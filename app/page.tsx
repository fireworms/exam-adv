import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { DDayBanner } from '@/components/common/DDayBanner'
import { SubjectProgressCard } from '@/components/common/SubjectProgressCard'
import { ReviewQueue } from '@/components/common/ReviewQueue'
import { RecentBookmarks } from '@/components/common/RecentBookmarks'
import { ExamDayPanel } from '@/components/common/ExamDayPanel'
import { SUBJECT_KEYS, SUBJECT_META } from '@/lib/utils'

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <DDayBanner />
      <ExamDayPanel />

      <section>
        <h2 className="text-lg font-semibold mb-3">과목별 학습 진도</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SUBJECT_KEYS.map(subject => (
            <SubjectProgressCard key={subject} subject={subject} />
          ))}
        </div>
      </section>

      <ReviewQueue />

      <RecentBookmarks />

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
