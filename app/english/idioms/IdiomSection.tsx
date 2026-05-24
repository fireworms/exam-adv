'use client'

import { useState, useMemo } from 'react'
import { MiniQuizShell } from '@/components/common/MiniQuizShell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Shuffle } from 'lucide-react'
import { TTSButton } from '@/components/common/TTSButton'

interface Idiom { phrase: string; meaning: string }

interface Props { category: string; label: string; idioms: Idiom[] }

export function IdiomSection({ category, label, idioms }: Props) {
  const [quizMode, setQuizMode] = useState(false)

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">{label}</span>
          <Badge variant="secondary">{idioms.length}개</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setQuizMode(v => !v)} className="gap-2">
          <Shuffle className="h-3.5 w-3.5" />
          {quizMode ? '목록 보기' : '매칭 퀴즈'}
        </Button>
      </div>

      {quizMode
        ? <IdiomMatchingQuiz idioms={idioms} category={category} />
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {idioms.map((idiom, i) => (
              <Card key={i}>
                <CardContent className="py-2 px-3">
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-sm text-english flex-1">{idiom.phrase}</p>
                    <TTSButton text={idiom.phrase} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{idiom.meaning}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }
    </section>
  )
}

function IdiomMatchingQuiz({ idioms, category }: { idioms: Idiom[]; category: string }) {
  const quiz = useMemo(() => {
    const subset = idioms.slice(0, Math.min(8, idioms.length))
    const shuffledMeanings = [...subset].sort(() => Math.random() - 0.5)
    return { phrases: subset, meanings: shuffledMeanings }
  }, [])

  const [selected, setSelected] = useState<string | null>(null)
  const [matched, setMatched] = useState<Record<string, string>>({}) // phrase → meaning
  const [wrong, setWrong] = useState<string | null>(null)

  const allDone = Object.keys(matched).length === quiz.phrases.length

  const handlePhraseClick = (phrase: string) => {
    if (matched[phrase]) return
    setSelected(phrase)
    setWrong(null)
  }

  return (
    <MiniQuizShell quizType="idiom_matching" subject="영어" itemKey={category}>
      {({ onSubmit }) => (
        <div className="space-y-4">
          {allDone ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-2xl">🎉</p>
              <p className="font-semibold">모두 매칭 완료!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* 왼쪽: 관용구 */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">관용구</p>
                {quiz.phrases.map(({ phrase }) => (
                  <button
                    key={phrase}
                    onClick={() => handlePhraseClick(phrase)}
                    className={cn(
                      'w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors',
                      matched[phrase] ? 'bg-green-100 dark:bg-green-950 border-green-400 line-through opacity-60' :
                      selected === phrase ? 'border-english bg-blue-50 dark:bg-blue-950 font-medium' :
                      wrong === phrase ? 'border-red-400 bg-red-50 dark:bg-red-950' :
                      'hover:bg-muted'
                    )}
                  >
                    {phrase}
                  </button>
                ))}
              </div>

              {/* 오른쪽: 뜻 */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">뜻</p>
                {quiz.meanings.map(({ phrase: srcPhrase, meaning }) => {
                  const isMatched = Object.entries(matched).some(([p, m]) => m === meaning)
                  return (
                    <button
                      key={meaning}
                      disabled={isMatched || !selected}
                      onClick={() => {
                        if (!selected) return
                        const isCorrect = srcPhrase === selected
                        if (isCorrect) {
                          setMatched(m => ({ ...m, [selected]: meaning }))
                          onSubmit(true)
                          const newMatchCount = Object.keys(matched).length + 1
                          if (newMatchCount === quiz.phrases.length) onSubmit(true)
                        } else {
                          setWrong(selected)
                          onSubmit(false)
                          setTimeout(() => setWrong(null), 800)
                        }
                        setSelected(null)
                      }}
                      className={cn(
                        'w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors',
                        isMatched ? 'bg-green-100 dark:bg-green-950 border-green-400 line-through opacity-60' :
                        !selected ? 'opacity-50 cursor-not-allowed' :
                        'hover:bg-muted cursor-pointer'
                      )}
                    >
                      {meaning}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {selected && !allDone && (
            <p className="text-xs text-center text-muted-foreground">
              선택됨: <strong className="text-english">{selected}</strong> — 오른쪽에서 뜻을 고르세요
            </p>
          )}
        </div>
      )}
    </MiniQuizShell>
  )
}
