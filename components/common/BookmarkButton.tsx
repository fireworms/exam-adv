'use client'

import { useState, useEffect } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface BookmarkButtonProps {
  subject: string
  itemType: string
  itemKey: string
  label: string
  size?: 'sm' | 'icon'
}

function storageKey(subject: string, itemType: string, itemKey: string) {
  return `bm::${subject}::${itemType}::${itemKey}`
}

export function BookmarkButton({ subject, itemType, itemKey, label, size = 'icon' }: BookmarkButtonProps) {
  const key = storageKey(subject, itemType, itemKey)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(!!localStorage.getItem(key))
  }, [key])

  const toggle = async () => {
    if (saved) {
      localStorage.removeItem(key)
      setSaved(false)
      toast('북마크 해제', { icon: '🗑️', duration: 1200 })
    } else {
      localStorage.setItem(key, JSON.stringify({ subject, itemType, itemKey, label, savedAt: Date.now() }))
      setSaved(true)
      toast.success('북마크 저장!', { duration: 1200 })
    }

    // Supabase 동기 (인증 시)
    try {
      await fetch('/api/bookmarks', {
        method: saved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, itemType, itemKey, label }),
      })
    } catch { /* 비인증 무시 */ }
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggle}
      aria-label={saved ? '북마크 해제' : '북마크 저장'}
      className={saved ? 'text-yellow-500' : 'text-muted-foreground'}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
    </Button>
  )
}
