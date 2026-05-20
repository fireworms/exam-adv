import { readFileSync } from 'fs'
import { resolve } from 'path'
import { ExamMappingClient } from './ExamMappingClient'

export default function ExamMappingPage() {
  const json = JSON.parse(readFileSync(resolve('data/korean/요약노트_JSON.json'), 'utf-8'))
  const mapping = json.exam_round_mapping as {
    description: string
    mapping: Record<string, Record<string, number[]>>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">회차 매핑 검색</h1>
      <p className="text-sm text-muted-foreground">{mapping.description}</p>
      <ExamMappingClient mapping={mapping.mapping} />
    </div>
  )
}
