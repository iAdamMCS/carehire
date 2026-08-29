import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import axe from 'axe-core';

const base = process.env.CAREHIRE_QA_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base, { waitUntil: 'networkidle' });
await page.addScriptTag({ content: axe.source });

async function scan(name) {
  const result = await page.evaluate(async () => await axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] },
    resultTypes: ['violations']
  }));
  const serious = result.violations.filter(v => ['serious','critical'].includes(v.impact));
  if (serious.length) {
    console.error(`Accessibility violations on ${name}:`);
    for (const v of serious) {
      console.error(`${v.impact} ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
      for (const node of v.nodes) {
        console.error(`  target=${JSON.stringify(node.target)} html=${node.html}`);
        if (node.failureSummary) console.error(`  ${node.failureSummary.replace(/\n/g,' ')}`);
      }
    }
  }
  assert.equal(serious.length, 0, `${name} has serious/critical WCAG violations`);
}

await scan('home');
for (const role of ['Personal Support Worker (PSW)','Housekeeper','Sitter / Companion','Overnight Caregiver']) {
  await page.locator('[data-nav="home"]').click();
  await page.locator(`.choice[data-role="${role}"]`).click();
  await page.locator('#home .primary').click();
  await scan(`${role} needs`);
  await page.locator('#needs .need').nth(0).check();
  await page.getByRole('button', { name: /Use estimate/ }).click();
  await scan(`${role} job details`);
  await page.getByRole('button', { name: /Create documents/ }).click();
  await scan(`${role} job description`);
}

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(base, { waitUntil: 'networkidle' });
await mobile.addScriptTag({ content: axe.source });
const result = await mobile.evaluate(async () => await axe.run(document, {
  runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] },
  resultTypes: ['violations']
}));
const serious = result.violations.filter(v => ['serious','critical'].includes(v.impact));
assert.equal(serious.length, 0, 'mobile home has serious/critical WCAG violations');
await mobile.close();
await browser.close();
console.log('CareHire automated accessibility QA: PASS');
