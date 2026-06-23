ALTER TABLE users
  ADD COLUMN account_type VARCHAR(16) NOT NULL DEFAULT 'consumer' AFTER email,
  ADD COLUMN active_organization_id CHAR(36) NULL AFTER account_type;

ALTER TABLE stripe_subscriptions
  ADD COLUMN organization_id CHAR(36) NULL AFTER user_id;

CREATE TABLE IF NOT EXISTS organizations (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  owner_user_id CHAR(36)     NOT NULL,
  name          VARCHAR(120) NOT NULL,
  slug          VARCHAR(120) NOT NULL UNIQUE,
  account_type  VARCHAR(16)  NOT NULL DEFAULT 'consumer',
  email_domain  VARCHAR(191) NULL,
  plan_key      VARCHAR(32)  NOT NULL DEFAULT 'free',
  is_personal   TINYINT(1)   NOT NULL DEFAULT 1,
  archived_at   DATETIME     NULL,
  created_at    DATETIME     NOT NULL DEFAULT NOW(),
  updated_at    DATETIME     NOT NULL DEFAULT NOW(),
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS organization_members (
  organization_id CHAR(36)    NOT NULL,
  user_id         CHAR(36)    NOT NULL,
  role            VARCHAR(16) NOT NULL DEFAULT 'member',
  created_at      DATETIME    NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS workspace_settings (
  organization_id CHAR(36)     NOT NULL PRIMARY KEY,
  brand_name      VARCHAR(120) NOT NULL,
  brand_tagline   VARCHAR(160) NULL,
  accent_color    VARCHAR(7)   NOT NULL DEFAULT '#ff6b35',
  logo_url        VARCHAR(255) NULL,
  created_at      DATETIME     NOT NULL DEFAULT NOW(),
  updated_at      DATETIME     NOT NULL DEFAULT NOW(),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS organization_invites (
  id              CHAR(36)     NOT NULL PRIMARY KEY,
  organization_id CHAR(36)     NOT NULL,
  email           VARCHAR(255) NOT NULL,
  token           CHAR(64)     NOT NULL UNIQUE,
  role            VARCHAR(16)  NOT NULL DEFAULT 'member',
  invited_by_user_id CHAR(36)  NOT NULL,
  accepted_by_user_id CHAR(36) NULL,
  accepted_at     DATETIME     NULL,
  expires_at      DATETIME     NOT NULL,
  revoked_at      DATETIME     NULL,
  created_at      DATETIME     NOT NULL DEFAULT NOW(),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (accepted_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS organization_activity_logs (
  id              CHAR(36)     NOT NULL PRIMARY KEY,
  organization_id CHAR(36)     NOT NULL,
  actor_user_id   CHAR(36)     NULL,
  action_key      VARCHAR(64)  NOT NULL,
  target_type     VARCHAR(32)  NULL,
  target_id       VARCHAR(64)  NULL,
  message         VARCHAR(255) NOT NULL,
  metadata_json   JSON         NULL,
  created_at      DATETIME     NOT NULL DEFAULT NOW(),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_users_active_org ON users (active_organization_id);
CREATE INDEX idx_stripe_org       ON stripe_subscriptions (organization_id);
CREATE INDEX idx_org_owner        ON organizations (owner_user_id);
CREATE INDEX idx_org_members_user ON organization_members (user_id);
CREATE INDEX idx_org_invites_org  ON organization_invites (organization_id);
CREATE INDEX idx_org_invites_email ON organization_invites (email);
CREATE INDEX idx_org_activity_org ON organization_activity_logs (organization_id);
