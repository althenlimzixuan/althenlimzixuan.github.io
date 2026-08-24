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
  //
  //    Stated generally rather than against one class name: ANY declaration
  //    block that sets a scroll/view timeline must not also hide its element.
  //    The hidden state belongs in @keyframes, where it exists only while the
  //    animation actually runs.
  for (const m of css.matchAll(/\{[^{}]*\}/g)) {
    const block = m[0];
    if (!/animation-timeline:\s*(view|scroll)\(/.test(block)) continue;
    const hidden = block.match(
      /(opacity:\s*0(?![.\d])|visibility:\s*hidden|transform:\s*scale[XY]?\(\s*0\s*\)|clip-path:\s*inset\(\s*100%)/,
    );
    if (hidden) {
      failures.push(
        `${file}: a scroll-timeline rule also sets a static hidden state ` +
          `(${hidden[0]}) — put it in @keyframes so a dropped animation cannot ` +
          `strand the element: "${block.slice(0, 140)}"`,
      );
    }
  }

  // 3. An `animation-range` must keep BOTH a start and an end. The minifier
  //    drops any end written as `<name> 100%`, treating it as the default —
  //    correct for `cover 100%`, wrong for `entry 100%`. What is left,
  //    e.g. `animation-range: entry 5%`, parses as start-only with the end
  //    falling back to `normal` (= cover 100%), so an entrance animation
  //    silently becomes a scroll-through progress animation: the element sits
  //    half-animated for as long as it is on screen.
  //
  //    Two tokens means start-only. Write ends as `entry 90%` etc. rather than
  //    `entry 100%`, and this stays intact.
  for (const m of css.matchAll(/animation-range:\s*([^;}]+)/g)) {
    const tokens = m[1].trim().split(/\s+/);
    if (tokens.length < 3) {
      failures.push(
        `${file}: animation-range lost its end — "${m[1].trim()}" is start-only, ` +
          `so the end defaults to \`normal\` (cover 100%) and the animation runs ` +
          `for as long as the element is on screen. Avoid \`<name> 100%\` ends.`,
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
