'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Rows3 } from 'lucide-react'

interface TocItem {
  id: string
  text: string
  level: number
}

function slugify(text: string) {
  return text
    .replace(/[^\w\s가-힣]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}

function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split('\n')
  const items: TocItem[] = []
  const seen: Record<string, number> = {}

  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+)/)
    if (!m) continue
    const level = m[1].length
    const text = m[2].trim()
    const base = slugify(text)
    seen[base] = (seen[base] ?? 0) + 1
    const id = seen[base] > 1 ? `${base}-${seen[base]}` : base
    items.push({ id, text, level })
  }
  return items
}

interface MarkdownViewerProps {
  subject: string
  type: 'master' | 'table' | 'trends'
  pdfUrl?: string
}

export function MarkdownViewer({ subject, type, pdfUrl }: MarkdownViewerProps) {
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [tableHighlight, setTableHighlight] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/notes/${subject}/${type}`)
      .then(r => {
        if (!r.ok) throw new Error('not found')
        return r.text()
      })
      .then(setContent)
      .catch(() => setError(true))
  }, [subject, type])

  const toc = content ? extractToc(content) : []

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }, [])

  if (error) {
    return (
      <div className="rounded-lg border p-6 text-center text-muted-foreground">
        파일을 불러올 수 없습니다. 준비 중이거나 파일이 없습니다.
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex gap-6">
        <div className="hidden md:flex flex-col gap-2 w-48 shrink-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4" style={{ width: `${60 + (i % 3) * 20}%` }} />
          ))}
        </div>
        <div className="flex-1 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 relative">
      {/* 목차 사이드바 */}
      {toc.length > 0 && (
        <nav className="hidden md:flex flex-col gap-1 w-52 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">목차</p>
          {toc.map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={cn(
                'text-left text-xs py-1 rounded transition-colors hover:text-foreground truncate',
                item.level === 3 ? 'pl-4' : 'pl-1',
                activeId === item.id
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              {item.text}
            </button>
          ))}
        </nav>
      )}

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        {type === 'table' && (
          <div className="flex items-center justify-end mb-4">
            <Button
              variant={tableHighlight ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTableHighlight(v => !v)}
              className="gap-2"
            >
              <Rows3 className="h-4 w-4" />
              표 강조 모드
            </Button>
          </div>
        )}

        <div
          ref={contentRef}
          className={cn(
            'prose prose-sm dark:prose-invert max-w-none',
            tableHighlight && '[&_p]:opacity-40 [&_ul]:opacity-40 [&_ol]:opacity-40 [&_blockquote]:opacity-40',
            '[&_table]:overflow-x-auto [&_table]:block',
            '[&_h2]:scroll-mt-20 [&_h3]:scroll-mt-20'
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children, ...props }) => {
                const text = String(children)
                const id = slugify(text)
                return <h2 id={id} {...props}>{children}</h2>
              },
              h3: ({ children, ...props }) => {
                const text = String(children)
                const id = slugify(text)
                return <h3 id={id} {...props}>{children}</h3>
              },
              table: ({ children, ...props }) => (
                <div className="overflow-x-auto">
                  <table className="min-w-full" {...props}>{children}</table>
                </div>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
