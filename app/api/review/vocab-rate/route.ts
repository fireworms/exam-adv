import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sm2Update, type Quality } from '@/lib/sm2'
import { addDays } from 'date-fns'

export async function POST(req: Request) {
  const { word, meaning, category, quality } = await req.json() as {
    word: string; meaning: string; category: string; quality: Quality
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: true })

  // vocab_words upsert
  const { data: wordRow } = await supabase
    .from('vocab_words')
    .upsert({ word, meaning_ko: meaning, category, subject: 'english' }, { onConflict: 'word' })
    .select('id')
    .single()

  if (!wordRow) return NextResponse.json({ error: 'word upsert failed' }, { status: 500 })

  // vocab_progress 조회 또는 생성
  const { data: existing } = await supabase
    .from('vocab_progress')
    .select('id, repetitions, ease_factor, interval')
    .eq('user_id', user.id)
    .eq('vocab_id', wordRow.id)
    .single()

  const current = existing ?? { repetitions: 0, ease_factor: 2.5, interval: 1 }
  const next = sm2Update(
    { repetitions: current.repetitions ?? 0, easeFactor: current.ease_factor ?? 2.5, interval: current.interval ?? 1 },
    quality,
  )
  const nextReviewAt = addDays(new Date(), next.interval)
  const status = next.repetitions >= 5 ? 'mastered' : next.repetitions >= 2 ? 'reviewed' : 'learning'

  if (existing) {
    await supabase.from('vocab_progress').update({
      repetitions: next.repetitions, ease_factor: next.easeFactor, interval: next.interval,
      next_review_at: nextReviewAt.toISOString(), last_reviewed_at: new Date().toISOString(),
      mastery_level: Math.min(5, next.repetitions), status,
    }).eq('id', existing.id)
  } else {
    await supabase.from('vocab_progress').insert({
      user_id: user.id, vocab_id: wordRow.id,
      repetitions: next.repetitions, ease_factor: next.easeFactor, interval: next.interval,
      next_review_at: nextReviewAt.toISOString(), last_reviewed_at: new Date().toISOString(),
      mastery_level: Math.min(5, next.repetitions), status,
    })
  }

  return NextResponse.json({ nextReviewAt: nextReviewAt.toISOString(), interval: next.interval })
}
