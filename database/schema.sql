-- ─────────────────────────────────────────────────────────────────────────────
-- Minitoon.Games — MySQL schema
-- Run in: Strato control panel → phpMyAdmin → SQL tab → paste & run
-- Requires MySQL 5.7.8+ or MariaDB 10.2+ (JSON column support)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME     NOT NULL DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Magic-link tokens (1-hour expiry, single use) ────────────────────────────
CREATE TABLE IF NOT EXISTS auth_tokens (
  token      CHAR(64)   NOT NULL PRIMARY KEY,
  user_id    CHAR(36)   NOT NULL,
  expires_at DATETIME   NOT NULL,
  used       TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME   NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Sessions (30-day expiry) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  token      CHAR(64) NOT NULL PRIMARY KEY,
  user_id    CHAR(36) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Player profiles ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  user_id          CHAR(36)     NOT NULL PRIMARY KEY,
  coins            INT          NOT NULL DEFAULT 0,
  active_card_back VARCHAR(64)  NOT NULL DEFAULT 'cardBack_blue1',
  owned_card_backs JSON         NOT NULL,
  premium_until    DATETIME     NULL,
  last_coin_grant  DATETIME     NULL,
  wins             INT          NOT NULL DEFAULT 0,
  losses           INT          NOT NULL DEFAULT 0,
  games_played     INT          NOT NULL DEFAULT 0,
  best_streak      INT          NOT NULL DEFAULT 0,
  current_streak   INT          NOT NULL DEFAULT 0,
  created_at       DATETIME     NOT NULL DEFAULT NOW(),
  updated_at       DATETIME     NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Stripe subscriptions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id                      CHAR(36)     NOT NULL PRIMARY KEY,
  user_id                 CHAR(36)     NOT NULL,
  stripe_customer_id      VARCHAR(255) NOT NULL,
  stripe_subscription_id  VARCHAR(255) NULL UNIQUE,
  status                  VARCHAR(32)  NOT NULL,
  current_period_end      DATETIME     NULL,
  created_at              DATETIME     NOT NULL DEFAULT NOW(),
  updated_at              DATETIME     NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Cleanup indexes ──────────────────────────────────────────────────────────
CREATE INDEX idx_auth_tokens_user   ON auth_tokens (user_id);
CREATE INDEX idx_sessions_user      ON sessions (user_id);
CREATE INDEX idx_sessions_expires   ON sessions (expires_at);
CREATE INDEX idx_stripe_customer    ON stripe_subscriptions (stripe_customer_id);
