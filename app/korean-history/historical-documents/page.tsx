import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Document {
  name: string
  year?: number
  era?: string
  author?: string
  country?: string
  feature: string
}

interface DocumentGroups {
  historical_records_역사서: Document[]
  legal_codes_법전: Document[]
  treaties_조약: Document[]
  manifestos_선언서_강령: Document[]
}

const CATEGORY_LABELS: Record<string, string> = {
  historical_records_역사서: '역사서',
  legal_codes_법전:          '법전',
  treaties_조약:             '조약',
  manifestos_선언서_강령:    '선언서·강령',
}

const CATEGORY_COLORS: Record<string, string> = {
  historical_records_역사서: '#7B5EA7',
  legal_codes_법전:          '#1A6FBF',
  treaties_조약:             '#D4820F',
  manifestos_선언서_강령:    '#2E9E4F',
}

export default function HistoricalDocumentsPage() {
  const json = JSON.parse(readFileSync(resolve('data/korean_history/요약노트_JSON.json'), 'utf-8'))
  const groups = json.key_documents as DocumentGroups

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-xl font-bold">한국사 사료 모음</h1>

      {Object.entries(groups).map(([cat, docs]) => (
        <section key={cat}>
          <div
            className="inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-bold mb-3"
            style={{ backgroundColor: CATEGORY_COLORS[cat] }}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(docs as Document[]).map((doc, i) => (
              <Card key={i} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-3 px-4">
                  <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
                    <span className="font-semibold text-sm">{doc.name}</span>
                    {doc.year && (
                      <Badge variant="outline" className="text-xs">{doc.year}년</Badge>
                    )}
                    {doc.era && !doc.year && (
                      <Badge variant="outline" className="text-xs">{doc.era}</Badge>
                    )}
                    {doc.author && (
                      <span className="text-xs text-muted-foreground">저자: {doc.author}</span>
                    )}
                    {doc.country && (
                      <span className="text-xs text-muted-foreground">상대국: {doc.country}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{doc.feature}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
