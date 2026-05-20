import { notFound } from 'next/navigation'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { SUBJECT_KEYS, SUBJECT_META, type SubjectKey } from '@/lib/utils'
import { JsonTreeViewer } from '@/components/common/JsonTreeViewer'

const DIR_MAP: Record<string, string> = {
  'korean':           'korean',
  'english':          'english',
  'korean-history':   'korean_history',
  'computer-general': 'computer_general',
  'infosec':          'infosec',
}

interface Props {
  params: Promise<{ subject: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function JsonNotePage({ params, searchParams }: Props) {
  const { subject } = await params
  const { q } = await searchParams

  if (!SUBJECT_KEYS.includes(subject as SubjectKey)) notFound()
  const meta = SUBJECT_META[subject as SubjectKey]

  const dir = DIR_MAP[subject]
  const filePath = resolve(`data/${dir}/요약노트_JSON.json`)

  if (!existsSync(filePath)) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-4">{meta.label} JSON 데이터</h1>
        <p className="text-muted-foreground">파일을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const data = JSON.parse(readFileSync(filePath, 'utf-8'))

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{meta.label} JSON 데이터 트리</h1>
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="키·값 검색..."
          className="flex-1 px-3 py-2 text-sm rounded-md border bg-background"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground"
        >
          검색
        </button>
      </form>
      <JsonTreeViewer data={data} highlight={q} />
    </div>
  )
}
