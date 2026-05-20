'use client'

import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

interface MiniQuizShellProps {
  quizType: string
  itemKey?: string
  subject: string
  children: (props: {
    onSubmit: (isCorrect: boolean) => void
  }) => React.ReactNode
}

export function MiniQuizShell({ quizType, itemKey, subject, children }: MiniQuizShellProps) {
  const startRef = useRef<number>(Date.now())

  useEffect(() => { startRef.current = Date.now() }, [quizType, itemKey])

  const handleSubmit = async (isCorrect: boolean) => {
    const timeSec = Math.round((Date.now() - startRef.current) / 1000)

    if (isCorrect) {
      toast.success('정답입니다 ✓', { duration: 1500 })
    } else {
      toast.error('오답입니다', { duration: 1500 })
    }

    // Supabase 기록 — 인증 없으면 조용히 무시
    try {
      await fetch('/api/quiz/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizType, itemKey, subject, isCorrect, timeSec }),
      })
    } catch {
      // 비인증 상태에서는 무시
    }

    startRef.current = Date.now()
  }

  return <>{children({ onSubmit: handleSubmit })}</>
}
