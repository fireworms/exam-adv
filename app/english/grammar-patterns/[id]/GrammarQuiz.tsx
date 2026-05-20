'use client'

import { useState, useMemo } from 'react'
import { MiniQuizShell } from '@/components/common/MiniQuizShell'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Pattern { id: number; name: string; form: string; example: string; korean: string }

interface Props { pattern: Pattern; allPatterns: Pattern[] }

export function GrammarQuiz({ pattern, allPatterns }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  // 현재 패턴 + 다른 3개 섞기
  const options = useMemo(() => {
    const others = allPatterns
      .filter(p => p.id !== pattern.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    return [...others, pattern].sort(() => Math.random() - 0.5)
  }, [pattern.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const correctIdx = options.findIndex(o => o.id === pattern.id)

  return (
    <MiniQuizShell quizType="grammar_pattern_quiz" itemKey={String(pattern.id)} subject="영어">
      {({ onSubmit }) => (
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">미니 퀴즈: 다음 예문이 속하는 패턴은?</p>
          <p className="text-sm italic bg-muted px-3 py-2 rounded">"{pattern.example}"</p>

          <div className="space-y-2">
            {options.map((opt, i) => {
              const isCorrect = i === correctIdx
              const isSelected = selected === i
              return (
                <button
                  key={opt.id}
                  disabled={revealed}
                  onClick={() => {
                    if (revealed) return
                    setSelected(i)
                    setRevealed(true)
                    onSubmit(isCorrect)
                  }}
                  className={cn(
                    'w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors',
                    !revealed && 'hover:bg-muted',
                    revealed && isCorrect && 'bg-green-100 dark:bg-green-950 border-green-500 text-green-700 dark:text-green-300',
                    revealed && isSelected && !isCorrect && 'bg-red-100 dark:bg-red-950 border-red-400 text-red-700 dark:text-red-300',
                    revealed && !isSelected && !isCorrect && 'opacity-50'
                  )}
                >
                  {opt.name}
                </button>
              )
            })}
          </div>

          {revealed && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setSelected(null); setRevealed(false) }}
              className="w-full"
            >
              다시 풀기
            </Button>
          )}
        </div>
      )}
    </MiniQuizShell>
  )
}
