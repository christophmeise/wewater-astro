/**
 * Media handling: resolve WordPress upload URLs to their original files, get the bytes
 * (disk cache -> old Gatsby cache -> download), re-encode images with sharp, transcode
 * videos with ffmpeg and copy documents to public/docs/.
 *
 * Usage is two-phase: the HTML converter first runs in "collect" mode and only records
 * which URLs it needs (placeholders are returned); then process() fetches and writes
 * everything; then the converter runs again and gets the final paths.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import pLimit from 'p-limit';
import sharp from 'sharp';
import { IMAGE_MAX_WIDTH, JPEG_QUALITY, ROOT, UPLOADS_ORIGIN, flags, paths } from './config.ts';
import type { WpMediaItem } from './wp.ts';
import { warn } from './log.ts';

export interface ImageAsset {
  /** Path relative to src/assets/, e.g. "wp/2026/11/foo.jpg". */
  rel: string;
  width: number;
  height: number;
  item: WpMediaItem | undefined;
}
export interface VideoAsset {
  /** Public URL, e.g. "/media/foo.mp4". */
  src: string;
  /** Poster image relative to src/assets/. */
  poster: string | undefined;
  width: number | undefined;
  height: number | undefined;
  bytes: number;
}

const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;
const VIDEO_EXT = /\.(mp4|mov|m4v|webm)$/i;

/** Any reference to a wp-content/uploads file -> canonical https://www.wewaterbackend.org/... URL. */
export function normalizeUploadUrl(raw: string): string | undefined {
  let s = raw.trim().replace(/&amp;/g, '&');
  if (!s.includes('/wp-content/uploads/')) return undefined;
  if (s.startsWith('//')) s = 'https:' + s;
  if (s.startsWith('/')) s = UPLOADS_ORIGIN + s;
  try {
    const u = new URL(s);
    let pathname = u.pathname;
    try {
      pathname = encodeURI(decodeURI(pathname));
    } catch {
      /* keep as is */
    }
    return UPLOADS_ORIGIN + pathname;
  } catch {
    return undefined;
  }
}

/** "…/uploads/2021/07/foo-1024x768.jpg" -> "…/uploads/2021/07/foo.jpg" */
function stripSizeSuffix(url: string): string {
  return url.replace(/-\d{2,5}x\d{2,5}(?=\.[a-z0-9]+$)/i, '');
}

/** Path below /wp-content/uploads/, decoded: "2021/07/foo.jpg". */
export function uploadRel(url: string): string {
  const rel = url.split('/wp-content/uploads/')[1] ?? path.basename(url);
  try {
    return decodeURI(rel);
  } catch {
    return rel;
  }
}

/** Disk-cache path for any downloaded URL. */
function cacheRel(url: string): string {
  return url.includes('/wp-content/uploads/') ? uploadRel(url) : `external/${new URL(url).hostname}${new URL(url).pathname}`;
}

function safeName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

export function dirSize(dir: string): number {
  return walkFiles(dir).reduce((sum, f) => sum + statSync(f).size, 0);
}

interface Manifest {
  images: Record<string, { rel: string; width: number; height: number }>;
  docs: Record<string, string>;
  videos: Record<string, VideoAsset>;
}

export class Media {
  readonly collecting = { value: true };
  private byUrl = new Map<string, WpMediaItem>();
  private byId = new Map<number, WpMediaItem>();
  private gatsbyIndex = new Map<string, string[]>();
  private imageRequests = new Map<string, { candidates: string[]; item: WpMediaItem | undefined }>();
  private docRequests = new Set<string>();
  private videoRequests = new Set<string>();
  private images = new Map<string, ImageAsset>();
  private docs = new Map<string, string>();
  private videos = new Map<string, VideoAsset>();
  /** Every file this run wrote (absolute paths), for cleaning stale files. */
  readonly written = new Set<string>();
  private usedOutputs = new Map<string, string>();
  private manifestFile = path.join(paths.cache, 'media-manifest.json');
  private manifest: Manifest;
  /** Separate limiters: downloads run inside processing tasks. */
  private downloadLimit = pLimit(3);
  private processLimit = pLimit(4);
  stats = { fromDiskCache: 0, fromGatsby: 0, downloaded: 0, failed: 0 };

