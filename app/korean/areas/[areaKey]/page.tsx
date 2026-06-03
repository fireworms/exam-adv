import { readFileSync } from 'fs'
import { resolve } from 'path'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { areaFieldLabel } from '@/lib/koreanAreaLabels'

interface Props {
  params: Promise<{ areaKey: string }>
}

export default async function AreaDetailPage({ params }: Props) {
  const { areaKey } = await params
  const key = decodeURIComponent(areaKey)

  const json = JSON.parse(readFileSync(resolve('data/korean/요약노트_JSON.json'), 'utf-8'))
  const details = json.area_details as Record<string, Record<string, unknown>>

  const detail = details[key]
  if (!detail) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/korean/areas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> 영역 목록
      </Link>

      <h1 className="text-xl font-bold">{String(detail.name ?? key)}</h1>

      {Object.entries(detail).map(([k, v]) => {
        if (k === 'name') return null
        return (
          <Card key={k}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{areaFieldLabel(k)}</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(v) ? (
                <ul className="space-y-1.5">
                  {(v as unknown[]).map((item, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      {typeof item === 'object' ? (
                        <div className="space-y-0.5">
                          {Object.entries(item as Record<string, unknown>).map(([ik, iv]) => (
                            <div key={ik} className="text-xs">
                              <span className="font-medium">{areaFieldLabel(ik)}: </span>
                              <span className="text-muted-foreground">
                                {Array.isArray(iv) ? (iv as string[]).join(' · ') : String(iv)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-korean shrink-0" />
                          <span>{String(item)}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : typeof v === 'object' && v !== null ? (
                <div className="space-y-1">
                  {Object.entries(v as Record<string, unknown>).map(([ik, iv]) => (
                    <div key={ik} className="text-sm">
                      <span className="font-medium">{areaFieldLabel(ik)}: </span>
                      <span className="text-muted-foreground">
                        {Array.isArray(iv) ? (iv as string[]).join(', ') : String(iv)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{String(v)}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
