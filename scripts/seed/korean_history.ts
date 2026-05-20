import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function seedKoreanHistory() {
  const json = JSON.parse(
    readFileSync(resolve('data/korean_history/요약노트_JSON.json'), 'utf-8')
  )

  // eras 적재
  if (json.eras) {
    const eras = (json.eras as Record<string, unknown>[]).map((e, i) => ({
      name_ko:    e.name_ko ?? e.name,
      name_en:    e.name_en ?? null,
      start_year: e.start_year ?? null,
      end_year:   e.end_year ?? null,
      color_hex:  e.color_hex ?? null,
      description: e.description ?? null,
      sort_order: i,
    }))
    const { error } = await supabase.from('eras').upsert(eras)
    if (error) throw new Error(`eras 적재 실패: ${error.message}`)
    console.log(`  ✓ 시대 ${eras.length}개 적재`)
  }

  // figures 적재
  if (json.figures) {
    const { data: eraRows } = await supabase.from('eras').select('id, name_ko')
    const eraMap = Object.fromEntries((eraRows ?? []).map(e => [e.name_ko, e.id]))

    const figures = (json.figures as Record<string, unknown>[]).map(f => ({
      era_id:          f.era ? eraMap[f.era as string] ?? null : null,
      name_ko:         f.name_ko ?? f.name,
      name_hanja:      f.name_hanja ?? null,
      pen_name:        f.pen_name ?? null,
      courtesy_name:   f.courtesy_name ?? null,
      posthumous_name: f.posthumous_name ?? null,
      birth_year:      f.birth_year ?? null,
      death_year:      f.death_year ?? null,
      role:            f.role ?? null,
      summary:         f.summary ?? null,
      achievements:    f.achievements ?? null,
      importance:      f.importance ?? 3,
      exam_appearances: f.exam_appearances ?? 0,
    }))
    const { error } = await supabase.from('figures').upsert(figures)
    if (error) throw new Error(`figures 적재 실패: ${error.message}`)
    console.log(`  ✓ 인물 ${figures.length}개 적재`)
  }

  // historical_events 적재
  if (json.historical_events) {
    const { data: eraRows } = await supabase.from('eras').select('id, name_ko')
    const eraMap = Object.fromEntries((eraRows ?? []).map(e => [e.name_ko, e.id]))

    const events = (json.historical_events as Record<string, unknown>[]).map(ev => ({
      era_id:      ev.era ? eraMap[ev.era as string] ?? null : null,
      name_ko:     ev.name_ko ?? ev.name,
      name_hanja:  ev.name_hanja ?? null,
      year:        ev.year ?? null,
      month:       ev.month ?? null,
      day:         ev.day ?? null,
      category:    ev.category ?? null,
      location:    ev.location ?? null,
      latitude:    ev.latitude ?? null,
      longitude:   ev.longitude ?? null,
      description: ev.description ?? null,
      importance:  ev.importance ?? 3,
    }))
    const { error } = await supabase.from('historical_events').upsert(events)
    if (error) throw new Error(`historical_events 적재 실패: ${error.message}`)
    console.log(`  ✓ 역사 사건 ${events.length}개 적재`)
  }

  // trap_patterns 적재 (한국사)
  if (json.trap_patterns) {
    const traps = (json.trap_patterns as Record<string, unknown>[]).map((t, i) => ({
      subject:         '한국사',
      rank:            i + 1,
      title:           t.title ?? t.name,
      description:     t.description ?? null,
      incorrect_form:  t.incorrect_form ?? null,
      correct_form:    t.correct_form ?? null,
      trap_category:   t.category ?? null,
      frequency:       t.frequency ?? null,
      countermeasure:  t.countermeasure ?? null,
      exam_appeared_in: t.exam_appeared_in ?? null,
    }))
    const { error } = await supabase.from('trap_patterns').upsert(traps)
    if (error) throw new Error(`한국사 trap_patterns 적재 실패: ${error.message}`)
    console.log(`  ✓ 한국사 함정 ${traps.length}개 적재`)
  }
}
