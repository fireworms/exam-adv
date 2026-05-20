'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Checklist {
  one_week_before: string[]
  day_before: { must_remember: string[]; exam_strategy: string[] }
}

export function ChecklistClient({ checklist }: { checklist: Checklist }) {
  const allItems = [
    ...checklist.one_week_before.map((item, i) => ({ id: `w_${i}`, section: '1주 전', text: item })),
    ...checklist.day_before.must_remember.map((item, i) => ({ id: `mr_${i}`, section: '하루 전 — 꼭 기억', text: item })),
    ...checklist.day_before.exam_strategy.map((item, i) => ({ id: `es_${i}`, section: '시험장 전략', text: item })),
  ]

  const [checked, setChecked] = useState<Set<string>>(new Set())
  const toggle = (id: string) => setChecked(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const total = allItems.length
  const done = checked.size
  const allDone = done === total

  const sections = [...new Set(allItems.map(i => i.section))]

  return (
    <div className="space-y-4">
      {/* 진도 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(done / total) * 100}%`, backgroundColor: '#E04B2A' }}
          />
        </div>
        <span className="text-sm font-medium shrink-0">{done}/{total}</span>
      </div>

      {allDone && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 border border-green-300 px-4 py-3">
          <PartyPopper className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium text-green-700 dark:text-green-300">준비 완료! 파이팅! 🎉</p>
        </div>
      )}

      {sections.map(section => (
        <div key={section}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{section}</p>
          <div className="space-y-2">
            {allItems.filter(i => i.section === section).map(item => (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={cn(
                  'w-full flex items-start gap-3 text-left px-3 py-2.5 rounded-lg border transition-colors',
                  checked.has(item.id)
                    ? 'bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-700'
                    : 'hover:bg-muted/60'
                )}
              >
                {checked.has(item.id)
                  ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  : <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
                <span className={cn('text-sm', checked.has(item.id) && 'line-through text-muted-foreground')}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
