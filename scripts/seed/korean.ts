import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function seedKorean() {
  const json = JSON.parse(
    readFileSync(resolve('data/korean/요약노트_JSON.json'), 'utf-8')
  )

  // top_10_areas 적재
  if (json.top_10_areas) {
    const areas = json.top_10_areas.map((area: Record<string, unknown>, i: number) => ({
      area_key:            area.key ?? area.area_key ?? `area_${i}`,
      name_ko:             area.name ?? area.name_ko ?? String(area),
      rank:                i + 1,
      study_weight:        area.study_weight ?? null,
      difficulty:          area.difficulty ?? null,
      frequency_per_round: area.frequency ?? area.frequency_per_round ?? null,
    }))

    const { error } = await supabase
      .from('korean_areas')
      .upsert(areas, { onConflict: 'area_key' })
    if (error) throw new Error(`korean_areas 적재 실패: ${error.message}`)
    console.log(`  ✓ 국어 영역 ${areas.length}개 적재`)
  }

  // trap_patterns 적재 (국어)
  if (json.trap_patterns) {
    const traps = json.trap_patterns.map((t: Record<string, unknown>, i: number) => ({
      subject:         '국어',
      rank:            i + 1,
      title:           t.title ?? t.name,
      description:     t.description ?? null,
      incorrect_form:  t.incorrect_form ?? t.wrong ?? null,
      correct_form:    t.correct_form ?? t.correct ?? null,
      trap_category:   t.category ?? t.trap_category ?? null,
      frequency:       t.frequency ?? null,
      countermeasure:  t.countermeasure ?? null,
      example:         t.example ?? null,
      exam_appeared_in: t.exam_appeared_in ?? null,
    }))

    const { error } = await supabase.from('trap_patterns').upsert(traps)
    if (error) throw new Error(`국어 trap_patterns 적재 실패: ${error.message}`)
    console.log(`  ✓ 국어 함정 ${traps.length}개 적재`)
  }
}
