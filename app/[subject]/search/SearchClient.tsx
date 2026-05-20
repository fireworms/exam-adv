'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SearchResult } from '@/app/api/search/route'

interface Props {
  subject: string
  initialQuery: string
  accentColor: string
}

export function SearchClient({ subject, initialQuery, accentColor }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return }
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&subject=${subject}&limit=20`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [subject])

  // 초기 쿼리 자동 실행
  useEffect(() => { if (initialQuery) doSearch(initialQuery) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <form
        onSubmit={e => { e.preventDefault(); doSearch(query) }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="키워드 검색 (예: SHA-256, 세종, 가정법)"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          검색
        </button>
      </form>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          검색 중...
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          "{query}"에 대한 결과가 없습니다.
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{results.length}개 결과</p>
          {results.map((r, i) => (
            <Link key={i} href={r.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs shrink-0 mt-0.5"
                      style={{ borderColor: accentColor, color: accentColor }}
                    >
                      {r.item_type.replace(/_/g, ' ')}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
