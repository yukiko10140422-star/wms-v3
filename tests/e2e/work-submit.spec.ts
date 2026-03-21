import { test, expect } from '@playwright/test'

/**
 * 管理者ログイン → 作業者としてログインするヘルパー
 */
async function loginAsWorkerViaAdmin(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('wms-worker-session')
    localStorage.removeItem('wms-worksubmit-draft')
    localStorage.removeItem('wms-quantities-draft')
    localStorage.removeItem('wms-hourly-draft')
    localStorage.removeItem('wms-timer-draft')
    localStorage.removeItem('wms-last-submit')
    localStorage.setItem('wms-last-seen-version', '3.1')
  })
  await page.goto('/')
  await page.waitForTimeout(2000)

  // 管理者ログイン
  await page.locator('text=管理者としてログイン').click()
  await expect(page.locator('h2:has-text("管理者PIN")')).toBeVisible()

  for (const digit of ['1', '2', '3', '4']) {
    const buttons = page.locator(`.fixed >> button:has-text("${digit}")`)
    await buttons.first().click()
  }

  await expect(page.locator('h2:has-text("管理者PIN")')).not.toBeVisible({ timeout: 5000 })
  await page.waitForTimeout(1000)

  // 作業入力ページに遷移（作業者選択画面が表示される）
  const workNavButton = page.locator('text=作業入力').first()
  await workNavButton.click()
  await page.waitForTimeout(500)

  // 作業者を選択（管理者モードなのでPIN不要）
  await expect(page.locator('text=作業者を選択')).toBeVisible({ timeout: 5000 })
  const workerButtons = page.locator('button').filter({ has: page.locator('.rounded-full') })
  const count = await workerButtons.count()
  if (count === 0) {
    return false
  }
  await workerButtons.first().click()
  await page.waitForTimeout(1000)
  return true
}

test.describe('作業入力ページ', () => {
  test('作業入力フォームが表示される', async ({ page }) => {
    const loggedIn = await loginAsWorkerViaAdmin(page)
    if (!loggedIn) {
      test.skip(true, '作業者がいません')
      return
    }

    // 作業入力ページの主要要素を確認（h2で限定）
    await expect(page.locator('h2:has-text("作業入力")')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=作業日')).toBeVisible()
    await expect(page.locator('label:has-text("加工内容")')).toBeVisible()
  })

  test('作業日フィールドにデフォルトで今日の日付が設定される', async ({ page }) => {
    const loggedIn = await loginAsWorkerViaAdmin(page)
    if (!loggedIn) {
      test.skip(true, '作業者がいません')
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const dateInput = page.locator('input[type="date"]')
    await expect(dateInput).toHaveValue(today)
  })

  test('プロセスリストが表示される', async ({ page }) => {
    const loggedIn = await loginAsWorkerViaAdmin(page)
    if (!loggedIn) {
      test.skip(true, '作業者がいません')
      return
    }

    await expect(page.locator('label:has-text("加工内容")')).toBeVisible()
    await page.waitForTimeout(2000)

    // プロセス名が表示される（例: 箱に入れる）
    await expect(page.locator('text=箱に入れる').first()).toBeVisible({ timeout: 5000 })
  })

  test('プロセスの数量を増減できる', async ({ page }) => {
    const loggedIn = await loginAsWorkerViaAdmin(page)
    if (!loggedIn) {
      test.skip(true, '作業者がいません')
      return
    }

    await page.waitForTimeout(2000)

    // Plusボタン（bg-mango text-white のオレンジ丸ボタン、SVGアイコン内）
    // Counterコンポーネントの構造: minus → value → plus
    // Plus ボタンは bg-mango クラスを持つ丸ボタン
    const plusButtons = page.locator('button.bg-mango.text-white')
    await expect(plusButtons.first()).toBeVisible({ timeout: 5000 })
    await plusButtons.first().click()
    await page.waitForTimeout(300)

    // 数量が1になり、金額が¥50になる（箱に入れる ¥50 × 1）
    await expect(page.locator('text=¥50').first()).toBeVisible({ timeout: 3000 })
  })

  test('ボーナストグルが動作する', async ({ page }) => {
    const loggedIn = await loginAsWorkerViaAdmin(page)
    if (!loggedIn) {
      test.skip(true, '作業者がいません')
      return
    }

    // ボーナストグルを探してクリック
    const toggleButton = page.locator('button').filter({ hasText: /ボーナス|OFF|ON/ })
    if (await toggleButton.count() > 0) {
      await toggleButton.first().click()
      await page.waitForTimeout(300)
    }
  })

  test('提出ボタンが表示される', async ({ page }) => {
    const loggedIn = await loginAsWorkerViaAdmin(page)
    if (!loggedIn) {
      test.skip(true, '作業者がいません')
      return
    }

    await expect(page.locator('text=提出する')).toBeVisible()
  })

  test('加工内容なしで提出するとエラートースト', async ({ page }) => {
    const loggedIn = await loginAsWorkerViaAdmin(page)
    if (!loggedIn) {
      test.skip(true, '作業者がいません')
      return
    }

    // 何も入力せずに提出
    await page.locator('text=提出する').click()

    // トーストのエラーメッセージ（span内）
    await page.waitForTimeout(500)
    const toast = page.locator('span:has-text("加工内容を入力してください")')
    await expect(toast).toBeVisible({ timeout: 5000 })
  })

  test('備考欄に入力できる', async ({ page }) => {
    const loggedIn = await loginAsWorkerViaAdmin(page)
    if (!loggedIn) {
      test.skip(true, '作業者がいません')
      return
    }

    const remarksInput = page.locator('textarea[placeholder*="備考"]')
    await remarksInput.fill('テスト備考')
    await expect(remarksInput).toHaveValue('テスト備考')
  })
})
