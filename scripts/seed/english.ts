import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

interface Word { word: string; meaning?: string; common_meaning?: string; example?: string; synonym?: string; exam_synonym?: string }
interface Pattern { id: number; name: string; form: string; equivalent?: string; example: string; korean: string; appeared_in?: string; key_point?: string }
interface Idiom { phrase: string; meaning: string }
interface Trap { id: number; trap: string; avoidance: string }

export async function seedEnglish() {
  const json = JSON.parse(
    readFileSync(resolve('data/english/요약노트_JSON.json'), 'utf-8')
  )

  // ── 1. vocab_words ───────────────────────────────────────
  const ve = json.vocabulary_essentials as Record<string, Word[]>
  const words = Object.entries(ve).flatMap(([category, list]) =>
    list.map(w => ({
      word:             w.word,
      meaning_ko:       w.meaning ?? w.common_meaning ?? '',
      category,
      difficulty:       1,
      example_sentence: w.example ?? null,
      synonym:          w.synonym ? [w.synonym] : [],
      antonym:          [],
    }))
  )
  const { error: wErr } = await supabase.from('vocab_words').upsert(words)
  if (wErr) throw new Error(`vocab_words 실패: ${wErr.message}`)
  console.log(`  ✓ 어휘 ${words.length}개 적재`)

  // ── 2. grammar_patterns ──────────────────────────────────
  const gp = json.grammar_patterns as Pattern[]
  const patterns = gp.map((p, i) => ({
    pattern_number:      p.id ?? i + 1,
    name:                p.name,
    form:                p.form,
    korean_meaning:      p.korean ?? null,
    example_sentence:    p.example ?? null,
    equivalent_form:     p.equivalent ?? null,
    key_point:           p.key_point ?? null,
    exam_appeared_in:    p.appeared_in ?? null,
    related_verbs:       [],
    difficulty:          1,
  }))
  const { error: gpErr } = await supabase.from('grammar_patterns').upsert(patterns)
  if (gpErr) throw new Error(`grammar_patterns 실패: ${gpErr.message}`)
  console.log(`  ✓ 문법 패턴 ${patterns.length}개 적재`)

  // ── 3. idioms ────────────────────────────────────────────
  const ip = json.idioms_and_phrases as Record<string, Idiom[]>
  const idioms = Object.entries(ip).flatMap(([category, list]) =>
    list.map(i => ({
      phrase:     i.phrase,
      meaning_ko: i.meaning,
      category,
      difficulty: 1,
    }))
  )
  const { error: iErr } = await supabase.from('idioms').upsert(idioms)
  if (iErr) throw new Error(`idioms 실패: ${iErr.message}`)
  console.log(`  ✓ 관용구 ${idioms.length}개 적재`)

  // ── 4. trap_patterns ─────────────────────────────────────
  const traps = (json.top_15_traps as Trap[]).map((t, i) => ({
    subject:        '영어',
    rank:           i + 1,
    title:          t.trap,
    countermeasure: t.avoidance ?? null,
  }))
  const { error: tErr } = await supabase.from('trap_patterns').upsert(traps)
  if (tErr) throw new Error(`영어 trap_patterns 실패: ${tErr.message}`)
  console.log(`  ✓ 영어 함정 ${traps.length}개 적재`)
}
