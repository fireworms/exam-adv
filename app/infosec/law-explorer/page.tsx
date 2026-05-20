import { readFileSync } from 'fs'
import { resolve } from 'path'
import { LawExplorerClient } from './LawExplorerClient'

export default function LawExplorerPage() {
  const json = JSON.parse(readFileSync(resolve('data/infosec/요약노트_JSON.json'), 'utf-8'))
  const laws = json.laws_regulations as Record<string, unknown>
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">정보보호 법규 탐색기</h1>
      <LawExplorerClient laws={laws} />
    </div>
  )
}
