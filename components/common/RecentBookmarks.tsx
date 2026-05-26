'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookMarked } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SUBJECT_META, type SubjectKey } from '@/lib/utils'

interface Bookmark {
  subject: string
  itemType: string
  itemKey: string
  label: string
  savedAt: number
}

function readBookmarks(): Bookmark[] {
  const items: Bookmark[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k?.startsWith('bm::')) continue
    try {
      const val = JSON.parse(localStorage.getItem(k) ?? '')
      if (val?.label) items.push(val)
    } catch { /* skip */ }
  }
  return items.sort((a, b) => b.savedAt - a.savedAt).slice(0, 5)
}

export function RecentBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[] | null>(null)

  useEffect(() => {
    setBookmarks(readBookmarks())
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BookMarked className="h-4 w-4" />
          최근 북마크
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookmarks === null || bookmarks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            북마크한 항목이 없습니다.{' '}
            <Link href="/bookmarks" className="underline">북마크 관리</Link>
          </p>
        ) : (
          <div className="space-y-2">
            {bookmarks.map(bm => {
              const meta = SUBJECT_META[bm.subject as SubjectKey]
              return (
                <div key={`${bm.subject}_${bm.itemKey}`} className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: meta?.color ?? '#888' }}
                  />
                  <Link
                    href={`/${bm.subject}/notes/json?q=${encodeURIComponent(bm.label)}`}
                    className="flex-1 text-sm hover:underline truncate"
                  >
                    {bm.label}
                  </Link>
                  <Badge variant="outline" className="text-xs shrink-0">{meta?.label ?? bm.subject}</Badge>
                </div>
              )
            })}
            <div className="pt-1">
              <Link href="/bookmarks" className="text-xs text-muted-foreground underline">
                전체 보기
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
