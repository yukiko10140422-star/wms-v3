# ファイルオーナーシップ表

> **重要:** 各ファイルには1つの部署のみがオーナーとして編集権を持つ。
> 他部署のファイルを読むことは自由だが、編集は禁止。

## ルートファイル

| ファイル | オーナー | 備考 |
|---------|---------|------|
| `CLAUDE.md` | 管理者のみ | エージェントは編集不可 |
| `package.json` | DEPT-1 | |
| `vite.config.ts` | DEPT-1 | |
| `tsconfig.json` | DEPT-1 | |
| `tailwind.config.ts` | DEPT-1 | |
| `netlify.toml` | DEPT-1 | |
| `index.html` | DEPT-1 | Viteエントリ（旧index.htmlはold_index.htmlにリネーム） |
| `.gitignore` | DEPT-1 | |
| `.env` | 編集不可 | 機密情報 |

## src/

| ファイル | オーナー |
|---------|---------|
| `src/main.tsx` | DEPT-1 |
| `src/vite-env.d.ts` | DEPT-1 |
| `src/App.tsx` | DEPT-6 |
| `src/index.css` | DEPT-3 |

## src/lib/

| ファイル | オーナー |
|---------|---------|
| `src/lib/supabase.ts` | DEPT-2 |
| `src/lib/types.ts` | DEPT-2 |

## src/store/

| ファイル | オーナー |
|---------|---------|
| `src/store/useStore.ts` | DEPT-2 |

## src/hooks/

| ファイル | オーナー |
|---------|---------|
| `src/hooks/useSync.ts` | DEPT-2 |
| `src/hooks/useTimer.ts` | DEPT-2 |

## src/components/ui/

| ファイル | オーナー |
|---------|---------|
| `src/components/ui/Button.tsx` | DEPT-3 |
| `src/components/ui/Modal.tsx` | DEPT-3 |
| `src/components/ui/Toast.tsx` | DEPT-3 |
| `src/components/ui/Counter.tsx` | DEPT-3 |
| `src/components/ui/Badge.tsx` | DEPT-3 |

## src/components/layout/

| ファイル | オーナー |
|---------|---------|
| `src/components/layout/Sidebar.tsx` | DEPT-3 |
| `src/components/layout/BottomNav.tsx` | DEPT-3 |
| `src/components/layout/SyncBar.tsx` | DEPT-3 |
| `src/components/layout/AdminGuard.tsx` | DEPT-3 |

## src/components/work/

| ファイル | オーナー |
|---------|---------|
| `src/components/work/ProcessList.tsx` | DEPT-4 |
| `src/components/work/ProcessItem.tsx` | DEPT-4 |
| `src/components/work/WorkerPicker.tsx` | DEPT-4 |
| `src/components/work/Timer.tsx` | DEPT-4 |
| `src/components/work/BonusToggle.tsx` | DEPT-4 |
| `src/components/work/TotalPanel.tsx` | DEPT-4 |

## src/components/shift/

| ファイル | オーナー |
|---------|---------|
| `src/components/shift/Calendar.tsx` | DEPT-5 |
| `src/components/shift/ShiftList.tsx` | DEPT-5 |

## src/components/history/

| ファイル | オーナー |
|---------|---------|
| `src/components/history/RecordList.tsx` | DEPT-5 |
| `src/components/history/RecordCard.tsx` | DEPT-5 |
| `src/components/history/MonthSummary.tsx` | DEPT-5 |

## src/components/settings/

| ファイル | オーナー |
|---------|---------|
| `src/components/settings/CompanyForm.tsx` | DEPT-5 |
| `src/components/settings/WorkerManager.tsx` | DEPT-5 |
| `src/components/settings/PriceManager.tsx` | DEPT-5 |
| `src/components/settings/PasswordForm.tsx` | DEPT-5 |

## src/components/print/

| ファイル | オーナー |
|---------|---------|
| `src/components/print/PaymentDoc.tsx` | DEPT-5 |

## src/pages/

| ファイル | オーナー |
|---------|---------|
| `src/pages/WorkSubmit.tsx` | DEPT-4 |
| `src/pages/ShiftRequest.tsx` | DEPT-5 |
| `src/pages/History.tsx` | DEPT-5 |
| `src/pages/ShiftAdmin.tsx` | DEPT-5 |
| `src/pages/Settings.tsx` | DEPT-5 |

## docs/

| ファイル | オーナー |
|---------|---------|
| `docs/PROGRESS.md` | 全部署（自分のセクションのみ更新） |
| `docs/INTERFACES.md` | 全部署（追記のみ） |
| その他docs | 管理者のみ |
