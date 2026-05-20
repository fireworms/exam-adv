import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

interface Area { rank: number; name: string; frequency_per_round: string; difficulty: string; study_weight: number }
interface Trap { rank: number; trap: string; frequency?: string; countermeasure?: string }

export async function seedKorean() {
  const json = JSON.parse(readFileSync(resolve('data/korean/요약노트_JSON.json'), 'utf-8'))

  // ── 1. korean_areas (top_10_areas) ───────────────────────
  const areas = (json.top_10_areas as Area[]).map(a => ({
    area_key:            a.name.replace(/\s/g, '_').toLowerCase(),
    name_ko:             a.name,
    rank:                a.rank,
    study_weight:        a.study_weight,
    difficulty:          a.difficulty,
    frequency_per_round: a.frequency_per_round,
  }))
  const { error: aErr } = await supabase.from('korean_areas').upsert(areas, { onConflict: 'area_key' })
  if (aErr) throw new Error(`korean_areas 실패: ${aErr.message}`)
  console.log(`  ✓ 국어 영역 ${areas.length}개 적재`)

  // ── 2. trap_patterns (top_15_traps) ──────────────────────
  const traps = (json.top_15_traps as Trap[]).map(t => ({
    subject:        '국어',
    rank:           t.rank,
    title:          t.trap,
    frequency:      t.frequency ?? null,
    countermeasure: t.countermeasure ?? null,
    trap_category:  'concept_trap',
  }))
  const { error: tErr } = await supabase.from('trap_patterns').upsert(traps)
  if (tErr) throw new Error(`국어 trap_patterns 실패: ${tErr.message}`)
  console.log(`  ✓ 국어 함정 ${traps.length}개 적재`)
}
