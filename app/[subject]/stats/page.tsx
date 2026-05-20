import { notFound } from 'next/navigation'
import { SUBJECT_KEYS, SUBJECT_META, type SubjectKey } from '@/lib/utils'

interface Props {
  params: Promise<{ subject: string }>
}

export default async function StatsPage({ params }: Props) {
  const { subject } = await params
  if (!SUBJECT_KEYS.includes(subject as SubjectKey)) notFound()
  const meta = SUBJECT_META[subject as SubjectKey]

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{meta.label} 학습 통계</h1>
      <div className="rounded-lg border p-4 text-sm text-muted-foreground bg-muted">
        Recharts 통계 차트는 Week 3에서 구현됩니다.
      </div>
    </div>
  )
}
