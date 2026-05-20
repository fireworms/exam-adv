import { notFound } from 'next/navigation'
import { Search } from 'lucide-react'
import { SUBJECT_KEYS, SUBJECT_META, type SubjectKey } from '@/lib/utils'

interface Props {
  params: Promise<{ subject: string }>
}

export default async function SearchPage({ params }: Props) {
  const { subject } = await params
  if (!SUBJECT_KEYS.includes(subject as SubjectKey)) notFound()
  const meta = SUBJECT_META[subject as SubjectKey]

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5" style={{ color: meta.color }} />
        <h1 className="text-xl font-bold">{meta.label} 검색</h1>
      </div>
      <div className="rounded-lg border p-4 text-sm text-muted-foreground bg-muted">
        PostgreSQL FTS 검색은 Week 5에서 구현됩니다.
      </div>
    </div>
  )
}
