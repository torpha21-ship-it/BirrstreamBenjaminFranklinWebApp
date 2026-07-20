CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  full_name text NOT NULL,
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  main_balance numeric(14,2) NOT NULL DEFAULT '0',
  total_yield numeric(14,2) NOT NULL DEFAULT '0',
  total_deposited numeric(14,2) NOT NULL DEFAULT '0',
  total_withdrawn numeric(14,2) NOT NULL DEFAULT '0',
  referral_code text NOT NULL UNIQUE,
  referred_by_user_id integer REFERENCES users(id),
  login_streak integer NOT NULL DEFAULT 0,
  last_login_at timestamp,
  is_admin boolean NOT NULL DEFAULT false,
  profile_photo text,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS packages (
  id serial PRIMARY KEY,
  name text NOT NULL,
  cost numeric(14,2) NOT NULL,
  daily_return numeric(14,2) NOT NULL,
  total_yield numeric(14,2) NOT NULL,
  duration_days integer NOT NULL DEFAULT 7,
  is_locked boolean NOT NULL DEFAULT false,
  tier text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_packages (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  package_id integer NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  purchased_at timestamp NOT NULL DEFAULT NOW(),
  expires_at timestamp NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  total_earned numeric(14,2) NOT NULL DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS transactions (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  type text NOT NULL,
  amount numeric(14,2) NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  related_id integer,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deposits (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount numeric(14,2) NOT NULL,
  sender_name text NOT NULL,
  receipt_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount numeric(14,2) NOT NULL,
  bank_name text NOT NULL,
  account_name text NOT NULL,
  wallet_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawal_settings (
  id serial PRIMARY KEY,
  user_id integer NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  bank_name text,
  account_name text,
  wallet_id text,
  updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commissions (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  from_user_id integer NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  level integer NOT NULL,
  amount numeric(14,2) NOT NULL,
  description text NOT NULL,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_tasks (
  id serial PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  reward numeric(8,2) NOT NULL,
  task_type text NOT NULL,
  action_url text,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS user_task_completions (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  task_id integer NOT NULL REFERENCES daily_tasks(id) ON DELETE RESTRICT,
  completed_at timestamp NOT NULL DEFAULT NOW(),
  date text NOT NULL,
  CONSTRAINT uq_task_completion_daily UNIQUE (user_id, task_id, date)
);

CREATE TABLE IF NOT EXISTS login_streaks (
  id serial PRIMARY KEY,
  user_id integer NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  current_streak integer NOT NULL DEFAULT 0,
  last_checkin_date text,
  updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date ON transactions(user_id, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_user_status ON deposits(user_id, status);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_status ON withdrawals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_user_packages_user_active ON user_packages(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_from_user_id ON commissions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_deposits_status'
  ) THEN
    ALTER TABLE deposits
      ADD CONSTRAINT chk_deposits_status
      CHECK (status IN ('pending','approved','rejected'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_withdrawals_status'
  ) THEN
    ALTER TABLE withdrawals
      ADD CONSTRAINT chk_withdrawals_status
      CHECK (status IN ('pending','approved','rejected'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_transactions_status'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT chk_transactions_status
      CHECK (status IN ('pending','completed','rejected'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_transactions_type'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT chk_transactions_type
      CHECK (type IN (
        'deposit',
        'withdrawal',
        'task_earning',
        'commission',
        'daily_yield',
        'streak_bonus',
        'package_purchase',
        'admin_adjustment'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_commissions_level'
  ) THEN
    ALTER TABLE commissions
      ADD CONSTRAINT chk_commissions_level
      CHECK (level IN (1,2,3));
  END IF;
END $$;

INSERT INTO packages (name, cost, daily_return, total_yield, duration_days, is_locked, tier, sort_order)
VALUES
  ('VIP 1',     500,    35,    245,    7, false, 'vip1',  1),
  ('VIP 2',     1000,   80,    560,    7, false, 'vip2',  2),
  ('VIP 3',     2000,   180,   1260,   7, false, 'vip3',  3),
  ('VIP 4',     5000,   500,   3500,   7, false, 'vip4',  4),
  ('VIP 5',     10000,  1100,  7700,   7, false, 'vip5',  5),
  ('VIP Elite', 25000,  3000,  21000,  7, true,  'elite', 6),
  ('VIP Apex',  50000,  7000,  49000,  7, true,  'apex',  7),
  ('VIP Titan', 100000, 16000, 112000, 7, true,  'titan', 8),
  ('VIP Alpha', 250000, 45000, 315000, 7, true,  'alpha', 9)
ON CONFLICT DO NOTHING;

INSERT INTO daily_tasks (title, description, reward, task_type, action_url, is_active)
VALUES
  ('Watch a BirrStream video',      'Watch any video on our streaming platform for 5 minutes',             15, 'stream_video',  null,                      true),
  ('Visit the BirrStream homepage', 'Open and browse the BirrStream main page for 2 minutes',             10, 'open_page',     null,                      true),
  ('Join BirrStream Telegram',      'Join our official Telegram channel for updates and bonuses',         20, 'join_telegram', 'https://t.me/birrstream', true),
  ('Share your referral link',      'Share your unique referral link with at least one person today',     25, 'other',         null,                      true),
  ('Complete your profile',         'Ensure your full name and email are up to date in your profile',     10, 'other',         null,                      true),
  ('Watch 2 more videos',           'Watch 2 additional streaming videos on BirrStream',                  20, 'stream_video',  null,                      true)
ON CONFLICT DO NOTHING;
