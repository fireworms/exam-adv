import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface AncientKingdom { kingdom: string; period: string; key_events: string[] }
interface King { king: string; period: string; achievements: string[] }
interface ModernEvent { year: number; event: string }

function parseYear(period: string): number {
  const m = period.match(/^(\?|기원전\s*\d+|\d{3,4})/)
  if (!m) return 0
  if (m[1] === '?') return -3000
  if (m[1].startsWith('기원전')) return -parseInt(m[1].replace(/[^0-9]/g, ''))
  return parseInt(m[1])
}

const ERA_COLORS: Record<string, string> = {
  ancient: '#7B5EA7',
  goryeo:  '#1A6FBF',
  joseon:  '#2E9E4F',
  modern:  '#D4820F',
}

export default function TimelinePage() {
  const json = JSON.parse(readFileSync(resolve('data/korean_history/요약노트_JSON.json'), 'utf-8'))
  const dc = json.dynasty_chronology as {
    ancient_kingdoms: AncientKingdom[]
    goryeo_kings: King[]
    joseon_kings: King[]
    modern_events: ModernEvent[]
  }

  const sections = [
    {
      label: '고대 왕조',
      color: ERA_COLORS.ancient,
      items: dc.ancient_kingdoms.map(k => ({
        title: k.kingdom,
        period: k.period,
        bullets: k.key_events,
      })),
    },
    {
      label: '고려 왕조',
      color: ERA_COLORS.goryeo,
      items: dc.goryeo_kings.map(k => ({
        title: k.king,
        period: k.period,
        bullets: k.achievements,
      })),
    },
    {
      label: '조선 왕조',
      color: ERA_COLORS.joseon,
      items: dc.joseon_kings.map(k => ({
        title: k.king,
        period: k.period,
        bullets: k.achievements,
      })),
    },
    {
      label: '근현대',
      color: ERA_COLORS.modern,
      items: dc.modern_events.map(ev => ({
        title: String(ev.year),
        period: `${ev.year}년`,
        bullets: [ev.event],
      })),
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-xl font-bold">한국사 연표</h1>

      {sections.map(section => (
        <section key={section.label}>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-bold mb-4"
            style={{ backgroundColor: section.color }}
          >
            {section.label}
          </div>

          <div className="relative pl-6 border-l-2" style={{ borderColor: section.color }}>
            {section.items.map((item, i) => (
              <div key={i} className="mb-4 relative">
                {/* 타임라인 점 */}
                <span
                  className="absolute -left-[1.45rem] top-1.5 w-3 h-3 rounded-full border-2 border-background"
                  style={{ backgroundColor: section.color }}
                />
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm">{item.title}</span>
                      <Badge variant="outline" className="text-xs">{item.period}</Badge>
                    </div>
                    <ul className="space-y-0.5">
                      {item.bullets.map((b, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                          <span className="mt-1 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
