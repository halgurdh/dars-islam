-- Teacher/school/class hierarchy. Students join via a class join-code
-- instead of email (see api/auth/join-class.php) — they're still ordinary
-- `users` + `profiles` rows underneath, so the existing XP/streak/badge/
-- leaderboard system just works for them unchanged.

ALTER TABLE users
  MODIFY COLUMN email VARCHAR(255) NULL,
  ADD COLUMN role VARCHAR(16) NOT NULL DEFAULT 'player';

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

CREATE INDEX idx_school_members_teacher ON school_members (teacher_id);
CREATE INDEX idx_classes_school         ON classes (school_id);
CREATE INDEX idx_students_class         ON students (class_id);
