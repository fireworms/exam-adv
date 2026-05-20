import { readFileSync } from 'fs'
import { resolve } from 'path'
import { ChecklistClient } from './ChecklistClient'

export default function ChecklistPage() {
  const json = JSON.parse(readFileSync(resolve('data/korean/요약노트_JSON.json'), 'utf-8'))
  const checklist = json.final_checklist as {
    one_week_before: string[]
    day_before: { must_remember: string[]; exam_strategy: string[] }
  }
  const motto = json.final_motto as string

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">국어 시험 직전 체크리스트</h1>
      {motto && (
        <div className="rounded-lg bg-korean/10 border border-korean/20 px-4 py-3">
          <p className="text-sm text-korean font-medium">📌 {motto}</p>
        </div>
      )}
      <ChecklistClient checklist={checklist} />
    </div>
  )
}
