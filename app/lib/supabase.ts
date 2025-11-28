import { createClient } from '@supabase/supabase-js'

export type Database = {
  public: {
    Tables: {
      prompts: {
        Row: {
          id: number
          product_id: string
          system_prompt: string | null
          worldview: string | null
          personality_prompt: string | null
          menu_subtitle_dev: string | null
          menu_subtitle: string | null
          subtitle_char_count: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          product_id: string
          system_prompt?: string | null
          worldview?: string | null
          personality_prompt?: string | null
          menu_subtitle_dev?: string | null
          menu_subtitle?: string | null
          subtitle_char_count?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          product_id?: string
          system_prompt?: string | null
          worldview?: string | null
          personality_prompt?: string | null
          menu_subtitle_dev?: string | null
          menu_subtitle?: string | null
          subtitle_char_count?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 빌드 시 환경 변수가 없어도 에러가 발생하지 않도록 처리
let supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.')
}

export { supabase }

