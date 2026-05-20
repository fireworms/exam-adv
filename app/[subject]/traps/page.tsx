import { notFound } from 'next/navigation'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { AlertTriangle } from 'lucide-react'
import { SUBJECT_KEYS, SUBJECT_META, type SubjectKey } from '@/lib/utils'
import { TrapCard } from '@/components/common/TrapCard'
import { normalizeTrapData } from '@/lib/traps'

const DIR_MAP: Record<SubjectKey, string> = {
  'korean':           'korean',
  'english':          'english',
  'korean-history':   'korean_history',
  'computer-general': 'computer_general',
  'infosec':          'infosec',
}

interface Props {
  params: Promise<{ subject: string }>
}

export default async function TrapsPage({ params }: Props) {
  const { subject } = await params
  if (!SUBJECT_KEYS.includes(subject as SubjectKey)) notFound()

  const meta = SUBJECT_META[subject as SubjectKey]
  const dir = DIR_MAP[subject as SubjectKey]
  const filePath = resolve(`data/${dir}/요약노트_JSON.json`)

  if (!existsSync(filePath)) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-bold mb-4">{meta.label} 함정 패턴</h1>
        <p className="text-muted-foreground">데이터 파일을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const json = JSON.parse(readFileSync(filePath, 'utf-8'))
  const traps = normalizeTrapData(subject, json)

  const understood = 0
  const total = traps.length

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" style={{ color: meta.color }} />
          <h1 className="text-xl font-bold">{meta.label} 함정 패턴 TOP {total}</h1>
        </div>
        <span className="text-sm text-muted-foreground">{understood}/{total} 완료</span>
      </div>

      {/* 진도 바 */}
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${total ? (understood / total) * 100 : 0}%`, backgroundColor: meta.color }}
        />
      </div>

      {traps.length === 0 ? (
        <p className="text-muted-foreground text-sm">함정 패턴 데이터가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {traps.map(trap => (
            <TrapCard key={trap.rank} trap={trap} accentColor={meta.color} />
          ))}
        </div>
      )}
    </div>
  )
}
