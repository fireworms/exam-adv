import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

interface Figure { name: string; era: string; key: string[] }
interface AncientKingdom { kingdom: string; period: string; key_events: string[] }
interface King { king: string; period: string; achievements: string[] }
interface ModernEvent { year: number; event: string }
interface Document { name: string; year?: number; era?: string; author?: string; country?: string; feature: string }
interface TrapItem { title?: string; name?: string; description?: string; incorrect_form?: string; correct_form?: string; category?: string; frequency?: string; countermeasure?: string }

export async function seedKoreanHistory() {
  const json = JSON.parse(
    readFileSync(resolve('data/korean_history/요약노트_JSON.json'), 'utf-8')
  )

  // ── 1. eras (시대 정보) ──────────────────────────────────
  const ERA_COLORS: Record<string, string> = {
    고조선: '#8B7355', 삼국: '#7B5EA7', 남북국: '#6B4EA0', 고려: '#1A6FBF',
    조선: '#2E9E4F', 근대: '#D4820F', 일제강점기: '#DC2626', 현대: '#0891B2',
  }
  const eraNames = ['선사·고조선', '삼국시대', '남북국시대', '고려', '조선', '근대', '일제강점기', '현대']
  const eras = eraNames.map((name, i) => ({
    name_ko: name, name_en: null, start_year: null, end_year: null,
    color_hex: ERA_COLORS[name] ?? '#7B5EA7', description: null, sort_order: i,
  }))
  const { error: eraErr } = await supabase.from('eras').upsert(eras)
  if (eraErr) throw new Error(`eras 적재 실패: ${eraErr.message}`)
  console.log(`  ✓ 시대 ${eras.length}개 적재`)

  // ── 2. figures (인물) ─────────────────────────────────────
  const { data: eraRows } = await supabase.from('eras').select('id, name_ko')
  const eraMap = Object.fromEntries((eraRows ?? []).map(e => [e.name_ko, e.id]))

  const figureGroups = json.key_figures as Record<string, Figure[]>
  const ROLE_MAP: Record<string, string> = {
    rulers_주요_통치자:             'ruler',
    scholars_학자:                  'scholar',
    reformers_개혁가:               'reformer',
    independence_activists_독립운동가: 'activist',
  }
  const figures: Record<string, unknown>[] = []
  for (const [cat, figs] of Object.entries(figureGroups)) {
    for (const f of figs) {
      figures.push({
        name_ko:         f.name,
        era_id:          null,
        role:            ROLE_MAP[cat] ?? 'other',
        summary:         f.key.join(' / '),
        achievements:    { keywords: f.key },
        importance:      3,
        exam_appearances: 0,
      })
    }
  }
  const { error: figErr } = await supabase.from('figures').upsert(figures)
  if (figErr) throw new Error(`figures 적재 실패: ${figErr.message}`)
  console.log(`  ✓ 인물 ${figures.length}개 적재`)

  // ── 3. historical_events (근현대 사건) ────────────────────
  const dc = json.dynasty_chronology as {
    modern_events: ModernEvent[]
  }
  const events = dc.modern_events.map(ev => ({
    name_ko: ev.event, year: ev.year, category: 'politics',
    description: null, importance: 3,
  }))
  const { error: evErr } = await supabase.from('historical_events').upsert(events)
  if (evErr) throw new Error(`historical_events 적재 실패: ${evErr.message}`)
  console.log(`  ✓ 근현대 사건 ${events.length}개 적재`)

  // ── 4. historical_documents (사료) ────────────────────────
  const docGroups = json.key_documents as Record<string, Document[]>
  const TYPE_MAP: Record<string, string> = {
    historical_records_역사서: 'historical_record',
    legal_codes_법전:          'legal_code',
    treaties_조약:             'treaty',
    manifestos_선언서_강령:    'manifesto',
  }
  const docs: Record<string, unknown>[] = []
  for (const [cat, docList] of Object.entries(docGroups)) {
    for (const d of docList) {
      docs.push({
        name_ko: d.name, type: TYPE_MAP[cat] ?? 'other',
        year: d.year ?? null, description: d.feature, importance: 3,
      })
    }
  }
  const { error: docErr } = await supabase.from('historical_documents').upsert(docs)
  if (docErr) throw new Error(`historical_documents 적재 실패: ${docErr.message}`)
  console.log(`  ✓ 사료 ${docs.length}개 적재`)

  // ── 5. trap_patterns (TOP 15 함정) ────────────────────────
  const rawTraps = json.top_15_traps as (string | TrapItem)[]
  const traps = rawTraps.map((t, i) => ({
    subject: '한국사', rank: i + 1,
    title: typeof t === 'string' ? t : (t.title ?? t.name ?? `함정 ${i + 1}`),
    description:    typeof t === 'object' ? t.description ?? null : null,
    incorrect_form: typeof t === 'object' ? t.incorrect_form ?? null : null,
    correct_form:   typeof t === 'object' ? t.correct_form ?? null : null,
    trap_category:  typeof t === 'object' ? t.category ?? null : null,
    frequency:      typeof t === 'object' ? t.frequency ?? null : null,
    countermeasure: typeof t === 'object' ? t.countermeasure ?? null : null,
  }))
  const { error: trapErr } = await supabase.from('trap_patterns').upsert(traps)
  if (trapErr) throw new Error(`한국사 trap_patterns 적재 실패: ${trapErr.message}`)
  console.log(`  ✓ 한국사 함정 ${traps.length}개 적재`)
}
