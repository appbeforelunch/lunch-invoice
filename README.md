# Lunch Invoice

A single-file invoicing app. Open `index.html` in a browser, that is the whole install. Live: https://appbeforelunch.github.io/lunch-invoice/
Built with Claude Code for App Before Lunch, episode 1 ("Can AI build my LLC's invoicing app before lunch?").
The exact prompt is in `PROMPT.md`.

- Business profile, clients, auto-numbered invoices, line items, tax, notes, statuses (draft / sent / paid)
- Outstanding and paid-this-year totals
- "Download PDF" opens the browser print dialog with a clean invoice layout (save as PDF)
- Everything is stored in your browser's localStorage. No account, no server, no subscription.
- Shortcuts: Cmd/Ctrl+N new invoice, Cmd/Ctrl+P print the open invoice, Esc closes dialogs

Known limitation: data lives in one browser. Export/backup is the obvious next feature.

## Tests

```bash
npm i -D playwright && npx playwright install chromium
node test.mjs
```

15 checks that click through the app like a person would, including the evening-date bug from the episode.
