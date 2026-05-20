import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function seedInfosec() {
  const json = JSON.parse(
    readFileSync(resolve('data/infosec/요약노트_JSON.json'), 'utf-8')
  )

  // crypto_algorithms
  if (json.crypto_algorithms) {
    const cryptos = (json.crypto_algorithms as Record<string, unknown>[]).map(c => ({
      name:             c.name,
      category:         c.category,
      block_size:       c.block_size ?? null,
      key_size_options: c.key_size_options ?? [],
      output_size:      c.output_size ?? null,
      rounds:           c.rounds ?? null,
      structure:        c.structure ?? null,
      base_problem:     c.base_problem ?? null,
      security_status:  c.security_status ?? 'secure',
      description:      c.description ?? null,
    }))
    const { error } = await supabase.from('crypto_algorithms').upsert(cryptos)
    if (error) throw new Error(`crypto_algorithms 적재 실패: ${error.message}`)
    console.log(`  ✓ 암호 알고리즘 ${cryptos.length}개 적재`)
  }

  // law_articles
  if (json.law_articles) {
    const articles = (json.law_articles as Record<string, unknown>[]).map(a => ({
      law_name:           a.law_name,
      article_number:     a.article_number,
      article_title:      a.article_title ?? null,
      content:            a.content,
      supervising_ministry: a.supervising_ministry ?? null,
      key_numbers:        a.key_numbers ?? null,
    }))
    const { error } = await supabase.from('law_articles').upsert(articles)
    if (error) throw new Error(`law_articles 적재 실패: ${error.message}`)
    console.log(`  ✓ 법규 조문 ${articles.length}개 적재`)
  }

  // ismsp_items
  if (json.ismsp_items) {
    const items = (json.ismsp_items as Record<string, unknown>[]).map(it => ({
      area:        it.area,
      phase:       it.phase ?? null,
      category:    it.category ?? null,
      item_code:   it.item_code ?? null,
      item_name:   it.item_name ?? it.name,
      description: it.description ?? null,
    }))
    const { error } = await supabase.from('ismsp_items').upsert(items)
    if (error) throw new Error(`ismsp_items 적재 실패: ${error.message}`)
    console.log(`  ✓ ISMS-P 항목 ${items.length}개 적재`)
  }

  // access_control_models
  if (json.access_control_models) {
    const models = (json.access_control_models as Record<string, unknown>[]).map(m => ({
      name:        m.name,
      policy_type: m.policy_type ?? null,
      focus:       m.focus ?? null,
      rules:       m.rules ?? null,
      use_case:    m.use_case ?? null,
    }))
    const { error } = await supabase.from('access_control_models').upsert(models)
    if (error) throw new Error(`access_control_models 적재 실패: ${error.message}`)
    console.log(`  ✓ 접근통제 모델 ${models.length}개 적재`)
  }

  // attack_techniques
  if (json.attack_techniques) {
    const attacks = (json.attack_techniques as Record<string, unknown>[]).map(a => ({
      name:            a.name,
      category:        a.category,
      target_layer:    a.target_layer ?? null,
      mechanism:       a.mechanism ?? null,
      defense_methods: a.defense_methods ?? [],
      example:         a.example ?? null,
    }))
    const { error } = await supabase.from('attack_techniques').upsert(attacks)
    if (error) throw new Error(`attack_techniques 적재 실패: ${error.message}`)
    console.log(`  ✓ 공격 기법 ${attacks.length}개 적재`)
  }

  // trap_patterns (정보보호론)
  if (json.trap_patterns) {
    const traps = (json.trap_patterns as Record<string, unknown>[]).map((t, i) => ({
      subject:         '정보보호론',
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
    if (error) throw new Error(`정보보호론 trap_patterns 적재 실패: ${error.message}`)
    console.log(`  ✓ 정보보호론 함정 ${traps.length}개 적재`)
  }
}
