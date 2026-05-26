'use client'

import { useState } from 'react'
import { FlashCard } from '@/components/common/FlashCard'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, RotateCcw } from 'lucide-react'

interface Word { word: string; meaning: string; example?: string; synonym?: string; appeared_in?: string }

interface Props {
  words: Word[]
  category: string
}

const QUALITY_LABEL = { 0: '어려움', 1: '보통', 2: '쉬움' } as const

export function VocabCardDeck({ words, category }: Props) {
  const [index, setIndex] = useState(0)
  const [ratings, setRatings] = useState<Record<number, 0 | 1 | 2>>({})
  const [done, setDone] = useState(false)

  const current = words[index]
  const progress = Math.round((index / words.length) * 100)

  const handleRate = async (quality: 0 | 1 | 2) => {
    setRatings(r => ({ ...r, [index]: quality }))

    // SM-2 API 호출 (Supabase 있을 때)
    try {
      await fetch('/api/review/vocab-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: current.word, meaning: current.meaning, category, quality }),
      })
    } catch { /* 비인증 무시 */ }

    if (index + 1 >= words.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  const restart = () => { setIndex(0); setRatings({}); setDone(false) }

  if (done) {
    const hard = Object.values(ratings).filter(r => r === 0).length
    const normal = Object.values(ratings).filter(r => r === 1).length
    const easy = Object.values(ratings).filter(r => r === 2).length

    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="text-lg font-bold">세션 완료! 🎉</h2>
        <div className="flex justify-center gap-4 text-sm">
          <span className="text-red-600">😓 어려움 {hard}개</span>
          <span className="text-yellow-600">🙂 보통 {normal}개</span>
          <span className="text-green-600">😊 쉬움 {easy}개</span>
        </div>
        <Button onClick={restart} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          다시 학습
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 진도 바 */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{index + 1} / {words.length}</span>
          <span>{progress}% 완료</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* 플립 카드 */}
      <FlashCard
        front={
          <div className="space-y-2 text-center">
            <p className="text-3xl font-bold text-english">{current.word}</p>
          </div>
        }
        back={
          <div className="space-y-3 text-center w-full">
            <p className="text-2xl font-semibold">{current.meaning}</p>
            {current.example && (
              <p className="text-sm text-muted-foreground italic">"{current.example}"</p>
            )}
            {current.synonym && (
              <div className="flex flex-wrap gap-1 justify-center">
                <span className="text-xs text-muted-foreground">유의어:</span>
                <Badge variant="secondary" className="text-xs">{current.synonym}</Badge>
              </div>
            )}
            {current.appeared_in && (
              <Badge variant="outline" className="text-xs">{current.appeared_in}</Badge>
            )}
          </div>
        }
        onRate={handleRate}
        showTTS
        ttsText={current.word}
        ttsLang="en-US"
        accentColor="#1A6FBF"
      />
    </div>
  )
}
