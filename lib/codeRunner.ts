// 웹 코드 실행기 공통 모듈
// 실행 백엔드: Wandbox 공개 API (무료·키 불필요). 서버 라우트 /api/run-code 가 프록시한다.

export type RunLangId = 'c' | 'cpp' | 'java' | 'python'

export interface RunLanguage {
  id: RunLangId
  label: string
  /** Wandbox 컴파일러 식별자 */
  compiler: string
  /** UI 표시용 버전 */
  version: string
  /** 빈 에디터 기본 예제 */
  template: string
}

export const RUN_LANGUAGES: RunLanguage[] = [
  {
    id: 'c',
    label: 'C',
    compiler: 'gcc-13.2.0-c',
    version: 'GCC 13.2',
    template: `#include <stdio.h>

int main(void) {
    printf("Hello, C\\n");
    return 0;
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    compiler: 'gcc-13.2.0',
    version: 'GCC 13.2',
    template: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, C++" << endl;
    return 0;
}`,
  },
  {
    id: 'java',
    label: 'Java',
    compiler: 'openjdk-jdk-21+35',
    version: 'OpenJDK 21',
    template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java");
    }
}`,
  },
  {
    id: 'python',
    label: 'Python',
    compiler: 'cpython-3.13.8',
    version: 'Python 3.13',
    template: `print("Hello, Python")`,
  },
]

export function getLanguage(id: string): RunLanguage | undefined {
  return RUN_LANGUAGES.find(l => l.id === id)
}

/** 코드 트레이싱 예제의 language 라벨 → 실행기 언어 id */
export function traceLangToRunId(language: string): RunLangId | null {
  switch (language) {
    case 'C':
      return 'c'
    case 'C++':
      return 'cpp'
    case 'Java':
      return 'java'
    case 'Python':
      return 'python'
    default:
      return null // SQL 등 실행 불가
  }
}

export interface RunResult {
  ok: boolean
  /** 컴파일 단계 에러 (있으면 실행 안 됨) */
  compileError: string
  /** 프로그램 표준출력 */
  stdout: string
  /** 프로그램 표준에러 */
  stderr: string
  /** 종료/상태 코드 문자열 */
  status: string
  /** 사용자에게 보여줄 에러 메시지 (네트워크 등) */
  error?: string
}

/** 클라이언트에서 호출하는 실행 헬퍼 */
export async function runCode(
  language: RunLangId,
  code: string,
  stdin = '',
): Promise<RunResult> {
  try {
    const res = await fetch('/api/run-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, code, stdin }),
    })
    const data = await res.json()
    if (!res.ok) {
      return {
        ok: false,
        compileError: '',
        stdout: '',
        stderr: '',
        status: '',
        error: data?.error ?? '실행 서버 오류',
      }
    }
    return data as RunResult
  } catch {
    return {
      ok: false,
      compileError: '',
      stdout: '',
      stderr: '',
      status: '',
      error: '네트워크 오류로 실행에 실패했습니다.',
    }
  }
}
