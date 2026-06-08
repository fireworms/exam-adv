'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  RUN_LANGUAGES,
  getLanguage,
  runCode,
  type RunLangId,
  type RunResult,
} from '@/lib/codeRunner'

export interface CodeRunnerHandle {
  /** 외부(코드 트레이싱 등)에서 코드를 실행기로 불러온다 */
  load: (lang: RunLangId, code: string) => void
}

export const CodeRunner = forwardRef<CodeRunnerHandle, { title?: string }>(
  function CodeRunner({ title = '웹 코드 실행기' }, ref) {
    const [lang, setLang] = useState<RunLangId>('c')
    // 언어별로 코드를 독립 보관 (언어 전환 시 각자 코드 유지)
    const [codeByLang, setCodeByLang] = useState<Record<RunLangId, string>>(
      () =>
        Object.fromEntries(
          RUN_LANGUAGES.map(l => [l.id, l.template]),
        ) as Record<RunLangId, string>,
    )
    const code = codeByLang[lang]
    const setCode = (next: string) =>
      setCodeByLang(prev => ({ ...prev, [lang]: next }))
    const [stdin, setStdin] = useState('')
    const [running, setRunning] = useState(false)
    const [result, setResult] = useState<RunResult | null>(null)
    const taRef = useRef<HTMLTextAreaElement>(null)

    function pickLang(id: RunLangId) {
      setLang(id)
      setResult(null)
    }

    useImperativeHandle(ref, () => ({
      load(nextLang, nextCode) {
        setLang(nextLang)
        setCodeByLang(prev => ({ ...prev, [nextLang]: nextCode }))
        setResult(null)
        // 실행기로 스크롤
        requestAnimationFrame(() => {
          taRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          taRef.current?.focus()
        })
      },
    }))

    async function handleRun() {
      setRunning(true)
      setResult(null)
      const r = await runCode(lang, code, stdin)
      setResult(r)
      setRunning(false)
    }

    // 탭 키로 들여쓰기 (포커스 이동 대신 4칸 삽입)
    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === 'Tab') {
        e.preventDefault()
        const el = e.currentTarget
        const start = el.selectionStart
        const end = el.selectionEnd
        const next = code.slice(0, start) + '    ' + code.slice(end)
        setCode(next)
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + 4
        })
      }
      // Ctrl/Cmd + Enter 로 실행
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        if (!running) handleRun()
      }
    }

    const meta = getLanguage(lang)!

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 flex-wrap">
            {title}
            <Badge variant="outline" className="font-normal">
              {meta.version}
            </Badge>
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              Ctrl/⌘ + Enter 실행
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 언어 선택 */}
          <div className="flex flex-wrap gap-2">
            {RUN_LANGUAGES.map(l => (
              <Button
                key={l.id}
                size="sm"
                variant={lang === l.id ? 'default' : 'outline'}
                onClick={() => pickLang(l.id)}
                style={lang === l.id ? { backgroundColor: '#2E9E4F' } : undefined}
              >
                {l.label}
              </Button>
            ))}
          </div>

          {/* 코드 에디터 */}
          <textarea
            ref={taRef}
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            rows={14}
            className="w-full font-mono text-xs leading-relaxed bg-muted rounded p-3
                       border border-border resize-y focus:outline-none focus:ring-2
                       focus:ring-computer/40 whitespace-pre overflow-auto"
          />

          {/* 표준 입력 */}
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground select-none">
              표준 입력 (stdin) {stdin && `· ${stdin.split('\n').length}줄`}
            </summary>
            <textarea
              value={stdin}
              onChange={e => setStdin(e.target.value)}
              placeholder="프로그램에 전달할 입력값 (예: scanf / input() 용)"
              rows={3}
              className="mt-2 w-full font-mono text-xs bg-muted rounded p-2 border border-border
                         resize-y focus:outline-none focus:ring-2 focus:ring-computer/40"
            />
          </details>

          {/* 실행 버튼 */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRun}
              disabled={running}
              style={{ backgroundColor: '#2E9E4F' }}
              className="text-white"
            >
              {running ? '실행 중…' : '▶ 실행'}
            </Button>
            {result && (
              <Badge
                variant="outline"
                className={
                  result.ok
                    ? 'text-green-700 dark:text-green-400 border-green-400'
                    : 'text-red-700 dark:text-red-400 border-red-400'
                }
              >
                {result.error
                  ? '오류'
                  : result.compileError
                    ? '컴파일 에러'
                    : result.ok
                      ? '정상 종료'
                      : `종료 코드 ${result.status}`}
              </Badge>
            )}
          </div>

          {/* 결과 출력 */}
          {result && (
            <div className="space-y-2">
              {result.error && (
                <pre className="text-xs rounded p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 whitespace-pre-wrap">
                  {result.error}
                </pre>
              )}
              {result.compileError && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">컴파일 메시지</p>
                  <pre className="text-xs rounded p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 whitespace-pre-wrap overflow-x-auto">
                    {result.compileError}
                  </pre>
                </div>
              )}
              {(result.stdout || (!result.error && !result.compileError)) && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">▶ 실행 결과</p>
                  <pre className="text-xs rounded p-3 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-300 whitespace-pre-wrap overflow-x-auto min-h-[2.5rem]">
                    {result.stdout || '(출력 없음)'}
                  </pre>
                </div>
              )}
              {result.stderr && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">표준 에러</p>
                  <pre className="text-xs rounded p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 whitespace-pre-wrap overflow-x-auto">
                    {result.stderr}
                  </pre>
                </div>
              )}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            실행은 외부 공개 컴파일 서비스(Wandbox)를 통해 처리됩니다. 코드가 서버로 전송되니 민감 정보는 넣지 마세요.
          </p>
        </CardContent>
      </Card>
    )
  },
)
