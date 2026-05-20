'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface DueCard { type: string; subject?: string }

const TYPE_LABEL: Record<string, string> = {
  vocab: '영어 어휘', concept: '컴일 개념', trap: '함정', idiom: '관용구',
}
const TYPE_HREF: Record<string, string> = {
  vocab: '/english/vocabulary', concept: '/computer-general/flashcards',
  trap: '/korean-history/traps', idiom: '/english/idioms',
}

export function ReviewQueue() {
  const [cards, setCards] = useState<DueCard[] | null>(null)

  useEffect(() => {
    fetch('/api/review/due')
      .then(r => r.json())
      .then(d => setCards(d.cards ?? []))
      .catch(() => setCards([]))
  }, [])

  const grouped = cards
    ? cards.reduce<Record<string, number>>((acc, c) => {
        acc[c.type] = (acc[c.type] ?? 0) + 1
        return acc
      }, {})
    : {}

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          오늘의 복습 카드
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cards === null ? (
          <div className="flex gap-2">
            {[1,2,3].map(i => <Skeleton key={i} className="h-7 w-24 rounded-full" />)}
          </div>
        ) : cards.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            오늘 복습 완료 🎉 다음 복습은 내일입니다
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Object.entries(grouped).map(([type, count]) => (
              <Link key={type} href={TYPE_HREF[type] ?? '/'}>
                <Badge
                  variant="outline"
                  className="gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-muted transition-colors"
                >
                  {TYPE_LABEL[type] ?? type} {count}개
                  <ArrowRight className="h-3 w-3" />
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
