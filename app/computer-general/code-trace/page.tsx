import { readFileSync } from 'fs'
import { resolve } from 'path'
import { CodeTraceViewer } from './CodeTraceViewer'

type CodePattern = Record<string, unknown>

export interface TraceItem {
  title: string
  language: string
  code: string
  notes: string[]
}

const CODE_KEYS = ['C', 'Python', 'code', 'code_pattern']

function detectLanguage(key: string, val: CodePattern): string {
  if (key.includes('Java')) return 'Java'
  if (key.includes('Python') || key.includes('리스트')) return 'Python'
  if (key.includes('SQL')) return 'SQL'
  if (val['code_pattern']) return 'Java'
  return 'C'
}

function formatNoteValue(v: unknown): string {
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.join(', ')
  if (typeof v === 'object' && v !== null)
    return Object.entries(v as Record<string, unknown>)
      .map(([k, iv]) => `${k}: ${iv}`)
      .join(' | ')
  return String(v)
}

export default function CodeTracePage() {
  const json = JSON.parse(readFileSync(resolve('data/computer_general/요약노트_JSON.json'), 'utf-8'))
  const patterns = json.code_patterns_formulas as Record<string, CodePattern | string>

  const items: TraceItem[] = Object.entries(patterns).map(([key, val]) => {
    // SQL_실행_순서처럼 string인 경우
    if (typeof val === 'string') {
      return { title: key.replace(/_/g, ' '), language: 'SQL', code: val, notes: [] }
    }

    const codeKey = CODE_KEYS.find(k => typeof val[k] === 'string')
    const code = codeKey ? String(val[codeKey]) : ''
    const lang = detectLanguage(key, val)
    const notes = Object.entries(val)
      .filter(([k]) => !CODE_KEYS.includes(k))
      .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${formatNoteValue(v)}`)

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
