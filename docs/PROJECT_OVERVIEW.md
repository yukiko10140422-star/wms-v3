# Global Mango System (GMS) - プロジェクト概要

## 概要

**プロジェクト名:** Global Mango System (GMS)
**目的:** マンゴー加工業務における作業管理・支払処理のためのWebベースワークマネジメントシステム
**リポジトリ:** https://github.com/yukiko10140422-star/wms.git

契約作業者の勤怠管理、支払処理、シフト管理、支払明細書の生成、作業者情報の管理を行うフル機能SaaSアプリケーション。UIは全て日本語。

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| バックエンド | Netlify Functions (サーバーレス), Node.js |
| データストレージ | JSONBin API v3 |
| デプロイ | Netlify |
| バンドラー | esbuild (Netlify Functions用) |
| フォント | Noto Sans JP, DM Mono (Google Fonts) |

**特徴:** フレームワーク不使用のモノリシック・シングルファイルアプリケーション（`index.html` 約93KB）

---

## プロジェクト構造

```
wms-v3/
├── index.html                    # メインアプリケーション (1349行, 93KB)
├── netlify.toml                  # Netlify設定
├── netlify/
│   └── functions/
│       └── jsonbin.js            # JSONBin APIプロキシ関数
├── docs/                         # ドキュメント
└── .git/                         # Gitリポジトリ
```

---

## 主要機能

### 1. 作業入力（作業記録モジュール）
- 作業日・作業者名・加工種類・数量・単価の入力
- リアルタイム合計計算
- ボーナスレート設定（設定可能な%）
- 備考欄
- 自動保存＆同期ステータス表示

### 2. シフト希望
- インタラクティブカレンダーでのシフト日選択
- 月送り/戻りナビゲーション
- タイムスタンプ付きシフト申請
- 承認/却下ワークフロー

### 3. 作業時間タイマー
- 作業セッション計測
- 一時停止/再開
- 休憩時間トラッキング
- タイムログ（タイムスタンプ付き）

### 4. 履歴・明細書
- 提出済み作業記録の閲覧
- 月別・作業者別フィルタ
- 承認/却下ワークフロー
- 印刷用支払明細書生成（消費税10%計算対応）
- CSVエクスポート
- 帳票番号自動生成

### 5. 作業者管理
- 作業者の追加/編集/削除
- アバターアップロード（圧縮対応）
- 住所・銀行口座情報の管理

### 6. シフト管理（管理者用）
- 管理者カレンダービュー（ワーカーチップ表示）
- ステータス別フィルタ
- シフト承認/却下/削除
- カラーコードステータスバッジ

### 7. 設定
- 会社名・管理者名・会社住所
- 振込元銀行情報
- ボーナスレート設定（1-100%）
- 管理者パスワード保護

---

## 加工種類（デフォルト）

| 加工名 | 単価（円） |
|--------|-----------|
| 箱に入れる | 50 |
| 防水袋・プチプチ | 10 |
| プチプチ巻き | 30 |
| 圧縮 | 70 |
| 箱加工（普通） | 100 |
| 箱加工（大） | 200 |
| セット詰め | 50 |
| 段ボール巻き | 50 |
| 送り状入力 | 50 |

※ 時給制サポートあり（デフォルト: ¥1,200）

---

## ページ構成

| ページID | ページ名 | 権限 |
|----------|---------|------|
| `page-submit` | 作業入力 | 全ユーザー |
| `page-shift` | シフト希望 | 全ユーザー |
| `page-history` | 履歴・明細書 | 管理者のみ |
| `page-shift-admin` | シフト管理 | 管理者のみ |
| `page-settings` | 設定 | 管理者のみ |

---

## API・データ同期

### エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/.netlify/functions/jsonbin` | データ取得 |
| PUT | `/.netlify/functions/jsonbin` | データ更新（全データ置換） |
| OPTIONS | `/.netlify/functions/jsonbin` | CORSプリフライト |

### バックエンド構成
- **プロキシURL:** `/.netlify/functions/jsonbin`
- **実際のバックエンド:** JSONBin API v3
- **BIN_ID:** `69a1961fae596e708f4f49b8`
- **APIキー:** Netlify Function内にサーバーサイドで保管

