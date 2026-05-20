import { readFileSync } from 'fs'
import { resolve } from 'path'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Figure {
  name: string
  era: string
  key: string[]
}

interface FigureGroups {
  rulers_주요_통치자: Figure[]
  scholars_학자: Figure[]
  reformers_개혁가: Figure[]
  independence_activists_독립운동가: Figure[]
}

const CATEGORY_LABELS: Record<string, string> = {
  rulers_주요_통치자:             '왕·통치자',
  scholars_학자:                  '학자',
  reformers_개혁가:               '개혁가',
  independence_activists_독립운동가: '독립운동가',
}

const CATEGORY_COLORS: Record<string, string> = {
  rulers_주요_통치자:             '#7B5EA7',
  scholars_학자:                  '#1A6FBF',
  reformers_개혁가:               '#2E9E4F',
  independence_activists_독립운동가: '#D4820F',
}

export default function HistoricalFiguresPage() {
  const json = JSON.parse(readFileSync(resolve('data/korean_history/요약노트_JSON.json'), 'utf-8'))
  const groups = json.key_figures as FigureGroups

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-xl font-bold">한국사 인물 사전</h1>

      {Object.entries(groups).map(([cat, figures]) => (
        <section key={cat}>
          <div
            className="inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-bold mb-3"
            style={{ backgroundColor: CATEGORY_COLORS[cat] }}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(figures as Figure[]).map((fig, i) => (
              <Link
                key={i}
                href={`/korean-history/historical-figures/${encodeURIComponent(fig.name)}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="font-semibold">{fig.name}</span>
                      <Badge variant="outline" className="text-xs">{fig.era}</Badge>
                    </div>
                    <ul className="space-y-0.5">
                      {fig.key.slice(0, 3).map((k, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                          <span className="mt-1 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                          {k}
                        </li>
                      ))}
                      {fig.key.length > 3 && (
                        <li className="text-xs text-muted-foreground pl-2.5">
                          +{fig.key.length - 3}개 더
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
