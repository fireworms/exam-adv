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
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-6.5rem)]">
      <h1 className="text-xl font-bold shrink-0 pb-4">{meta.label} 표중심 노트</h1>
      <div className="flex-1 min-h-0">
        <MarkdownViewer subject={subject} type="table" />
      </div>
    </div>
  )
}
