# Supabase移行ログ

## 実行日時
2026-03-08

## 移行元
- **JSONBin API v3**
- BIN_ID: `69a1961fae596e708f4f49b8`
- バックアップファイル: `docs/jsonbin_backup.json`

## 移行先
- **Supabase PostgreSQL**
- Project URL: `https://bixiuvzcaosmefphttbe.supabase.co`
- 接続情報: `.env` に保管（gitignore済み）

## 作成済みテーブル

| テーブル | 件数 | RLS | ポリシー |
|---------|------|-----|---------|
| workers | 4件 | 有効 | allow_all |
| processes | 9件 | 有効 | allow_all |
| records | 5件 | 有効 | allow_all |
| shifts | 3件 | 有効 | allow_all |
| settings | 1件 | 有効 | allow_all |

## 移行済みデータ詳細

### Workers（4件）
1. ff（テスト用）
2. 多田健人
3. 宮崎 友祈子
4. 永田 映利佳

### Records（5件）
- 2026-02-27: ff, 宮崎健人
- 2026-02-28: 多田健人, 宮崎健人
- 2026-03-03: 多田健人

### Shifts（3件）
- ff: 2026-04-07〜11（pending）
- 多田健人: 2026-03-01〜02（approved）
- 多田健人: 2026-03-02, 12, 26（approved）

### Settings
- 会社名: WMS
- ボーナスレート: 10%
- 管理者パスワード: 1234

## カラム名マッピング（JSONBin → Supabase）

| JSONBinキー | Supabaseカラム |
|-------------|---------------|
| `bonusOn` | `bonus_on` |
| `bonusAmt` | `bonus_amt` |
| `bonusRate` | `bonus_rate` |
| `baseTotal` | `base_total` |
| `timerLog` | `timer_log` |
| `timerWorkMs` | `timer_work_ms` |
| `createdAt` | `created_at` |
| `workerName` | `worker_name` |
| `submittedAt` | `submitted_at` |
| `bankName` | `bank_name` |
| `bankBranch` | `bank_branch` |
| `bankType` | `bank_type` |
| `bankNumber` | `bank_number` |
| `bankHolder` | `bank_holder` |
| `adminPw` | `admin_pw` |

## セキュリティ

- `.env` に機密情報を保管
- `.gitignore` で `.env` と `jsonbin_backup.json` を除外
- git pushは行わない

## 次のステップ

- [ ] `index.html` の API接続先をSupabaseに変更
- [ ] `pushData()` / `pullData()` をSupabase REST APIに書き換え
- [ ] 各CRUD操作をテーブル単位に変更
- [ ] ローカルで動作テスト
