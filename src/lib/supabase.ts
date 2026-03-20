import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '環境変数 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY が設定されていません。.env ファイルを確認してください。'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
