'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Rows3, ChevronDown } from 'lucide-react'

interface Section {
  id: string
  heading: string
  content: string
}

function slugify(text: string) {
  return text
    .replace(/[^\w\s가-힣]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}

function parseSections(markdown: string): { preamble: string; sections: Section[] } {
  const lines = markdown.split('\n')
  const sections: Section[] = []
  let current: { id: string; heading: string; lines: string[] } | null = null
  const preambleLines: string[] = []
  const seen: Record<string, number> = {}

  for (const line of lines) {
    const m = line.match(/^#{2}\s+(.+)/)
    if (m) {
      if (current) sections.push({ ...current, content: current.lines.join('\n') })
      const text = m[1].trim()
      const base = slugify(text)
      seen[base] = (seen[base] ?? 0) + 1
      const id = seen[base] > 1 ? `${base}-${seen[base]}` : base
      current = { id, heading: text, lines: [line] }
    } else {
      if (current) current.lines.push(line)
      else preambleLines.push(line)
    }
  }
  if (current) sections.push({ ...current, content: current.lines.join('\n') })

  return { preamble: preambleLines.join('\n').trim(), sections }
}

const mdComponents = {
  table: ({ children, ...props }: React.ComponentPropsWithoutRef<'table'>) => (
    <div className="overflow-x-auto my-4">
      <table
        className="min-w-full border-collapse text-sm"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.ComponentPropsWithoutRef<'thead'>) => (
    <thead className="bg-muted" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }: React.ComponentPropsWithoutRef<'th'>) => (
    <th className="border border-border px-3 py-2 text-left font-semibold" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: React.ComponentPropsWithoutRef<'td'>) => (
    <td className="border border-border px-3 py-2 align-top" {...props}>{children}</td>
  ),
  tr: ({ children, ...props }: React.ComponentPropsWithoutRef<'tr'>) => (
    <tr className="even:bg-muted/40" {...props}>{children}</tr>
  ),
}

interface MarkdownViewerProps {
  subject: string
  type: 'master' | 'table' | 'trends'
  pdfUrl?: string
}

export function MarkdownViewer({ subject, type }: MarkdownViewerProps) {
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [tableHighlight, setTableHighlight] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/notes/${subject}/${type}`)
      .then(r => {
        if (!r.ok) throw new Error('not found')
        return r.text()
      })
      .then(setContent)
      .catch(() => setError(true))
  }, [subject, type])

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

  const { preamble, sections } = parseSections(content)

  const proseClass = cn(
    'prose prose-sm dark:prose-invert max-w-none',
    tableHighlight && '[&_p]:opacity-40 [&_ul]:opacity-40 [&_ol]:opacity-40 [&_blockquote]:opacity-40',
  )

  return (
    <div className="flex gap-6 relative">
      {/* 목차 사이드바 */}
      {sections.length > 0 && (
        <nav className="hidden md:flex flex-col gap-1 w-52 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">목차</p>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setOpenId(prev => prev === s.id ? null : s.id)}
              className={cn(
                'text-left text-xs py-1.5 px-2 rounded transition-colors hover:text-foreground whitespace-normal break-words leading-snug',
                openId === s.id
                  ? 'text-foreground font-medium bg-accent'
                  : 'text-muted-foreground hover:bg-accent/50'
              )}
            >
              {s.heading}
            </button>
          ))}
        </nav>
      )}

      {/* 본문 */}
      <div className="flex-1 min-w-0 space-y-2">
        {type === 'table' && (
          <div className="flex items-center justify-end mb-2">
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

        {/* 헤더 앞 서문 */}
        {preamble && (
          <div className={proseClass}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {preamble}
            </ReactMarkdown>
          </div>
        )}

        {/* 아코디언 섹션 */}
        {sections.map(s => (
          <div key={s.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenId(prev => prev === s.id ? null : s.id)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left transition-colors',
                openId === s.id
                  ? 'bg-accent text-foreground'
                  : 'hover:bg-accent/50 text-foreground'
              )}
            >
              {s.heading}
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 transition-transform', openId === s.id && 'rotate-180')}
              />
            </button>

            {openId === s.id && (
              <div className={cn(proseClass, 'px-4 py-4 border-t')}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {s.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
