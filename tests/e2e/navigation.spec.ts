import { test, expect } from '@playwright/test'

/**
 * 管理者としてログインするヘルパー
 */
async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('wms-worker-session')
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
}

test.describe('ページナビゲーション（管理者モード）', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('設定ページが表示される（管理者ログイン直後）', async ({ page }) => {
    // 管理者ログイン後は設定ページに遷移する
    const settingsContent = page.locator('text=会社名').or(page.locator('text=作業者管理')).or(page.locator('text=設定'))
    await expect(settingsContent.first()).toBeVisible({ timeout: 5000 })
  })

  test('作業者選択画面が表示される（未ログイン時のワーカーページ）', async ({ page }) => {
    // 作業入力ページに遷移
    const workNavButton = page.locator('text=作業入力').or(page.locator('text=入力'))
    if (await workNavButton.count() > 0) {
      await workNavButton.first().click()
      await page.waitForTimeout(500)

      // 作業者選択画面が表示される
      await expect(page.locator('text=作業者を選択')).toBeVisible({ timeout: 5000 })
    }
  })

  test('履歴ページに遷移できる', async ({ page }) => {
    const historyNav = page.locator('text=履歴')
    if (await historyNav.count() > 0) {
      await historyNav.first().click()
      await page.waitForTimeout(500)

      // 履歴ページのコンテンツが表示される
      const historyContent = page.locator('h2:has-text("履歴")').or(page.locator('text=作業履歴'))
      await expect(historyContent.first()).toBeVisible({ timeout: 5000 })
    }
  })
})
