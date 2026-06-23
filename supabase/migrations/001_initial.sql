-- ─────────────────────────────────────────────────────────────────────────────
-- Minitoon.Games — initial schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Player profiles (one per auth user)
CREATE TABLE public.profiles (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username          TEXT,
  coins             INTEGER     NOT NULL DEFAULT 0,
  active_card_back  TEXT        NOT NULL DEFAULT 'cardBack_blue2',
  owned_card_backs  TEXT[]      NOT NULL DEFAULT ARRAY['cardBack_blue2'],
  premium_until     TIMESTAMPTZ,
  last_coin_grant   TIMESTAMPTZ,           -- for monthly coin drip
  wins              INTEGER     NOT NULL DEFAULT 0,
  losses            INTEGER     NOT NULL DEFAULT 0,
  games_played      INTEGER     NOT NULL DEFAULT 0,
  best_streak       INTEGER     NOT NULL DEFAULT 0,
  current_streak    INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and write only their own profile
CREATE POLICY "profiles: own row read"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles: own row write"
  ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────

-- Stripe subscriptions (written by the webhook Edge Function via service role)
CREATE TABLE public.stripe_subscriptions (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id      TEXT        NOT NULL,
  stripe_subscription_id  TEXT        UNIQUE,
  status                  TEXT        NOT NULL,   -- active | canceled | past_due | trialing
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscription (webhook writes via service role — no RLS needed there)
CREATE POLICY "subscriptions: own row read"
  ON public.stripe_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: safely add coins (used by webhook to grant premium bonus)
CREATE OR REPLACE FUNCTION public.add_coins(p_user_id UUID, p_amount INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET coins = GREATEST(0, coins + p_amount), updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Helper: grant monthly coin drip (called by Edge Function or cron)
CREATE OR REPLACE FUNCTION public.grant_monthly_coins(p_user_id UUID, p_amount INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET
    coins          = GREATEST(0, coins + p_amount),
    last_coin_grant = NOW(),
    updated_at     = NOW()
  WHERE id = p_user_id
    AND (last_coin_grant IS NULL OR last_coin_grant < NOW() - INTERVAL '28 days');
END;
$$;
