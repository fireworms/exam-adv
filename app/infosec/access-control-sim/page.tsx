'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MiniQuizShell } from '@/components/common/MiniQuizShell'

type Level = 'U' | 'C' | 'S' | 'TS'
type Operation = 'read' | 'write'
type Model = 'BLP' | 'Biba'

const LEVELS: Level[] = ['U', 'C', 'S', 'TS']
const LEVEL_LABELS: Record<Level, string> = {
  U: '비분류(U)', C: '기밀(C)', S: '비밀(S)', TS: '극비(TS)',
}
const LEVEL_ORDER: Record<Level, number> = { U: 0, C: 1, S: 2, TS: 3 }

function judge(model: Model, subjLevel: Level, objLevel: Level, op: Operation): { allow: boolean; reason: string } {
  const sOrd = LEVEL_ORDER[subjLevel], oOrd = LEVEL_ORDER[objLevel]

  if (model === 'BLP') {
    if (op === 'read') {
      const allow = sOrd >= oOrd
      return { allow, reason: allow
        ? `BLP No Read Up 통과: 주체(${subjLevel}) ≥ 객체(${objLevel})`
        : `BLP No Read Up 위반: 주체(${subjLevel}) < 객체(${objLevel}) — 상위 등급 읽기 불가` }
    } else {
      const allow = sOrd <= oOrd
      return { allow, reason: allow
        ? `BLP No Write Down 통과: 주체(${subjLevel}) ≤ 객체(${objLevel})`
        : `BLP No Write Down 위반: 주체(${subjLevel}) > 객체(${objLevel}) — 하위 등급 쓰기 불가` }
    }
  } else { // Biba
    if (op === 'read') {
      const allow = sOrd <= oOrd
      return { allow, reason: allow
        ? `Biba No Read Down 통과: 주체(${subjLevel}) ≤ 객체(${objLevel})`
        : `Biba No Read Down 위반: 주체(${subjLevel}) > 객체(${objLevel}) — 하위 등급 읽기 불가` }
    } else {
      const allow = sOrd >= oOrd
      return { allow, reason: allow
        ? `Biba No Write Up 통과: 주체(${subjLevel}) ≥ 객체(${objLevel})`
        : `Biba No Write Up 위반: 주체(${subjLevel}) < 객체(${objLevel}) — 상위 등급 쓰기 불가` }
    }
  }
}

export default function AccessControlSimPage() {
  const [model, setModel] = useState<Model>('BLP')
  const [subjLevel, setSubjLevel] = useState<Level>('C')
  const [objLevel, setObjLevel] = useState<Level>('TS')
  const [op, setOp] = useState<Operation>('read')
  const [result, setResult] = useState<{ allow: boolean; reason: string } | null>(null)

  const MODEL_INFO = {
    BLP:  { focus: '기밀성', color: '#1A6FBF', rules: ['No Read Up (읽기: 주체 ≥ 객체)', 'No Write Down (쓰기: 주체 ≤ 객체)'] },
    Biba: { focus: '무결성', color: '#7B5EA7', rules: ['No Read Down (읽기: 주체 ≤ 객체)', 'No Write Up (쓰기: 주체 ≥ 객체)'] },
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">접근통제 시뮬레이터</h1>

      {/* 모델 정보 */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(MODEL_INFO).map(([m, info]) => (
          <Card
            key={m}
            className={`cursor-pointer transition-shadow ${model === m ? 'ring-2' : ''}`}
            style={model === m ? { outline: `2px solid ${info.color}` } : undefined}
            onClick={() => { setModel(m as Model); setResult(null) }}
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">{m}</span>
                <Badge variant="outline" className="text-xs">{info.focus}</Badge>
              </div>
              {info.rules.map(r => (
                <p key={r} className="text-xs text-muted-foreground">{r}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 설정 */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">판정 조건 설정</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: '주체(Subject) 보안 등급', val: subjLevel, setter: setSubjLevel },
            { label: '객체(Object) 보안 등급',  val: objLevel,  setter: setObjLevel },
          ].map(({ label, val, setter }) => (
            <div key={label}>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
              <div className="flex gap-2">
                {LEVELS.map(lv => (
                  <button
                    key={lv}
                    onClick={() => { setter(lv as Level); setResult(null) }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      val === lv ? 'text-white' : 'border hover:bg-muted'
                    }`}
                    style={val === lv ? { backgroundColor: MODEL_INFO[model].color } : undefined}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">작업 유형</p>
            <div className="flex gap-2">
              {(['read', 'write'] as const).map(o => (
                <button
                  key={o}
                  onClick={() => { setOp(o); setResult(null) }}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    op === o ? 'text-white' : 'border hover:bg-muted'
                  }`}
                  style={op === o ? { backgroundColor: MODEL_INFO[model].color } : undefined}
                >
                  {o === 'read' ? '읽기 (Read)' : '쓰기 (Write)'}
                </button>
              ))}
            </div>
          </div>

          <MiniQuizShell quizType="access_control_judge" subject="정보보호론" itemKey={`${model}_${subjLevel}_${objLevel}_${op}`}>
            {({ onSubmit }) => (
              <Button
                onClick={() => {
                  const r = judge(model, subjLevel, objLevel, op)
                  setResult(r)
                  onSubmit(true) // 시뮬레이션은 항상 "정답" 처리
                }}
                className="w-full"
                style={{ backgroundColor: MODEL_INFO[model].color }}
              >
                판정하기
              </Button>
            )}
          </MiniQuizShell>
        </CardContent>
      </Card>

      {/* 결과 */}
      {result && (
        <Card className={result.allow
          ? 'border-green-400 bg-green-50 dark:bg-green-950/30'
          : 'border-red-400 bg-red-50 dark:bg-red-950/30'}>
          <CardContent className="py-4 px-4 space-y-2">
            <div className="flex items-center gap-2 text-lg font-bold">
              <span>{result.allow ? '✅ 허용' : '❌ 거부'}</span>
            </div>
            <p className="text-sm text-muted-foreground">{result.reason}</p>
            <div className="text-xs text-muted-foreground pt-1">
              {model === 'BLP'
                ? '💡 BLP: 기밀성 보호 — 높은 보안등급 정보의 하향 유출을 차단'
                : '💡 Biba: 무결성 보호 — 낮은 무결성 정보로 인한 오염을 차단'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
