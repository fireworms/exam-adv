'use client'

import { Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TTSButtonProps {
  text: string
  lang?: 'en-US' | 'ko-KR'
  size?: 'sm' | 'icon'
  rate?: number
}

export function TTSButton({ text, lang = 'en-US', size = 'icon', rate = 0.8 }: TTSButtonProps) {
  const speak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = lang
    utt.rate = rate
    window.speechSynthesis.speak(utt)
  }

  return (
    <Button variant="ghost" size={size} onClick={speak} aria-label="발음 듣기" className="shrink-0">
      <Volume2 className="h-4 w-4" />
    </Button>
  )
}
