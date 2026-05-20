import { notFound } from 'next/navigation'
import { SUBJECT_KEYS, SUBJECT_META, type SubjectKey } from '@/lib/utils'

interface Props {
  params: Promise<{ subject: string }>
}

export default async function TableNotePage({ params }: Props) {
  const { subject } = await params
  if (!SUBJECT_KEYS.includes(subject as SubjectKey)) notFound()
  const meta = SUBJECT_META[subject as SubjectKey]

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{meta.label} 표중심 노트</h1>
      <div className="rounded-lg border p-4 text-sm text-muted-foreground bg-muted">
        표중심 노트 뷰어는 Week 2에서 구현됩니다.
      </div>
    </div>
  )
}
