/**
 * WPGraphQL access: typed queries, sequential pagination, raw-response cache.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { GRAPHQL_URL, paths, flags } from './config.ts';

export interface WpLanguageRef {
  slug: string;
}
export interface WpTranslation {
  slug: string;
  databaseId: number;
  language: WpLanguageRef;
}
export interface WpImageNode {
  databaseId: number;
  sourceUrl: string;
  altText: string | null;
  caption: string | null;
  title: string | null;
}
export interface WpComment {
  databaseId: number;
  content: string;
  date: string;
  dateGmt: string | null;
  status: string;
  type: string | null;
  parentDatabaseId: number | null;
  author: { node: { name: string } | null } | null;
}
export interface WpPost {
  databaseId: number;
  slug: string;
  title: string;
  date: string;
  dateGmt: string | null;
  modifiedGmt: string | null;
  status: string;
  excerpt: string | null;
  content: string | null;
  language: WpLanguageRef | null;
  translations: WpTranslation[] | null;
  author: { node: { name: string; slug: string; description: string | null; avatar: { url: string } | null } } | null;
  categories: { nodes: { databaseId: number; slug: string; name: string }[] };
  featuredImage: { node: WpImageNode } | null;
  comments?: { nodes: WpComment[] };
}
export interface WpCategory {
  databaseId: number;
  name: string;
  slug: string;
  description: string | null;
  count: number | null;
  language: WpLanguageRef | null;
  translations: { slug: string; name: string; databaseId: number; language: WpLanguageRef }[] | null;
}
export interface WpTeamMember {
  databaseId: number;
  title: string;
  slug: string;
  date: string;
  acf_team: Record<string, string | null>;
  featuredImage: { node: WpImageNode } | null;
}
export interface WpPage {
  databaseId: number;
  slug: string;
  title: string;
  language: WpLanguageRef | null;
  content: string | null;
  blocksJSON: string | null;
}
export interface WpMediaItem {
  databaseId: number;
  sourceUrl: string | null;
  mediaItemUrl: string | null;
  altText: string | null;
  caption: string | null;
  title: string | null;
  mimeType: string | null;
  fileSize: number | null;
  mediaDetails: { width: number | null; height: number | null; sizes: { sourceUrl: string }[] | null } | null;
}

async function request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'wewater-astro-migration' },
        body: JSON.stringify({ query, variables }),
      });
      if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
      const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
      if (json.errors?.length) throw new Error(`GraphQL: ${json.errors.map((e) => e.message).join('; ')}`);
      if (!json.data) throw new Error('GraphQL: empty response');
      return json.data;
    } catch (error) {
      lastError = error;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  throw lastError;
}

interface Connection<N> {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: N[];
}

/** Fetch all nodes of a root connection, one page at a time (gentle on the server). */
async function fetchAll<N>(root: string, fields: string, args = '', pageSize = 50): Promise<N[]> {
  const nodes: N[] = [];
  let after: string | null = null;
  for (;;) {
    const query = `query ($first: Int!, $after: String) {
      ${root}(first: $first, after: $after${args ? ', ' + args : ''}) {
        pageInfo { hasNextPage endCursor }
        nodes { ${fields} }
      }
    }`;
    const data: Record<string, Connection<N>> = await request(query, { first: pageSize, after });
    const conn = data[root];
    if (!conn) throw new Error(`GraphQL: no ${root} in response`);
    nodes.push(...conn.nodes);
    if (!conn.pageInfo.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return nodes;
}

/** Cached fetch: with --offline the last saved response is used. */
async function cached<T>(name: string, load: () => Promise<T>): Promise<T> {
  const file = path.join(paths.cache, 'graphql', `${name}.json`);
  if (flags.offline && existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')) as T;
  const data = await load();
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 1));
  return data;
}

const imageFields = 'databaseId sourceUrl altText caption title';
const postFields = `
  databaseId slug title date dateGmt modifiedGmt status excerpt content
  language { slug }
  translations { slug databaseId language { slug } }
  author { node { name slug description avatar { url } } }
  categories(first: 50) { nodes { databaseId slug name } }
  featuredImage { node { ${imageFields} } }
`;

export interface WpData {
  posts: WpPost[];
  projects: WpPost[];
  categories: WpCategory[];
  team: WpTeamMember[];
  pages: WpPage[];
  media: WpMediaItem[];
}

export async function fetchWordPress(): Promise<WpData> {
  const posts = await cached('posts', () =>
    fetchAll<WpPost>(
      'posts',
      `${postFields}
       comments(first: 100) { nodes { databaseId content date dateGmt status type parentDatabaseId author { node { name } } } }`,
      'where: { language: null, status: PUBLISH }',
      20,
    ),
  );
  const projects = await cached('projects', () =>
    fetchAll<WpPost>('projekte', postFields, 'where: { language: null, status: PUBLISH }', 20),
  );
  const categories = await cached('categories', () =>
    fetchAll<WpCategory>(
      'categories',
      'databaseId name slug description count language { slug } translations { slug name databaseId language { slug } }',
      'where: { hideEmpty: false }',
      100,
    ),
  );
  const team = await cached('team', () =>
    fetchAll<WpTeamMember>(
      'team',
      `databaseId title slug date featuredImage { node { ${imageFields} } }
       acf_team { kurzbeschreibung kurzbeschreibungEnglisch kurzbeschreibungFr description descriptionEnglisch descriptionFr email facebook instagram linkedin twitter website }`,
    ),
  );
  const pages = await cached('pages', () =>
    fetchAll<WpPage>('pages', 'databaseId slug title language { slug } content blocksJSON', 'where: { language: null }'),
  );
  const media = await cached('media', () =>
    fetchAll<WpMediaItem>(
      'mediaItems',
      'databaseId sourceUrl mediaItemUrl altText caption title mimeType fileSize mediaDetails { width height sizes { sourceUrl } }',
      '',
      100,
    ),
  );
  return { posts, projects, categories, team, pages, media };
}
