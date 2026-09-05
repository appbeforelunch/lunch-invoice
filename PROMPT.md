# The prompt (episode 1, App Before Lunch)

Build me a single-file invoicing web app for my new LLC so I never pay $30/month for invoices.

Requirements:
- One index.html, no build step, no backend. Everything saves to localStorage.
- My business profile: name, address, email, payment instructions. Shown on every invoice.
- Clients: name, email, address. Pick one per invoice.
- Invoices: auto-numbered (INV-0001...), issue date, due date, line items (description, qty, rate),
  tax rate %, notes, status (draft / sent / paid).
- A list of all invoices with status badges and an "outstanding" total at the top.
- "Download PDF" = print stylesheet that hides the UI and prints a clean invoice.
- Duplicate an invoice, mark it paid, delete it.
- Clean, light UI. Keyboard-friendly. Works on a phone.
