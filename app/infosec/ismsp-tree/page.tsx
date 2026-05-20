import { readFileSync } from 'fs'
import { resolve } from 'path'
import { IsmspTreeClient } from './IsmspTreeClient'

export default function IsmspTreePage() {
  const json = JSON.parse(readFileSync(resolve('data/infosec/요약노트_JSON.json'), 'utf-8'))
  const ismsp = (json.laws_regulations as Record<string, unknown>)['ISMS-P']
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">ISMS-P 인증체계 트리</h1>
      <IsmspTreeClient data={ismsp as Record<string, unknown>} />
    </div>
  )
}