### 同期機能
- フォーム送信時の自動同期
- アプリ初期化時のデータ取得
- オフライン検出・フォールバック
- 同期ステータスバー＆トースト通知
- 強制同期ボタン（管理者メニュー）

---

## データ構造

### Records（作業記録）
```javascript
{
  id: number,
  date: "YYYY-MM-DD",
  name: string,          // 作業者名
  address: string,
  items: [{name, price, qty, sub, isHourly}],
  total: number,
  bonusOn: boolean,
  bonusRate: number,
  bonusAmt: number,
  timerWorkMs: number,
  timerLog: [{type, time}],
  status: "pending|approved|rejected",
  remarks: string,
  submittedAt: string
}
```

### Workers（作業者）
```javascript
{
  name: string,
  address: string,
  avatar: string,        // base64
  bank: {
    name: string,        // 銀行名
    branch: string,      // 支店名
    type: "普通|当座",
    number: string,      // 口座番号
    holder: string       // 口座名義
  }
}
```

### Shifts（シフト）
```javascript
{
  id: number,
  workerName: string,
  dates: ["YYYY-MM-DD", ...],
  status: "pending|approved|rejected",
  submittedAt: string
}
```

### Settings（設定）
```javascript
{
  company: string,       // 会社名
  manager: string,       // 管理者名
  address: string,       // 住所
  bonusRate: number,     // ボーナスレート
  bankName: string,      // 銀行名
  bankBranch: string,    // 支店名
  bankType: string,      // 口座種別
  bankNumber: string,    // 口座番号
  bankHolder: string,    // 口座名義
  adminPw: string        // 管理者パスワード（デフォルト: "1234"）
}
```

---

## デザインシステム

### カラーパレット

| 名前 | カラーコード | 用途 |
|------|-------------|------|
| Primary (Mango) | `#ff8c00` | メインカラー |
| Primary Light | `#fff3e0` | 背景・ハイライト |
| Primary Dark | `#e65c00` | ホバー・アクセント |
| Secondary | `#ffc107` | セカンダリボタン |
| Success | `#2e7d32` | 成功ステータス |
| Error | `#c62828` | エラー・却下 |
| Background | `#fff8f0` | ページ背景 |
| Text (Ink) | `#2d1a00` | 本文テキスト |
| Muted | `#8a6a40` | 補助テキスト |

### デザイン仕様
- **角丸:** 12px
- **シャドウ:** 軽微なシャドウで奥行き表現
- **スペーシング:** REM基準のレスポンシブサイジング
- **レスポンシブ:** モバイルファーストデザイン

---

## 起動方法

### ローカル開発
```bash
# リポジトリのクローン
git clone https://github.com/yukiko10140422-star/wms.git
cd wms-v3

# ローカルサーバーで起動（例）
npx serve .
# または
python -m http.server 8000
```

### 本番デプロイ（Netlify）
1. GitHubリポジトリをNetlifyに接続
2. プッシュ時に自動デプロイ
3. Netlify FunctionがJSONBin APIプロキシとして動作
4. データはJSONBinクラウドに永続化

---

## デフォルト値

| 項目 | デフォルト値 |
|------|-------------|
| 管理者パスワード | `1234` |
| ボーナスレート | `10%` |
| 時給 | `¥1,200` |
| 消費税率 | `10%` |

---

## Git履歴

| コミット | メッセージ |
|---------|-----------|
| `3e30ea0` | モバイルレスポンシブレイアウト追加 |
| `e941114` | タイマーと設定可能なボーナスレート追加 |
| `0a59886` | タイマーと設定可能なボーナスレート追加 |
| `cdfa07e` | アップデート |
| `999b955` | 初回コミット |

---

## セキュリティに関する注意

- 管理者パスワードのデフォルト値（`1234`）は本番環境で必ず変更してください
- APIキーはNetlify Functionのサーバーサイドに保管されています
- CORSヘッダーは適切に設定されています
- 本格運用時はユーザー認証・認可の導入を推奨します
