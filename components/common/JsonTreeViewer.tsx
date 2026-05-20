'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NodeProps {
  label: string
  value: unknown
  depth?: number
  defaultOpen?: boolean
  highlight?: string
}

function JsonNode({ label, value, depth = 0, defaultOpen = false, highlight }: NodeProps) {
  const [open, setOpen] = useState(defaultOpen || depth < 1)
  const isObject = value !== null && typeof value === 'object'
  const isArray = Array.isArray(value)
  const entries = isObject
    ? isArray
      ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
      : Object.entries(value as Record<string, unknown>)
    : []

  const primitive = !isObject
    ? String(value)
    : isArray
    ? `[${(value as unknown[]).length}개]`
    : `{${Object.keys(value as object).length}개 키}`

  const matchesHighlight =
    highlight &&
    (label.toLowerCase().includes(highlight.toLowerCase()) ||
      (!isObject && primitive.toLowerCase().includes(highlight.toLowerCase())))

  return (
    <div className={cn('text-sm font-mono', depth > 0 && 'ml-4')}>
      <div
        className={cn(
          'flex items-start gap-1 py-0.5 rounded px-1 cursor-pointer hover:bg-muted/60 transition-colors',
          matchesHighlight && 'bg-yellow-100 dark:bg-yellow-900/30'
        )}
        onClick={() => isObject && setOpen(v => !v)}
      >
        {isObject ? (
          open ? (
            <ChevronDown className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        <span className="text-blue-600 dark:text-blue-400 shrink-0">{label}</span>
        <span className="text-muted-foreground mx-1">:</span>

        {isObject ? (
          <span className="text-muted-foreground text-xs">{primitive}</span>
        ) : (
          <span className={cn(
            'break-all',
            typeof value === 'number' ? 'text-orange-600 dark:text-orange-400' :
            typeof value === 'boolean' ? 'text-purple-600 dark:text-purple-400' :
            'text-green-700 dark:text-green-400'
          )}>
            {typeof value === 'string' ? `"${primitive}"` : primitive}
          </span>
        )}
      </div>

      {isObject && open && (
        <div className="border-l border-border ml-2 pl-1">
          {entries.map(([k, v]) => (
            <JsonNode
              key={k}
              label={k}
              value={v}
              depth={depth + 1}
              highlight={highlight}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface JsonTreeViewerProps {
  data: Record<string, unknown>
  highlight?: string
}

export function JsonTreeViewer({ data, highlight }: JsonTreeViewerProps) {
  return (
    <div className="rounded-lg border bg-card p-4 overflow-x-auto">
      {Object.entries(data).map(([k, v]) => (
        <JsonNode key={k} label={k} value={v} depth={0} highlight={highlight} />
      ))}
    </div>
  )
}
