NOR ELLAB CAPITAL DASHBOARD BUNDLE

Upload all 10 files in this bundle to the same GitHub folder as your existing login.html:
dashboard.html, invest-now.html, my-investments.html, payment-review.html,
crypto-payment-history.html, deposit-history.html, transactions.html, support.html,
investor-dashboard.css, investor-dashboard.js.

Do not delete login.html. These pages redirect to login.html when no session exists.
The investments table must have user_id, investment_name, investment_type, amount, status, created_at.
Payment Review/history expect crypto_payments: user_id, currency, amount, transaction_reference, notes, status, created_at.
Deposit History expects deposits: user_id, currency, amount, status, created_at.
Transactions expects transactions with user_id and created_at plus compatible optional fields.
Configure Supabase RLS so authenticated users can read and write only their own rows.
A request/reference does not prove payment or approve an investment. The support page includes email/phone but not the existing Smartsupp script.
