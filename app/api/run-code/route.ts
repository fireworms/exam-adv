import { NextResponse } from 'next/server'
import { getLanguage, type RunResult } from '@/lib/codeRunner'

const WANDBOX_URL = 'https://wandbox.org/api/compile.json'
const MAX_CODE_LEN = 20_000

interface WandboxResponse {
  status?: string
  compiler_error?: string
  compiler_output?: string
  program_output?: string
  program_error?: string
  program_message?: string
}

// Java: Wandbox 은 소스를 prog.java 로 저장하므로 public class 면 파일명 불일치 에러가 난다.
// public 한정자를 제거하면 컴파일 후 main 메서드를 가진 클래스를 자동 실행한다.
function preprocess(langId: string, code: string): string {
  if (langId === 'java') {
    return code.replace(/\bpublic\s+(?=(?:final\s+|abstract\s+)?(?:class|interface|enum)\b)/g, '')
  }
  return code
}

async function callWandbox(compiler: string, code: string, stdin: string) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 25_000)
  try {
    const res = await fetch(WANDBOX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compiler, code, stdin }),
      signal: ctrl.signal,
    })
    if (!res.ok) return { httpError: res.status } as const
    return { data: (await res.json()) as WandboxResponse } as const
  } finally {
    clearTimeout(timer)
  }
}

export async function POST(req: Request) {
  let body: { language?: string; code?: string; stdin?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const lang = getLanguage(String(body.language ?? ''))
  if (!lang) {
    return NextResponse.json({ error: '지원하지 않는 언어입니다.' }, { status: 400 })
  }

  const code = String(body.code ?? '')
  if (!code.trim()) {
    return NextResponse.json({ error: '실행할 코드가 비어 있습니다.' }, { status: 400 })
  }
  if (code.length > MAX_CODE_LEN) {
    return NextResponse.json({ error: '코드가 너무 깁니다 (최대 20,000자).' }, { status: 400 })
  }

  const processed = preprocess(lang.id, code)
  const stdin = String(body.stdin ?? '')

  // 컨테이너 리소스 일시 부족(OCI clone) 시 짧게 재시도
  let result: Awaited<ReturnType<typeof callWandbox>> | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      result = await callWandbox(lang.compiler, processed, stdin)
    } catch {
      return NextResponse.json({ error: '실행 서버에 연결하지 못했습니다.' }, { status: 502 })
    }
    if ('httpError' in result) {
      return NextResponse.json({ error: `실행 서버 오류 (${result.httpError})` }, { status: 502 })
    }
    const transient =
      result.data.status === '126' ||
      /temporarily unavailable|OCI runtime/i.test(result.data.program_error ?? '')
    if (!transient) break
    if (attempt < 2) await new Promise(r => setTimeout(r, 1500))
  }

  const d = (result && 'data' in result ? result.data : {}) as WandboxResponse
  const payload: RunResult = {
    ok: d.status === '0',
    compileError: d.compiler_error ?? '',
    stdout: d.program_output ?? '',
    stderr: d.program_error ?? '',
    status: d.status ?? '',
  }
  return NextResponse.json(payload)
}