  constructor(items: WpMediaItem[], gatsbyDir: string | undefined) {
    for (const item of items) {
      this.byId.set(item.databaseId, item);
      for (const u of [item.sourceUrl, item.mediaItemUrl, ...(item.mediaDetails?.sizes ?? []).map((s) => s.sourceUrl)]) {
        const n = u ? normalizeUploadUrl(u) : undefined;
        if (n && !this.byUrl.has(n)) this.byUrl.set(n, item);
      }
    }
    if (gatsbyDir) {
      for (const file of walkFiles(gatsbyDir)) {
        const base = path.basename(file).toLowerCase();
        this.gatsbyIndex.set(base, [...(this.gatsbyIndex.get(base) ?? []), file]);
      }
    }
    this.manifest = existsSync(this.manifestFile)
      ? (JSON.parse(readFileSync(this.manifestFile, 'utf8')) as Manifest)
      : { images: {}, docs: {}, videos: {} };
  }

  /** Media library entry for an upload URL (any size variant). */
  lookup(url: string, wpId?: number): WpMediaItem | undefined {
    const n = normalizeUploadUrl(url);
    if (!n) return undefined;
    const byUrl = this.byUrl.get(n) ?? this.byUrl.get(stripSizeSuffix(n));
    if (byUrl) return byUrl;
    if (wpId !== undefined) {
      const item = this.byId.get(wpId);
      const want = path.basename(stripSizeSuffix(n)).replace(/\.[a-z0-9]+$/i, '').toLowerCase();
      const have = path.basename(item?.sourceUrl ?? '').replace(/(-scaled)?\.[a-z0-9]+$/i, '').toLowerCase();
      if (item && have && want.startsWith(have)) return item;
    }
    return undefined;
  }

