import { test, expect } from '@playwright/test'

test.describe('管理者アクセス', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('wms-worker-session')
      // アップデート通知を抑制
      localStorage.setItem('wms-last-seen-version', '3.1')
    })
    await page.goto('/')
    await page.waitForTimeout(2000)
  })

  test('管理者PINモーダルが開く', async ({ page }) => {
    await page.locator('text=管理者としてログイン').click()

    // 管理者PINモーダルが表示される（h2タイトル）
    await expect(page.locator('h2:has-text("管理者PIN")')).toBeVisible()
    await expect(page.locator('.fixed >> text=4桁のPINを入力')).toBeVisible()
  })

  test('管理者PIN入力で正しいPINでロック解除', async ({ page }) => {
    await page.locator('text=管理者としてログイン').click()
    await expect(page.locator('h2:has-text("管理者PIN")')).toBeVisible()

    // 正しい管理者PIN（1234）を入力
    for (const digit of ['1', '2', '3', '4']) {
      // 管理者モーダル内（.fixed内）のテンキーをクリック
      const buttons = page.locator(`.fixed >> button:has-text("${digit}")`)
      await buttons.first().click()
    }

    // 管理者モーダルが閉じる（h2が消える）
    await expect(page.locator('h2:has-text("管理者PIN")')).not.toBeVisible({ timeout: 5000 })
  })

  test('間違った管理者PINでエラー', async ({ page }) => {
    await page.locator('text=管理者としてログイン').click()
    await expect(page.locator('h2:has-text("管理者PIN")')).toBeVisible()

    // 間違ったPIN（9999）を入力
    for (const digit of ['9', '9', '9', '9']) {
      const buttons = page.locator(`.fixed >> button:has-text("${digit}")`)
      await buttons.first().click()
    }

    // PIN入力がリセットされ、モーダルは開いたまま
    await page.waitForTimeout(1000)
    await expect(page.locator('h2:has-text("管理者PIN")')).toBeVisible()
  })

  test('管理者PINモーダルを閉じられる', async ({ page }) => {
    await page.locator('text=管理者としてログイン').click()
    await expect(page.locator('h2:has-text("管理者PIN")')).toBeVisible()

    // 閉じるボタンをクリック
    await page.locator('button[aria-label="閉じる"]').click()

    // モーダルが閉じる
    await expect(page.locator('h2:has-text("管理者PIN")')).not.toBeVisible()
  })

  test('管理者ロック解除後にナビゲーションが表示される', async ({ page }) => {
    // 管理者ログイン
    await page.locator('text=管理者としてログイン').click()
    await expect(page.locator('h2:has-text("管理者PIN")')).toBeVisible()

    for (const digit of ['1', '2', '3', '4']) {
      const buttons = page.locator(`.fixed >> button:has-text("${digit}")`)
      await buttons.first().click()
    }

    // 管理者モーダルが閉じる
    await expect(page.locator('h2:has-text("管理者PIN")')).not.toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(1000)

    // ボトムナビまたはサイドバーが表示される
    const hasNav = await page.locator('nav').count() > 0 ||
                   await page.locator('aside').count() > 0
    expect(hasNav).toBeTruthy()
  })
})
