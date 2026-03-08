-- ===========================================
-- GMS データ移行SQL（JSONBin → Supabase）
-- ===========================================

-- Workers
INSERT INTO workers (id, name, address, avatar, bank_name, bank_branch, bank_type, bank_number, bank_holder) VALUES ('w1772203669594', 'ff', 'ff', '', '', '', '普通', '', '');
INSERT INTO workers (id, name, address, avatar, bank_name, bank_branch, bank_type, bank_number, bank_holder) VALUES ('w1772204141765', '多田健人', 'ffff', '', '', '', '普通', '', '');
INSERT INTO workers (id, name, address, avatar, bank_name, bank_branch, bank_type, bank_number, bank_holder) VALUES ('w1772946377491', '宮崎 友祈子', '藤沢市辻堂6-13-14', '', '', '', '普通', '', '');
INSERT INTO workers (id, name, address, avatar, bank_name, bank_branch, bank_type, bank_number, bank_holder) VALUES ('w1772946755161', '永田　映利佳', '神奈川県藤沢市鵠沼松が岡2-5-3-101', '', '楽天銀行', 'リード支店', '普通', '1247661', 'ナガタ　エリカ');

-- Processes
INSERT INTO processes (id, name, price, sort_order) VALUES ('box', '箱に入れる', 50, 0);
INSERT INTO processes (id, name, price, sort_order) VALUES ('waterproof', '防水袋 / プチプチ', 10, 1);
INSERT INTO processes (id, name, price, sort_order) VALUES ('roll', 'プチプチロール', 30, 2);
INSERT INTO processes (id, name, price, sort_order) VALUES ('compress', '圧縮', 70, 3);
INSERT INTO processes (id, name, price, sort_order) VALUES ('boxwork', '箱加工（通常）', 100, 4);
INSERT INTO processes (id, name, price, sort_order) VALUES ('boxlarge', '箱加工（特大）', 200, 5);
INSERT INTO processes (id, name, price, sort_order) VALUES ('set', 'セット梱包', 50, 6);
INSERT INTO processes (id, name, price, sort_order) VALUES ('danboru', '巻段ボール', 50, 7);
INSERT INTO processes (id, name, price, sort_order) VALUES ('label', '発送伝票打ち込み', 50, 8);

