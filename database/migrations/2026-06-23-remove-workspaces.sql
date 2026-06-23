ALTER TABLE users
  DROP COLUMN active_organization_id;

ALTER TABLE stripe_subscriptions
  DROP COLUMN organization_id;

DROP TABLE IF EXISTS organization_activity_logs;
DROP TABLE IF EXISTS organization_invites;
DROP TABLE IF EXISTS workspace_settings;
DROP TABLE IF EXISTS organization_members;
DROP TABLE IF EXISTS organizations;
