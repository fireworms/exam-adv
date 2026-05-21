'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface IsmspItem {
  code: string
  name: string
  summary: string
  exam_ref?: string
}

export type IsmspArea = Record<string, IsmspItem[]>

export interface IsmspCertData {
  유효기간_3년_법칙: { 항목: string; 값: string; 비고: string; exam_ref?: string }[]
  심사_종류: { 종류: string; 설명: string }[]
  심사원_등급: { 등급: string; 요건: string; exam_ref?: string }[]
  응시_요건: { 총_경력: string; 필수_정보보호: string; 필수_개인정보보호: string; 예시: string }
  주요_함정: string[]
}

interface Props {
  tree: Record<string, IsmspArea>
}

export function IsmspTreeClient({ tree }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [openAreas, setOpenAreas] = useState<Set<string>>(new Set())
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())

  const toggleArea = (key: string) => setOpenAreas(s => {
    const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n
  })
  const toggleSection = (key: string) => setOpenSections(s => {
    const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n
  })
  const toggleCheck = (code: string) => setChecked(s => {
    const n = new Set(s); n.has(code) ? n.delete(code) : n.add(code); return n
  })

  const totalItems = Object.values(tree).reduce((sum, area) =>
    sum + Object.values(area).reduce((s, items) => s + items.length, 0), 0)
  const checkedCount = checked.size

  return (
    <div className="space-y-2">
      {checkedCount > 0 && (
        <div className="text-xs text-right text-muted-foreground">
          ✓ {checkedCount} / {totalItems}개 학습 완료
          <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(checkedCount / totalItems) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        {Object.entries(tree).map(([areaName, sections]) => {
          const areaItems = Object.values(sections).flat()
          const areaChecked = areaItems.filter(i => checked.has(i.code)).length
          const areaExam = areaItems.filter(i => i.exam_ref).length
          const isAreaOpen = openAreas.has(areaName)

          return (
            <div key={areaName} className="rounded-lg border bg-card overflow-hidden">
              {/* 영역 헤더 */}
              <button
                onClick={() => toggleArea(areaName)}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                {isAreaOpen
                  ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                }
                <span className="font-semibold text-sm flex-1">{areaName}</span>
                <span className="text-xs text-muted-foreground">{areaItems.length}개</span>
                {areaExam > 0 && (
                  <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600 px-1.5 py-0">
                    기출 {areaExam}
                  </Badge>
                )}
                {areaChecked > 0 && (
                  <Badge variant="outline" className="text-[10px] border-green-400 text-green-600 px-1.5 py-0">
                    ✓ {areaChecked}
                  </Badge>
                )}
              </button>

              {isAreaOpen && (
                <div className="border-t divide-y">
                  {Object.entries(sections).map(([sectionName, items]) => {
                    const secChecked = items.filter(i => checked.has(i.code)).length
                    const secExam = items.filter(i => i.exam_ref).length
                    const isSectionOpen = openSections.has(sectionName)

                    return (
                      <div key={sectionName}>
                        {/* 분야 헤더 */}
                        <button
                          onClick={() => toggleSection(sectionName)}
                          className="w-full flex items-center gap-2 px-6 py-2.5 hover:bg-muted/40 transition-colors text-left bg-muted/20"
                        >
                          {isSectionOpen
                            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          }
                          <span className="text-sm flex-1">{sectionName}</span>
                          <span className="text-xs text-muted-foreground">{items.length}개</span>
                          {secExam > 0 && (
                            <span className="text-[10px] text-amber-600">기출 {secExam}</span>
                          )}
                          {secChecked > 0 && (
                            <span className="text-[10px] text-green-600">✓{secChecked}</span>
                          )}
                        </button>

                        {/* 항목 목록 */}
                        {isSectionOpen && (
                          <div className="divide-y divide-border/50">
                            {items.map(item => {
                              const isDone = checked.has(item.code)
                              const hasExam = !!item.exam_ref

                              return (
                                <div
                                  key={item.code}
                                  onClick={() => toggleCheck(item.code)}
                                  className={cn(
                                    'flex items-start gap-3 px-8 py-2.5 cursor-pointer transition-colors',
                                    isDone
                                      ? 'bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/30'
                                      : hasExam
                                        ? 'bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                        : 'hover:bg-muted/30'
                                  )}
                                >
                                  {/* 체크 아이콘 */}
                                  <div className="mt-0.5 shrink-0">
                                    {isDone
                                      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                                      : <Circle className="h-4 w-4 text-muted-foreground" />
                                    }
                                  </div>

                                  {/* 내용 */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-mono text-muted-foreground shrink-0">
                                        {item.code}
                                      </span>
                                      <span className={cn(
                                        'text-sm',
                                        hasExam && 'font-semibold text-amber-800 dark:text-amber-300',
                                        isDone && 'line-through text-muted-foreground'
                                      )}>
                                        {item.name}
                                      </span>
                                      {hasExam && !isDone && (
                                        <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 hover:bg-amber-500 shrink-0">
                                          {item.exam_ref}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className={cn(
                                      'text-xs text-muted-foreground mt-0.5',
                                      isDone && 'line-through'
                                    )}>
                                      {item.summary}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
