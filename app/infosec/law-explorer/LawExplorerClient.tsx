'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MiniQuizShell } from '@/components/common/MiniQuizShell'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { laws: Record<string, unknown> }

const LAW_LABELS: Record<string, string> = {
  개인정보보호법: '개인정보 보호법',
  정보통신망법:   '정보통신망 이용촉진 및 정보보호 등에 관한 법률',
  위치정보법_소관: '위치정보법',
  'ISMS-P':       'ISMS-P 인증체계',
  평가기준:       '평가기준',
  CC_보증요구사항: 'CC 보증 요구사항',
}

export function LawExplorerClient({ laws }: Props) {
  const [openLaw, setOpenLaw] = useState<string | null>('개인정보보호법')

  return (
    <div className="space-y-3">
      {Object.entries(laws).map(([lawKey, content]) => (
        <Card key={lawKey}>
          <CardHeader
            className="pb-2 cursor-pointer"
            onClick={() => setOpenLaw(openLaw === lawKey ? null : lawKey)}
          >
            <CardTitle className="text-sm flex items-center justify-between">
              <span>{LAW_LABELS[lawKey] ?? lawKey}</span>
              {openLaw === lawKey
                ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>

          {openLaw === lawKey && (
            <CardContent className="space-y-3">
              {typeof content === 'object' && content !== null
                ? <LawArticles articles={content as Record<string, unknown>} lawKey={lawKey} />
                : <p className="text-sm">{String(content)}</p>}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

function renderValue(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v !== 'object') return String(v)
  if (Array.isArray(v)) {
    if (v.length === 0) return ''
    if (typeof v[0] !== 'object') return v.join(', ')
    return `[${v.length}개 항목]`
  }
  const keys = Object.keys(v as object)
  return `{${keys.length}개 키}`
}

function LawArticles({ articles, lawKey }: { articles: Record<string, unknown>; lawKey: string }) {
  const [openArticle, setOpenArticle] = useState<string | null>(null)
  const [quizArticle, setQuizArticle] = useState<string | null>(null)

  // 숫자가 포함된 키 찾기 → 단답 퀴즈 후보
  function extractNumbers(val: unknown): string[] {
    const str = typeof val === 'string' ? val : JSON.stringify(val)
    return [...str.matchAll(/\d+/g)].map(m => m[0]).filter(n => n.length >= 1)
  }

  return (
    <div className="space-y-2">
      {Object.entries(articles).map(([key, val]) => {
        const nums = extractNumbers(val)
        const hasQuiz = nums.length > 0
        const isOpen = openArticle === key
        const isQuiz = quizArticle === key

        return (
          <div key={key} className="rounded-lg border">
            <div
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50"
              onClick={() => setOpenArticle(isOpen ? null : key)}
            >
              <span className="text-sm font-medium">{key.replace(/_/g, ' ')}</span>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {hasQuiz && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => setQuizArticle(isQuiz ? null : key)}
                  >
                    숫자 퀴즈
                  </Button>
                )}
                {isOpen
                  ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            </div>

            {isOpen && (
              <div className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed border-t pt-2">
                {typeof val === 'object'
                  ? Object.entries(val as Record<string, unknown>)
                      .filter(([k]) => k !== '인증기준' && k !== '인증제도')
                      .map(([k, v]) => (
                        <div key={k} className="mb-1">
                          <span className="font-medium text-foreground">{k}: </span>
                          {renderValue(v)}
                        </div>
                      ))
                  : String(val)}
              </div>
            )}

            {isQuiz && hasQuiz && (
              <NumberQuiz
                articleKey={key}
                content={String(typeof val === 'object' ? JSON.stringify(val) : val)}
                lawKey={lawKey}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function NumberQuiz({ articleKey, content, lawKey }: { articleKey: string; content: string; lawKey: string }) {
  const nums = [...content.matchAll(/(\d+)/g)].map(m => m[0]).filter(n => n.length >= 1)
  const target = nums[Math.floor(Math.random() * nums.length)]
  const blanked = content.replace(target, '___')

  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)

  return (
    <MiniQuizShell quizType="law_number_input" itemKey={`${lawKey}_${articleKey}`} subject="정보보호론">
      {({ onSubmit }) => (
        <div className="px-3 pb-3 pt-2 border-t space-y-2">
          <p className="text-xs font-medium">빈칸에 알맞은 숫자를 입력하세요</p>
          <p className="text-xs bg-muted rounded px-2 py-1.5 leading-relaxed">
            {blanked.slice(0, 200)}
            {blanked.length > 200 && '...'}
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={revealed}
              placeholder="숫자 입력"
              className="w-28 px-2 py-1 text-sm rounded border bg-background font-mono"
            />
            {!revealed ? (
              <Button
                size="sm"
                onClick={() => {
                  setRevealed(true)
                  onSubmit(answer.trim() === target)
                }}
                disabled={!answer}
                style={{ backgroundColor: '#D4820F' }}
              >
                확인
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                {answer.trim() === target
                  ? <span className="text-green-600 font-medium">정답 ✓</span>
                  : <span className="text-red-600">정답: <strong>{target}</strong></span>}
                <Button size="sm" variant="outline" onClick={() => { setAnswer(''); setRevealed(false) }}>
                  다시
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </MiniQuizShell>
  )
}
