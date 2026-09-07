-- FinApp — schema do banco (MySQL 8.x)
-- Rodar este script depois de criar o banco:
--   CREATE DATABASE finapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Uso: mysql -u root -p finapp < db/schema.sql

CREATE TABLE users (
  id               CHAR(36)      PRIMARY KEY,
  email            VARCHAR(255)  NOT NULL UNIQUE,
  name             VARCHAR(255)  NOT NULL,
  password_hash    VARCHAR(255)  NOT NULL,
  initial_balance  DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id          CHAR(36)              PRIMARY KEY,
  user_id     CHAR(36)              NOT NULL,
  name        VARCHAR(100)          NOT NULL,
  type        ENUM('income','expense') NOT NULL,
  color       VARCHAR(20)           NOT NULL,
  icon        VARCHAR(10)           NOT NULL,
  archived    BOOLEAN               NOT NULL DEFAULT FALSE,
  created_at  DATETIME              NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_categories_user (user_id)
);

CREATE TABLE recurrences (
  id            CHAR(36)                          PRIMARY KEY,
  user_id       CHAR(36)                          NOT NULL,
  category_id   CHAR(36)                          NOT NULL,
  type          ENUM('income','expense')          NOT NULL,
  amount        DECIMAL(10,2)                     NOT NULL,
  description   VARCHAR(255)                      NOT NULL,
  frequency     ENUM('monthly','weekly','yearly') NOT NULL,
  day_of_month  INT                                NOT NULL,
  start_date    DATE                               NOT NULL,
  end_date      DATE                               NULL,
  active        BOOLEAN                            NOT NULL DEFAULT TRUE,
  created_at    DATETIME                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_recurrences_user_active (user_id, active)
);

CREATE TABLE transactions (
  id             CHAR(36)                 PRIMARY KEY,
  user_id        CHAR(36)                 NOT NULL,
  category_id    CHAR(36)                 NOT NULL,
  recurrence_id  CHAR(36)                 NULL,
  type           ENUM('income','expense') NOT NULL,
  amount         DECIMAL(10,2)            NOT NULL,
  occurred_on    DATE                     NOT NULL,
  description    VARCHAR(255)             NULL,
  created_at     DATETIME                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME                 NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (recurrence_id) REFERENCES recurrences(id),
  INDEX idx_transactions_user_date (user_id, occurred_on)
);
