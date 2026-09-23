-- ─────────────────────────────────────────────────────────────────────────────
-- dars-islam — MySQL schema
-- Run in: Strato control panel → phpMyAdmin → SQL tab → paste & run
-- Requires MySQL 5.7.8+ or MariaDB 10.2+ (JSON column support)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  -- NULL for students, who join via a class code (see `students` below)
  -- instead of an email/magic-link.
  email        VARCHAR(255) NULL UNIQUE,
  account_type VARCHAR(16)  NOT NULL DEFAULT 'consumer',
  role         VARCHAR(16)  NOT NULL DEFAULT 'player', -- 'player' | 'teacher' | 'student'
  created_at   DATETIME     NOT NULL DEFAULT NOW()
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
  user_id           CHAR(36)     NOT NULL PRIMARY KEY,
  coins             INT          NOT NULL DEFAULT 0,
  active_card_back  VARCHAR(64)  NOT NULL DEFAULT 'cardBack_blue1',
  owned_card_backs  JSON         NOT NULL,
  premium_until     DATETIME     NULL,
  last_coin_grant   DATETIME     NULL,
  wins              INT          NOT NULL DEFAULT 0,
  losses            INT          NOT NULL DEFAULT 0,
  games_played      INT          NOT NULL DEFAULT 0,
  best_streak       INT          NOT NULL DEFAULT 0,
  current_streak    INT          NOT NULL DEFAULT 0,
  display_name      VARCHAR(24)  NULL,
  xp                INT          NOT NULL DEFAULT 0,
  daily_streak      INT          NOT NULL DEFAULT 0,
  best_daily_streak INT          NOT NULL DEFAULT 0,
  last_played_date  DATE         NULL,
  badges            JSON         NULL,
  created_at        DATETIME     NOT NULL DEFAULT NOW(),
  updated_at        DATETIME     NOT NULL DEFAULT NOW(),
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

-- ── Schools, classes, students ───────────────────────────────────────────────
-- A teacher creates a school (gets an invite_code for co-teachers) and
-- classes within it (each with its own join_code). Students join with a
-- class join_code instead of an email — see api/auth/join-class.php.
CREATE TABLE IF NOT EXISTS schools (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  invite_code   CHAR(8)      NOT NULL UNIQUE,
  owner_user_id CHAR(36)     NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT NOW(),
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS school_members (
  school_id  CHAR(36)    NOT NULL,
  teacher_id CHAR(36)    NOT NULL,
  role       VARCHAR(16) NOT NULL DEFAULT 'teacher', -- 'owner' | 'teacher'
  joined_at  DATETIME    NOT NULL DEFAULT NOW(),
  PRIMARY KEY (school_id, teacher_id),
  FOREIGN KEY (school_id)  REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS classes (
  id         CHAR(36)    NOT NULL PRIMARY KEY,
  school_id  CHAR(36)    NOT NULL,
  teacher_id CHAR(36)    NOT NULL,
  name       VARCHAR(80) NOT NULL,
  join_code  CHAR(6)     NOT NULL UNIQUE,
  created_at DATETIME    NOT NULL DEFAULT NOW(),
  FOREIGN KEY (school_id)  REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS students (
  user_id   CHAR(36)  NOT NULL PRIMARY KEY,
  class_id  CHAR(36)  NOT NULL,
  joined_at DATETIME  NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id)  REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Cleanup indexes ──────────────────────────────────────────────────────────
CREATE INDEX idx_auth_tokens_user   ON auth_tokens (user_id);
CREATE INDEX idx_sessions_user      ON sessions (user_id);
CREATE INDEX idx_sessions_expires   ON sessions (expires_at);
CREATE INDEX idx_stripe_customer    ON stripe_subscriptions (stripe_customer_id);
CREATE INDEX idx_profiles_xp        ON profiles (xp DESC);
CREATE INDEX idx_school_members_teacher ON school_members (teacher_id);
CREATE INDEX idx_classes_school      ON classes (school_id);
CREATE INDEX idx_students_class      ON students (class_id);
