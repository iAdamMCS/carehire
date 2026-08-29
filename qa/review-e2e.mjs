import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.CAREHIRE_QA_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
page.on('response', r => { if (r.status() >= 400 && !r.url().includes('favicon')) errors.push(`http ${r.status()}: ${r.url()}`); });

await page.goto(base, { waitUntil: 'networkidle' });
assert.equal(await page.locator('#roleChoices .choice').count(), 4, 'four role choices');
assert.equal(await page.locator('#home .voice').isVisible(), false, 'voice hidden on first screen');

// Branding: the live review bundle must use the supplied symbol-only MCS asset, not the placeholder C or an external icon dependency.
const logoStyle = await page.locator('.logo').evaluate(el => ({
  bg: getComputedStyle(el).backgroundImage,
  color: getComputedStyle(el).color,
  width: el.getBoundingClientRect().width,
  height: el.getBoundingClientRect().height
}));
assert.ok(logoStyle.bg.includes('mcs-symbol.png'), 'MCS symbol asset is used');
assert.ok(logoStyle.width >= 48 && logoStyle.height >= 36, 'MCS symbol has usable display size');

// The runtime fixes must be loaded by the actual page, not injected only by the QA runner.
const scriptSources = await page.locator('script[src]').evaluateAll(nodes => nodes.map(n => n.getAttribute('src')));
for (const expected of ['role-fix.js','qa-fixes.js','a11y-fixes.js']) {
  assert.ok(scriptSources.some(src => src?.endsWith(expected)), `${expected} loaded by live HTML`);
}

const roles = [
  {
    name: 'Housekeeper', title: 'What household help is needed in a typical week?',
    includes: ['General cleaning & tidying','Laundry & linens','Bathroom cleaning'],
    excludes: ['Morning personal care','Medication reminders'],
    interview: 'experience cleaning or maintaining private homes', schedule: '2–3 daytime visits per week'
  },
  {
    name: 'Personal Support Worker (PSW)', title: 'What personal support is needed in a typical week?',
    includes: ['Morning personal care','Bathing & grooming assistance','Mobility / transfer assistance'],
    excludes: ['General cleaning & tidying'],
    interview: 'experience providing support similar to this role', schedule: 'Weekday mornings + 2 evenings'
  },
  {
    name: 'Sitter / Companion', title: 'What companion support is needed in a typical week?',
    includes: ['Companionship & conversation','Family respite / relief','Walks / light activities'],
    excludes: ['Bathroom cleaning','Bathing & grooming assistance'],
    interview: 'experience providing companionship or supervision', schedule: 'Weekday afternoons + occasional evenings'
  },
  {
    name: 'Overnight Caregiver', title: 'What support is needed overnight?',
    includes: ['Overnight presence','Scheduled safety checks','Bedtime routine support'],
    excludes: ['General cleaning & tidying','Companionship & conversation'],
    interview: 'experience providing overnight support', schedule: '2–3 overnight shifts per week'
  }
];

for (const r of roles) {
  await page.locator('[data-nav="home"]').click();
  await page.locator(`.choice[data-role="${r.name}"]`).click();
  await page.locator('#home .primary').click();
  assert.equal((await page.locator('#needs h1').innerText()).trim(), r.title, `${r.name} title`);
  const needsText = await page.locator('#needs .checks').innerText();
  for (const x of r.includes) assert.ok(needsText.includes(x), `${r.name} includes ${x}`);
  for (const x of r.excludes) assert.ok(!needsText.includes(x), `${r.name} excludes ${x}`);

  const selected = page.locator('#needs .need');
  await selected.nth(0).check();
  await selected.nth(1).check();
  await page.getByRole('button', { name: 'Calculate estimate' }).click();
  assert.ok((await page.locator('#hoursResult').innerText()).includes('hrs/week'), `${r.name} estimate`);
  await page.getByRole('button', { name: /Use estimate/ }).click();
  assert.equal(await page.locator('#schedule').inputValue(), r.schedule, `${r.name} schedule`);
  await page.getByRole('button', { name: /Create documents/ }).click();
  const job = await page.locator('#jobDoc').innerText();
  assert.ok(job.includes(r.name.replace(' (PSW)','')) || job.includes(r.name), `${r.name} job role`);
  const firstTask = await selected.nth(0).getAttribute('value');
  assert.ok(job.includes(firstTask), `${r.name} selected task in job`);
  await page.getByRole('button', { name: /Interview questions/ }).click();
  assert.ok((await page.locator('#interviewDoc').innerText()).toLowerCase().includes(r.interview.toLowerCase()), `${r.name} interview`);
  await page.getByRole('button', { name: /Build agreement/ }).click();
  assert.ok((await page.locator('#agreementDoc').innerText()).includes(r.name), `${r.name} agreement`);
}

// Role change clears previous tasks.
await page.locator('[data-nav="home"]').click();
await page.locator('.choice[data-role="Housekeeper"]').click();
await page.locator('#home .primary').click();
await page.locator('#needs .need').nth(0).check();
await page.locator('[data-nav="home"]').click();
await page.locator('.choice[data-role="Personal Support Worker (PSW)"]').click();
await page.locator('#home .primary').click();
assert.equal(await page.locator('#needs .need:checked').count(), 0, 'role switching clears tasks');

// Do not invent an estimate when no task is selected.
await page.getByRole('button', { name: /Use estimate/ }).click();
assert.equal(await page.locator('#needs').isVisible(), true, 'empty task selection stays on needs');
assert.ok((await page.locator('#hoursResult').innerText()).includes('Choose at least one task first'), 'empty task validation');

// Keyboard role selection.
await page.locator('[data-nav="home"]').click();
const hk = page.locator('.choice[data-role="Housekeeper"]');
await hk.focus();
await page.keyboard.press('Enter');
assert.equal(await hk.getAttribute('aria-pressed'), 'true', 'keyboard selects Housekeeper');

// Start over resets role and province.
await page.locator('#home .primary').click();
await page.locator('#needs .need').nth(0).check();
await page.locator('header .secondary').click();
assert.equal(await page.locator('.choice.selected').getAttribute('data-role'), 'Personal Support Worker (PSW)', 'start over role reset');
assert.equal(await page.locator('#province').inputValue(), 'Alberta', 'start over province reset');
assert.equal(await page.locator('#hours').inputValue(), '', 'start over hours reset');

// Mobile layout and role flow.
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(base, { waitUntil: 'networkidle' });
assert.equal(await mobile.locator('.sidebar').isVisible(), false, 'mobile sidebar hidden');
const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
assert.ok(overflow, 'no horizontal mobile overflow');
await mobile.locator('.choice[data-role="Housekeeper"]').click();
await mobile.locator('#home .primary').click();
assert.ok((await mobile.locator('#needs h1').innerText()).includes('household help'), 'mobile Housekeeper path');
const mobileLogo = await mobile.locator('.logo').evaluate(el => getComputedStyle(el).backgroundImage);
assert.ok(mobileLogo.includes('mcs-symbol.png'), 'mobile uses MCS symbol');
await mobile.close();

assert.deepEqual(errors, [], `browser console/page errors: ${errors.join('; ')}`);
await browser.close();
console.log('CareHire review E2E QA: PASS');
