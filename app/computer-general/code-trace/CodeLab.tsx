'use client'

import { useRef } from 'react'
import { CodeTraceViewer } from './CodeTraceViewer'
import { CodeRunner, type CodeRunnerHandle } from '@/components/computer-general/CodeRunner'
import { traceLangToRunId } from '@/lib/codeRunner'
import type { TraceItem } from './page'

export function CodeLab({ items }: { items: TraceItem[] }) {
  const runnerRef = useRef<CodeRunnerHandle>(null)

  function sendToRunner(item: TraceItem) {
    const langId = traceLangToRunId(item.language)
    if (!langId) return
    runnerRef.current?.load(langId, item.code)
  }

  return (
    <div className="space-y-6">
      <CodeTraceViewer items={items} onSend={sendToRunner} />

      <div className="space-y-2 pt-2 border-t">
        <div>
          <h2 className="text-lg font-bold">웹 코드 실행기</h2>
          <p className="text-sm text-muted-foreground">
            C · C++ · Java · Python 코드를 바로 실행해 결과를 검증해 보세요. 위 예제의 “실행기로
            보내기”를 누르면 코드가 자동으로 채워집니다.
          </p>
        </div>
        <CodeRunner ref={runnerRef} title="실행기" />
      </div>
    </div>
  )
}
