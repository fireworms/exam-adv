import { readFileSync } from 'fs'
import { resolve } from 'path'
import { ConceptCardDeck } from './ConceptCardDeck'

interface ConceptRaw {
  definition?: string
  description?: string
  calculation?: string
  example?: string
  formula?: string
  exam_frequency?: number
  trap?: string
  [key: string]: unknown
}

export interface DetailGroup {
  label: string
  items: string[]
}

export interface Concept {
  key: string
  domain: string
  name: string
  description: string
  details?: DetailGroup[]
  formula?: string
  example?: string
  trap?: string
  importance: number
}

const DOMAIN_MAP: Record<string, string> = {
  '2의_보수': '컴퓨터구조', '캐시_메모리': '컴퓨터구조', 'CPU_스케줄링': '운영체제',
  '페이지_교체': '운영체제', 'OSI_7계층': '네트워크', '정규화': '데이터베이스',
}

function inferDomain(key: string): string {
  return DOMAIN_MAP[key] ?? '기타'
}

function flattenValue(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (typeof v === 'object' && v !== null) {
    return Object.entries(v as Record<string, unknown>).map(([k2, v2]) => {
      const label = k2.replace(/^\d+_/, '').replace(/_/g, ' ')
      if (typeof v2 === 'object' && v2 !== null && !Array.isArray(v2)) {
        const inner = Object.entries(v2 as Record<string, unknown>)
          .map(([, iv]) => Array.isArray(iv) ? (iv as string[]).join(', ') : String(iv))
          .join(' | ')
        return `${label}: ${inner}`
      }
      if (Array.isArray(v2)) return `${label}: ${(v2 as string[]).join(', ')}`
      return `${label}: ${v2}`
    })
  }
  return [String(v)]
}

const EXCLUDED = new Set(['exam_frequency', 'trap', 'formula', 'example', 'calculation', 'definition', 'description'])

function flattenConcept(key: string, raw: ConceptRaw): Concept {
  const description = raw.definition ?? raw.description ?? ''

  const details: DetailGroup[] = Object.entries(raw)
    .filter(([k, v]) => !EXCLUDED.has(k) && (Array.isArray(v) || (typeof v === 'object' && v !== null)))
    .map(([k, v]) => ({ label: k.replace(/_/g, ' '), items: flattenValue(v) }))

  const scalarFallback = !description
    ? Object.entries(raw)
        .filter(([k, v]) => !EXCLUDED.has(k) && !Array.isArray(v) && typeof v !== 'object')
        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
        .join(' / ')
    : ''

  return {
    key,
    domain: inferDomain(key),
    name: key.replace(/_/g, ' '),
    description: (description || scalarFallback).slice(0, 300),
    details: details.length > 0 ? details : undefined,
    formula: raw.formula ?? raw.calculation,
    example: raw.example,
    trap: raw.trap,
    importance: raw.exam_frequency ?? 3,
  }
}

export default function FlashcardsPage() {
  const json = JSON.parse(readFileSync(resolve('data/computer_general/요약노트_JSON.json'), 'utf-8'))
  const raw = json.key_concepts as Record<string, ConceptRaw>
  const concepts: Concept[] = Object.entries(raw).map(([k, v]) => flattenConcept(k, v))

  const domains = [...new Set(concepts.map(c => c.domain))]

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">컴퓨터일반 플래시카드</h1>
      <p className="text-sm text-muted-foreground">{concepts.length}개 핵심 개념 · SM-2 간격 반복</p>
      <ConceptCardDeck concepts={concepts} domains={domains} />
    </div>
  )
}
