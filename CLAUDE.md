# CLAUDE.md — WMS (World Mango System) プロジェクト指示書

## プロジェクト概要
マンゴー加工業務の作業管理・支払処理Webアプリ。Vanilla JS → React + Vite + Tailwind へフルモダン化中。

## 絶対ルール
- **git push 禁止** — ローカルテストのみ。pushは明示的な指示があった場合のみ
- **`.env` をコミットしない** — Supabase接続情報が含まれる
- **本番JSONBin/Netlifyに干渉しない** — 既存の `index.html` は参照用として残す
- **作業前にdocsを確認** — `docs/PROGRESS.md` と `docs/FILE_OWNERSHIP.md` を必ず読む
- **作業後にdocsを更新** — 進捗・完了状態を `docs/PROGRESS.md` に反映する
- **他部署のファイルを編集しない** — `docs/FILE_OWNERSHIP.md` に従う

## 技術スタック
- React 19 + Vite 6 + TypeScript
- Tailwind CSS v4
- Zustand (状態管理)
- @dnd-kit (ドラッグ&ドロップ)
- Framer Motion (アニメーション)
- Lucide React (アイコン)
- React Router v7
- @supabase/supabase-js v2

## Supabase接続
- URL と anon key は `.env` に記載（`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`）
- テーブル: workers, processes, records, shifts, settings
- カラム名はスネークケース（例: `worker_name`, `bonus_rate`）
- 詳細は `docs/MIGRATION_LOG.md` のカラムマッピング参照

## デザイン方針
- マンゴーカラー（#ff8c00）を基調に洗練されたデザイン
- モバイルファースト
- シンプルで直感的なUI
- 梱包オプション: ドラッグ並べ替え + プッシュカウンター（+/-ボタン）
- 余計な装飾を避け、操作性重視

## 部署制度
このプロジェクトは複数のエージェントが並行作業する。各エージェントは担当部署に特化する。
- 部署の詳細: `docs/DEPARTMENTS.md`
- ファイル所有権: `docs/FILE_OWNERSHIP.md`
- 進捗管理: `docs/PROGRESS.md`

## コーディング規約
- コンポーネントは関数コンポーネント + hooks
- 型定義は `src/lib/types.ts` に集約
- Supabaseクライアントは `src/lib/supabase.ts` のシングルトン
- Tailwindクラスを直接使用（CSS Modules不使用）
- 日本語UIテキストはコンポーネント内に直書き（i18n不使用）
- ファイル名: コンポーネントはPascalCase、hooks/libはcamelCase

## 参照ファイル
- 現行機能の実装: `index.html`（旧コード、参照用）
- DB構造: `docs/supabase_schema.sql`
- データサンプル: `docs/supabase_seed.sql`
- 技術選定の詳細: `docs/TECH_STACK.md`
