'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { type SubjectKey, SUBJECT_META } from '@/lib/utils'

interface SubjectStats { viewed: number; mastered: number; due: number }

// 과목별 학습 아이템 총 개수 (JSON 데이터 기준 추정치)
const SUBJECT_TOTAL: Record<SubjectKey, number> = {
  korean:             50,
  english:            84,
  'korean-history':   60,
  'computer-general': 60,
  infosec:            80,
}

let cachedProgress: Record<string, SubjectStats> | null = null
let cacheLoggedIn: boolean | null = null

async function fetchProgress() {
  if (cachedProgress !== null) return { progress: cachedProgress, loggedIn: cacheLoggedIn }
  const res = await fetch('/api/progress')
  const data = await res.json()
  cachedProgress = data.progress ?? {}
  cacheLoggedIn = data.loggedIn ?? false
  return { progress: cachedProgress!, loggedIn: cacheLoggedIn! }
}

interface SubjectProgressCardProps {
  subject: SubjectKey
}

export function SubjectProgressCard({ subject }: SubjectProgressCardProps) {
  const meta = SUBJECT_META[subject]
  const total = SUBJECT_TOTAL[subject]
  const [stats, setStats] = useState<SubjectStats | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    fetchProgress().then(({ progress, loggedIn }) => {
      setStats(progress[subject] ?? { viewed: 0, mastered: 0, due: 0 })
      setLoggedIn(loggedIn)
    }).catch(() => {
      setStats({ viewed: 0, mastered: 0, due: 0 })
      setLoggedIn(false)
    })
  }, [subject])

  const viewRate   = stats ? Math.min(100, Math.round((stats.viewed  / total) * 100)) : 0
  const memoryRate = stats ? Math.min(100, Math.round((stats.mastered / total) * 100)) : 0
  const due = stats?.due ?? 0

  return (
    <Link href={`/${subject}/dashboard`} className="block">
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{meta.label}</CardTitle>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: meta.color }}
            >
              {stats === null ? '…' : due > 0 ? `복습 ${due}` : '완료'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!loggedIn && stats !== null ? (
            <p className="text-xs text-muted-foreground text-center py-1">로그인 후 진도 확인</p>
          ) : (
            <>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>열람률</span>
                  {stats === null ? <Skeleton className="h-3 w-8" /> : <span>{viewRate}%</span>}
                </div>
                <Progress value={viewRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>암기율</span>
                  {stats === null ? <Skeleton className="h-3 w-8" /> : <span>{memoryRate}%</span>}
                </div>
                <Progress value={memoryRate} className="h-2" />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
