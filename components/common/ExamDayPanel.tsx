'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getDDayCount, SUBJECT_KEYS, SUBJECT_META } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, Flame } from 'lucide-react'

const DAY_ZERO_ITEMS = [
  { id: 'd0_1', subject: '국어',      text: '공문서 7원칙·개요 결론 공식 최종 확인', href: '/korean/checklist' },
  { id: 'd0_2', subject: '영어',      text: '어휘 어려움 카드 마지막 점검', href: '/english/vocabulary' },
  { id: 'd0_3', subject: '한국사',    text: '사료 키워드 한 번 훑기', href: '/korean-history/historical-documents' },
  { id: 'd0_4', subject: '컴퓨터일반', text: 'CPU·OSI·정규화 함정 최종 확인', href: '/computer-general/traps' },
  { id: 'd0_5', subject: '정보보호론', text: 'BLP·Biba·법규 숫자 마지막 체크', href: '/infosec/traps' },
]

const D7_SCHEDULE: Record<number, { title: string; tasks: { text: string; href: string }[] }> = {
  7: { title: 'D-7 학습 플로우', tasks: [
    { text: '5과목 표중심 노트 전체 훑기', href: '/korean/notes/table' },
    { text: '전 과목 함정 TOP 15 시작', href: '/korean/traps' },
    { text: '영어 어휘 카드 전 카테고리', href: '/english/vocabulary' },
  ]},
  6: { title: 'D-6 학습 플로우', tasks: [
    { text: '한국사 연표·인물 집중 복습', href: '/korean-history/timeline' },
    { text: '정보보호론 암호 실습실', href: '/infosec/crypto-lab' },
    { text: '컴일 플래시카드 1회전', href: '/computer-general/flashcards' },
  ]},
  5: { title: 'D-5 학습 플로우', tasks: [
    { text: '국어 영역별 학습 (취약 영역)', href: '/korean/areas' },
    { text: '영어 문법 패턴 10개 미니퀴즈', href: '/english/grammar-patterns' },
    { text: '정보보호론 법규 숫자 단답', href: '/infosec/law-explorer' },
  ]},
  4: { title: 'D-4 학습 플로우', tasks: [
    { text: '한국사 사료 모음 전체', href: '/korean-history/historical-documents' },
    { text: '컴일 코드 트레이싱', href: '/computer-general/code-trace' },
    { text: '정보보호론 ISMS-P 트리', href: '/infosec/ismsp-tree' },
  ]},
  3: { title: 'D-3 집중 복습', tasks: [
    { text: '5과목 함정 패턴 총정리', href: '/korean/traps' },
    { text: '영어 관용구 매칭 퀴즈', href: '/english/idioms' },
    { text: '접근통제 시뮬레이터 BLP·Biba', href: '/infosec/access-control-sim' },
  ]},
  2: { title: 'D-2 약점 보완', tasks: [
    { text: '오늘의 복습 카드 전부 소화', href: '/' },
    { text: '한국사 인물 취약 파트', href: '/korean-history/historical-figures' },
    { text: '정보보호론 신유형 확인', href: '/infosec/new-trends' },
  ]},
  1: { title: 'D-1 마지막 점검', tasks: [
    { text: '국어 시험 직전 체크리스트', href: '/korean/checklist' },
    { text: '정보보호론 법규 핵심 숫자 암기', href: '/infosec/law-explorer' },
    { text: 'RSA·DH 계산기 마지막 확인', href: '/infosec/crypto-lab' },
  ]},
}

export function ExamDayPanel() {
  const days = getDDayCount()

  if (days < 0) return null

  // D-0: 당일 체크리스트
  if (days === 0) return <DayZeroChecklist />

  // D-1 ~ D-7: 일자별 학습 플로우
  if (days <= 7) {
    const plan = D7_SCHEDULE[days] ?? D7_SCHEDULE[7]
    return (
      <Card className="border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
            <Flame className="h-4 w-4" />
            {plan.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {plan.tasks.map((task, i) => (
              <Link
                key={i}
                href={task.href}
                className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300 hover:underline"
              >
                <span className="w-5 h-5 rounded-full bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                {task.text}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}

function DayZeroChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const toggle = (id: string) => setChecked(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const allDone = checked.size === DAY_ZERO_ITEMS.length

  return (
    <Card className="border-red-500 dark:border-red-600">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-red-600 dark:text-red-400">
          🎯 D-Day 당일 최종 확인 체크리스트
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {DAY_ZERO_ITEMS.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <button onClick={() => toggle(item.id)} className="shrink-0">
              {checked.has(item.id)
                ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                : <Circle className="h-5 w-5 text-muted-foreground" />}
            </button>
            <Link
              href={item.href}
              className={`text-sm flex-1 hover:underline ${checked.has(item.id) ? 'line-through text-muted-foreground' : ''}`}
            >
              <span className="text-xs text-muted-foreground mr-1">[{item.subject}]</span>
              {item.text}
            </Link>
          </div>
        ))}
        {allDone && (
          <p className="text-center text-green-600 font-semibold pt-2">합격합니다! 파이팅! 🏆</p>
        )}
      </CardContent>
    </Card>
  )
}
