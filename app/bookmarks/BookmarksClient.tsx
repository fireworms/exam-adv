'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, BookMarked } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SUBJECT_META, type SubjectKey } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Bookmark {
  subject: string
  itemType: string
  itemKey: string
  label: string
  savedAt: number
}

function getAllBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return []
  const items: Bookmark[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k?.startsWith('bm::')) continue
    try {
      const val = JSON.parse(localStorage.getItem(k) ?? '')
      if (val?.label) items.push(val)
    } catch { /* skip */ }
  }
  return items.sort((a, b) => b.savedAt - a.savedAt)
}

export function BookmarksClient() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    setBookmarks(getAllBookmarks())
  }, [])

  const remove = (bm: Bookmark) => {
    const key = `bm::${bm.subject}::${bm.itemType}::${bm.itemKey}`
    localStorage.removeItem(key)
    setBookmarks(prev => prev.filter(b => b.itemKey !== bm.itemKey || b.subject !== bm.subject))
    toast('북마크 삭제됨', { icon: '🗑️', duration: 1200 })
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookMarked className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">북마크한 항목이 없습니다.</p>
        <p className="text-xs mt-1">학습 페이지에서 🔖 버튼을 눌러 북마크하세요.</p>
      </div>
    )
  }

  // 과목별 그룹
  const grouped = bookmarks.reduce<Record<string, Bookmark[]>>((acc, bm) => {
    if (!acc[bm.subject]) acc[bm.subject] = []
    acc[bm.subject].push(bm)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([subject, items]) => {
        const meta = SUBJECT_META[subject as SubjectKey]
        return (
          <section key={subject}>
            <div
              className="inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-bold mb-3"
              style={{ backgroundColor: meta?.color ?? '#666' }}
            >
              {meta?.label ?? subject}
              <span className="ml-2 bg-white/20 rounded-full px-1.5 text-xs">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map(bm => (
                <Card key={`${bm.subject}_${bm.itemKey}`} className="hover:shadow-sm transition-shadow">
                  <CardContent className="py-2 px-4 flex items-center gap-3">
                    <Badge variant="outline" className="text-xs shrink-0">{bm.itemType}</Badge>
                    <Link
                      href={`/${bm.subject}/notes/json?q=${encodeURIComponent(bm.label)}`}
                      className="flex-1 text-sm hover:underline truncate"
                    >
                      {bm.label}
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(bm)}
                      aria-label="북마크 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
