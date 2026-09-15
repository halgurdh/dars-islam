-- Adds cross-game XP/level, daily streak, badges and a public display name
-- to profiles, so the leaderboard has something other than an email to show.
ALTER TABLE profiles
  ADD COLUMN display_name      VARCHAR(24) NULL,
  ADD COLUMN xp                INT         NOT NULL DEFAULT 0,
  ADD COLUMN daily_streak      INT         NOT NULL DEFAULT 0,
  ADD COLUMN best_daily_streak INT         NOT NULL DEFAULT 0,
  ADD COLUMN last_played_date  DATE        NULL,
  -- NULL-able rather than the owned_card_backs-style "NOT NULL, app fills it
  -- in" — this column is added to rows that already exist, and MySQL/MariaDB
  -- reject a NOT NULL JSON column with no DEFAULT on a non-empty ALTER. The
  -- app (ensure_profile/get_profile) treats NULL the same as an empty array.
  ADD COLUMN badges            JSON        NULL;

UPDATE profiles SET badges = JSON_ARRAY() WHERE badges IS NULL;

CREATE INDEX idx_profiles_xp ON profiles (xp DESC);
