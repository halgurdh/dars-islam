/**
 * Supabase Edge Function: stripe-webhook
 *
 * Receives Stripe events and updates the user's premium status in PostgreSQL.
 * This is the only place premium is granted — client code cannot fake it.
 *
 * Deploy:
 *   supabase functions deploy stripe-webhook
 *
 * Required secrets:
 *   STRIPE_SECRET_KEY      — sk_live_...
 *   STRIPE_WEBHOOK_SECRET  — whsec_... (from Stripe → Webhooks → your endpoint)
 *
 * In Stripe dashboard → Webhooks, point to:
 *   https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook
 *
 * Listen for events:
 *   customer.subscription.created
 *   customer.subscription.updated
 *   customer.subscription.deleted
 */

import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const PREMIUM_COIN_BONUS = 500;

Deno.serve(async (req) => {
  const sig  = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, sig!, Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    return new Response(`Webhook signature failed: ${(err as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub        = event.data.object as Stripe.Subscription;
        const userId     = sub.metadata?.supabase_user_id ?? sub.client_reference_id;
        const isActive   = sub.status === 'active' || sub.status === 'trialing';
        const periodEnd  = isActive
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

        if (!userId) { console.error('No user ID in subscription metadata'); break; }

        // Upsert subscription record
        await supabase.from('stripe_subscriptions').upsert({
          user_id:                userId,
          stripe_customer_id:     sub.customer as string,
          stripe_subscription_id: sub.id,
          status:                 sub.status,
          current_period_end:     periodEnd,
          updated_at:             new Date().toISOString(),
        }, { onConflict: 'stripe_subscription_id' });

        // Update premium_until on profile
        await supabase.from('profiles')
          .update({ premium_until: periodEnd, updated_at: new Date().toISOString() })
          .eq('id', userId);

        // Grant coin bonus on new subscription only
        if (isActive && event.type === 'customer.subscription.created') {
          await supabase.rpc('add_coins', { p_user_id: userId, p_amount: PREMIUM_COIN_BONUS });

          // Unlock all Dragon (red) card backs
          const { data: profile } = await supabase
            .from('profiles')
            .select('owned_card_backs')
            .eq('id', userId)
            .single<{ owned_card_backs: string[] }>();

          const owned  = profile?.owned_card_backs ?? ['cardBack_blue2'];
          const dragon = ['cardBack_red1','cardBack_red2','cardBack_red3','cardBack_red4','cardBack_red5'];
          const merged = [...new Set([...owned, ...dragon])];
          await supabase.from('profiles')
            .update({ owned_card_backs: merged, updated_at: new Date().toISOString() })
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id ?? sub.client_reference_id;
        if (!userId) break;

        await supabase.from('stripe_subscriptions')
          .update({ status: 'canceled', current_period_end: null, updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id);

        await supabase.from('profiles')
          .update({ premium_until: null, updated_at: new Date().toISOString() })
          .eq('id', userId);
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return new Response('Handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
