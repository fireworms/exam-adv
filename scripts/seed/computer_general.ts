import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function seedComputerGeneral() {
  const json = JSON.parse(
    readFileSync(resolve('data/computer_general/요약노트_JSON.json'), 'utf-8')
  )

  // cs_concepts 적재 (key_concepts)
  const conceptSource = json.key_concepts ?? json.concepts ?? []
  if (conceptSource.length > 0) {
    const concepts = (conceptSource as Record<string, unknown>[]).map(c => ({
      domain:          c.domain ?? c.category ?? '기타',
      name:            c.name,
      description:     c.description ?? null,
      formula:         c.formula ?? null,
      example:         c.example ?? null,
      exam_appeared_in: c.exam_appeared_in ?? null,
      importance:      c.importance ?? 3,
    }))
    const { error } = await supabase.from('cs_concepts').upsert(concepts)
    if (error) throw new Error(`cs_concepts 적재 실패: ${error.message}`)
    console.log(`  ✓ 컴일 개념 ${concepts.length}개 적재`)
  }

  // cs_algorithms 적재
  if (json.algorithms) {
    const algs = (json.algorithms as Record<string, unknown>[]).map(a => ({
      name:             a.name,
      category:         a.category ?? null,
      time_complexity:  a.time_complexity ?? null,
      space_complexity: a.space_complexity ?? null,
      pseudocode:       a.pseudocode ?? null,
      description:      a.description ?? null,
    }))
    const { error } = await supabase.from('cs_algorithms').upsert(algs)
    if (error) throw new Error(`cs_algorithms 적재 실패: ${error.message}`)
    console.log(`  ✓ 알고리즘 ${algs.length}개 적재`)
  }

  // cs_protocols 적재
  if (json.protocols) {
    const protocols = (json.protocols as Record<string, unknown>[]).map(p => ({
      name:        p.name,
      osi_layer:   p.osi_layer ?? null,
      rfc_number:  p.rfc_number ?? null,
      description: p.description ?? null,
    }))
    const { error } = await supabase.from('cs_protocols').upsert(protocols)
    if (error) throw new Error(`cs_protocols 적재 실패: ${error.message}`)
    console.log(`  ✓ 프로토콜 ${protocols.length}개 적재`)
  }

  // trap_patterns 적재 (컴퓨터일반)
  if (json.trap_patterns) {
    const traps = (json.trap_patterns as Record<string, unknown>[]).map((t, i) => ({
      subject:         '컴퓨터일반',
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
    if (error) throw new Error(`컴일 trap_patterns 적재 실패: ${error.message}`)
    console.log(`  ✓ 컴일 함정 ${traps.length}개 적재`)
  }
}
