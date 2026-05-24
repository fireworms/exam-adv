'use client'

import { useState, useMemo } from 'react'
import { FlashCard } from '@/components/common/FlashCard'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, RotateCcw } from 'lucide-react'
import type { Concept, DetailGroup } from './page'

interface Props { concepts: Concept[]; domains: string[] }

const COMPUTER_COLOR = '#2E9E4F'

export function ConceptCardDeck({ concepts, domains }: Props) {
  const [domain, setDomain] = useState<string>('전체')
  const [index, setIndex] = useState(0)
  const [ratings, setRatings] = useState<Record<number, 0 | 1 | 2>>({})
  const [done, setDone] = useState(false)

  const filtered = useMemo(
    () => domain === '전체' ? concepts : concepts.filter(c => c.domain === domain),
    [domain, concepts]
  )

  const current = filtered[index]
  const progress = filtered.length ? Math.round((index / filtered.length) * 100) : 0

  const handleDomainChange = (d: string) => {
    setDomain(d); setIndex(0); setRatings({}); setDone(false)
  }

  const handleRate = async (quality: 0 | 1 | 2) => {
    setRatings(r => ({ ...r, [index]: quality }))
    try {
      await fetch('/api/review/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'cs_concept_progress', conceptKey: current.key, quality }),
      })
    } catch { /* 비인증 무시 */ }

    if (index + 1 >= filtered.length) setDone(true)
    else setIndex(i => i + 1)
  }

  const restart = () => { setIndex(0); setRatings({}); setDone(false) }

  if (!current && !done) return <p className="text-muted-foreground">개념 없음</p>

  return (
    <div className="space-y-4">
      {/* 도메인 탭 */}
      <div className="flex flex-wrap gap-2">
        {['전체', ...domains].map(d => (
          <button
            key={d}
            onClick={() => handleDomainChange(d)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              domain === d
                ? 'text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            style={domain === d ? { backgroundColor: COMPUTER_COLOR } : undefined}
          >
            {d}
          </button>
        ))}
      </div>

      {done ? (
        <div className="text-center space-y-4 py-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-lg font-bold">세션 완료! 🎉</h2>
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-red-600">😓 헷갈림 {Object.values(ratings).filter(r=>r===0).length}개</span>
            <span className="text-yellow-600">🙂 보통 {Object.values(ratings).filter(r=>r===1).length}개</span>
            <span className="text-green-600">😊 익숙 {Object.values(ratings).filter(r=>r===2).length}개</span>
          </div>
          <Button onClick={restart} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> 다시 학습
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{index + 1} / {filtered.length}</span>
              <span>{progress}% 완료</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <FlashCard
            front={
              <div className="space-y-2 text-center">
                <Badge variant="outline" className="text-xs">{current.domain}</Badge>
                <p className="text-2xl font-bold" style={{ color: COMPUTER_COLOR }}>
                  {current.name}
                </p>
              </div>
            }
            back={
              <div className="space-y-3 text-sm w-full text-left">
                {current.description && (
                  <p className="leading-relaxed">{current.description}</p>
                )}
                {current.details?.map((group: DetailGroup) => (
                  <div key={group.label}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">{group.label}</p>
                    <div className="flex flex-wrap gap-1">
                      {group.items.map((item, i) => (
                        <span key={i} className="inline-block bg-muted rounded px-2 py-0.5 text-xs leading-relaxed">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {current.formula && (
                  <div className="bg-muted rounded px-3 py-2 font-mono text-xs">
                    {current.formula}
                  </div>
                )}
                {current.example && (
                  <p className="text-xs text-muted-foreground">예: {current.example}</p>
                )}
                {current.trap && (
                  <div className="rounded bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-3 py-2 text-xs">
                    ⚠️ 함정: {current.trap}
                  </div>
                )}
              </div>
            }
            onRate={handleRate}
            accentColor={COMPUTER_COLOR}
          />
        </>
      )}
    </div>
  )
}
