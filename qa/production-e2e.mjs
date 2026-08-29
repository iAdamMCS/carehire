import assert from 'node:assert/strict';
import axe from 'axe-core';

const base = process.env.CAREHIRE_QA_URL || 'http://127.0.0.1:8080';
const browserType = process.env.CAREHIRE_BROWSER || 'chromium';
const playwright = await import('playwright');
const engine = playwright[browserType];
if (!engine) throw new Error(`Unknown browser engine: ${browserType}`);
const browser = await engine.launch({ headless: true });
// CSP is asserted from the real HTTP response below. Test-only CSP bypass lets axe inject its scanner without weakening production policy.
const context = await browser.newContext({ bypassCSP: true, viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const browserErrors = [];
page.on('pageerror', e => browserErrors.push(`pageerror: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') browserErrors.push(`console: ${m.text()}`); });

async function scan(name) {
  await page.addScriptTag({ content: axe.source });
  const result = await page.evaluate(async () => await axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] },
    resultTypes: ['violations']
  }));
  const serious = result.violations.filter(v => ['serious','critical'].includes(v.impact));
  if (serious.length) {
    console.error(`Accessibility violations on ${name}:`);
    for (const v of serious) console.error(`${v.impact} ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
  }
  assert.equal(serious.length, 0, `${name} has serious/critical WCAG violations`);
}

const response = await page.goto(base, { waitUntil: 'networkidle' });
assert.equal(response?.status(), 200, 'production root returns 200');
const headers = response?.headers() || {};
assert.ok(headers['content-security-policy']?.includes("default-src 'self'"), 'CSP is present');
assert.ok(headers['content-security-policy']?.includes("script-src 'self'"), 'CSP blocks inline scripts');
assert.equal(headers['x-content-type-options'], 'nosniff', 'nosniff header is present');
assert.ok(!headers['x-powered-by'], 'Express signature is hidden');

await scan('home');
assert.equal(await page.locator('#roleChoices .choice').count(), 4, 'four role choices');

const roles = [
  {
    name: 'Personal Support Worker (PSW)', includes: ['Morning personal care','Bathing and grooming assistance'], excludes: ['General cleaning and tidying'],
    schedule: 'Weekday mornings + 2 evenings', interview: 'experience providing support similar to this role'
  },
  {
    name: 'Housekeeper', includes: ['General cleaning and tidying','Laundry and linens'], excludes: ['Morning personal care','Medication reminders'],
    schedule: '2–3 daytime visits per week', interview: 'experience cleaning or maintaining private homes'
  },
  {
    name: 'Sitter / Companion', includes: ['Companionship and conversation','Family respite or relief'], excludes: ['Bathroom cleaning','Bathing and grooming assistance'],
    schedule: 'Weekday afternoons + occasional evenings', interview: 'experience providing companionship or supervision'
  },
  {
    name: 'Overnight Caregiver', includes: ['Overnight presence','Scheduled safety checks'], excludes: ['General cleaning and tidying','Companionship and conversation'],
    schedule: '2–3 overnight shifts per week', interview: 'experience providing overnight support'
  }
];

for (const role of roles) {
  await page.locator('.navbtn[data-nav="home"]').click();
  await page.locator(`.choice[data-role="${role.name}"]`).click();
  await page.locator('[data-next="needs"]').click();
  const taskText = await page.locator('#taskPicker').innerText();
  for (const item of role.includes) assert.ok(taskText.includes(item), `${role.name} includes ${item}`);
  for (const item of role.excludes) assert.ok(!taskText.includes(item), `${role.name} excludes ${item}`);
  await scan(`${role.name} needs`);

  const taskInputs = page.locator('#taskPicker input[type="checkbox"]');
  await taskInputs.nth(0).check();
  await taskInputs.nth(1).check();
  assert.equal(await page.locator('#taskEditor').isVisible(), true, `${role.name} task editor shown`);
  const hours = Number(await page.locator('#hours').inputValue());
  assert.ok(hours > 0, `${role.name} estimate is positive`);

  await page.locator('[data-next="details"]').click();
  assert.equal(await page.locator('#schedule').inputValue(), role.schedule, `${role.name} schedule default`);
  await page.locator('#pay').fill('$25/hour');
  await scan(`${role.name} details`);
  await page.locator('[data-next="job"]').click();
  const job = await page.locator('#jobDoc').innerText();
  assert.ok(job.includes(role.name), `${role.name} shown in job description`);
  assert.ok(job.includes(role.includes[0]), `${role.name} selected duty shown in job description`);
  await scan(`${role.name} job`);

  await page.locator('[data-next="interview"]').click();
  assert.ok((await page.locator('#interviewDoc').innerText()).toLowerCase().includes(role.interview.toLowerCase()), `${role.name} interview is tailored`);

  await page.locator('[data-next="status"]').click();
  const statusChecks = page.locator('#statusQuestions input[type="checkbox"]');
  await statusChecks.nth(0).check();
  await statusChecks.nth(1).check();
  assert.ok((await page.locator('#statusResult').innerText()).toLowerCase().includes('employment'), `${role.name} status guidance updates`);

  await page.locator('[data-next="agreement"]').click();
  const agreement = await page.locator('#agreementDoc').innerText();
  assert.ok(agreement.includes(role.name), `${role.name} agreement contains role`);
  assert.ok(agreement.includes('$25/hour'), `${role.name} agreement contains pay`);
}

// Draft storage is local-device only and must round-trip without a server account.
await page.locator('.navbtn[data-nav="details"]').click();
await page.locator('#notes').fill('QA local draft note');
await page.locator('#saveDraft').click();
const saved = await page.evaluate(() => localStorage.getItem('carehire.draft.v1'));
assert.ok(saved?.includes('QA local draft note'), 'local draft is saved');
page.once('dialog', dialog => dialog.accept());
await page.locator('.navbtn[data-nav="agreement"]').click();
await page.locator('#clearLocal').click();
assert.equal(await page.evaluate(() => localStorage.getItem('carehire.draft.v1')), null, 'local draft is cleared');

// Voice API validation without a production key: invalid inputs are rejected and a valid-shaped request fails closed as unconfigured.
const missing = await page.request.post(`${base}/api/voice/transcribe`, { data: {} });
assert.equal(missing.status(), 400, 'voice endpoint rejects missing audio');
const unsupported = await page.request.post(`${base}/api/voice/transcribe`, { data: { audioBase64: 'AQ==', mimeType: 'text/plain' } });
assert.equal(unsupported.status(), 400, 'voice endpoint rejects unsupported MIME');
const unconfigured = await page.request.post(`${base}/api/voice/transcribe`, { data: { audioBase64: 'AQ==', mimeType: 'audio/webm', languageHint: 'en-CA' } });
assert.equal(unconfigured.status(), 503, 'voice endpoint fails closed when Gemini is not configured');

const health = await page.request.get(`${base}/healthz`);
assert.equal(health.status(), 200, 'health endpoint returns 200');
assert.equal((await health.json()).service, 'carehire', 'health endpoint identifies service');

assert.deepEqual(browserErrors, [], `browser errors: ${browserErrors.join('; ')}`);
await context.close();
await browser.close();
console.log(`CareHire production E2E QA (${browserType}): PASS`);
