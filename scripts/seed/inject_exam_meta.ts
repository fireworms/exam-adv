/**
 * set*.json에서 기출 메타데이터를 추출하여
 * vocab_words / cs_concepts / law_articles 등의 exam_appeared_in 컬럼에 주입
 * 실행: npm run inject-exam-meta
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { resolve, join } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const META_REGEX = /\[관련 기출:\s*([^\]\/]+?)(?:\s*\/\s*핵심 개념:\s*([^\]]+))?\]/g

const SUBJECT_DIRS: Record<string, string> = {
  korean:          'data/korean',
  english:         'data/english',
  korean_history:  'data/korean_history',
  computer_general: 'data/computer_general',
  infosec:         'data/infosec',
}

async function injectExamMeta() {
  console.log('📎 기출 메타데이터 주입 시작...\n')
  let total = 0

  for (const [subject, dir] of Object.entries(SUBJECT_DIRS)) {
    const setFiles = ['set1.json', 'set2.json', 'set3.json']
      .map(f => join(dir, f))

    for (const filePath of setFiles) {
      let data: { questions?: Record<string, unknown>[] }
      try {
        data = JSON.parse(readFileSync(resolve(filePath), 'utf-8'))
      } catch {
        continue
      }

      if (!data.questions) continue

      for (const q of data.questions) {
        const explanation = (q.explanation as string) ?? ''
        const matches = Array.from(explanation.matchAll(META_REGEX))

        for (const m of matches) {
          const examRef = m[1].trim()
          const conceptKey = m[2]?.trim()
          if (!conceptKey) continue

          // 어휘(영어) — word 이름으로 매칭
          if (subject === 'english') {
            await supabase
              .from('vocab_words')
              .update({ exam_appeared_in: examRef })
              .ilike('word', `%${conceptKey}%`)
          }

          // 컴퓨터일반 개념
          if (subject === 'computer_general') {
            await supabase
              .from('cs_concepts')
              .update({ exam_appeared_in: examRef })
              .ilike('name', `%${conceptKey}%`)
          }

          // 정보보호론 법규
          if (subject === 'infosec') {
            await supabase
              .from('law_articles')
              .update({ exam_appeared_in: examRef })
              .ilike('content', `%${conceptKey}%`)
          }

          total++
        }
      }
    }
  }

  console.log(`✅ 기출 메타데이터 주입 완료 (총 ${total}건)`)
}

injectExamMeta().catch(err => {
  console.error('❌ 주입 실패:', err)
  process.exit(1)
})
