import { readFileSync } from 'fs'
import { resolve } from 'path'
import { notFound } from 'next/navigation'
import { VocabCardDeck } from './VocabCardDeck'

interface Word { word: string; meaning: string; example?: string; synonym?: string }

const CATEGORY_LABELS: Record<string, string> = {
  environment_climate:                     '환경·기후',
  ai_digital:                              'AI·디지털',
  administration_policy:                   '행정·정책',
  health_welfare:                          '건강·복지',
  economy_labor:                           '경제·노동',
  multi_meaning_words_for_passage_questions: '다의어',
}

interface Props {
  params: Promise<{ category: string }>
}

export default async function VocabCategoryPage({ params }: Props) {
  const { category } = await params
  const json = JSON.parse(readFileSync(resolve('data/english/요약노트_JSON.json'), 'utf-8'))
  const ve = json.vocabulary_essentials as Record<string, Word[]>

  if (!ve[category]) notFound()

  const words = ve[category]
  const label = CATEGORY_LABELS[category] ?? category

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">영어 어휘 — {label}</h1>
        <p className="text-sm text-muted-foreground mt-1">{words.length}개 단어</p>
      </div>
      <VocabCardDeck words={words} category={category} />
    </div>
  )
}
