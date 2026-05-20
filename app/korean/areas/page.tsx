import { readFileSync } from 'fs'
import { resolve } from 'path'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Area {
  rank: number
  name: string
  frequency_per_round: string
  difficulty: string
  study_weight: number
}

const DIFFICULTY_COLOR: Record<string, string> = {
  '상': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  '중': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  '하': 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
}

export default function KoreanAreasPage() {
  const json = JSON.parse(readFileSync(resolve('data/korean/요약노트_JSON.json'), 'utf-8'))
  const areas = json.top_10_areas as Area[]
  const areaDetails = json.area_details as Record<string, unknown>
  const detailKeys = Object.keys(areaDetails)

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">국어 영역별 학습</h1>
      <p className="text-sm text-muted-foreground">출제 비중 순 TOP 10 영역</p>

      <div className="space-y-2">
        {areas.map((area, i) => {
          const detailKey = detailKeys[i]
          return (
            <Link
              key={area.rank}
              href={`/korean/areas/${encodeURIComponent(detailKey ?? area.name)}`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: '#E04B2A' }}
                    >
                      {area.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{area.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[area.difficulty] ?? ''}`}>
                          난이도 {area.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {area.frequency_per_round} · 학습비중 {area.study_weight}%
                      </p>
                    </div>
                    <div className="shrink-0">
                      <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${area.study_weight}%`, backgroundColor: '#E04B2A' }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
