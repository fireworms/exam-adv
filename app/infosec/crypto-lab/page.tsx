import { readFileSync } from 'fs'
import { resolve } from 'path'
import { CryptoLabClient } from './CryptoLabClient'

export default function CryptoLabPage() {
  const json = JSON.parse(readFileSync(resolve('data/infosec/요약노트_JSON.json'), 'utf-8'))
  const ae = json.algorithms_encryption as Record<string, unknown>

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">암호 알고리즘 실습실</h1>
      <CryptoLabClient encData={ae} />
    </div>
  )
}
