import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function seedEnglish() {
  const json = JSON.parse(
    readFileSync(resolve('data/english/요약노트_JSON.json'), 'utf-8')
  )

  // 어휘 카드 적재
  if (json.vocabulary_by_category) {
    const words: Record<string, unknown>[] = []
    for (const [category, list] of Object.entries(json.vocabulary_by_category)) {
      for (const w of list as Record<string, unknown>[]) {
        words.push({
          word:                w.word,
          meaning_ko:          w.meaning_ko,
          meaning_en:          w.meaning_en ?? null,
          category,
          difficulty:          w.difficulty ?? 1,
          example_sentence:    w.example ?? w.example_sentence ?? null,
          example_translation: w.example_translation ?? null,
          synonym:             w.synonyms ?? w.synonym ?? [],
          antonym:             w.antonyms ?? w.antonym ?? [],
          pronunciation:       w.ipa ?? w.pronunciation ?? null,
        })
      }
    }
    const { error } = await supabase.from('vocab_words').upsert(words, { onConflict: 'id' })
    if (error) throw new Error(`vocab_words 적재 실패: ${error.message}`)
    console.log(`  ✓ 어휘 ${words.length}개 적재`)
  }

  // 문법 패턴 적재
  if (json.grammar_patterns) {
    const patterns = (json.grammar_patterns as Record<string, unknown>[]).map((p, i) => ({
      pattern_number:      i + 1,
      name:                p.name,
      form:                p.form ?? null,
      korean_meaning:      p.korean_meaning ?? null,
      example_sentence:    p.example_sentence ?? null,
      example_translation: p.example_translation ?? null,
      equivalent_form:     p.equivalent_form ?? null,
      key_point:           p.key_point ?? null,
      exam_appeared_in:    p.exam_appeared_in ?? null,
      related_verbs:       p.related_verbs ?? [],
      difficulty:          p.difficulty ?? 1,
    }))
    const { error } = await supabase.from('grammar_patterns').upsert(patterns)
    if (error) throw new Error(`grammar_patterns 적재 실패: ${error.message}`)
    console.log(`  ✓ 문법 패턴 ${patterns.length}개 적재`)
  }

  // 관용구 적재
  if (json.idioms) {
    const idioms = (json.idioms as Record<string, unknown>[]).map(idiom => ({
      phrase:              idiom.phrase,
      meaning_ko:          idiom.meaning_ko,
      category:            idiom.category ?? null,
      example_sentence:    idiom.example_sentence ?? null,
      literal_translation: idiom.literal_translation ?? null,
      difficulty:          idiom.difficulty ?? 1,
      exam_appeared_in:    idiom.exam_appeared_in ?? null,
    }))
    const { error } = await supabase.from('idioms').upsert(idioms)
    if (error) throw new Error(`idioms 적재 실패: ${error.message}`)
    console.log(`  ✓ 관용구 ${idioms.length}개 적재`)
  }

  // 안내문 함정 적재
  if (json.announcement_traps) {
    const traps = (json.announcement_traps as Record<string, unknown>[]).map(t => ({
      trap_category: t.category ?? t.trap_category,
      title:         t.title,
      description:   t.description ?? null,
      example:       t.example ?? null,
    }))
    const { error } = await supabase.from('announcement_traps').upsert(traps)
    if (error) throw new Error(`announcement_traps 적재 실패: ${error.message}`)
    console.log(`  ✓ 안내문 함정 ${traps.length}개 적재`)
  }

  // 영어 trap_patterns 적재
  if (json.trap_patterns) {
    const traps = (json.trap_patterns as Record<string, unknown>[]).map((t, i) => ({
      subject:         '영어',
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
    if (error) throw new Error(`영어 trap_patterns 적재 실패: ${error.message}`)
    console.log(`  ✓ 영어 함정 ${traps.length}개 적재`)
  }
}
