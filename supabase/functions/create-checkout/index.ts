/**
 * Supabase Edge Function: create-checkout
 *
 * Creates a Stripe Checkout Session for the €20/month premium subscription.
 * Embeds the user's Supabase ID so the webhook can map payment → account.
 *
 * Deploy:
 *   supabase functions deploy create-checkout
 *
 * Required secrets (set via Supabase dashboard → Edge Functions → Secrets):
 *   STRIPE_SECRET_KEY   — sk_live_...
 *   SITE_URL            — https://minitoon.games
 */

import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const PRICE_ID  = Deno.env.get('STRIPE_PRICE_ID')!;  // your €20/mo price ID from Stripe
const SITE_URL  = Deno.env.get('SITE_URL') ?? 'https://minitoon.games';
const CORS = {
  'Access-Control-Allow-Origin':  SITE_URL,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    // Verify the user's JWT
    const jwt = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!jwt) return json({ error: 'Unauthorized' }, 401);

    const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt);
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

    // Look up or create a Stripe customer tied to this user
    const { data: existing } = await supabase
      .from('stripe_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId = existing?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer:             customerId,
      mode:                 'subscription',
      line_items:           [{ price: PRICE_ID, quantity: 1 }],
      client_reference_id:  user.id,        // ← maps payment → Supabase user in webhook
      success_url:          `${SITE_URL}/?premium=success`,
      cancel_url:           `${SITE_URL}/`,
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    return json({ url: session.url });
  } catch (err) {
    console.error(err);
    return json({ error: 'Internal error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
