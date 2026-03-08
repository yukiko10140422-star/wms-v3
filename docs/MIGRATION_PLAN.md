# Supabase移行計画書

## 目的
現在のJSONBin + Netlify Functionsバックエンドを、Supabaseに移行する。
本番環境（Netlify/JSONBin）に干渉せず、ローカルで開発・テストを行う。

---

## 現状のアーキテクチャ

```
[ブラウザ] → [Netlify Function (プロキシ)] → [JSONBin API]
                jsonbin.js                    BIN_ID: 69a1961f...
```

- データはJSON1塊として保存・取得（PUT/GET）
- 全データを毎回丸ごと送受信

---

## 移行後のアーキテクチャ

```
[ブラウザ] → [Supabase REST API (直接接続)]
              PostgreSQLテーブル × 5
```

- テーブル単位でCRUD操作
- Netlify Functionは不要になる
- Row Level Security (RLS) で保護

---

## 移行対象データ

| データ | 件数 | 移行先テーブル |
|--------|------|---------------|
| records | 5件 | `records` |
| workers | 4件 | `workers` |
| settings | 1件 | `settings` |
| processes | 9件 | `processes` |
| shifts | 3件 | `shifts` |

バックアップ: `docs/jsonbin_backup.json`

---

## 作業ステップ

### Phase 1: 準備
- [x] 現在のデータ構造を分析
- [x] JSONBinデータのバックアップ取得
- [ ] Supabaseアカウント/プロジェクト作成

### Phase 2: Supabase設定
- [ ] テーブル作成（SQLスクリプト実行）
- [ ] RLSポリシー設定
- [ ] 既存データの投入

### Phase 3: コード修正
- [ ] Supabase JS クライアント導入（CDN）
- [ ] `pushData()` / `pullData()` をSupabase APIに書き換え
- [ ] 各CRUD操作をテーブル単位に変更
- [ ] Netlify Function依存を削除

### Phase 4: テスト
- [ ] ローカルでデータ取得テスト
- [ ] データ保存テスト
- [ ] 全機能の動作確認

---

## 修正対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `index.html` | Supabase CDN追加、API接続先変更、CRUD関数書き換え |
| `netlify/functions/jsonbin.js` | 削除対象（移行後は不要） |
| `netlify.toml` | functions設定を削除 |

---

## 注意事項

- 移行中は本番（JSONBin/Netlify）に一切変更を加えない
- git pushは行わない（ローカルテストのみ）
- 全変更前にファイルの現状を確認し、変更後に動作を検証する
