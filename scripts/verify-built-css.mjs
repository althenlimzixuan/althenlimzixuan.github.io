/**
 * Post-build guard for a bug that shipped invisible content to production.
 *
 * A reveal-on-scroll rule set `opacity: 0` on `.reveal` and relied on a
 * scroll-driven animation to undo it. The CSS minifier folded
 * `animation-timeline: view()` into the `animation` shorthand, emitting
 * `animation: linear both reveal-in view()`. That shorthand does not accept a
 * timeline — it was removed in CSS Animations 2 — so browsers dropped the
 * declaration, the static opacity survived, and four landing-page sections
 * rendered permanently blank.
 *
 * Nothing caught it. Type-check, unit tests, link check and Lighthouse all
 * passed, because the markup was correct and the page scored perfectly while
 * being invisible. It took a human opening the site.
 *
 * These assertions run against the BUILT CSS, which is the only place the
 * minifier's output can be inspected at all.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'dist/_astro';

let files;
try {
  files = readdirSync(dir).filter((f) => f.endsWith('.css'));
} catch {
  console.error(`verify-built-css: ${dir} not found — run \`npm run build\` first.`);
  process.exit(1);
}

if (files.length === 0) {
  console.error(`verify-built-css: no CSS in ${dir} — did the build emit anything?`);
  process.exit(1);
}

const failures = [];

for (const file of files) {
  const css = readFileSync(join(dir, file), 'utf8');

  // 1. A timeline inside the `animation` shorthand is invalid; browsers drop
  //    the entire declaration and every animation in it silently dies.
  for (const m of css.matchAll(/animation:[^;}]*/g)) {
    if (/\b(view|scroll)\(/.test(m[0])) {
      failures.push(
        `${file}: timeline folded into an \`animation\` shorthand — browsers drop ` +
          `this as invalid: "${m[0].slice(0, 120)}"`,
      );
    }
  }

  // 2. Nothing scroll-animated may depend on a static hidden state. If the
  //    animation is ever dropped, the element must still be visible.
  for (const m of css.matchAll(/\.reveal\{[^}]*\}/g)) {
    if (/opacity:\s*0(?![.\d])/.test(m[0])) {
      failures.push(
        `${file}: static opacity:0 on .reveal — the hidden state belongs in ` +
          `@keyframes so a dropped animation cannot strand it: "${m[0].slice(0, 120)}"`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(
    'verify-built-css FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'),
  );
  process.exit(1);
}

console.log(`verify-built-css: ok (${files.length} stylesheet(s) checked)`);
