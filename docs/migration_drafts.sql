-- ===========================================
-- WMS v2.2: drafts テーブル追加
-- ===========================================
-- Supabase Dashboard → SQL Editor で実行すること
-- 既存テーブルには影響しない（新規テーブルの追加のみ）

-- 6. drafts テーブル（作業中の下書き、端末間リアルタイム共有用）
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY DEFAULT 'default',   -- device_id or worker_id ベース
  worker_id TEXT,                          -- 選択中の作業者ID
  worker_name TEXT DEFAULT '',             -- 選択中の作業者名
  work_date DATE,                          -- 作業日
  address TEXT DEFAULT '',                 -- 住所
  remarks TEXT DEFAULT '',                 -- 備考
  bonus_on BOOLEAN DEFAULT FALSE,          -- ボーナス有効
  bonus_rate NUMERIC DEFAULT 10,           -- ボーナスレート
  quantities JSONB DEFAULT '{}',           -- {process_id: qty}
  hourly_hours NUMERIC DEFAULT 0,          -- 時間制作業の時間
  base_total NUMERIC DEFAULT 0,            -- 基本合計
  device_id TEXT DEFAULT '',               -- 端末識別子
  updated_at TIMESTAMPTZ DEFAULT NOW()     -- 最終更新日時
);

-- RLS設定
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON drafts FOR ALL USING (true) WITH CHECK (true);

-- Realtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE drafts;
