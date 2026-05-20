import { readFileSync } from 'fs'
import { resolve } from 'path'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Pattern {
  id: number
  name: string
  form: string
  appeared_in?: string
}

export default function GrammarPatternsPage() {
  const json = JSON.parse(readFileSync(resolve('data/english/요약노트_JSON.json'), 'utf-8'))
  const patterns = json.grammar_patterns as Pattern[]

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">영어 문법 패턴 10</h1>
      <p className="text-sm text-muted-foreground">패턴을 클릭하면 상세 설명과 미니 퀴즈가 열립니다.</p>

      <div className="space-y-2">
        {patterns.map((p, i) => (
          <Link key={p.id} href={`/english/grammar-patterns/${p.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <span
                    className="text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: '#1A6FBF' }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{p.form}</p>
                  </div>
                  {p.appeared_in && (
                    <Badge variant="outline" className="text-xs shrink-0">{p.appeared_in}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
