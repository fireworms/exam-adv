import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { quizType, itemKey, subject, isCorrect, timeSec } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: true }) // 비인증 무시

  await supabase.from('user_mini_quiz_attempts').insert({
    user_id:       user.id,
    subject,
    quiz_type:     quizType,
    item_key:      itemKey ?? null,
    is_correct:    isCorrect,
    time_spent_sec: timeSec ?? null,
  })

  return NextResponse.json({ ok: true })
}
