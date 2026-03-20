-- ============================================================
-- WMS セキュリティマイグレーション
-- 実行場所: Supabase ダッシュボード > SQL Editor
-- ============================================================

-- Phase 1: admin_pw/PIN をサーバーサイドで検証する関数

-- 管理者パスワード検証（クライアントに admin_pw を返さない）
CREATE OR REPLACE FUNCTION verify_admin_pw(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_pw TEXT;
BEGIN
  SELECT admin_pw INTO stored_pw FROM settings WHERE id = 1;
  RETURN stored_pw IS NOT NULL AND stored_pw = password;
END;
$$;

-- 作業者 PIN 検証（クライアントに pin を返さない）
CREATE OR REPLACE FUNCTION verify_worker_pin(p_worker_id TEXT, p_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_pin TEXT;
BEGIN
  SELECT pin INTO stored_pin FROM workers WHERE id = p_worker_id;
  RETURN stored_pin IS NOT NULL AND stored_pin <> '' AND stored_pin = p_pin;
END;
$$;

-- Phase 3: settings に hourly_rate カラム追加
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hourly_rate INTEGER DEFAULT 1200;

-- ============================================================
-- Phase 4: RLS ポリシー適正化
-- ============================================================

-- workers テーブル
DROP POLICY IF EXISTS "Allow all access" ON workers;
CREATE POLICY "workers_select" ON workers FOR SELECT USING (true);
CREATE POLICY "workers_insert" ON workers FOR INSERT WITH CHECK (true);
CREATE POLICY "workers_update" ON workers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "workers_delete" ON workers FOR DELETE USING (true);

-- processes テーブル
DROP POLICY IF EXISTS "Allow all access" ON processes;
CREATE POLICY "processes_select" ON processes FOR SELECT USING (true);
CREATE POLICY "processes_insert" ON processes FOR INSERT WITH CHECK (true);
CREATE POLICY "processes_update" ON processes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "processes_delete" ON processes FOR DELETE USING (true);

-- records テーブル
DROP POLICY IF EXISTS "Allow all access" ON records;
CREATE POLICY "records_select" ON records FOR SELECT USING (true);
CREATE POLICY "records_insert" ON records FOR INSERT WITH CHECK (true);
CREATE POLICY "records_update" ON records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "records_delete" ON records FOR DELETE USING (true);

-- shifts テーブル
DROP POLICY IF EXISTS "Allow all access" ON shifts;
CREATE POLICY "shifts_select" ON shifts FOR SELECT USING (true);
CREATE POLICY "shifts_insert" ON shifts FOR INSERT WITH CHECK (true);
CREATE POLICY "shifts_update" ON shifts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "shifts_delete" ON shifts FOR DELETE USING (true);

-- settings テーブル（SELECT + UPDATE のみ、INSERT/DELETE 不可）
DROP POLICY IF EXISTS "Allow all access" ON settings;
CREATE POLICY "settings_select" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_update" ON settings FOR UPDATE USING (true) WITH CHECK (true);

-- drafts テーブル
DROP POLICY IF EXISTS "Allow all access" ON drafts;
CREATE POLICY "drafts_select" ON drafts FOR SELECT USING (true);
CREATE POLICY "drafts_insert" ON drafts FOR INSERT WITH CHECK (true);
CREATE POLICY "drafts_update" ON drafts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "drafts_delete" ON drafts FOR DELETE USING (true);

-- feature_requests テーブル
DROP POLICY IF EXISTS "Allow all access" ON feature_requests;
CREATE POLICY "feature_requests_select" ON feature_requests FOR SELECT USING (true);
CREATE POLICY "feature_requests_insert" ON feature_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "feature_requests_update" ON feature_requests FOR UPDATE USING (true) WITH CHECK (true);
