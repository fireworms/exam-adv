import { readFileSync } from 'fs'
import { resolve } from 'path'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GrammarQuiz } from './GrammarQuiz'

interface Pattern {
  id: number; name: string; form: string; equivalent?: string
  example: string; korean: string; appeared_in?: string
  key_point?: string
}

interface Props { params: Promise<{ id: string }> }

export default async function GrammarPatternDetailPage({ params }: Props) {
  const { id } = await params
  const json = JSON.parse(readFileSync(resolve('data/english/요약노트_JSON.json'), 'utf-8'))
  const patterns = json.grammar_patterns as Pattern[]
  const pattern = patterns.find(p => String(p.id) === id)
  if (!pattern) notFound()

  const idx = patterns.findIndex(p => p.id === pattern.id)
  const prev = patterns[idx - 1]
  const next = patterns[idx + 1]

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/english/grammar-patterns" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> 문법 패턴 목록
      </Link>

      <div className="flex items-baseline gap-3">
        <h1 className="text-xl font-bold">{pattern.name}</h1>
        {pattern.appeared_in && <Badge variant="outline">{pattern.appeared_in}</Badge>}
      </div>

      {/* 패턴 형식 */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">패턴 형식</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-sm font-mono bg-muted rounded p-3 whitespace-pre-wrap">{pattern.form}</pre>
          {pattern.equivalent && (
            <p className="text-xs text-muted-foreground mt-2">≡ {pattern.equivalent}</p>
          )}
        </CardContent>
      </Card>

      {/* 예문 */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">예문</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm italic">"{pattern.example}"</p>
          <p className="text-sm text-muted-foreground">→ {pattern.korean}</p>
        </CardContent>
      </Card>

      {/* 핵심 포인트 */}
      {pattern.key_point && (
        <Card className="border-english/30 bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="py-3 px-4">
            <p className="text-sm">💡 {pattern.key_point}</p>
          </CardContent>
        </Card>
      )}

      {/* 미니 퀴즈 */}
      <GrammarQuiz pattern={pattern} allPatterns={patterns} />

      {/* 이전/다음 */}
      <div className="flex justify-between pt-2">
        {prev ? (
          <Link href={`/english/grammar-patterns/${prev.id}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />{prev.name}
          </Link>
        ) : <span />}
        {next && (
          <Link href={`/english/grammar-patterns/${next.id}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            {next.name}<ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
