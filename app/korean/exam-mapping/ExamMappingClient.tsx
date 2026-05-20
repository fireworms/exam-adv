'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

interface Props {
  mapping: Record<string, Record<string, number[]>>
}

export function ExamMappingClient({ mapping }: Props) {
  const [year, setYear] = useState('2025')
  const [examType, setExamType] = useState('지방직')
  const [questionNo, setQuestionNo] = useState('')

  const YEARS = ['2022', '2023', '2024', '2025', '2026']
  const EXAM_TYPES = ['국가직', '지방직']

  const keyToSearch = `${year}_${examType}`

  const results = questionNo
    ? Object.entries(mapping).filter(([, rounds]) => {
        const nums = rounds[keyToSearch] ?? []
        return nums.includes(Number(questionNo))
      })
    : []

  const allForRound = questionNo === ''
    ? Object.entries(mapping).map(([area, rounds]) => ({
        area,
        questions: rounds[keyToSearch] ?? [],
      })).filter(r => r.questions.length > 0)
    : []

  return (
    <div className="space-y-4">
      {/* 검색 폼 */}
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <p className="text-xs text-muted-foreground mb-1">연도</p>
          <div className="flex gap-1">
            {YEARS.map(y => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                  year === y ? 'bg-korean text-white' : 'border hover:bg-muted'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">직렬</p>
          <div className="flex gap-1">
            {EXAM_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setExamType(t)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  examType === t ? 'bg-korean text-white' : 'border hover:bg-muted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">문제 번호 (선택)</p>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={25}
              value={questionNo}
              onChange={e => setQuestionNo(e.target.value)}
              placeholder="1~25"
              className="w-24 px-3 py-1.5 text-sm rounded border bg-background"
            />
            {questionNo && (
              <button
                onClick={() => setQuestionNo('')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                초기화
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 결과 */}
      {questionNo ? (
        results.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {year} {examType} {questionNo}번 → 출제 영역:
            </p>
            {results.map(([area]) => (
              <Card key={area}>
                <CardContent className="py-2 px-4">
                  <p className="text-sm font-medium">{area.replace(/_/g, ' ')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {year} {examType} {questionNo}번에 대한 매핑 데이터가 없습니다.
          </p>
        )
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium">{year} {examType} 전체 매핑</p>
          {allForRound.length > 0 ? (
            allForRound.sort((a, b) => Math.min(...a.questions) - Math.min(...b.questions))
              .map(({ area, questions }) => (
                <div key={area} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                  <div className="flex gap-1 flex-wrap shrink-0">
                    {questions.map(q => (
                      <Badge key={q} variant="outline" className="text-xs">{q}번</Badge>
                    ))}
                  </div>
                  <span className="text-sm">{area.replace(/_/g, ' ')}</span>
                </div>
              ))
          ) : (
            <p className="text-sm text-muted-foreground">해당 회차 데이터가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  )
}
