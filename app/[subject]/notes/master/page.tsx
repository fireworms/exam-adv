import { notFound } from 'next/navigation'
import { Download } from 'lucide-react'
import { SUBJECT_KEYS, SUBJECT_META, type SubjectKey } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MarkdownViewer } from '@/components/common/MarkdownViewer'

interface Props {
  params: Promise<{ subject: string }>
}

export default async function MasterNotePage({ params }: Props) {
  const { subject } = await params
  if (!SUBJECT_KEYS.includes(subject as SubjectKey)) notFound()
  const meta = SUBJECT_META[subject as SubjectKey]

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{meta.label} 마스터 노트</h1>
        <a href={`/api/notes/${subject}/master-pdf`} download>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </a>
      </div>
      <MarkdownViewer subject={subject} type="master" />
    </div>
  )
}
