import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ loggedIn: false, progress: {} })
  }

  const now = new Date().toISOString()

  const [vocab, idiom, cs, traps] = await Promise.all([
    supabase.from('vocab_progress').select('status, next_review_at').eq('user_id', user.id),
    supabase.from('idiom_progress').select('status, next_review_at').eq('user_id', user.id),
    supabase.from('cs_concept_progress').select('status, next_review_at').eq('user_id', user.id),
    supabase.from('user_trap_progress')
      .select('status, next_review_at, trap_patterns(subject)')
      .eq('user_id', user.id),
  ])

  function stats(rows: { status?: string | null; next_review_at?: string | null }[]) {
    const viewed = rows.length
    const mastered = rows.filter(r => r.status === 'mastered').length
    const due = rows.filter(r => r.next_review_at && r.next_review_at <= now).length
    return { viewed, mastered, due }
  }

  const trapRows = traps.data ?? []
  function trapStats(subject: string) {
    const rows = trapRows.filter(r => {
      const tp = r.trap_patterns as { subject?: string } | null
      return tp?.subject === subject
    })
    return stats(rows)
  }

  const englishRows = [...(vocab.data ?? []), ...(idiom.data ?? [])]

  return NextResponse.json({
    loggedIn: true,
    progress: {
      korean:           trapStats('korean'),
      english:          stats(englishRows),
      'korean-history': trapStats('korean-history'),
      'computer-general': stats(cs.data ?? []),
      infosec:          trapStats('infosec'),
    },
  })
}
