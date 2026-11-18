/** Collects warnings so the run ends with one readable report instead of scattered output. */

const warnings = new Map<string, Set<string>>();

export function warn(topic: string, message: string): void {
  const set = warnings.get(topic) ?? new Set<string>();
  set.add(message);
  warnings.set(topic, set);
}

export function allWarnings(): Record<string, string[]> {
  return Object.fromEntries([...warnings].map(([topic, set]) => [topic, [...set].sort()]));
}

export function printWarnings(): void {
  for (const [topic, set] of warnings) {
    console.log(`\n⚠ ${topic} (${set.size})`);
    for (const message of [...set].sort()) console.log(`  - ${message}`);
  }
}
