import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { subject, itemType, itemKey, label } = await req.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: true })

  await supabase.from('user_bookmarks').upsert({
    user_id: user.id, subject, item_type: itemType, item_key: itemKey, label,
  }, { onConflict: 'user_id,subject,item_type,item_key' })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { subject, itemType, itemKey } = await req.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: true })

  await supabase.from('user_bookmarks')
    .delete()
    .match({ user_id: user.id, subject, item_type: itemType, item_key: itemKey })

  return NextResponse.json({ ok: true })
}
