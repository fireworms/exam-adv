import { notFound } from 'next/navigation'
import { TrendingUp } from 'lucide-react'
import { SUBJECT_KEYS, SUBJECT_META, type SubjectKey } from '@/lib/utils'
import { MarkdownViewer } from '@/components/common/MarkdownViewer'

interface Props {
  params: Promise<{ subject: string }>
}

export default async function TrendsPage({ params }: Props) {
  const { subject } = await params
  if (!SUBJECT_KEYS.includes(subject as SubjectKey)) notFound()
  const meta = SUBJECT_META[subject as SubjectKey]

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" style={{ color: meta.color }} />
        <h1 className="text-xl font-bold">{meta.label} 트렌드 분석</h1>
      </div>
      <MarkdownViewer subject={subject} type="trends" />
    </div>
  )
}

export function generateStaticParams() {
  return SUBJECT_KEYS.map(subject => ({ subject }))
}
