# 進捗管理表

> 各部署は作業開始時・完了時にこのファイルの自分のセクションを更新すること。
> ステータス: `待機` → `進行中` → `完了` / `ブロック中`

---

## Phase 1

### DEPT-1: インフラ部


| タスク                               | ステータス | 担当Agent | 備考                |
| --------------------------------- | ----- | ------- | ----------------- |
| Vite + React + TS プロジェクト初期化       | 完了    | main    |                   |
| Tailwind CSS v4 導入                | 完了    | main    | @tailwindcss/vite |
| 依存パッケージインストール                     | 完了    | main    | 全パッケージインストール済み    |
| tsconfig / vite.config 設定         | 完了    | main    | @エイリアス設定済み        |
| netlify.toml 更新                   | 完了    | main    | dist出力に変更         |
| 旧index.html → old_index.html リネーム | 完了    | main    |                   |
| src/ ディレクトリ構造作成                   | 完了    | main    | 全ディレクトリ作成済み       |
| `vite build` 動作確認                 | 完了    | main    | ビルド成功             |


---

## Phase 2（DEPT-1 完了後に開始可能）

### DEPT-2: バックエンド部


| タスク                         | ステータス | 担当Agent | 備考  |
| --------------------------- | ----- | ------- | --- |
| 型定義（types.ts）               | 完了    | DEPT-2  | 全型定義済み |
| Supabaseクライアント（supabase.ts） | 完了    | DEPT-2  | VITE_環境変数使用 |
| Zustandストア（useStore.ts）     | 完了    | DEPT-2  | 全CRUD実装済み |
| 同期フック（useSync.ts）           | 完了    | DEPT-2  | |
| タイマーフック（useTimer.ts）        | 完了    | DEPT-2  | useRef+setInterval |
| Supabase CRUD テスト           | 完了    | main    | tsc+vite build通過 |


### DEPT-3: デザイン部


| タスク                            | ステータス | 担当Agent | 備考  |
| ------------------------------ | ----- | ------- | --- |
| index.css（Tailwindベース + CSS変数） | 完了    | DEPT-3  | @theme定義済み |
| Button コンポーネント                 | 完了    | DEPT-3  | 5バリアント+loading |
| Modal コンポーネント                  | 完了    | DEPT-3  | AnimatePresence |
| Toast コンポーネント                  | 完了    | DEPT-3  | 2.5秒自動消去 |
| Counter コンポーネント（プッシュ式）         | 完了    | DEPT-3  | 長押し連続カウント対応 |
| Badge コンポーネント                  | 完了    | DEPT-3  | 3ステータス |
| Sidebar コンポーネント                | 完了    | DEPT-3  | マンゴーグラデーション |
| BottomNav コンポーネント              | 完了    | DEPT-3  | 管理者メニューシート付き |
| SyncBar コンポーネント                | 完了    | DEPT-3  | ok時フェードアウト |
| AdminGuard コンポーネント             | 完了    | DEPT-3  | shakeアニメーション |


---

## Phase 3（DEPT-2 + DEPT-3 完了後に開始可能）

### DEPT-4: フィーチャー部A（作業入力）


| タスク                       | ステータス | 担当Agent | 備考  |
| ------------------------- | ----- | ------- | --- |
| ProcessItem（個別梱包 + カウンター） | 完了    | DEPT-4  | DnD+Counter |
| ProcessList（ドラッグ&ドロップ）    | 完了    | DEPT-4  | @dnd-kit |
| WorkerPicker（作業者選択）       | 完了    | DEPT-4  | チップUI |
| Timer（タイマーUI）             | 完了    | DEPT-4  | ダークカード |
| BonusToggle（ボーナス切替）       | 完了    | DEPT-4  | アニメトグル |
| TotalPanel（合計表示）          | 完了    | DEPT-4  | グラデーション |
| WorkSubmit ページ統合          | 完了    | DEPT-4  | 全コンポーネント統合 |
| 動作テスト                     | 完了    | main    | tsc+build通過 |


### DEPT-5: フィーチャー部B（シフト・履歴・設定）


| タスク                        | ステータス | 担当Agent | 備考  |
| -------------------------- | ----- | ------- | --- |
| Calendar（シフトカレンダー）         | 完了    | DEPT-5  | |
| ShiftRequest ページ           | 完了    | DEPT-5  | |
| ShiftList + ShiftAdmin ページ | 完了    | DEPT-5  | AdminCalendar内蔵 |
| RecordCard + RecordList    | 完了    | DEPT-5  | AnimatePresence |
| MonthSummary               | 完了    | DEPT-5  | 4カードグリッド |
| History ページ                | 完了    | DEPT-5  | フィルタ+CSV |
| CompanyForm + PasswordForm | 完了    | DEPT-5  | |
| WorkerManager              | 完了    | DEPT-5  | Modal+画像圧縮 |
| PriceManager               | 完了    | DEPT-5  | |
| Settings ページ統合             | 完了    | DEPT-5  | 5セクション |
| PaymentDoc（印刷帳票）           | 完了    | DEPT-5  | 旧コード完全移植 |
| CSVエクスポート                  | 完了    | DEPT-5  | BOM付きUTF-8 |
| 動作テスト                      | 完了    | main    | tsc+build通過 |


---

## Phase 4（全Phase完了後）

### DEPT-6: 統合部


| タスク              | ステータス | 担当Agent | 備考  |
| ---------------- | ----- | ------- | --- |
| App.tsx ルーティング統合 | 完了    | DEPT-6  | 5ページ統合 |
| 全ページ結合テスト        | 完了    | main    | tsc+build+dev OK |
| モバイルレスポンシブ確認     | 待機    | -       | ブラウザで確認必要 |
| Supabase E2Eテスト  | 待機    | -       | ブラウザで確認必要 |
| フォーム下書きlocalStorage永続化 | 完了 | main | タイマー・数量・フォーム全体 |
| 色彩視認性向上+モバイルレイアウト改善 | 完了 | main | Counter直接入力対応 |


---

## ブロッカー・メモ




| 日時  | 部署  | 内容  | 解決状態 |
| --- | --- | --- | ---- |
| -   | -   | -   | -    |


