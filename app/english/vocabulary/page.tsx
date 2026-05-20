import { readFileSync } from 'fs'
import { resolve } from 'path'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  environment_climate:                     { label: '환경·기후',    emoji: '🌿' },
  ai_digital:                              { label: 'AI·디지털',   emoji: '🤖' },
  administration_policy:                   { label: '행정·정책',   emoji: '🏛️' },
  health_welfare:                          { label: '건강·복지',   emoji: '🏥' },
  economy_labor:                           { label: '경제·노동',   emoji: '💼' },
  multi_meaning_words_for_passage_questions: { label: '다의어',      emoji: '📖' },
}

export default function VocabularyPage() {
  const json = JSON.parse(readFileSync(resolve('data/english/요약노트_JSON.json'), 'utf-8'))
  const ve = json.vocabulary_essentials as Record<string, unknown[]>

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">영어 어휘 카드</h1>
      <p className="text-sm text-muted-foreground">카테고리를 선택해 플립 카드 학습을 시작하세요.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(ve).map(([cat, words]) => {
          const meta = CATEGORY_META[cat] ?? { label: cat, emoji: '📝' }
          return (
            <Link key={cat} href={`/english/vocabulary/${cat}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="py-4 px-4 flex flex-col items-center gap-2 text-center">
                  <span className="text-3xl">{meta.emoji}</span>
                  <span className="font-semibold text-sm">{meta.label}</span>
                  <Badge variant="secondary">{(words as unknown[]).length}개</Badge>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
