import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

const DOMAIN_HINTS: Record<string, string> = {
  '2의_보수': '컴퓨터구조', 캐시_메모리: '컴퓨터구조', CPU_스케줄링: '운영체제',
  페이지_교체: '운영체제', OSI_7계층: '네트워크', 정규화: '데이터베이스',
}

export async function seedComputerGeneral() {
  const json = JSON.parse(readFileSync(resolve('data/computer_general/요약노트_JSON.json'), 'utf-8'))

  // ── 1. cs_concepts (key_concepts) ────────────────────────
  const kc = json.key_concepts as Record<string, Record<string, unknown>>
  const concepts = Object.entries(kc).map(([key, val]) => ({
    domain:      DOMAIN_HINTS[key] ?? '기타',
    name:        key.replace(/_/g, ' '),
    description: String(val.definition ?? val.description ?? JSON.stringify(val)).slice(0, 500),
    formula:     val.calculation ? String(val.calculation) : null,
    example:     val.example ? String(val.example) : null,
    importance:  Number(val.exam_frequency ?? 3),
  }))
  const { error: cErr } = await supabase.from('cs_concepts').upsert(concepts)
  if (cErr) throw new Error(`cs_concepts 실패: ${cErr.message}`)
  console.log(`  ✓ 컴일 개념 ${concepts.length}개 적재`)

  // ── 2. cs_algorithms ─────────────────────────────────────
  const alg = json.algorithms_data_structures as Record<string, unknown>
  const algorithms = Object.entries(alg).flatMap(([cat, val]) => {
    if (typeof val !== 'object' || val === null) return []
    return Object.entries(val as Record<string, unknown>).map(([name, data]) => ({
      name,
      category:         cat,
      time_complexity:  ((data as Record<string, unknown>)?.complexity as Record<string, unknown>)?.avg as string ?? null,
      space_complexity: null,
      pseudocode:       null,
      description:      typeof data === 'object' ? JSON.stringify(data).slice(0, 300) : String(data),
    }))
  })
  const { error: aErr } = await supabase.from('cs_algorithms').upsert(algorithms)
  if (aErr) throw new Error(`cs_algorithms 실패: ${aErr.message}`)
  console.log(`  ✓ 알고리즘 ${algorithms.length}개 적재`)

  // ── 3. trap_patterns (common_traps) ──────────────────────
  const ct = json.common_traps as Record<string, unknown>
  const traps = Object.entries(ct).map(([key, val], i) => ({
    subject:        '컴퓨터일반',
    rank:           i + 1,
    title:          key.replace(/_/g, ' vs '),
    description:    typeof val === 'string' ? val : JSON.stringify(val),
    trap_category:  'concept_trap',
  }))
  const { error: tErr } = await supabase.from('trap_patterns').upsert(traps)
  if (tErr) throw new Error(`컴일 trap_patterns 실패: ${tErr.message}`)
  console.log(`  ✓ 컴일 함정 ${traps.length}개 적재`)
}
