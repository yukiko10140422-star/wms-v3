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
| 型定義（types.ts）               | 完了    | DEPT-2  | 全型定義済み + Draft型追加 |
| Supabaseクライアント（supabase.ts） | 完了    | DEPT-2  | VITE_環境変数使用 |
| Zustandストア（useStore.ts）     | 完了    | DEPT-2  | 全CRUD + drafts同期 |
| 同期フック（useSync.ts）           | 完了    | DEPT-2  | |
| タイマーフック（useTimer.ts）        | 完了    | DEPT-2  | localStorage永続化対応 |
| Supabase CRUD テスト           | 完了    | main    | tsc+vite build通過 |


### DEPT-3: デザイン部


| タスク                            | ステータス | 担当Agent | 備考  |
| ------------------------------ | ----- | ------- | --- |
| index.css（Tailwindベース + CSS変数） | 完了    | DEPT-3  | 視認性向上版 |
| Button コンポーネント                 | 完了    | DEPT-3  | 5バリアント+loading |
| Modal コンポーネント                  | 完了    | DEPT-3  | AnimatePresence |
| Toast コンポーネント                  | 完了    | DEPT-3  | 2.5秒自動消去 |
| Counter コンポーネント（プッシュ式）         | 完了    | DEPT-3  | 長押し+直接入力対応 |
| Badge コンポーネント                  | 完了    | DEPT-3  | 3ステータス |
| Sidebar コンポーネント                | 完了    | DEPT-3  | ガイドリンク追加 |
| BottomNav コンポーネント              | 完了    | DEPT-3  | ガイドボタン追加 |
| SyncBar コンポーネント                | 完了    | DEPT-3  | ok時フェードアウト |
| AdminGuard コンポーネント             | 完了    | DEPT-3  | shakeアニメーション |
| UpdateNotice コンポーネント           | 完了    | main    | ビルド毎に自動通知 |
| UsageGuide コンポーネント             | 完了    | main    | 8セクションの使い方ガイド |


---

## Phase 3（DEPT-2 + DEPT-3 完了後に開始可能）

### DEPT-4: フィーチャー部A（作業入力）


| タスク                       | ステータス | 担当Agent | 備考  |
| ------------------------- | ----- | ------- | --- |
| ProcessItem（個別梱包 + カウンター） | 完了    | DEPT-4  | モバイル2行レイアウト対応 |
| ProcessList（ドラッグ&ドロップ）    | 完了    | DEPT-4  | localStorage永続化 |
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

---

## Phase 5（運用改善）

| タスク | ステータス | 担当Agent | 備考 |
| --- | --- | --- | --- |
| 色彩視認性向上 | 完了 | main | コントラスト改善、マンゴー雰囲気維持 |
| モバイル梱包レイアウト改善 | 完了 | main | 2行レイアウト（sm未満） |
| Counter直接入力対応 | 完了 | main | タップで数値入力モード |
| localStorage下書き永続化 | 完了 | main | タイマー・数量・フォーム |
| アップデート通知 | 完了 | main | バージョン変更時のみ表示 |
| 使い方ガイド | 完了 | main | BottomNav+Sidebarからアクセス |
| データ整合性対策 | 完了 | main | 最新単価再計算・重複警告・削除ブロック |
| Supabase下書きリアルタイム同期 | 完了 | main | draftsテーブル+Realtime |
| draftsテーブル作成 | 完了 | main | pg直接接続で作成済み |

---

## Phase 6（UX改善）

| タスク | ステータス | 担当Agent | 備考 |
| --- | --- | --- | --- |
| フォーム順序最適化 | 完了 | main | 作業者→日付+住所(横並び)→加工内容 |
| 提出完了確認モーダル | 完了 | main | 内訳表示+取り消し機能付き |
| 前回と同じ内容で入力 | 完了 | main | localStorage保存→ワンタップ復元 |
| 提出取り消し機能 | 完了 | main | 確認モーダル内で即取り消し |
| 日次サマリーダッシュボード | 完了 | main | 提出件数・合計・未提出者表示 |
| LiveDrafts UI改善 | 完了 | main | コピーボタン明確化 |
| 機能リクエストシステム | 完了 | main | 送信(全員)+閲覧(メール認証) |
| feature_requestsテーブル作成 | 完了 | main | pg直接接続で作成済み |

