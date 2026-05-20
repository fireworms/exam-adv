import { readFileSync } from 'fs'
import { resolve } from 'path'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'

interface Figure {
  name: string
  era: string
  key: string[]
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function FigureDetailPage({ params }: Props) {
  const { id } = await params
  const name = decodeURIComponent(id)

  const json = JSON.parse(readFileSync(resolve('data/korean_history/요약노트_JSON.json'), 'utf-8'))
  const groups = json.key_figures as Record<string, Figure[]>

  let found: Figure | null = null
  let category = ''
  for (const [cat, figs] of Object.entries(groups)) {
    const match = figs.find(f => f.name === name)
    if (match) { found = match; category = cat; break }
  }

  if (!found) notFound()

  const CATEGORY_LABELS: Record<string, string> = {
    rulers_주요_통치자:             '왕·통치자',
    scholars_학자:                  '학자',
    reformers_개혁가:               '개혁가',
    independence_activists_독립운동가: '독립운동가',
  }

  // 관련 인물: 같은 시대(era)에 속한 다른 인물
  const related = groups[category]
    ?.filter(f => f.era === found!.era && f.name !== found!.name)
    .slice(0, 4) ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link
        href="/korean-history/historical-figures"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        인물 사전으로
      </Link>

      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <h1 className="text-2xl font-bold">{found.name}</h1>
          <Badge variant="secondary">{found.era}</Badge>
          <Badge variant="outline">{CATEGORY_LABELS[category] ?? category}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">핵심 키워드 · 업적</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {found.key.map((k, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-history shrink-0" />
                {k}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {related.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">같은 시대 인물</p>
          <div className="flex flex-wrap gap-2">
            {related.map(fig => (
              <Link
                key={fig.name}
                href={`/korean-history/historical-figures/${encodeURIComponent(fig.name)}`}
                className="px-3 py-1 rounded-full border text-sm hover:bg-muted transition-colors"
              >
                {fig.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
