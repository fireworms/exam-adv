'use client'

import { getDDayCount } from '@/lib/utils'
import Link from 'next/link'

const D_DAY_PLANS: Record<number, { label: string; links: { text: string; href: string }[] }> = {
  7: {
    label: 'D-7 오늘의 필수',
    links: [
      { text: '전 과목 표중심 노트', href: '/korean/notes/table' },
      { text: '정보보호론 함정 TOP15', href: '/infosec/traps' },
      { text: '컴일 플래시카드', href: '/computer-general/flashcards' },
    ],
  },
  3: {
    label: 'D-3 집중 복습',
    links: [
      { text: '5과목 함정 패턴 총정리', href: '/korean/traps' },
      { text: '영어 어휘 카드', href: '/english/vocabulary' },
      { text: '한국사 연표 확인', href: '/korean-history/timeline' },
    ],
  },
  1: {
    label: 'D-1 마지막 점검',
    links: [
      { text: '국어 체크리스트', href: '/korean/checklist' },
      { text: '정보보호론 법규 핵심 숫자', href: '/infosec/law-explorer' },
      { text: 'RSA·DH 계산기 한 번 더', href: '/infosec/crypto-lab' },
    ],
  },
}

function getPlan(days: number) {
  if (days <= 0) return null
  const key = [7, 3, 1].find(d => days <= d) ?? 7
  return D_DAY_PLANS[key] ?? D_DAY_PLANS[7]
}

export function ExamCountdownBanner() {
  const days = getDDayCount()
  if (days > 7 || days < 0) return null

  const plan = getPlan(days)

  return (
    <div className="bg-red-600 dark:bg-red-800 text-white px-4 py-2 text-sm">
      <div className="max-w-5xl mx-auto flex items-center gap-3 flex-wrap">
        <span className="font-bold shrink-0">
          ⏰ 시험까지 {days === 0 ? 'D-Day!' : `D-${days}`}
        </span>
        {plan && (
          <>
            <span className="text-red-200 shrink-0">{plan.label}:</span>
            <div className="flex gap-2 flex-wrap">
              {plan.links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="underline underline-offset-2 hover:text-red-100 transition-colors text-xs"
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
