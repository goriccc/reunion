import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

type PromptRecord = {
  product_id: string
  system_prompt: string | null
  worldview: string | null
  personality_prompt: string | null
  menu_subtitle_dev: string | null
  menu_subtitle: string | null
  subtitle_char_count: string | number | null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('product_id', productId)
      .single()

    const prompt = data as PromptRecord | null

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch prompts', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      systemPrompt: prompt?.system_prompt || '',
      worldview: prompt?.worldview || '',
      personalityPrompt: prompt?.personality_prompt || '',
      menuSubtitleDev: prompt?.menu_subtitle_dev || '',
      menuSubtitle: prompt?.menu_subtitle || '',
      subtitleCharCount: prompt?.subtitle_char_count ? String(prompt.subtitle_char_count) : '',
    })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, systemPrompt, worldview, personalityPrompt, menuSubtitleDev, menuSubtitle, subtitleCharCount } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      )
    }

    // upsert: 존재하면 업데이트, 없으면 생성
    const { data, error } = await supabase
      .from('prompts')
      .upsert({
        product_id: productId,
        system_prompt: systemPrompt || '',
        worldview: worldview || '',
        personality_prompt: personalityPrompt || '',
        menu_subtitle_dev: menuSubtitleDev || '',
        menu_subtitle: menuSubtitle || '',
        subtitle_char_count: subtitleCharCount && subtitleCharCount.trim() !== '' ? String(subtitleCharCount) : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'product_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save prompts', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data as PromptRecord | null })
  } catch (error) {
    console.error('Error saving prompts:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

