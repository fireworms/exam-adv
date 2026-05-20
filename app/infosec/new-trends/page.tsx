import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function NewTrendsPage() {
  const json = JSON.parse(readFileSync(resolve('data/infosec/요약노트_JSON.json'), 'utf-8'))
  const trends = json.new_trends_2026 as Record<string, unknown>

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">2026 신유형</h1>
        <Badge style={{ backgroundColor: '#D4820F' }} className="text-white">NEW</Badge>
      </div>
      <p className="text-sm text-muted-foreground">제로트러스트·PQC·AI 보안 등 2026년 출제 가능 신유형</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(trends).map(([key, val]) => (
          <Card key={key} className="hover:shadow-sm transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-infosec">◆</span>
                {key.replace(/_/g, ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {typeof val === 'object' && val !== null
                ? Object.entries(val as Record<string, unknown>).map(([k, v]) => (
                    <div key={k} className="text-xs mb-1">
                      <span className="font-medium">{k}: </span>
                      <span className="text-muted-foreground">
                        {Array.isArray(v) ? v.join(', ') : String(v)}
                      </span>
                    </div>
                  ))
                : <p className="text-xs text-muted-foreground">{String(val)}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
