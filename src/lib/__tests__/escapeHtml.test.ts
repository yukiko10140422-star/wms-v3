import { describe, it, expect } from 'vitest'
import { escapeHtml } from '../escapeHtml'

describe('escapeHtml', () => {
  it('& をエスケープする', () => {
    expect(escapeHtml('a&b')).toBe('a&amp;b')
  })

  it('< > をエスケープする', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    )
  })

  it('" をエスケープする', () => {
    expect(escapeHtml('a"b')).toBe('a&quot;b')
  })

  it("' をエスケープする", () => {
    expect(escapeHtml("a'b")).toBe('a&#39;b')
  })

  it('エスケープ不要な文字列はそのまま返す', () => {
    expect(escapeHtml('hello world 123')).toBe('hello world 123')
  })

  it('空文字列を処理する', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('複数の特殊文字を同時にエスケープする', () => {
    expect(escapeHtml('<div class="a" data-x=\'b\'>&</div>')).toBe(
      '&lt;div class=&quot;a&quot; data-x=&#39;b&#39;&gt;&amp;&lt;/div&gt;'
    )
  })
})
