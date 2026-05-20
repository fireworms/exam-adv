'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { type SubjectKey, SUBJECT_META } from '@/lib/utils'

interface SubjectProgressCardProps {
  subject: SubjectKey
  viewRate?: number
  memoryRate?: number
  cardsDue?: number
}

export function SubjectProgressCard({
  subject,
  viewRate = 0,
  memoryRate = 0,
  cardsDue = 0,
}: SubjectProgressCardProps) {
  const meta = SUBJECT_META[subject]

  return (
    <Link href={`/${subject}/dashboard`} className="block">
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{meta.label}</CardTitle>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: meta.color }}
            >
              {cardsDue > 0 ? `복습 ${cardsDue}` : '완료'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>열람률</span>
              <span>{viewRate}%</span>
            </div>
            <Progress value={viewRate} className="h-2" style={{ '--tw-bg-opacity': '1' } as React.CSSProperties} />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>암기율</span>
              <span>{memoryRate}%</span>
            </div>
            <Progress value={memoryRate} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
