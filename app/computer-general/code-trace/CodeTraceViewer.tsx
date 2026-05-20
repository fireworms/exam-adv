'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TraceItem } from './page'

interface Props { items: TraceItem[] }

export function CodeTraceViewer({ items }: Props) {
  const [selected, setSelected] = useState(0)
  const item = items[selected]

  return (
    <div className="space-y-4">
      {/* 예제 선택 */}
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <Button
            key={i}
            size="sm"
            variant={selected === i ? 'default' : 'outline'}
            onClick={() => setSelected(i)}
            style={selected === i ? { backgroundColor: '#2E9E4F' } : undefined}
          >
            {it.title}
          </Button>
        ))}
      </div>

      {item && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 코드 패널 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                소스 코드
                <Badge variant="outline">{item.language}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted rounded p-3 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
                {item.code}
              </pre>
            </CardContent>
          </Card>

          {/* 노트 패널 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">실행 포인트 · 핵심</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {item.notes.map((note, i) => (
                  <li key={i} className="text-xs flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-computer text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
