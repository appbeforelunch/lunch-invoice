// Browser smoke test. Run: npm i -D playwright && npx playwright install chromium && node test.mjs
import { chromium } from 'playwright';
const url = 'file://' + new URL('./index.html', import.meta.url).pathname;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.addInitScript(() => { window.print = () => { window.__printed = document.getElementById('print').innerHTML; }; });
await page.goto(url);
const t = async (name, fn) => { try { await fn(); console.log('PASS', name); } catch (e) { console.log('FAIL', name, '->', e.message.split('\n')[0]); } };

await t('empty state', async () => { if (!(await page.textContent('#main')).includes('Pick an invoice')) throw new Error('no empty state'); });
await t('profile', async () => {
  await page.click('#editProfile'); await page.fill('#pName', 'Example Studio LLC'); await page.fill('#pAddress', '123 Main St\nSpringfield, NY'); await page.fill('#pEmail', 'hello@example.com'); await page.fill('#pPay', 'Zelle: hello@example.com'); await page.fill('#pTax', '8.375');
  await page.click('#saveProfile'); if (await page.isVisible('#profileModal .card')) throw new Error('modal still open');
});
await t('client', async () => {
  await page.click('#editClients'); await page.fill('#cName', 'Acme Co.'); await page.fill('#cEmail', 'ap@acme.com'); await page.fill('#cAddress', '99 Acme Way'); await page.click('#saveClient');
  if (!(await page.textContent('#clientList')).includes('Acme Co.')) throw new Error('client not listed');
  await page.keyboard.press('Escape');
});
await t('new invoice', async () => {
  await page.click('#newInvoice'); const h = await page.textContent('#main h1'); if (!h.includes('INV-0001')) throw new Error('number ' + h);
  const sel = await page.inputValue('#main select'); if (!sel) throw new Error('client not preselected');
  const tax = await page.inputValue('#main [data-f="tax"]'); if (tax !== '8.375') throw new Error('tax default ' + tax);
});
await t('line items + totals', async () => {
  await page.fill('#main [data-f="description"][data-i="0"]', 'iOS app development'); await page.fill('#main [data-f="qty"][data-i="0"]', '10'); await page.fill('#main [data-f="rate"][data-i="0"]', '150');
  await page.click('[data-act="addline"]'); await page.fill('#main [data-f="description"][data-i="1"]', 'App Store submission'); await page.fill('#main [data-f="rate"][data-i="1"]', '200');
  const tot = await page.textContent('#main .totals .grand span:last-child'); if (tot !== '$1,842.38') throw new Error('total ' + tot);
  const focused = await page.evaluate(() => document.activeElement?.dataset?.f); if (focused !== 'rate') throw new Error('focus lost -> ' + focused);
});
await t('sidebar reflects', async () => { const s = await page.textContent('#invoiceList'); if (!s.includes('Acme Co.') || !s.includes('$1,842.38')) throw new Error(s); });
await t('mark sent -> outstanding', async () => { await page.click('[data-act="sent"]'); if ((await page.textContent('#statOut')) !== '$1,842.38') throw new Error(await page.textContent('#statOut')); });
await t('mark paid -> stats', async () => { await page.click('[data-act="paid"]'); if ((await page.textContent('#statOut')) !== '$0.00') throw new Error('out'); if ((await page.textContent('#statPaid')) !== '$1,842.38') throw new Error('paid'); });
await t('pdf', async () => { await page.click('[data-act="pdf"]'); const html = await page.evaluate(() => window.__printed); if (!html || !html.includes('Example Studio LLC') || !html.includes('Acme Co.') || !html.includes('PAID') || !html.includes('$1,842.38')) throw new Error('print html incomplete'); });
await t('duplicate', async () => { await page.click('[data-act="dup"]'); const h = await page.textContent('#main h1'); if (!h.includes('INV-0002')) throw new Error(h); const badge = await page.textContent('#main .badge'); if (badge !== 'draft') throw new Error(badge); });
await t('persist after reload', async () => { await page.reload(); const s = await page.textContent('#invoiceList'); if (!s.includes('INV-0001') || !s.includes('INV-0002')) throw new Error(s); });
await t('remove line', async () => { await page.click('[data-rm="1"]'); const rows = await page.$$('#main tbody tr'); if (rows.length !== 1) throw new Error('rows ' + rows.length); });
await t('delete', async () => { page.once('dialog', d => d.accept()); await page.click('[data-act="del"]'); const s = await page.textContent('#invoiceList'); if (s.includes('INV-0002')) throw new Error('still there'); });
await t('mobile layout', async () => { await page.setViewportSize({ width: 390, height: 844 }); const cols = await page.evaluate(() => getComputedStyle(document.querySelector('.app')).gridTemplateColumns.split(' ').length); if (cols !== 1) throw new Error('cols ' + cols); });
await t('evening invoice is dated today, not tomorrow (UTC bug)', async () => {
  const ctx = await browser.newContext({ timezoneId: 'America/New_York' }); const p2 = await ctx.newPage();
  await p2.clock.setFixedTime(new Date('2026-09-04T21:30:00-04:00')); await p2.goto(url); await p2.click('#newInvoice');
  const issued = await p2.inputValue('[data-f="issued"]'); await ctx.close(); if (issued !== '2026-09-04') throw new Error('issued ' + issued);
});
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
