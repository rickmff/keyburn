import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface TestResult {
  id?: number
  user_id: string
  wpm: number
  accuracy: number
  correct_chars: number
  incorrect_chars: number
  total_characters_typed: number
  character_stats: Record<string, { total: number; mistakes: number }>
  created_at?: string
  snippet_title?: string
  test_duration: number
}

export async function saveTestResult(testResult: TestResult) {
  return await supabase
    .from('test_results')
    .insert(testResult)
}

export async function getUserTestResults(userId: string) {
  return await supabase
    .from('test_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
} 