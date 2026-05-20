import { notFound } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { SUBJECT_KEYS, SUBJECT_META, type SubjectKey } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{ subject: string }>
}

export default async function TrapsPage({ params }: Props) {
  const { subject } = await params
  if (!SUBJECT_KEYS.includes(subject as SubjectKey)) notFound()

  const meta = SUBJECT_META[subject as SubjectKey]

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" style={{ color: meta.color }} />
        <h1 className="text-xl font-bold">{meta.label} 함정 패턴 TOP 15</h1>
      </div>

      <div className="rounded-lg border p-4 text-sm text-muted-foreground bg-muted">
        데이터를 적재하면 함정 패턴이 표시됩니다. (<code>npm run seed</code> 실행 후 새로고침)
      </div>

      {/* 함정 카드 플레이스홀더 */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="opacity-40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">#{i + 1}</Badge>
              <CardTitle className="text-sm">함정 패턴 {i + 1}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="rounded bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-3 py-2">
              ❌ 잘못된 형태 — 예시
            </div>
            <div className="rounded bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 px-3 py-2">
              ✅ 올바른 형태 — 예시
            </div>
            <div className="rounded bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 px-3 py-2">
              💡 회피법 — 예시
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
