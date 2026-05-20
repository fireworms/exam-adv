import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

interface Trap { 틀린생각: string; 정답: string }

export async function seedInfosec() {
  const json = JSON.parse(readFileSync(resolve('data/infosec/요약노트_JSON.json'), 'utf-8'))

  // ── 1. crypto_algorithms ─────────────────────────────────
  const ae = json.algorithms_encryption as Record<string, unknown>
  const cryptos: Record<string, unknown>[] = []

  // 대칭블록 (string array)
  if (Array.isArray(ae.대칭블록)) {
    ;(ae.대칭블록 as string[]).forEach(item => {
      const m = item.match(/^(\w+)\((\d+)\/[\d~]+\/[\d~]+\)$/)
      cryptos.push({ name: m ? m[1] : item, category: 'symmetric_block',
        block_size: m ? Number(m[2]) : null, description: item })
    })
  }

  // 비대칭 (object)
  if (typeof ae.비대칭 === 'object') {
    Object.entries(ae.비대칭 as Record<string, Record<string, unknown>>).forEach(([name, info]) => {
      cryptos.push({
        name, category: 'asymmetric',
        base_problem: info.기반 ?? null,
        description:  JSON.stringify(info).slice(0, 300),
      })
    })
  }

  // 해시 (array or object)
  if (ae.해시) {
    const h = ae.해시
    const items = Array.isArray(h)
      ? (h as string[]).map(s => ({ name: s, category: 'hash', description: s }))
      : Object.entries(h as Record<string, unknown>).map(([k, v]) => ({
          name: k, category: 'hash',
          description: typeof v === 'object' ? JSON.stringify(v).slice(0, 200) : String(v),
        }))
    cryptos.push(...items)
  }

  const { error: cErr } = await supabase.from('crypto_algorithms').upsert(cryptos)
  if (cErr) throw new Error(`crypto_algorithms 실패: ${cErr.message}`)
  console.log(`  ✓ 암호 알고리즘 ${cryptos.length}개 적재`)

  // ── 2. access_control_models ─────────────────────────────
  const ac = (json.key_concepts as Record<string, unknown>)['접근통제'] as Record<string, string>
  const models = Object.entries(ac).map(([name, desc]) => ({
    name,
    policy_type: name.includes('MAC') ? 'mac' : name.includes('DAC') ? 'dac' : name.includes('RBAC') ? 'rbac' : 'other',
    focus:       name === 'BLP' ? 'confidentiality' : name === 'Biba' ? 'integrity' : null,
    rules:       { summary: desc },
    use_case:    null,
  }))
  const { error: acErr } = await supabase.from('access_control_models').upsert(models)
  if (acErr) throw new Error(`access_control_models 실패: ${acErr.message}`)
  console.log(`  ✓ 접근통제 모델 ${models.length}개 적재`)

  // ── 3. law_articles ──────────────────────────────────────
  const lr = json.laws_regulations as Record<string, Record<string, unknown>>
  const articles: Record<string, unknown>[] = []
  for (const [lawName, content] of Object.entries(lr)) {
    if (typeof content !== 'object') continue
    for (const [artKey, artVal] of Object.entries(content)) {
      const nums = typeof artVal === 'string'
        ? [...artVal.matchAll(/\d+/g)].map(m => m[0])
        : []
      articles.push({
        law_name:       lawName,
        article_number: artKey,
        content:        typeof artVal === 'object' ? JSON.stringify(artVal).slice(0, 500) : String(artVal),
        key_numbers:    nums.length ? { numbers: nums } : null,
      })
    }
  }
  const { error: lErr } = await supabase.from('law_articles').upsert(articles)
  if (lErr) throw new Error(`law_articles 실패: ${lErr.message}`)
  console.log(`  ✓ 법규 조문 ${articles.length}개 적재`)

  // ── 4. trap_patterns ─────────────────────────────────────
  const traps = (json.common_traps as Trap[]).map((t, i) => ({
    subject:        '정보보호론',
    rank:           i + 1,
    title:          t.틀린생각,
    incorrect_form: t.틀린생각,
    correct_form:   t.정답,
    trap_category:  'concept_trap',
  }))
  const { error: tErr } = await supabase.from('trap_patterns').upsert(traps)
  if (tErr) throw new Error(`정보보호론 trap_patterns 실패: ${tErr.message}`)
  console.log(`  ✓ 정보보호론 함정 ${traps.length}개 적재`)
}
