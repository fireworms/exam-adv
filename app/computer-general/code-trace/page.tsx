import { readFileSync } from 'fs'
import { resolve } from 'path'
import { CodeTraceViewer } from './CodeTraceViewer'

type CodePattern = Record<string, unknown>

export interface TraceItem {
  title: string
  language: string
  code: string
  output?: string
  notes: string[]
}

const CODE_KEYS = ['C', 'Python', 'code', 'code_pattern']

// 항목별 코드·출력 보완 (데이터 파일에 없는 내용 직접 정의)
const OVERRIDES: Record<string, { code?: string; output?: string }> = {
  '포인터_배열': {
    code:
`int arr[] = {10, 20, 30, 40, 50};
int *p = arr;
printf("%d\\n", *(p+2));  // 배열 인덱스 표기와 동일
printf("%d\\n", p[2]);`,
    output:
`30
30`,
  },
  'swap_포인터': {
    code:
`void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}
int main() {
    int a = 3, b = 7;
    swap(&a, &b);
    printf("%d %d\\n", a, b);
}`,
    output: `7 3`,
  },
  '재귀_팩토리얼': {
    code:
`int fact(int n) {
    return n <= 1 ? 1 : n * fact(n - 1);
}
// fact(5) 호출 시 스택 흐름:`,
    output:
`fact(5) → 5 × fact(4)
         → 5 × 4 × fact(3)
         → 5 × 4 × 3 × fact(2)
         → 5 × 4 × 3 × 2 × fact(1)
         → 5 × 4 × 3 × 2 × 1
         = 120`,
  },
  '재귀_피보나치_DP': {
    code:
`int dp[100] = {0};
int fib(int n) {
    if (n <= 1) return n;
    if (dp[n]) return dp[n];
    return dp[n] = fib(n-1) + fib(n-2);
}
// fib(0) ~ fib(10)`,
    output:
`fib(0)= 0   fib(1)= 1   fib(2)= 1
fib(3)= 2   fib(4)= 3   fib(5)= 5
fib(6)= 8   fib(7)=13   fib(8)=21
fib(9)=34   fib(10)=55`,
  },
  '비트_연산': {
    code:
`int a = 0b1101;  // 13
int b = 0b1011;  // 11
printf("AND : %d\\n", a & b);
printf("OR  : %d\\n", a | b);
printf("XOR : %d\\n", a ^ b);
printf("NOT : %d\\n", ~a & 0xF);  // 4비트 마스크
printf("<<1 : %d\\n", a << 1);
printf(">>1 : %d\\n", a >> 1);`,
    output:
`AND :  9  (1001)
OR  : 15  (1111)
XOR :  6  (0110)
NOT :  2  (0010)  ← 4비트 반전
<<1 : 26  (11010)
>>1 :  6  (0110)`,
  },
  'Python_리스트_참조': {
    code:
`# trap_1: 같은 객체 참조 (y = x)
x = [1, 2, 3]
y = x
x.append(4)
print("trap_1:", y)   # y도 변경

# trap_2: 새 객체 생성 (x = x + [...])
x = [1, 2, 3]
y = x
x = x + [4]
print("trap_2:", y)   # y 영향 없음

# trap_3: in-place 수정 (x += [...])
x = [1, 2, 3]
y = x
x += [4]
print("trap_3:", y)   # append와 동일`,
    output:
`trap_1: [1, 2, 3, 4]  ← y도 같이 변경됨
trap_2: [1, 2, 3]     ← y는 영향 없음
trap_3: [1, 2, 3, 4]  ← y도 같이 변경됨`,
  },
  'Java_static': {
    code:
`class Counter {
    static int x = 10;
    static {
        x += 5;  // 클래스 로딩 시 1회 실행
    }
    public static void main(String[] args) {
        System.out.println(Counter.x);
        Counter c1 = new Counter();
        Counter c2 = new Counter();
        System.out.println(c1.x + " " + c2.x);
    }
}`,
    output:
`15
15 15   ← 모든 인스턴스가 같은 x 공유`,
  },
  '공식': {
    code:
`// 캐시 평균 접근 시간 (h=0.9, Tc=10ns, Tm=100ns)
T = h × Tc + (1-h) × (Tc + Tm)
  = 0.9×10 + 0.1×(10+100)

// 서브넷 호스트 수 (호스트 비트=8)
hosts = 2^8 - 2

// 순환 복잡도 (E=10 간선, N=8 노드)
V(G) = E - N + 2 = 10 - 8 + 2`,
    output:
`T = 9 + 11 = 20 ns
hosts = 256 - 2 = 254
V(G) = 4`,
  },
  'SQL_실행_순서': {
    code:
`SELECT dept, COUNT(*) AS cnt
FROM employees
WHERE salary > 3000
GROUP BY dept
HAVING COUNT(*) >= 2
ORDER BY cnt DESC;`,
    output:
`실행 순서:
1. FROM employees       → 전체 행 로드
2. WHERE salary > 3000  → 조건 행 필터
3. GROUP BY dept        → 부서별 그룹화
4. HAVING COUNT(*) >= 2 → 그룹 필터
5. SELECT dept, COUNT() → 컬럼 선택
6. ORDER BY cnt DESC    → 정렬`,
  },
  '후위_표기': {
    code:
`// 중위 → 후위 변환 예시
중위: A + B           후위: A B +
중위: A + B * C       후위: A B C * +
중위: (A + B) * C     후위: A B + C *
중위: A * B + C * D   후위: A B * C D * +`,
    output:
`규칙:
 · 피연산자 → 즉시 출력
 · 연산자   → 스택, 우선순위 낮은 것 pop 후 push
 · '('      → 스택 push
 · ')'      → '(' 나올 때까지 pop`,
  },
}

function detectLanguage(key: string, val: CodePattern): string {
  if (key.includes('Java')) return 'Java'
  if (key.includes('Python') || key.includes('리스트')) return 'Python'
  if (key.includes('SQL')) return 'SQL'
  if (val['code_pattern']) return 'Java'
  return 'C'
}

function formatNoteValue(v: unknown): string {
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.join(', ')
  if (typeof v === 'object' && v !== null)
    return Object.entries(v as Record<string, unknown>)
      .map(([k, iv]) => `${k}: ${iv}`)
      .join(' | ')
  return String(v)
}

export default function CodeTracePage() {
  const json = JSON.parse(readFileSync(resolve('data/computer_general/요약노트_JSON.json'), 'utf-8'))
  const patterns = json.code_patterns_formulas as Record<string, CodePattern | string>

  const items: TraceItem[] = Object.entries(patterns).map(([key, val]) => {
    const override = OVERRIDES[key] ?? {}

    if (typeof val === 'string') {
      return {
        title: key.replace(/_/g, ' '),
        language: 'SQL',
        code: override.code ?? val,
        output: override.output,
        notes: [],
      }
    }

    const codeKey = CODE_KEYS.find(k => typeof val[k] === 'string')
    const baseCode = codeKey ? String(val[codeKey]) : ''
    const lang = detectLanguage(key, val)
    const notes = Object.entries(val)
      .filter(([k]) => !CODE_KEYS.includes(k))
      .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${formatNoteValue(v)}`)

    return {
      title: key.replace(/_/g, ' '),
      language: lang,
      code: override.code ?? baseCode,
      output: override.output,
      notes,
    }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">코드 트레이싱 학습</h1>
      <p className="text-sm text-muted-foreground">
        코드를 보며 실행 흐름을 손으로 쫓는 연습
      </p>
      <CodeTraceViewer items={items} />
    </div>
  )
}
