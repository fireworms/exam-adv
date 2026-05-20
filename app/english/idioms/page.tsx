import { readFileSync } from 'fs'
import { resolve } from 'path'
import { IdiomSection } from './IdiomSection'

interface Idiom { phrase: string; meaning: string }

const CATEGORY_LABELS: Record<string, string> = {
  workplace:        '직장·업무',
  decision_making:  '의사결정',
  emotions_states:  '감정·상태',
  time_schedule:    '시간·일정',
}

export default function IdiomsPage() {
  const json = JSON.parse(readFileSync(resolve('data/english/요약노트_JSON.json'), 'utf-8'))
  const groups = json.idioms_and_phrases as Record<string, Idiom[]>

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-xl font-bold">영어 관용구</h1>
      {Object.entries(groups).map(([cat, idioms]) => (
        <IdiomSection
          key={cat}
          category={cat}
          label={CATEGORY_LABELS[cat] ?? cat}
          idioms={idioms as Idiom[]}
        />
      ))}
    </div>
  )
}
