'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TrapData {
  rank: number
  title: string
  incorrect_form?: string
  correct_form?: string
  countermeasure?: string
  frequency?: string
  description?: string
  example?: string
}

interface TrapCardProps {
  trap: TrapData
  accentColor?: string
}

export function TrapCard({ trap, accentColor = '#DC2626' }: TrapCardProps) {
  const [understood, setUnderstood] = useState(false)

  const handleUnderstand = async () => {
    setUnderstood(v => !v)
    try {
      await fetch('/api/quiz/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizType: 'trap_understood',
          itemKey: String(trap.rank),
          subject: 'trap',
          isCorrect: true,
          timeSec: 0,
        }),
      })
    } catch { /* 비인증 무시 */ }
  }

  const FREQ_COLOR: Record<string, string> = {
    '매우 높음': 'text-red-600',
    '높음':     'text-orange-500',
    '중간':     'text-yellow-600',
  }

  return (
    <Card className={cn('transition-all', understood && 'opacity-60')}>
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-3">
          {/* 랭크 + 빈도 */}
          <div className="flex flex-col items-center gap-1 shrink-0 w-10">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: accentColor }}
            >
              #{trap.rank}
            </span>
            {trap.frequency && (
              <span className={cn('text-[10px] font-medium leading-tight text-center', FREQ_COLOR[trap.frequency] ?? 'text-muted-foreground')}>
                {trap.frequency}
              </span>
            )}
          </div>

          {/* 내용 */}
          <div className="flex-1 min-w-0 space-y-2">
            <p className="font-semibold text-sm">{trap.title}</p>

            {trap.incorrect_form && (
              <div className="rounded bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-3 py-1.5 text-xs">
                ❌ {trap.incorrect_form}
              </div>
            )}
            {trap.correct_form && (
              <div className="rounded bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 px-3 py-1.5 text-xs">
                ✅ {trap.correct_form}
              </div>
            )}
            {trap.countermeasure && (
              <div className="rounded bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 text-xs">
                💡 {trap.countermeasure}
              </div>
            )}
            {trap.description && !trap.incorrect_form && (
              <p className="text-xs text-muted-foreground">{trap.description}</p>
            )}
            {trap.example && (
              <div className="rounded bg-muted px-3 py-2 text-xs leading-relaxed whitespace-pre-line border-l-2 border-muted-foreground/30">
                <span className="font-medium text-muted-foreground">예시</span>
                <br />
                {trap.example}
              </div>
            )}

            <button
              onClick={handleUnderstand}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium transition-colors',
                understood ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {understood
                ? <CheckCircle2 className="h-3.5 w-3.5" />
                : <Circle className="h-3.5 w-3.5" />}
              {understood ? '이해 완료 ✓' : '이해 완료로 표시'}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