-- Records
INSERT INTO records (id, date, worker_name, address, remarks, avatar, bonus_on, bonus_amt, bonus_rate, items, base_total, total, hours, timer_log, timer_work_ms, status, created_at) VALUES (1772542643091, '2026-03-03', '多田健人', 'ffff', '【作業ログ】
[21:56:55] 開始
[21:57:04] 休憩
[21:57:04] 終了
作業：0時間00分 / 休憩：0時間00分', '', false, 0, 10, '[{"name": "箱に入れる", "price": 50, "qty": 3, "sub": 150}, {"name": "プチプチロール", "price": 30, "qty": 2, "sub": 60}, {"name": "箱加工（通常）", "price": 100, "qty": 3, "sub": 300}, {"name": "セット梱包", "price": 50, "qty": 3, "sub": 150}]', 660, 660, 0, '[{"type": "開始", "time": "2026-03-03T12:56:55.645Z"}, {"type": "休憩", "time": "2026-03-03T12:57:04.753Z"}, {"type": "終了", "time": "2026-03-03T12:57:04.754Z"}]', 9108, 'approved', '2026/3/3 21:57:23');
INSERT INTO records (id, date, worker_name, address, remarks, avatar, bonus_on, bonus_amt, bonus_rate, items, base_total, total, hours, timer_log, timer_work_ms, status, created_at) VALUES (1772251726038, '2026-02-28', '多田健人', 'ffff', '【作業ログ】
[13:08:37] 開始
[13:08:39] 休憩
[13:08:39] 終了
作業：0時間00分 / 休憩：0時間00分
【作業ログ】
[13:08:37] 開始
[13:08:39] 休憩
[13:08:39] 終了
[13:08:41] 終了
作業：0時間00分 / 休憩：0時間00分', '', false, 0, 10, '[{"name": "箱に入れる", "price": 50, "qty": 3, "sub": 150}]', 150, 150, 0, '[{"type": "開始", "time": "2026-02-28T04:08:37.409Z"}, {"type": "休憩", "time": "2026-02-28T04:08:39.407Z"}, {"type": "終了", "time": "2026-02-28T04:08:39.423Z"}, {"type": "終了", "time": "2026-02-28T04:08:41.369Z"}]', 1998, 'approved', '2026/2/28 13:08:46');
INSERT INTO records (id, date, worker_name, address, remarks, avatar, bonus_on, bonus_amt, bonus_rate, items, base_total, total, hours, timer_log, timer_work_ms, status, created_at) VALUES (1772250466326, '2026-02-28', '宮崎健人', '', '【作業ログ】
[12:47:12] 開始
[12:47:17] 休憩
[12:47:17] 終了
作業：0時間00分 / 休憩：0時間00分
【作業ログ】
[12:47:12] 開始
[12:47:17] 休憩
[12:47:17] 終了
[12:47:19] 終了
作業：0時間00分 / 休憩：0時間00分', '', true, 150, 10, '[{"name": "箱に入れる", "price": 50, "qty": 30, "sub": 1500}]', 1500, 1650, 0, '[{"type": "開始", "time": "2026-02-28T03:47:12.742Z"}, {"type": "休憩", "time": "2026-02-28T03:47:17.244Z"}, {"type": "終了", "time": "2026-02-28T03:47:17.246Z"}, {"type": "終了", "time": "2026-02-28T03:47:19.261Z"}]', 4502, 'approved', '2026/2/28 12:47:46');
INSERT INTO records (id, date, worker_name, address, remarks, avatar, bonus_on, bonus_amt, bonus_rate, items, base_total, total, hours, timer_log, timer_work_ms, status, created_at) VALUES (1772204693103, '2026-02-27', '宮崎健人', '', '【作業ログ】
[0:04:31] 開始
[0:04:36] 休憩
[0:04:37] 再開
[0:04:38] 休憩
[0:04:38] 終了', '', false, 0, 10, '[{"name": "箱に入れる", "price": 50, "qty": 3, "sub": 150}]', 150, 150, 0, '[{"type": "開始", "time": "2026-02-27T15:04:31.599Z"}, {"type": "休憩", "time": "2026-02-27T15:04:36.324Z"}, {"type": "再開", "time": "2026-02-27T15:04:37.814Z"}, {"type": "休憩", "time": "2026-02-27T15:04:38.725Z"}, {"type": "終了", "time": "2026-02-27T15:04:38.726Z"}]', 0, 'approved', '2026/2/28 0:04:53');
INSERT INTO records (id, date, worker_name, address, remarks, avatar, bonus_on, bonus_amt, bonus_rate, items, base_total, total, hours, timer_log, timer_work_ms, status, created_at) VALUES (1772203684831, '2026-02-27', 'ff', 'ff', '', '', false, 0, 10, '[{"name": "箱に入れる", "price": 50, "qty": 3, "sub": 150}]', 150, 150, 0, '[]', 0, 'approved', '2026/2/27 23:48:04');

-- Shifts
INSERT INTO shifts (id, worker_name, dates, submitted_at, status) VALUES (1772542771699, 'ff', '["2026-04-07", "2026-04-08", "2026-04-09", "2026-04-10", "2026-04-11"]', '2026/3/3 21:59:31', 'pending');
INSERT INTO shifts (id, worker_name, dates, submitted_at, status) VALUES (1772272942853, '多田健人', '["2026-03-01", "2026-03-02"]', '2026/2/28 19:02:22', 'approved');
INSERT INTO shifts (id, worker_name, dates, submitted_at, status) VALUES (1772250547566, '多田健人', '["2026-03-02", "2026-03-12", "2026-03-26"]', '2026/2/28 12:49:07', 'approved');

-- Settings (update default row)
UPDATE settings SET company='WMS', manager='', address='', bonus_rate=10, bank_name='', bank_branch='', bank_type='普通', bank_number='', bank_holder='', admin_pw='1234' WHERE id=1;