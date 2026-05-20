'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Props { data: Record<string, unknown> }

export function IsmspTreeClient({ data }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState<Set<string>>(new Set())

  const toggle = (key: string) => setOpen(s => {
    const n = new Set(s)
    n.has(key) ? n.delete(key) : n.add(key)
    return n
  })

  const toggleCheck = (key: string) => setChecked(s => {
    const n = new Set(s)
    n.has(key) ? n.delete(key) : n.add(key)
    return n
  })

  const renderNode = (key: string, val: unknown, depth = 0): React.ReactNode => {
    const isOpen = open.has(key)
    const isChecked = checked.has(key)
    const isLeaf = typeof val !== 'object' || val === null || Array.isArray(val)
    const indent = depth * 16

    return (
      <div key={key} style={{ marginLeft: indent }}>
        <div
          className={cn(
            'flex items-start gap-2 py-1.5 px-2 rounded-md hover:bg-muted/60 cursor-pointer group',
            isChecked && 'opacity-60'
          )}
          onClick={() => { if (!isLeaf) toggle(key); else toggleCheck(key) }}
        >
          {!isLeaf
            ? isOpen
              ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            : isChecked
              ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
              : <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          }
          <span className={cn('text-sm', depth === 0 && 'font-semibold', isChecked && 'line-through')}>
            {key}
          </span>
          {isLeaf && Array.isArray(val) && (
            <Badge variant="secondary" className="text-xs ml-auto">{val.length}개</Badge>
          )}
        </div>

        {!isLeaf && isOpen && (
          <div className="border-l border-border ml-3 pl-1 mt-0.5">
            {Array.isArray(val)
              ? val.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-1 px-2 hover:bg-muted/60 rounded cursor-pointer"
                    onClick={() => toggleCheck(`${key}_${i}`)}
                  >
                    {checked.has(`${key}_${i}`)
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      : <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                    <span className={cn('text-xs', checked.has(`${key}_${i}`) && 'line-through text-muted-foreground')}>
                      {String(item)}
                    </span>
                  </div>
                ))
              : Object.entries(val as Record<string, unknown>).map(([k, v]) => renderNode(k, v, depth + 1))
            }
          </div>
        )}
      </div>
    )
  }

  const totalLeaves = checked.size
  return (
    <div className="space-y-2">
      {totalLeaves > 0 && (
        <div className="text-xs text-muted-foreground text-right">✓ {totalLeaves}개 학습 완료</div>
      )}
      <div className="rounded-lg border bg-card p-3 space-y-1">
        {Object.entries(data).map(([k, v]) => renderNode(k, v, 0))}
      </div>
    </div>
  )
}
