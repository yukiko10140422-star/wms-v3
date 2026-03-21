import { test, expect } from '@playwright/test'

test.describe('ログイン画面', () => {
  test.beforeEach(async ({ page }) => {
    // セッション情報をクリアしてログイン画面を表示
    await page.addInitScript(() => {
      localStorage.removeItem('wms-worker-session')
      localStorage.setItem('wms-last-seen-version', '3.1')
    })
    await page.goto('/')
  })

  test('ログイン画面が表示される', async ({ page }) => {
    // ブランディングの確認
    await expect(page.locator('text=World Mango System')).toBeVisible()
    await expect(page.locator('text=作業者を選択してください')).toBeVisible()
  })

  test('作業者一覧が表示される', async ({ page }) => {
    // Supabaseからデータ読み込みを待つ
    await page.waitForTimeout(2000)

    // 作業者ボタンが少なくとも1つ表示される
    const workerButtons = page.locator('button').filter({ has: page.locator('.rounded-full') })
    await expect(workerButtons.first()).toBeVisible({ timeout: 10000 })
  })

  test('PIN未設定の作業者はクリックできない', async ({ page }) => {
    await page.waitForTimeout(2000)

    // PIN未設定バッジがある場合、そのボタンはdisabled
    const noPinBadge = page.locator('text=PIN未設定')
    if (await noPinBadge.count() > 0) {
      const noPinButton = noPinBadge.first().locator('xpath=ancestor::button')
      await expect(noPinButton).toBeDisabled()
    }
  })

  test('作業者選択後にPIN入力画面が表示される', async ({ page }) => {
    await page.waitForTimeout(2000)

    // PIN設定済みの作業者（disabled でないボタン）をクリック
    const enabledWorkerButtons = page.locator('button:not([disabled])').filter({
      has: page.locator('.rounded-full'),
    })

    const count = await enabledWorkerButtons.count()
    if (count === 0) {
      test.skip(true, 'PIN設定済みの作業者がいません')
      return
    }

    await enabledWorkerButtons.first().click()

    // PIN入力画面の要素を確認
    await expect(page.locator('text=4桁のPINを入力')).toBeVisible()
    await expect(page.locator('text=戻る')).toBeVisible()

    // テンキーが表示される
    for (const digit of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']) {
      await expect(
        page.locator(`button:has-text("${digit}")`).first()
      ).toBeVisible()
    }
    await expect(page.locator('text=クリア')).toBeVisible()
  })

  test('間違ったPINでシェイクアニメーション', async ({ page }) => {
    await page.waitForTimeout(2000)

    const enabledWorkerButtons = page.locator('button:not([disabled])').filter({
      has: page.locator('.rounded-full'),
    })

    const count = await enabledWorkerButtons.count()
    if (count === 0) {
      test.skip(true, 'PIN設定済みの作業者がいません')
      return
    }

    await enabledWorkerButtons.first().click()
    await expect(page.locator('text=4桁のPINを入力')).toBeVisible()

    // 間違ったPINを入力（0000）
    for (const digit of ['0', '0', '0', '0']) {
      await page.locator(`button:has-text("${digit}")`).first().click()
    }

    // エラートーストが表示される
    await expect(page.locator('text=PINが正しくありません')).toBeVisible({ timeout: 5000 })
  })

  test('戻るボタンで作業者選択に戻れる', async ({ page }) => {
    await page.waitForTimeout(2000)

    const enabledWorkerButtons = page.locator('button:not([disabled])').filter({
      has: page.locator('.rounded-full'),
    })

    const count = await enabledWorkerButtons.count()
    if (count === 0) {
      test.skip(true, 'PIN設定済みの作業者がいません')
      return
    }

    await enabledWorkerButtons.first().click()
    await expect(page.locator('text=4桁のPINを入力')).toBeVisible()

    // 戻るボタンをクリック
    await page.locator('text=戻る').click()

    // 作業者選択画面に戻る
    await expect(page.locator('text=作業者を選択してください')).toBeVisible()
  })

  test('管理者ログインボタンが表示される', async ({ page }) => {
    await expect(page.locator('text=管理者としてログイン')).toBeVisible()
  })
})
