# 部署構成と担当範囲

## 部署一覧

### DEPT-1: インフラ部（Infrastructure）
**役割:** プロジェクト基盤の構築、設定ファイル、ビルド環境、デプロイ設定

**担当範囲:**
- `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`
- `netlify.toml`
- `index.html`（Viteエントリ）
- `src/main.tsx`
- `src/vite-env.d.ts`
- `.gitignore` の更新
- npm install / パッケージ管理

**成果物:** `npm run dev` で起動できる空のReactアプリ

---

### DEPT-2: バックエンド部（Backend / Data Layer）
**役割:** Supabase接続、型定義、状態管理、データ同期ロジック

**担当範囲:**
- `src/lib/supabase.ts` — Supabaseクライアント初期化
- `src/lib/types.ts` — 全型定義（Worker, Process, Record, Shift, Settings）
- `src/store/useStore.ts` — Zustandストア（全データ管理、CRUD操作）
- `src/hooks/useSync.ts` — 同期ステータス管理
- `src/hooks/useTimer.ts` — タイマーロジック

**依存:** DEPT-1完了後に開始
**制約:** UIコンポーネントは作成しない。型とロジックのみ。

---

### DEPT-3: デザイン部（Design / UI Components）
**役割:** 共通UIコンポーネント、デザインシステム、Tailwindカスタマイズ

**担当範囲:**
- `src/index.css` — Tailwindベーススタイル、カスタムCSS変数
- `src/components/ui/Button.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/ui/Counter.tsx` — プッシュカウンター共通部品
- `src/components/ui/Badge.tsx` — ステータスバッジ
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/BottomNav.tsx`
- `src/components/layout/SyncBar.tsx`
- `src/components/layout/AdminGuard.tsx`
- `src/pages/Login.tsx` — ログインページ（PIN認証）

**依存:** DEPT-1完了後に開始（DEPT-2と並行可能）
**制約:** Supabase直接呼び出しはしない。propsとコールバックで受け取る。

---

### DEPT-4: フィーチャー部A（Feature A — 作業入力・タイマー）
**役割:** 作業入力ページと関連コンポーネント

**担当範囲:**
- `src/pages/WorkSubmit.tsx` — 作業入力ページ
- `src/components/work/ProcessList.tsx` — ドラッグ可能な梱包リスト
- `src/components/work/ProcessItem.tsx` — 個別梱包アイテム + カウンター
- `src/components/work/WorkerPicker.tsx` — 作業者選択
- `src/components/work/Timer.tsx` — 作業タイマーUI
- `src/components/work/BonusToggle.tsx` — ボーナス切替
- `src/components/work/TotalPanel.tsx` — 合計表示パネル

**依存:** DEPT-2（型定義・ストア）、DEPT-3（UIコンポーネント）完了後
**現行コード参照:** `index.html` の buildProcList, calculate, saveRecord, timer関連

---

### DEPT-5: フィーチャー部B（Feature B — シフト・履歴・設定・印刷）
**役割:** 残り全ページの実装

**担当範囲:**
- `src/pages/ShiftRequest.tsx` — シフト希望ページ
- `src/pages/History.tsx` — 履歴・明細書ページ
- `src/pages/ShiftAdmin.tsx` — シフト管理ページ
- `src/pages/Settings.tsx` — 設定ページ
- `src/pages/MyShifts.tsx` — マイシフトページ
- `src/pages/MySalary.tsx` — 給料明細ページ
- `src/pages/MySettings.tsx` — マイ設定ページ
- `src/components/shift/Calendar.tsx`
- `src/components/shift/ShiftList.tsx`
- `src/components/history/RecordList.tsx`
- `src/components/history/RecordCard.tsx`
- `src/components/history/MonthSummary.tsx`
- `src/components/settings/CompanyForm.tsx`
- `src/components/settings/WorkerManager.tsx`
- `src/components/settings/PriceManager.tsx`
- `src/components/settings/PasswordForm.tsx`（管理者PIN変更）
- `src/components/print/PaymentDoc.tsx`

**依存:** DEPT-2（型定義・ストア）、DEPT-3（UIコンポーネント）完了後
**現行コード参照:** `index.html` の shift, history, settings, print関連

---

### DEPT-6: 統合部（Integration / App Shell）
**役割:** App.tsx のルーティング統合、全ページ結合、最終テスト

**担当範囲:**
- `src/App.tsx` — ルーティング、レイアウト統合

**依存:** 全部署完了後

---

## 実行順序

```
Phase 1:  DEPT-1（インフラ）
            ↓
Phase 2:  DEPT-2（バックエンド）＋ DEPT-3（デザイン）  ← 並行可能
            ↓
Phase 3:  DEPT-4（作業入力）＋ DEPT-5（シフト他）      ← 並行可能
            ↓
Phase 4:  DEPT-6（統合）
```

## ルール
1. **自分の担当ファイル以外を編集しない**
2. **作業開始時に `docs/PROGRESS.md` を読み、自分のタスクが開始可能か確認する**
3. **作業完了時に `docs/PROGRESS.md` を更新する**
4. **他部署に必要なインターフェース（型、props）を変更する場合は `docs/INTERFACES.md` に記載する**
5. **競合が発生した場合は作業を止めて報告する**
