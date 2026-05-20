import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AlgorithmsPage() {
  const json = JSON.parse(readFileSync(resolve('data/computer_general/요약노트_JSON.json'), 'utf-8'))
  const alg = json.algorithms_data_structures as Record<string, unknown>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">알고리즘·자료구조 도감</h1>

      {Object.entries(alg).map(([category, data]) => (
        <section key={category}>
          <h2 className="text-base font-semibold mb-3 capitalize">
            {category.replace(/_/g, ' ')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {renderAlgCategory(data)}
          </div>
        </section>
      ))}
    </div>
  )
}

function renderAlgCategory(data: unknown): React.ReactNode {
  if (typeof data !== 'object' || data === null) {
    return (
      <Card>
        <CardContent className="py-3 px-4 text-sm">{String(data)}</CardContent>
      </Card>
    )
  }

  return Object.entries(data as Record<string, unknown>).map(([key, val]) => (
    <Card key={key} className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{key.replace(/_/g, ' ')}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground space-y-1">
        {typeof val === 'object' && val !== null
          ? Object.entries(val as Record<string, unknown>).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="font-medium text-foreground shrink-0">{k}:</span>
                <span>{typeof v === 'object' ? JSON.stringify(v, null, 0).slice(0, 120) : String(v)}</span>
              </div>
            ))
          : <span>{String(val)}</span>
        }
      </CardContent>
    </Card>
  ))
}
