import { notFound } from 'next/navigation'
import { SUBJECT_KEYS, SUBJECT_META, type SubjectKey } from '@/lib/utils'
import { MarkdownViewer } from '@/components/common/MarkdownViewer'

interface Props {
  params: Promise<{ subject: string }>
}

export default async function TableNotePage({ params }: Props) {
  const { subject } = await params
  if (!SUBJECT_KEYS.includes(subject as SubjectKey)) notFound()
  const meta = SUBJECT_META[subject as SubjectKey]

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{meta.label} 표중심 노트</h1>
      <MarkdownViewer subject={subject} type="table" />
    </div>
  )
}