  private imageKey(url: string, wpId?: number): { key: string; candidates: string[]; item: WpMediaItem | undefined } | undefined {
    const n = normalizeUploadUrl(url);
    if (!n) {
      // Images hot-linked from betterplace.org in a few posts: copy them too (CSP allows only our own images).
      if (/^https:\/\/betterplace-assets\.betterplace\.org\//.test(url)) return { key: url, candidates: [url], item: undefined };
      return undefined;
    }
    const item = this.lookup(n, wpId);
    const original = item?.mimeType?.startsWith('image/') && item.sourceUrl ? normalizeUploadUrl(item.sourceUrl) : undefined;
    const candidates = [...new Set([original, stripSizeSuffix(n), n].filter((c): c is string => Boolean(c)))];
    return { key: candidates[0] ?? n, candidates, item };
  }

  /** Content image. Returns undefined if the URL is not a WordPress upload or failed to download. */
  image(url: string, wpId?: number): ImageAsset | undefined {
    const k = this.imageKey(url, wpId);
    if (!k) return undefined;
    if (this.collecting.value) {
      if (!this.imageRequests.has(k.key)) this.imageRequests.set(k.key, { candidates: k.candidates, item: k.item });
      return { rel: 'wp/pending.jpg', width: 1, height: 1, item: k.item };
    }
    return this.images.get(k.key);
  }

  /** Downloadable file (PDF, or an image linked for download). Returns its public URL. */
  doc(url: string): string | undefined {
    const n = normalizeUploadUrl(url);
    if (!n) return undefined;
    if (this.collecting.value) {
      this.docRequests.add(n);
      return '/docs/pending';
    }
    return this.docs.get(n);
  }

  video(url: string): VideoAsset | undefined {
    const n = normalizeUploadUrl(url);
    if (!n) return undefined;
    if (this.collecting.value) {
      this.videoRequests.add(n);
      return { src: '/media/pending.mp4', poster: undefined, width: undefined, height: undefined, bytes: 0 };
    }
    return this.videos.get(n);
  }

  static isImageUrl(url: string): boolean {
    return IMAGE_EXT.test(url.split(/[?#]/)[0] ?? '');
  }
  static isVideoUrl(url: string): boolean {
    return VIDEO_EXT.test(url.split(/[?#]/)[0] ?? '');
  }

  // ---------------------------------------------------------------------------
  // Fetching
  // ---------------------------------------------------------------------------

  /** Bytes of an upload: disk cache, then Gatsby cache, then download (first candidate that works). */
  async fetchOriginal(candidates: string[], item?: WpMediaItem): Promise<Buffer | undefined> {
    for (const url of candidates) {
      const cacheFile = path.join(paths.cache, 'originals', cacheRel(url));
      if (existsSync(cacheFile)) {
        this.stats.fromDiskCache++;
        return readFileSync(cacheFile);
      }
    }
    for (const url of candidates.filter((c) => c.includes('/wp-content/uploads/'))) {
      const base = path.basename(uploadRel(url)).toLowerCase();
      const hits = this.gatsbyIndex.get(base) ?? [];
      const size = item?.fileSize;
      const hit =
        hits.find((f) => size && statSync(f).size === size) ?? (hits.length === 1 && !size ? hits[0] : undefined);
      if (hit) {
        const buf = readFileSync(hit);
        this.saveOriginal(url, buf);
        this.stats.fromGatsby++;
        return buf;
      }
    }
    for (const url of candidates) {
      const buf = await this.downloadLimit(() => download(url));
      if (buf) {
        this.saveOriginal(url, buf);
        this.stats.downloaded++;
        return buf;
      }
    }
    this.stats.failed++;
    return undefined;
  }

  private saveOriginal(url: string, buf: Buffer) {
    const file = path.join(paths.cache, 'originals', cacheRel(url));
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, buf);
  }

  /** Reserve a unique output path (case-insensitive), deterministic given sorted input. */
  private reserve(abs: string, key: string): string {
    let candidate = abs;
    for (let i = 2; ; i++) {
      const owner = this.usedOutputs.get(candidate.toLowerCase());
      if (!owner || owner === key) break;
      candidate = abs.replace(/(\.[a-z0-9]+)$/i, `-${i}$1`);
    }
    this.usedOutputs.set(candidate.toLowerCase(), key);
    return candidate;
  }

  // ---------------------------------------------------------------------------
  // Processing
  // ---------------------------------------------------------------------------

  /**
   * Re-encode one image: auto-rotate, max IMAGE_MAX_WIDTH wide, mozjpeg; PNG only when it has
   * real transparency; animated GIFs are copied. `targetNoExt` is an absolute path without extension.
   */
  async writeImage(buf: Buffer, targetNoExt: string, key: string, maxWidth = IMAGE_MAX_WIDTH): Promise<{ abs: string; width: number; height: number }> {
    const meta = await sharp(buf).metadata();
    let ext = '.jpg';
    if (meta.format === 'gif' && (meta.pages ?? 1) > 1) ext = '.gif';
    else if (meta.format === 'svg') ext = '.svg';
    else if (meta.hasAlpha) {
      const { isOpaque } = await sharp(buf).stats();
      if (!isOpaque) ext = '.png';
    }
    const abs = this.reserve(targetNoExt + ext, key);
    mkdirSync(path.dirname(abs), { recursive: true });
    const cached = Object.values(this.manifest.images).find((m) => path.join(ROOT, 'src/assets', m.rel) === abs);
    if (!flags.forceMedia && cached && existsSync(abs)) {
      this.written.add(abs);
      return { abs, width: cached.width, height: cached.height };
    }
    if (ext === '.gif' || ext === '.svg') {
      writeFileSync(abs, buf);
      this.written.add(abs);
      return { abs, width: meta.width ?? 0, height: meta.height ?? 0 };
    }
    let pipeline = sharp(buf, { failOn: 'none' }).rotate().resize({ width: maxWidth, withoutEnlargement: true });
    pipeline =
      ext === '.png'
        ? pipeline.png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
        : pipeline.flatten({ background: '#ffffff' }).jpeg({ mozjpeg: true, quality: JPEG_QUALITY });
    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    writeFileSync(abs, data);
    this.written.add(abs);
    return { abs, width: info.width, height: info.height };
  }

  /** Download/convert everything requested during the collect pass. */
  async process(): Promise<void> {
    this.collecting.value = false;

    // Images -> src/assets/wp/<yyyy>/<mm>/<name>.<ext>
    const imageKeys = [...this.imageRequests.keys()].sort();
    await Promise.all(
      imageKeys.map((key) =>
        this.processLimit(async () => {
          const req = this.imageRequests.get(key);
          if (!req) return;
          const buf = await this.fetchOriginal(req.candidates, req.item);
          if (!buf) {
            warn('media', `image could not be downloaded: ${key}`);
            return;
          }
          const external = !key.includes('/wp-content/uploads/');
          const rel = external ? `external/betterplace-${new URL(key).pathname.split('/').slice(-2).join('-')}` : uploadRel(key);
          const dir = path.dirname(rel);
          const name = safeName(path.basename(rel).replace(/\.[a-z0-9]+$/i, '').replace(/-scaled$/i, ''));
          try {
            const out = await this.writeImage(buf, path.join(paths.assetsWp, dir, name), key);
            const asset: ImageAsset = {
              rel: path.relative(path.join(ROOT, 'src/assets'), out.abs).split(path.sep).join('/'),
              width: out.width,
              height: out.height,
              item: req.item,
            };
            this.images.set(key, asset);
            this.manifest.images[key] = { rel: asset.rel, width: asset.width, height: asset.height };
          } catch (error) {
            warn('media', `image could not be processed: ${key} (${String(error)})`);
          }
        }),
      ),
    );

    // Documents -> public/docs/<original-filename>
    const docKeys = [...this.docRequests].sort();
    const usedDocNames = new Map<string, string>();
    for (const key of docKeys) {
      const rel = uploadRel(key);
      let name = path.basename(rel);
      const lower = name.toLowerCase();
      if (usedDocNames.has(lower) && usedDocNames.get(lower) !== key) name = `${rel.split('/').slice(0, 2).join('-')}-${name}`;
      usedDocNames.set(name.toLowerCase(), key);
      const item = this.lookup(key);
      const buf = await this.fetchOriginal([key], item);
      if (!buf) {
        warn('media', `document could not be downloaded: ${key}`);
        continue;
      }
      let abs = path.join(paths.publicDocs, name);
      if (Media.isImageUrl(key)) {
        // Linked press photos: keep them downloadable, but not at camera resolution.
        const out = await this.writeImage(buf, abs.replace(/\.[a-z0-9]+$/i, ''), key);
        abs = out.abs;
      } else {
        mkdirSync(path.dirname(abs), { recursive: true });
        writeFileSync(abs, buf);
        this.written.add(abs);
      }
      const url = '/docs/' + encodeURI(path.basename(abs));
      this.docs.set(key, url);
      this.manifest.docs[key] = url;
    }

    // Videos -> public/media/<name>.mp4 (+ poster in src/assets/wp/)
    for (const key of [...this.videoRequests].sort()) {
      const asset = await this.processVideo(key);
      if (asset) {
        this.videos.set(key, asset);
        this.manifest.videos[key] = asset;
      }
    }

    mkdirSync(path.dirname(this.manifestFile), { recursive: true });
    writeFileSync(this.manifestFile, JSON.stringify(this.manifest, null, 1));
  }

  private async processVideo(key: string): Promise<VideoAsset | undefined> {
    const rel = uploadRel(key);
    const name = safeName(path.basename(rel).replace(/\.[a-z0-9]+$/i, ''));
    const out = path.join(paths.publicMedia, `${name}.mp4`);
    const posterNoExt = path.join(paths.assetsWp, path.dirname(rel), `${name}-poster`);
    const cached = this.manifest.videos[key];
    if (!flags.forceMedia && cached && existsSync(out) && (!cached.poster || existsSync(path.join(ROOT, 'src/assets', cached.poster)))) {
      this.written.add(out);
      if (cached.poster) this.written.add(path.join(ROOT, 'src/assets', cached.poster));
      return cached;
    }
    const buf = await this.fetchOriginal([key]);
    if (!buf) {
      warn('media', `video could not be downloaded: ${key}`);
      return undefined;
    }
    const src = path.join(paths.cache, 'originals', rel);
    mkdirSync(path.dirname(out), { recursive: true });
    try {
      // H.264, max 1280px wide, sane bitrate, faststart for progressive playback.
      execFileSync('ffmpeg', [
        '-y', '-loglevel', 'error', '-i', src,
        // Long side at most 960px (phone clips shown in a ~600px column), H.264 CRF 30.
        '-vf', "scale='if(gte(iw,ih),min(960,iw),-2)':'if(gte(iw,ih),-2,min(960,ih))'",
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '64k', '-ac', '1', '-movflags', '+faststart', out,
      ]);
      const frame = path.join(paths.cache, `${name}-poster.png`);
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '0.5', '-i', out, '-frames:v', '1', frame]);
      const poster = await this.writeImage(readFileSync(frame), posterNoExt, key + '#poster');
      const probe = execFileSync('ffprobe', [
        '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', out,
      ]).toString().trim();
      const [w, h] = probe.split(',').map(Number);
      this.written.add(out);
      return {
        src: '/media/' + path.basename(out),
        poster: path.relative(path.join(ROOT, 'src/assets'), poster.abs).split(path.sep).join('/'),
        width: w,
        height: h,
        bytes: statSync(out).size,
      };
    } catch (error) {
      warn('media', `ffmpeg failed for ${key} (${String(error)}); copying the original instead`);
      const copy = path.join(paths.publicMedia, path.basename(rel));
      writeFileSync(copy, buf);
      this.written.add(copy);
      return { src: '/media/' + path.basename(copy), poster: undefined, width: undefined, height: undefined, bytes: buf.length };
    }
  }
}

async function download(url: string): Promise<Buffer | undefined> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'wewater-astro-migration' } });
      if (res.status === 404 || res.status === 410) return undefined;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  return undefined;
}

/** Download any URL (e.g. a Gravatar) through the disk cache. */
export async function fetchCached(url: string, cacheName: string): Promise<Buffer | undefined> {
  const file = path.join(paths.cache, 'other', cacheName);
  if (existsSync(file)) return readFileSync(file);
  const buf = await download(url);
  if (buf) {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, buf);
  }
  return buf;
}
