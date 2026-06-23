<?php
// ─── Database (Strato → control panel → MySQL → your credentials) ───────────
define('DB_HOST', 'database-5020757964.webspace-host.com');
define('DB_NAME', 'dbs15817249');
define('DB_USER', 'dbu2070656');
define('DB_PASS', '44Wr8kqCHIYQUvWx');

// ─── Site ────────────────────────────────────────────────────────────────────
define('SITE_URL',    'https://minitoon.games');
define('FROM_EMAIL',  'info@minitoon.games');   // must be on your domain
define('FROM_NAME',   'Minitoon Games');

// ─── Stripe (Developers → API keys) ─────────────────────────────────────────
define('STRIPE_SECRET_KEY',      'pk_live_51OwZ0D02Zuzqs62U9VV2nW32hqyZ53wCqaujXIO3fuXPHon7YcqCEuAQSUwC5RsW5qHsl0Yli2GMiP4Qg5lNf124009ytO2Z3N');
define('STRIPE_WEBHOOK_SECRET',  'whsec_ZU0vKsQVdI1gynwWWdwqQGkpZViESg8J');
define('STRIPE_PRODUCT_ID',      'prod_Uks6ff0VdrPGhz');  // product — active price looked up at checkout

// ─── Token lifetimes ─────────────────────────────────────────────────────────
define('AUTH_TOKEN_TTL',  60 * 60);           // magic link: 1 hour
define('SESSION_TTL',     30 * 24 * 60 * 60); // session:    30 days
