-- ===========================================
-- GMS (Global Mango System) Supabase Schema
-- ===========================================
-- このSQLをSupabaseのSQL Editorで実行してテーブルを作成する

-- 1. workers テーブル
CREATE TABLE workers (
  id TEXT PRIMARY KEY,               -- 例: "w1772204141765"
  name TEXT NOT NULL,                -- 作業者名
  address TEXT DEFAULT '',           -- 住所
  avatar TEXT DEFAULT '',            -- base64画像
  bank_name TEXT DEFAULT '',         -- 銀行名
  bank_branch TEXT DEFAULT '',       -- 支店名
  bank_type TEXT DEFAULT '普通',     -- 口座種別（普通/当座）
  bank_number TEXT DEFAULT '',       -- 口座番号
  bank_holder TEXT DEFAULT '',       -- 口座名義
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. processes テーブル
CREATE TABLE processes (
  id TEXT PRIMARY KEY,               -- 例: "box", "roll"
  name TEXT NOT NULL,                -- 加工名
  price INTEGER NOT NULL DEFAULT 0,  -- 単価（円）
  sort_order INTEGER DEFAULT 0       -- 表示順
);

-- 3. records テーブル
CREATE TABLE records (
  id BIGINT PRIMARY KEY,             -- タイムスタンプベースID
  date DATE NOT NULL,                -- 作業日
  worker_name TEXT NOT NULL,         -- 作業者名
  address TEXT DEFAULT '',           -- 住所
  remarks TEXT DEFAULT '',           -- 備考
  avatar TEXT DEFAULT '',            -- base64画像
  bonus_on BOOLEAN DEFAULT FALSE,    -- ボーナス有効
  bonus_amt NUMERIC DEFAULT 0,       -- ボーナス金額
  bonus_rate NUMERIC DEFAULT 10,     -- ボーナスレート
  items JSONB DEFAULT '[]',          -- 作業項目 [{name, price, qty, sub, isHourly}]
  base_total NUMERIC DEFAULT 0,      -- 基本合計
  total NUMERIC DEFAULT 0,           -- 合計金額
  hours NUMERIC DEFAULT 0,           -- 作業時間
  timer_log JSONB DEFAULT '[]',      -- タイマーログ [{type, time}]
  timer_work_ms BIGINT DEFAULT 0,    -- 作業時間（ミリ秒）
  status TEXT DEFAULT 'pending',     -- ステータス: pending/approved/rejected
  created_at TEXT                     -- 作成日時（元のフォーマット維持）
);

-- 4. shifts テーブル
CREATE TABLE shifts (
  id BIGINT PRIMARY KEY,             -- タイムスタンプベースID
  worker_name TEXT NOT NULL,         -- 作業者名
  dates JSONB DEFAULT '[]',          -- シフト日配列 ["YYYY-MM-DD", ...]
  submitted_at TEXT,                 -- 申請日時（元のフォーマット維持）
  status TEXT DEFAULT 'pending'      -- ステータス: pending/approved/rejected
);

-- 5. settings テーブル（1行のみ）
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- 常に1行
  company TEXT DEFAULT '',           -- 会社名
  manager TEXT DEFAULT '',           -- 管理者名
  address TEXT DEFAULT '',           -- 住所
  bonus_rate NUMERIC DEFAULT 10,     -- ボーナスレート
  bank_name TEXT DEFAULT '',         -- 振込元銀行名
  bank_branch TEXT DEFAULT '',       -- 振込元支店名
  bank_type TEXT DEFAULT '普通',     -- 振込元口座種別
  bank_number TEXT DEFAULT '',       -- 振込元口座番号
  bank_holder TEXT DEFAULT '',       -- 振込元口座名義
  admin_pw TEXT DEFAULT '1234'       -- 管理者パスワード
);

-- ===========================================
-- Row Level Security (RLS) 設定
-- ===========================================
-- anon キーでのアクセスを許可（シンプル構成）

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 全テーブルに対してanon/authenticatedからのフルアクセスを許可
CREATE POLICY "Allow all access" ON workers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON processes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON shifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON settings FOR ALL USING (true) WITH CHECK (true);

-- ===========================================
-- 初期データ: settings（デフォルト行）
-- ===========================================
INSERT INTO settings (id, company, manager, address, bonus_rate, bank_name, bank_branch, bank_type, bank_number, bank_holder, admin_pw)
VALUES (1, 'WMS', '', '', 10, '', '', '普通', '', '', '1234');
