// Daily inactivity scan: warns teacher/parent accounts inactive 3+ months,
// then anonymizes ones still inactive 30 days after that warning. Never
// deletes auth.users — see database/supabase/0004_inactivity_cleanup.sql for
// why (schools.owner_user_id / classes.teacher_id both CASCADE from it).
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const OWNER_EMAIL = process.env.OWNER_EMAIL;
const FROM_EMAIL = process.env.INACTIVITY_FROM_EMAIL || 'dars-islam <noreply@dars-islam.app>';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — aborting.');
  process.exit(1);
}

// Safe no-op until Resend is set up: warning emails must actually send
// before an account is marked as warned, so without a key we skip the run
// entirely rather than silently starting 30-day countdowns nobody was told about.
if (!RESEND_API_KEY) {
  console.log('RESEND_API_KEY not set — skipping this run (no warnings sent, no accounts touched). Set the secret once Resend is configured.');
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function sendEmail(to, subject, text) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, text }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

function warningEmailBody(account) {
  return [
    `Hi${account.display_name ? ' ' + account.display_name : ''},`,
    '',
    "We haven't seen you sign in to dars-islam in over 3 months.",
    'To keep your account active, just sign in any time in the next 30 days — no other action needed.',
    '',
    "If we don't see a sign-in within 30 days, your account's personal details (display name and any parent-child links) will be anonymized. Your sign-in itself is never deleted, and any school or class you actively run is never affected.",
    '',
    "Questions, or want this handled sooner? Just reply to this email.",
  ].join('\n');
}

async function main() {
  const { data: rows, error } = await supabase.rpc('scan_inactive_accounts');
  if (error) throw error;

  const warned = [];
  const cleaned = [];
  const flagged = [];
  const failed = [];

  for (const account of rows ?? []) {
    try {
      if (account.action === 'warn') {
        await sendEmail(account.email, 'Your dars-islam account has been inactive', warningEmailBody(account));
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ inactivity_warned_at: new Date().toISOString() })
          .eq('id', account.user_id);
        if (updateError) throw updateError;
        warned.push(account);
      } else if (account.action === 'cleanup') {
        const { data: result, error: cleanupError } = await supabase.rpc('cleanup_inactive_account', {
          p_user_id: account.user_id,
        });
        if (cleanupError) throw cleanupError;
        if (result === 'flagged') flagged.push(account);
        else cleaned.push(account);
      }
    } catch (err) {
      failed.push({ account, message: err.message });
    }
  }

  console.log(`Warned: ${warned.length}, Cleaned: ${cleaned.length}, Flagged for review: ${flagged.length}, Failed: ${failed.length}`);

  if (OWNER_EMAIL && (warned.length || cleaned.length || flagged.length || failed.length)) {
    const lines = [
      `Inactivity scan summary — ${new Date().toISOString().slice(0, 10)}`,
      '',
      `Warned (3+ months inactive, first notice sent): ${warned.length}`,
      ...warned.map((a) => `  - ${a.email} (${a.role})`),
      '',
      `Cleaned up (still inactive 30+ days after warning): ${cleaned.length}`,
      ...cleaned.map((a) => `  - ${a.email} (${a.role})`),
      '',
      `Flagged for manual review (teacher still owns a school/class): ${flagged.length}`,
      ...flagged.map((a) => `  - ${a.email} (${a.role})`),
      '',
      `Failed: ${failed.length}`,
      ...failed.map((f) => `  - ${f.account.email}: ${f.message}`),
    ];
    await sendEmail(OWNER_EMAIL, 'dars-islam: inactivity scan summary', lines.join('\n'));
  }

  if (failed.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error('Inactivity scan failed:', err);
  process.exitCode = 1;
});
