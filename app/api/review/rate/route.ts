import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sm2Update, type Quality } from '@/lib/sm2'
import { addDays } from 'date-fns'

const ALLOWED_TABLES = ['vocab_progress', 'cs_concept_progress', 'user_trap_progress', 'idiom_progress', 'grammar_pattern_views'] as const
type AllowedTable = typeof ALLOWED_TABLES[number]

export async function POST(req: Request) {
  const { table, id, quality } = await req.json() as { table: AllowedTable; id: number; quality: Quality }

  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: row } = await supabase
    .from(table)
    .select('repetitions, ease_factor, interval')
    .eq('id', id)
    .single()

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const next = sm2Update(
    { repetitions: row.repetitions ?? 0, easeFactor: row.ease_factor ?? 2.5, interval: row.interval ?? 1 },
    quality
  )

  const nextReviewAt = addDays(new Date(), next.interval)
  const status = next.repetitions >= 5 ? 'mastered' : next.repetitions >= 2 ? 'reviewed' : 'learning'

  await supabase.from(table).update({
    repetitions:      next.repetitions,
    ease_factor:      next.easeFactor,
    interval:         next.interval,
    next_review_at:   nextReviewAt.toISOString(),
    last_reviewed_at: new Date().toISOString(),
    mastery_level:    Math.min(5, next.repetitions),
    status,
  }).eq('id', id)

  return NextResponse.json({ nextReviewAt: nextReviewAt.toISOString(), interval: next.interval })
}
