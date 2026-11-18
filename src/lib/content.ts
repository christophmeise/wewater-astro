/**
 * Helpers for blog posts and projects: URLs, static paths, translations, related posts.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, localizePath, type Locale } from '@/i18n';
import { categories, type CategoryKey } from '@/data/categories';

export type Post = CollectionEntry<'blog'>;
export type Project = CollectionEntry<'projects'>;
type Entry = Post | Project;

/** "de/foo-bar" -> "foo-bar" (the file name is the URL slug). */
export function entrySlug(entry: { id: string }): string {
  return entry.id.slice(entry.id.lastIndexOf('/') + 1);
}

export function postUrl(post: Post): string {
  return localizePath(`/blog/${entrySlug(post)}/`, post.data.lang);
}

export function projectUrl(project: Project): string {
  return localizePath(`/projekte/${entrySlug(project)}/`, project.data.lang);
}

function urlOf(entry: Entry): string {
  return entry.collection === 'blog' ? postUrl(entry) : projectUrl(entry);
}

/** Newest first. */
export function byDateDesc<T extends Entry>(a: T, b: T): number {
  return b.data.date.getTime() - a.data.date.getTime();
}

/** Fails the build if a file's `lang` does not match its folder or a translation is duplicated. */
function validate(entries: Entry[]): void {
  const seen = new Set<string>();
  for (const entry of entries) {
    const folder = entry.id.split('/')[0];
    if (folder !== entry.data.lang) {
      throw new Error(`${entry.collection}/${entry.id}: lang "${entry.data.lang}" does not match its folder "${folder}"`);
    }
    const key = `${entry.data.translationKey}:${entry.data.lang}`;
    if (seen.has(key)) {
      throw new Error(`${entry.collection}: two ${entry.data.lang} files share translationKey "${entry.data.translationKey}"`);
    }
    seen.add(key);
  }
}

export async function getPosts(locale?: Locale): Promise<Post[]> {
  const posts = await getCollection('blog');
  validate(posts);
  return posts.filter((p) => !locale || p.data.lang === locale).sort(byDateDesc);
}

export async function getProjects(locale?: Locale): Promise<Project[]> {
  const projects = await getCollection('projects');
  validate(projects);
  return projects.filter((p) => !locale || p.data.lang === locale).sort(byDateDesc);
}

/** Route params for src/pages/[...lang]/<section>/[slug].astro: each entry only in its own language. */
function paramsFor(entry: Entry) {
  return { lang: entry.data.lang === DEFAULT_LOCALE ? undefined : entry.data.lang, slug: entrySlug(entry) };
}

export async function postPaths() {
  return (await getPosts()).map((post) => ({ params: paramsFor(post), props: { post } }));
}

export async function projectPaths() {
  return (await getProjects()).map((project) => ({ params: paramsFor(project), props: { project } }));
}

/** hreflang alternates / language switcher targets: every translation of `entry`, including itself. */
export async function translationsOf(entry: Entry): Promise<Partial<Record<Locale, string>>> {
  const all: Entry[] = entry.collection === 'blog' ? await getPosts() : await getProjects();
  return Object.fromEntries(
    all.filter((e) => e.data.translationKey === entry.data.translationKey).map((e) => [e.data.lang, urlOf(e)]),
  );
}

/** "Projektupdates im Blog": posts in the project's blogCategory, same language, newest first. */
export async function relatedPosts(project: Project): Promise<Post[]> {
  const category = project.data.blogCategory;
  if (!category) return [];
  return (await getPosts(project.data.lang)).filter((post) => post.data.categories.includes(category));
}

/** Projects that use a filter system, for /filtersysteme/aqqabag/ and /filtersysteme/aqqacube/. */
export async function projectsWithFilter(filter: 'aqqabag' | 'aqqacube', locale: Locale): Promise<Project[]> {
  return (await getProjects(locale)).filter((p) => p.data.filters.includes(filter));
}

/** Press releases: posts in a category flagged isPress. */
export async function pressReleases(locale: Locale): Promise<Post[]> {
  const isPress = (key: CategoryKey) => categories[key].isPress === true;
  return (await getPosts(locale)).filter((p) => p.data.categories.some(isPress));
}

/** Rough reading time in minutes (200 words per minute), from the raw MDX body. */
export function readingMinutes(body: string | undefined): number {
  const words = (body ?? '')
    .replace(/^import .*$/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
