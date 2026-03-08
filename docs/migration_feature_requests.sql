-- feature_requests テーブル作成
-- Supabase SQL Editor で実行してください

CREATE TABLE IF NOT EXISTS feature_requests (
  id BIGINT PRIMARY KEY,
  author_name TEXT NOT NULL DEFAULT '匿名',
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'planned', 'done', 'declined')),
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- 誰でも読み書き可能（anonキー使用のため）
CREATE POLICY "Allow all access" ON feature_requests
  FOR ALL USING (true) WITH CHECK (true);

-- Realtime は不要（ポーリングで十分）
