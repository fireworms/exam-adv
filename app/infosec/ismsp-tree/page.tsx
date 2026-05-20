import { readFileSync } from 'fs'
import { resolve } from 'path'
import { IsmspTreeClient } from './IsmspTreeClient'
import type { IsmspArea } from './IsmspTreeClient'

export default function IsmspTreePage() {
  const json = JSON.parse(readFileSync(resolve('data/infosec/요약노트_JSON.json'), 'utf-8'))
  const tree = (json.laws_regulations['ISMS-P']['인증기준']) as Record<string, IsmspArea>

  const totalItems = Object.values(tree).reduce((sum, area) =>
    sum + Object.values(area).reduce((s, items) => s + items.length, 0), 0)

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-baseline gap-3">
        <h1 className="text-xl font-bold">ISMS-P 인증기준 트리</h1>
        <span className="text-sm text-muted-foreground">총 {totalItems}개 항목</span>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
          기출 출제 항목
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full border border-green-500 text-green-500 text-[9px] flex items-center justify-center">✓</span>
          학습 완료
        </span>
      </div>
      <IsmspTreeClient tree={tree} />
    </div>
  )
}
