# 技術スタック選定書

## 決定事項

### コアスタック

| 技術 | 選定理由 |
|------|---------|
| **React 19** | コンポーネント分割、状態管理、エコシステム |
| **Vite 6** | 高速ビルド、HMR、設定最小限 |
| **TypeScript** | 型安全、Supabaseとの相性 |
| **Tailwind CSS v4** | 高速UI開発、一貫したデザインシステム |
| **Supabase JS v2** | 型安全なDB接続、リアルタイム対応 |

### UI/UXライブラリ

| 技術 | 用途 |
|------|------|
| **@dnd-kit/core + sortable** | 梱包オプションのドラッグ&ドロップ並べ替え |
| **Lucide React** | 軽量アイコン（絵文字から置き換え） |
| **Framer Motion** | スムーズなアニメーション・トランジション |

### ルーティング・状態管理

| 技術 | 選定理由 |
|------|---------|
| **React Router v7** | ページ切り替え（現在5ページ） |
| **Zustand** | 軽量状態管理（Redux不要のシンプルさ） |

### デプロイ

| 項目 | 選定 |
|------|------|
| **ホスティング** | Netlify（現状維持、Viteビルド出力をデプロイ） |
| **DB** | Supabase PostgreSQL（移行済み） |
| **認証** | 4桁PIN認証方式（将来Supabase Authに移行可） |

---

## デプロイ方式

Netlifyで継続。設定変更のみ：

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

Netlify Functions は不要（Supabase直結のため削除可能）。

---

## プロジェクト構成

```
wms-v3/
├── index.html                  # Viteエントリ
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env                        # Supabase接続情報（gitignore）
├── .gitignore
├── netlify.toml
├── docs/                       # ドキュメント
├── public/
│   └── favicon.ico
└── src/
    ├── main.tsx                 # エントリポイント
    ├── App.tsx                  # ルーティング
    ├── index.css                # Tailwind + カスタムCSS
    ├── lib/
    │   ├── supabase.ts          # Supabaseクライアント初期化
    │   └── types.ts             # 型定義
    ├── store/
    │   └── useStore.ts          # Zustand グローバルストア
    ├── hooks/
    │   ├── useTimer.ts          # タイマーロジック
    │   ├── useSync.ts           # 同期ステータス管理
    │   ├── useOfflineQueue.ts  # オフラインキュー
    │   └── useTheme.ts         # テーマ管理
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx      # サイドバーナビゲーション
    │   │   ├── BottomNav.tsx    # モバイルボトムナビ
    │   │   ├── SyncBar.tsx      # 同期ステータスバー
    │   │   └── AdminGuard.tsx   # 管理者PIN認証
    │   ├── work/
    │   │   ├── ProcessList.tsx  # ★ ドラッグ可能な梱包リスト
    │   │   ├── ProcessItem.tsx  # ★ 個別梱包アイテム（プッシュカウンター）
    │   │   ├── WorkerPicker.tsx # 作業者選択
    │   │   ├── Timer.tsx        # 作業タイマー
    │   │   ├── BonusToggle.tsx  # ボーナス切替
    │   │   ├── TotalPanel.tsx   # 合計表示パネル
    │   │   ├── PhotoAttach.tsx # 写真添付
    │   │   └── LiveDrafts.tsx  # リアルタイム下書き
    │   ├── shift/
    │   │   ├── Calendar.tsx     # シフトカレンダー
    │   │   └── ShiftList.tsx    # シフト一覧
    │   ├── history/
    │   │   ├── RecordList.tsx   # 作業記録一覧
    │   │   ├── RecordCard.tsx   # 個別記録カード
    │   │   ├── MonthSummary.tsx # 月次サマリー
    │   │   └── WorkerChart.tsx # 作業者別実績グラフ
    │   ├── settings/
    │   │   ├── CompanyForm.tsx  # 会社情報フォーム
    │   │   ├── WorkerManager.tsx # 作業者管理
    │   │   ├── PriceManager.tsx # 単価管理
    │   │   ├── PasswordForm.tsx # 管理者PIN変更
    │   │   ├── FeatureRequestForm.tsx
    │   │   └── FeatureRequestList.tsx
    │   ├── print/
    │   │   └── PaymentDoc.tsx   # 支払明細書
    │   └── ui/
    │       ├── Button.tsx
    │       ├── Modal.tsx
    │       ├── Toast.tsx
    │       ├── Badge.tsx
    │       ├── UpdateNotice.tsx
    │       └── UsageGuide.tsx
    └── pages/
        ├── WorkSubmit.tsx       # 作業入力ページ
        ├── ShiftRequest.tsx     # シフト希望ページ
        ├── History.tsx          # 履歴・明細書ページ
        ├── ShiftAdmin.tsx       # シフト管理ページ
        ├── Settings.tsx         # 設定ページ
        ├── Login.tsx           # ログインページ（PIN認証）
        ├── MyShifts.tsx        # マイシフトページ
        ├── MySalary.tsx        # 給料明細ページ
        └── MySettings.tsx      # マイ設定ページ
```

---

## 新機能・改善点

### 1. ドラッグ&ドロップ梱包リスト
- `@dnd-kit/sortable` で梱包オプションの順序を自由に変更
- ドラッグハンドル付きのスムーズなアニメーション
- 並び順はSupabaseの `sort_order` に保存

### 2. プッシュカウンター
- 数量入力を `+` / `-` ボタンに変更
- タップで即座にカウントアップ
- 長押しで連続カウント
- 視覚的フィードバック（数値がバウンス）

### 3. デザイン刷新
- マンゴーカラーを維持しつつ洗練
- カード型レイアウト、適切な余白
- モバイルファーストの設計
- ダークモード対応可能な設計基盤

---

## 現行機能の完全維持チェックリスト

| 機能 | コンポーネント | 状態 |
|------|---------------|------|
| 作業入力フォーム | WorkSubmit | [ ] |
| 梱包オプション選択 | ProcessList + ProcessItem | [ ] |
| 数量入力・自動計算 | ProcessItem + TotalPanel | [ ] |
| ボーナス切替・レート | BonusToggle | [ ] |
| 作業タイマー | Timer (useTimer) | [ ] |
| 時給計算 | ProcessItem | [ ] |
| 作業者選択 | WorkerPicker | [ ] |
| 備考欄 | WorkSubmit | [ ] |
| レコード提出 | WorkSubmit | [ ] |
| シフトカレンダー | Calendar | [ ] |
| シフト申請 | ShiftRequest | [ ] |
| 履歴フィルタ（月/名前） | History | [ ] |
| 月次サマリー | MonthSummary | [ ] |
| レコード承認/却下/削除 | RecordCard | [ ] |
| 印刷用明細書 | PaymentDoc | [ ] |
| CSVエクスポート | History | [ ] |
| シフト管理カレンダー | ShiftAdmin | [ ] |
| シフト承認/却下/削除 | ShiftList | [ ] |
| 会社情報設定 | CompanyForm | [ ] |
| 作業者CRUD | WorkerManager | [ ] |
| アバターアップロード | WorkerManager | [ ] |
| 加工種類CRUD | PriceManager | [ ] |
| PIN認証 | AdminGuard | [ ] |
| PIN変更 | PasswordForm | [ ] |
| クラウド同期 | useSync + Zustand | [ ] |
| オフライン検出 | useSync | [ ] |
| モバイルUI | BottomNav + Sidebar | [ ] |
