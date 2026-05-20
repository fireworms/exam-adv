'use client'

import { getDDayCount } from '@/lib/utils'

export function DDayBanner() {
  const days = getDDayCount()
  const isUrgent = days <= 7
  const isToday = days === 0

  if (days < 0) {
    return (
      <div className="rounded-lg bg-muted p-4 text-center text-muted-foreground">
        시험이 종료되었습니다.
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg p-4 text-center ${
        isUrgent
          ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
          : 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
      }`}
    >
      <div className={`text-3xl font-bold ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} ${isUrgent ? 'animate-pulse-slow' : ''}`}>
        {isToday ? 'D-Day' : `D-${days}`}
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        {isToday
          ? '오늘이 시험일입니다! 파이팅!'
          : `2026년 6월 20일 지방직까지 ${days}일 남았습니다`}
      </div>
    </div>
  )
}
