'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { TTSButton } from './TTSButton'
import { ExamMetaBadge } from './ExamMetaBadge'
import { QUALITY_MAP } from '@/lib/sm2'

export interface FlashCardProps {
  front: React.ReactNode
  back: React.ReactNode
  onRate: (quality: 0 | 1 | 2) => void
  examMeta?: string
  showTTS?: boolean
  ttsText?: string
  ttsLang?: 'en-US' | 'ko-KR'
  accentColor?: string
}

type CardState = 'idle' | 'flipped' | 'rated'

export function FlashCard({
  front, back, onRate,
  examMeta, showTTS, ttsText, ttsLang = 'en-US',
  accentColor = '#1A6FBF',
}: FlashCardProps) {
  const [state, setState] = useState<CardState>('idle')
  const [flipped, setFlipped] = useState(false)

  const handleFlip = () => {
    if (state === 'idle') { setFlipped(true); setState('flipped') }
  }

  const handleRate = (q: 0 | 1 | 2) => {
    setState('rated')
    setTimeout(() => {
      onRate(q)
      setFlipped(false)
      setState('idle')
    }, 350)
  }

  return (
    <div className="w-full max-w-xl mx-auto select-none">
      {/* 카드 */}
      <div
        className="relative h-56 cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={handleFlip}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 앞면 */}
          <div
            className="absolute inset-0 rounded-2xl border-2 bg-card flex flex-col items-center justify-center p-6 shadow-md"
            style={{ backfaceVisibility: 'hidden', borderColor: accentColor }}
          >
            <div className="flex items-center gap-2">
              <div className="text-center">{front}</div>
              {showTTS && ttsText && (
                <TTSButton text={ttsText} lang={ttsLang} />
              )}
            </div>
            {examMeta && (
              <div className="absolute bottom-3">
                <ExamMetaBadge examAppearedIn={examMeta} />
              </div>
            )}
            <p className="absolute bottom-3 right-4 text-xs text-muted-foreground">
              탭하여 뒤집기
            </p>
          </div>

          {/* 뒷면 */}
          <div
            className="absolute inset-0 rounded-2xl border-2 bg-card flex flex-col items-center justify-center p-6 shadow-md"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderColor: accentColor }}
          >
            <div className="text-center w-full">{back}</div>
          </div>
        </motion.div>
      </div>

      {/* 평가 버튼 (뒷면일 때만) */}
      <AnimatePresence>
        {state === 'flipped' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="flex gap-3 justify-center mt-4"
          >
            <Button
              variant="outline"
              className="border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 flex-1 max-w-[8rem]"
              onClick={() => handleRate(0)}
            >
              😓 어려움
            </Button>
            <Button
              variant="outline"
              className="border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950 flex-1 max-w-[8rem]"
              onClick={() => handleRate(1)}
            >
              🙂 보통
            </Button>
            <Button
              variant="outline"
              className="border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 flex-1 max-w-[8rem]"
              onClick={() => handleRate(2)}
            >
              😊 쉬움
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
