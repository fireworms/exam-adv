import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ cards: [] })

  const now = new Date().toISOString()

  const [vocab, concepts, traps, idioms] = await Promise.all([
    supabase.from('vocab_progress')
      .select('id, vocab_id, next_review_at, vocab_words(word, meaning_ko)')
      .eq('user_id', user.id).lte('next_review_at', now).limit(20),
    supabase.from('cs_concept_progress')
      .select('id, concept_id, next_review_at, cs_concepts(name, domain)')
      .eq('user_id', user.id).lte('next_review_at', now).limit(20),
    supabase.from('user_trap_progress')
      .select('id, trap_id, next_review_at, trap_patterns(title, subject)')
      .eq('user_id', user.id).lte('next_review_at', now).limit(20),
    supabase.from('idiom_progress')
      .select('id, idiom_id, next_review_at, idioms(phrase, meaning_ko)')
      .eq('user_id', user.id).lte('next_review_at', now).limit(10),
  ])

  const cards = [
    ...(vocab.data ?? []).map(r => ({ type: 'vocab',   ...r })),
    ...(concepts.data ?? []).map(r => ({ type: 'concept', ...r })),
    ...(traps.data ?? []).map(r => ({ type: 'trap',    ...r })),
    ...(idioms.data ?? []).map(r => ({ type: 'idiom',  ...r })),
  ]

  return NextResponse.json({ cards, total: cards.length })
}
