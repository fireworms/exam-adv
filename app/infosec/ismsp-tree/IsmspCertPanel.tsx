'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { IsmspCertData } from './IsmspTreeClient'

interface Props { cert: IsmspCertData }

export function IsmspCertPanel({ cert }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
      >
        {open
          ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        }
        <span className="font-semibold text-sm flex-1">인증제도 · 심사원 자격 요건</span>
        <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600 px-1.5 py-0">
          기출 2022 국가직 20번
        </Badge>
      </button>

      {open && (
        <div className="border-t divide-y text-sm">

          {/* 유효기간 3년 법칙 */}
          <section className="p-4 space-y-2">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              유효기간 · 주기 (숫자 3 법칙)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="text-left pb-1.5 font-medium">구분</th>
                    <th className="text-left pb-1.5 font-medium">값</th>
                    <th className="text-left pb-1.5 font-medium">비고</th>
                    <th className="pb-1.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {cert.유효기간_3년_법칙.map(row => (
                    <tr key={row.항목} className={cn(row.exam_ref && 'bg-amber-50/60 dark:bg-amber-950/20')}>
                      <td className={cn('py-2 pr-3 font-medium', row.exam_ref && 'font-semibold text-amber-800 dark:text-amber-300')}>
                        {row.항목}
                      </td>
                      <td className="py-2 pr-3 font-mono font-bold">{row.값}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{row.비고}</td>
                      <td className="py-2">
                        {row.exam_ref && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 hover:bg-amber-500 whitespace-nowrap">
                            {row.exam_ref}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 심사 종류 */}
          <section className="p-4 space-y-2">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              심사 종류 (3가지)
            </h3>
            <div className="space-y-1.5">
              {cert.심사_종류.map((item, i) => (
                <div key={item.종류} className="flex gap-3 items-start">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-muted text-center text-[11px] font-bold leading-5">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-semibold">{item.종류}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{item.설명}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 심사원 등급 */}
          <section className="p-4 space-y-2">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              심사원 등급 (3단계)
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {cert.심사원_등급.map((grade, i) => (
                <div key={grade.등급} className="flex items-center gap-2">
                  <div className={cn(
                    'rounded-lg border px-3 py-2 text-xs space-y-0.5',
                    grade.exam_ref && 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/20'
                  )}>
                    <div className={cn('font-semibold', grade.exam_ref && 'text-amber-800 dark:text-amber-300')}>
                      {grade.등급}
                      {grade.exam_ref && (
                        <Badge className="ml-1.5 text-[9px] px-1 py-0 bg-amber-500 hover:bg-amber-500">
                          기출
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground max-w-[180px]">{grade.요건}</div>
                  </div>
                  {i < cert.심사원_등급.length - 1 && (
                    <span className="text-muted-foreground">→</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 응시 요건 */}
          <section className="p-4 space-y-2">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
              자격 검정 응시 요건
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '총 경력', value: cert.응시_요건.총_경력, color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' },
                { label: '정보보호 경력 (필수)', value: cert.응시_요건.필수_정보보호, color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' },
                { label: '개인정보보호 경력 (필수)', value: cert.응시_요건.필수_개인정보보호, color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' },
              ].map(item => (
                <div key={item.label} className={cn('rounded-lg border p-3 text-xs', item.color)}>
                  <div className="text-muted-foreground mb-1">{item.label}</div>
                  <div className="font-bold text-sm">{item.value}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
              💡 예시: {cert.응시_요건.예시}
            </p>
          </section>

          {/* 주요 함정 */}
          <section className="p-4 space-y-2">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              주요 함정 선지
            </h3>
            <ul className="space-y-1.5">
              {cert.주요_함정.map((trap, i) => (
                <li key={i} className="text-xs flex gap-2 items-start bg-red-50/60 dark:bg-red-950/20 rounded px-3 py-2">
                  <span className="text-red-500 font-bold shrink-0">✗</span>
                  <span>{trap}</span>
                </li>
              ))}
            </ul>
          </section>

        </div>
      )}
    </div>
  )
}