---

## Phase 7（機能拡張）

| タスク | ステータス | 担当Agent | 備考 |
| --- | --- | --- | --- |
| 写真添付機能 | 完了 | main | 最大3枚、圧縮JPEG、カメラ対応 |
| アップデート通知修正 | 完了 | main | バージョン変更時のみ表示 |
| オフラインキュー | 完了 | main | localStorage保存→復帰時自動送信 |
| オフラインインジケーター | 完了 | main | 赤バナー+待機件数表示 |
| 作業者別実績グラフ | 完了 | main | 棒グラフ+パーセント表示 |
| 履歴ステータスフィルタ | 完了 | main | pending/approved/rejected |
| 履歴ソート機能 | 完了 | main | 日付/金額の昇順降順 |
| ダークモード | 完了 | main | light/dark/system切替 |
| photosカラム追加 | 完了 | main | records JSONB |

---

## Phase 8（認証 & マイページ）

| タスク | ステータス | 担当Agent | 備考 |
| --- | --- | --- | --- |
| Worker型にpin追加 | 完了 | main | string \| null |
| Shift型にtype/reason追加 | 完了 | main | 'shift' \| 'absence' |
| Store認証レイヤー | 完了 | main | login/logout/restore/updatePin |
| Store updateShift追加 | 完了 | main | pendingシフト編集用 |
| DB移行SQL | 完了 | main | docs/migration_phase8.sql |
| ログインページ | 完了 | main | PIN入力+シェイクアニメ |
| マイシフトページ | 完了 | main | 提出/確認/変更/欠勤届 |
| 給料明細ページ | 完了 | main | 月別サマリー+請求書 |
| マイ設定ページ | 完了 | main | PIN変更+ログアウト |
| Sidebar更新 | 完了 | main | 作業者プロフィール+新メニュー |
| BottomNav更新 | 完了 | main | 5タブ構成 |
| App.tsxルーティング | 完了 | main | 認証ガード+新ページ統合 |
| WorkSubmit適応 | 完了 | main | WorkerPicker除去、自動設定 |
| 請求書フォーマット変更 | 完了 | main | 支払元固定、請求者=提出者 |
| アップデート通知v3.0 | 完了 | main | 新機能一覧 |
| pin/typeカラム追加 | 待機 | - | Supabase SQLエディタで実行必要 |

---

## 今後の改善候補（バックログ）

> 優先度順。実運用のフィードバックをもとに着手する。

### すぐ効果があるもの

| タスク | 優先度 | 概要 |
| --- | --- | --- |
| 提出前の確認ステップ | 高 | 内容一覧を表示→「本当に提出？」で誤送信防止 |
| 作業者ごとのデフォルト設定 | 高 | よく使うボーナス率・住所を作業者に紐づけて自動入力 |
| 月次レポートPDF自動生成 | 中 | CSV+印刷を統合、ワンタップでPDF保存 |
| 通知バッジ | 中 | 未承認件数をBottomNavの管理者アイコンに表示 |

### 運用を楽にするもの

| タスク | 優先度 | 概要 |
| --- | --- | --- |
| 一括承認 | 中 | 履歴画面でチェックボックス選択→まとめて承認 |
| 作業テンプレート | 中 | 「Aパターン」「Bパターン」など名前をつけて保存・呼び出し |
| カレンダー表示 | 低 | 履歴を日別カレンダーで見る（誰がいつ作業したか一覧） |

### 長期的なもの

| タスク | 優先度 | 概要 |
| --- | --- | --- |
| PWAプッシュ通知 | 低 | 提出忘れリマインダー、承認完了通知 |
| 多言語対応 | 低 | 外国人作業者がいる場合に対応 |
| APIキーの環境分離 | 低 | 開発/本番でSupabase環境を分ける |

---

## ブロッカー・メモ


| 日時 | 部署 | 内容 | 解決状態 |
| --- | --- | --- | ---- |
| 2026-03-08 | main | draftsテーブル未作成 | 解決済み（pg直接接続で作成） |

