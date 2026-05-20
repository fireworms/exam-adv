import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const DIR_MAP: Record<string, string> = {
  'korean':           'korean',
  'english':          'english',
  'korean-history':   'korean_history',
  'computer-general': 'computer_general',
  'infosec':          'infosec',
}

export interface SearchResult {
  subject: string
  subjectLabel: string
  item_type: string
  title: string
  summary: string
  href: string
}

const SUBJECT_LABELS: Record<string, string> = {
  korean: '국어', english: '영어', 'korean-history': '한국사',
  'computer-general': '컴퓨터일반', infosec: '정보보호론',
}

function searchInObject(obj: unknown, query: string, path: string[] = []): { path: string; value: string }[] {
  const q = query.toLowerCase()
  const results: { path: string; value: string }[] = []

  if (typeof obj === 'string') {
    if (obj.toLowerCase().includes(q)) {
      results.push({ path: path.join(' > '), value: obj.slice(0, 120) })
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      results.push(...searchInObject(item, query, [...path, String(i)]))
    })
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      results.push(...searchInObject(v, query, [...path, k]))
    }
  }
  return results
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const subject = searchParams.get('subject') ?? ''
  const limit = Number(searchParams.get('limit') ?? 20)

  if (!q || q.length < 1) return NextResponse.json({ results: [] })

  const subjects = subject && DIR_MAP[subject] ? [subject] : Object.keys(DIR_MAP)
  const results: SearchResult[] = []

  for (const subj of subjects) {
    const dir = DIR_MAP[subj]
    const filePath = resolve(`data/${dir}/요약노트_JSON.json`)
    if (!existsSync(filePath)) continue

    const json = JSON.parse(readFileSync(filePath, 'utf-8'))
    const hits = searchInObject(json, q)

    for (const hit of hits.slice(0, 5)) {
      results.push({
        subject: subj,
        subjectLabel: SUBJECT_LABELS[subj] ?? subj,
        item_type: hit.path.split(' > ')[0] ?? 'note',
        title: hit.path.replace(/_/g, ' '),
        summary: hit.value,
        href: `/${subj}/notes/json?q=${encodeURIComponent(q)}`,
      })
    }

    if (results.length >= limit) break
  }

  return NextResponse.json({ results: results.slice(0, limit) })
}
