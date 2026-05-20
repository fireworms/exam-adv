import { notFound } from 'next/navigation'
import { FileText, Download } from 'lucide-react'
import { SUBJECT_KEYS, SUBJECT_META, type SubjectKey } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ subject: string }>
}

export default async function MasterNotePage({ params }: Props) {
  const { subject } = await params
  if (!SUBJECT_KEYS.includes(subject as SubjectKey)) notFound()

  const meta = SUBJECT_META[subject as SubjectKey]

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" style={{ color: meta.color }} />
          <h1 className="text-xl font-bold">{meta.label} 마스터 노트</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          PDF 다운로드
        </Button>
      </div>

      <div className="rounded-lg border p-4 text-sm text-muted-foreground bg-muted">
        마크다운 뷰어는 Week 2에서 구현됩니다. (<code>MarkdownViewer</code> 컴포넌트)
      </div>
    </div>
  )
}
