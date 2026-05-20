import Link from 'next/link'
import { BookOpen, BookMarked, Clock } from 'lucide-react'
import { DDayBanner } from '@/components/common/DDayBanner'
import { SubjectProgressCard } from '@/components/common/SubjectProgressCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SUBJECT_KEYS, SUBJECT_META } from '@/lib/utils'

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* D-Day 카운터 */}
      <DDayBanner />

      {/* 5과목 진도 카드 */}
      <section>
        <h2 className="text-lg font-semibold mb-3">과목별 학습 진도</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SUBJECT_KEYS.map(subject => (
            <SubjectProgressCard
              key={subject}
              subject={subject}
              viewRate={0}
              memoryRate={0}
              cardsDue={0}
            />
          ))}
        </div>
      </section>

      {/* 오늘의 복습 */}
      <section>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              오늘의 복습 카드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              오늘 복습 완료 🎉 다음 복습은 내일입니다
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 최근 북마크 */}
      <section>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              최근 북마크
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              북마크한 항목이 없습니다.{' '}
              <Link href="/bookmarks" className="underline">북마크 관리</Link>
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 빠른 과목 이동 */}
      <section>
        <h2 className="text-lg font-semibold mb-3">바로가기</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SUBJECT_KEYS.map(subject => {
            const meta = SUBJECT_META[subject]
            return (
              <Link
                key={subject}
                href={`/${subject}/dashboard`}
                className="flex items-center justify-center gap-2 p-4 rounded-lg border font-medium text-sm text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: meta.color }}
              >
                <BookOpen className="h-4 w-4" />
                {meta.label}
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
