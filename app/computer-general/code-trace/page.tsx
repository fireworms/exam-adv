import { readFileSync } from 'fs'
import { resolve } from 'path'
import { CodeTraceViewer } from './CodeTraceViewer'

interface CodePattern {
  C?: string
  Python?: string
  예시?: string
  결과?: string
  설명?: string
  [key: string]: unknown
}

export interface TraceItem {
  title: string
  language: string
  code: string
  notes: string[]
}

export default function CodeTracePage() {
  const json = JSON.parse(readFileSync(resolve('data/computer_general/요약노트_JSON.json'), 'utf-8'))
  const patterns = json.code_patterns_formulas as Record<string, CodePattern>

  const items: TraceItem[] = Object.entries(patterns).map(([key, val]) => {
    const code = val.C ?? val.Python ?? ''
    const lang = val.C ? 'C' : 'Python'
    const notes = Object.entries(val)
      .filter(([k]) => !['C', 'Python'].includes(k))
      .map(([k, v]) => `${k}: ${v}`)
    return { title: key.replace(/_/g, ' '), language: lang, code, notes }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">코드 트레이싱 학습</h1>
      <p className="text-sm text-muted-foreground">
        코드를 보며 실행 흐름을 손으로 쫓는 연습
      </p>
      <CodeTraceViewer items={items} />
    </div>
  )
}
