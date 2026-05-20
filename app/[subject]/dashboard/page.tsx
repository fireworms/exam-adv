import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, TrendingUp, BookOpen, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SUBJECT_KEYS, SUBJECT_META, type SubjectKey } from '@/lib/utils'

interface Props {
  params: Promise<{ subject: string }>
}

export default async function SubjectDashboardPage({ params }: Props) {
  const { subject } = await params

  if (!SUBJECT_KEYS.includes(subject as SubjectKey)) notFound()

  const meta = SUBJECT_META[subject as SubjectKey]

  const quickLinks = [
    { href: `/${subject}/notes/master`, label: '마스터 노트', icon: BookOpen },
    { href: `/${subject}/notes/table`,  label: '표중심 노트', icon: BookOpen },
    { href: `/${subject}/traps`,        label: '함정 패턴',   icon: AlertTriangle },
    { href: `/${subject}/trends`,       label: '트렌드 분석', icon: TrendingUp },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <span
          className="inline-block w-4 h-4 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        <h1 className="text-2xl font-bold">{meta.label} 학습 허브</h1>
      </div>

      {/* 빠른 이동 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickLinks.map(link => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:shadow-md transition-shadow text-sm font-medium"
            >
              <Icon className="h-6 w-6" style={{ color: meta.color }} />
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* 진도 요약 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">학습 진도</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            학습을 시작하면 진도가 여기에 표시됩니다.
          </p>
        </CardContent>
      </Card>

      {/* 오늘 복습 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            오늘 복습할 카드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-2">
            오늘 복습할 카드가 없습니다 🎉
          </p>
        </CardContent>
      </Card>

      {/* 함정 패턴 바로가기 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            함정 패턴 TOP 3
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            데이터 적재 후 함정 패턴이 표시됩니다.
          </p>
          <Link
            href={`/${subject}/traps`}
            className="text-sm underline"
            style={{ color: meta.color }}
          >
            전체 보기 →
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export function generateStaticParams() {
  return SUBJECT_KEYS.map(subject => ({ subject }))
}
