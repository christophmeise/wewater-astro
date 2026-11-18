/** Writing generated files and removing stale ones from the directories the script owns. */
import { existsSync, mkdirSync, readdirSync, rmSync, rmdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { stringify } from 'yaml';

const written = new Set<string>();

export function writeFile(abs: string, content: string | Buffer): void {
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  written.add(abs);
}

/** Mark files written by other modules (media) as produced by this run. */
export function markWritten(files: Iterable<string>): void {
  for (const f of files) written.add(f);
}

/** YAML frontmatter block. Undefined values are omitted. */
export function frontmatter(data: Record<string, unknown>): string {
  const clean = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
  return `---\n${stringify(clean, { lineWidth: 0 }).trim()}\n---\n`;
}

/** Delete files in `dir` (recursively) that were not written in this run; remove empty folders. */
export function removeStale(dir: string, keep: (file: string) => boolean = () => false): string[] {
  const removed: string[] = [];
  if (!existsSync(dir)) return removed;
  const walk = (d: string) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        if (readdirSync(full).length === 0) rmdirSync(full);
      } else if (!written.has(full) && !keep(full) && entry.name !== '.gitkeep') {
        rmSync(full);
        removed.push(full);
      }
    }
  };
  walk(dir);
  return removed;
}
