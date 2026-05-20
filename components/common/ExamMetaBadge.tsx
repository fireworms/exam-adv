'use client'

import { buildQuizDeepLink } from '@/lib/deeplink'
import { ExternalLink } from 'lucide-react'

interface ExamMetaBadgeProps {
  examAppearedIn: string
}

export function ExamMetaBadge({ examAppearedIn }: ExamMetaBadgeProps) {
  const url = buildQuizDeepLink(examAppearedIn)

  const badge = (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
      📌 {examAppearedIn}
      {url && <ExternalLink className="h-3 w-3" />}
    </span>
  )

  if (!url) return badge

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title="관련 기출 문제 풀기">
      {badge}
    </a>
  )
}
