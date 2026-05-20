import { notFound } from 'next/navigation'
import { SUBJECT_KEYS, SUBJECT_META, type SubjectKey } from '@/lib/utils'
import { SearchClient } from './SearchClient'

interface Props {
  params: Promise<{ subject: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { subject } = await params
  const { q } = await searchParams

  if (!SUBJECT_KEYS.includes(subject as SubjectKey)) notFound()
  const meta = SUBJECT_META[subject as SubjectKey]

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{meta.label} 검색</h1>
      <SearchClient subject={subject} initialQuery={q ?? ''} accentColor={meta.color} />
    </div>
  )
}
