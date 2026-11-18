// Bake the lordicon expressions of a lord-icon Lottie file into static values, so the light
// lottie-web player (no expressions, no eval, allowed by our CSP) renders it exactly like lord-icon did.
//
//   node scripts/animations/bake.mjs <name>=<path/to/lordicon.json> [<name>=<path> ...]
//
// Writes src/assets/animations/<name>.json. Then run posters.mjs to render the static poster, and
// register the icon in src/components/ui/animated-icons.ts.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const outDir = new URL('../../src/assets/animations/', import.meta.url).pathname;
const FILES = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [name, file] = arg.split('=');
    if (!name || !file) throw new Error(`expected <name>=<path>, got "${arg}"`);
    return [name, file];
  }),
);
if (!Object.keys(FILES).length) {
  console.error('usage: node scripts/animations/bake.mjs <name>=<path/to/lordicon.json> ...');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

function effectValue(layers, layerName, effectName) {
  const layer = layers.find((l) => l.nm === layerName);
  if (!layer) throw new Error(`no layer ${layerName}`);
  const effect = layer.ef.find((e) => e.nm === effectName);
  if (!effect) throw new Error(`no effect ${effectName} on ${layerName}`);
  const v = effect.ef[0].v;
  if (v.a) throw new Error(`animated effect ${effectName}`);
  return v.k;
}

function findShape(items, name) {
  for (const it of items ?? []) {
    if (it.nm === name) return it;
  }
  throw new Error(`no shape ${name}`);
}

let baked = 0;
function bakeFile(data) {
  const root = data.layers;
  const compsByName = { [data.nm]: root };
  // Resolve one expression in the context of a comp (its layers) and a layer (for content()).
  function evaluate(expr, comp, layer) {
    let m;
    const compOf = (src) => (src === 'thisComp' ? comp : compsByName[src]);
    const ref = String.raw`(thisComp|comp\('([^']+)'\))\.layer\('([^']+)'\)\.effect\('([^']+)'\)\('([^']+)'\)`;
    const resolveRef = (mm, offset = 0) => {
      const layers = mm[1 + offset] === 'thisComp' ? comp : compOf(mm[2 + offset]);
      if (!layers) throw new Error(`unknown comp ${mm[2 + offset]}`);
      return effectValue(layers, mm[3 + offset], mm[4 + offset]);
    };
    if ((m = expr.match(new RegExp(String.raw`^var \$bm_rt;\n\$bm_rt = ${ref};$`)))) {
      const v = resolveRef(m);
      return Array.isArray(v) && v.length === 3 ? [...v, 1] : v;
    }
    if ((m = expr.match(new RegExp(String.raw`^var \$bm_rt;\n\$bm_rt = \$bm_mul\(([\d.]+) / 100, ${ref}\);$`)))) {
      return (Number(m[1]) / 100) * resolveRef(m, 1);
    }
    if ((m = expr.match(new RegExp(String.raw`^var \$bm_rt;\nvar temp;\ntemp = ${ref};\n\$bm_rt = \[\n    temp,\n    temp\n\];$`)))) {
      const v = resolveRef(m);
      return [v, v];
    }
    if ((m = expr.match(/var checkbox = thisComp\.layer\('([^']+)'\)\.effect\('([^']+)'\)\('Checkbox'\);\nif \(checkbox == 1\) \{\n    \$bm_rt = ([\d.]+);\n\} else \{\n    \$bm_rt = ([\d.]+);\n\}/))) {
      return effectValue(comp, m[1], m[2]) == 1 ? Number(m[3]) : Number(m[4]);
    }
    if ((m = expr.match(/^var \$bm_rt;\n\$bm_rt = content\('([^']+)'\)\.content\('([^']+)'\)\.(color|strokeWidth);$/))) {
      const group = findShape(layer.shapes, JSON.parse(`"${m[1]}"`));
      const item = findShape(group.it, m[2]);
      const prop = item[m[3] === 'color' ? 'c' : 'w'];
      if (prop.x) bakeProp(prop, comp, layer);
      if (prop.a) throw new Error('animated content ref');
      return prop.k;
    }
    throw new Error(`unknown expression: ${JSON.stringify(expr)}`);
  }
  function bakeProp(prop, comp, layer) {
    const value = evaluate(prop.x, comp, layer);
    prop.a = 0;
    prop.k = value;
    delete prop.x;
    baked++;
  }
  function walk(node, comp, layer) {
    if (Array.isArray(node)) {
      for (const n of node) walk(n, comp, layer);
      return;
    }
    if (!node || typeof node !== 'object') return;
    if (typeof node.x === 'string') bakeProp(node, comp, layer);
    for (const [key, value] of Object.entries(node)) {
      if (key === 'ef') continue; // effect controls themselves are not rendered
      walk(value, comp, layer);
    }
  }
  for (const layer of root) walk(layer, root, layer);
  for (const asset of data.assets ?? []) {
    for (const layer of asset.layers ?? []) walk(layer, asset.layers, layer);
  }
  // The control layers only fed the expressions and the "lordicon.com" watermark layer is always
  // transparent: drop them (when nothing is parented to them) so the player skips them.
  const DROP = new Set(['02092020', 'Color  & Stroke Change', 'lordicon.com Outlines']);
  const parents = new Set(root.map((l) => l.parent).filter((p) => p != null));
  data.layers = root.filter((l) => !(DROP.has(l.nm) && !parents.has(l.ind)));
  for (const layers of [data.layers, ...(data.assets ?? []).map((a) => a.layers ?? [])]) {
    for (const layer of layers) delete layer.ef;
  }
  delete data.markers;
  return data;
}

for (const [name, file] of Object.entries(FILES)) {
  baked = 0;
  const data = bakeFile(JSON.parse(readFileSync(file, 'utf8')));
  // Sanity: no expression left.
  if (JSON.stringify(data).includes('$bm_rt')) throw new Error(`expression left in ${name}`);
  writeFileSync(`${outDir}/${name}.json`, JSON.stringify(data));
  console.log(name, 'baked', baked);
}
