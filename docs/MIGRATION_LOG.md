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

## DB接続方法（CLIからのSQL実行）

`.env` から接続情報を読み取り、`pg` パッケージで直接接続する。

```bash
# Node.js で実行（pg パッケージが必要）
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: 'db.bixiuvzcaosmefphttbe.supabase.co',
  port: 5432,
  user: 'postgres',
  password: process.env.DB_PASSWORD || '.envのDB_PASSWORDを参照',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});
(async () => {
  const { rows } = await pool.query('SELECT * FROM workers LIMIT 5');
  console.log(rows);
  await pool.end();
})();
"
```

### 環境変数（.env）
| 変数名 | 用途 |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase REST API URL（フロントエンド用） |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key（フロントエンド用） |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key（管理操作用、フロントエンドでは不使用） |
| `DB_PASSWORD` | PostgreSQL直接接続のパスワード |

### 実行済み移行

| 日付 | ファイル | 内容 |
| --- | --- | --- |
| 2026-03-08 | (初期) | テーブル作成 + データ移行 |
| 2026-03-08 | migration_drafts.sql | draftsテーブル追加 |
| 2026-03-08 | migration_phase8.sql | workers.pin, shifts.type, shifts.reason 追加 |

## セキュリティ

- `.env` に機密情報を保管（DB_PASSWORD, API keys）
- `.gitignore` で `.env` と `jsonbin_backup.json` を除外
- git pushは行わない（明示的な指示がある場合のみ）

## 次のステップ

- [ ] `index.html` の API接続先をSupabaseに変更
- [ ] `pushData()` / `pullData()` をSupabase REST APIに書き換え
- [ ] 各CRUD操作をテーブル単位に変更
- [ ] ローカルで動作テスト
