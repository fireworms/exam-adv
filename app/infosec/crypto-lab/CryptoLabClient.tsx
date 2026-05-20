'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Tab = 'overview' | 'rsa' | 'dh' | 'hash'

interface Props { encData: Record<string, unknown> }

export function CryptoLabClient({ encData }: Props) {
  const [tab, setTab] = useState<Tab>('overview')

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: '개요' },
    { key: 'rsa',      label: 'RSA 계산기' },
    { key: 'dh',       label: 'DH 키 교환' },
    { key: 'hash',     label: '해시 비교' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <Button
            key={t.key}
            size="sm"
            variant={tab === t.key ? 'default' : 'outline'}
            onClick={() => setTab(t.key)}
            style={tab === t.key ? { backgroundColor: '#D4820F' } : undefined}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === 'overview' && <CryptoOverview data={encData} />}
      {tab === 'rsa'      && <RsaCalculator />}
      {tab === 'dh'       && <DhSimulator />}
      {tab === 'hash'     && <HashComparison />}
    </div>
  )
}

/* ── Overview ── */
function CryptoOverview({ data }: { data: Record<string, unknown> }) {
  const CATEGORY_LABELS: Record<string, string> = {
    대칭블록: '대칭키 블록 암호',
    대칭스트림: '대칭키 스트림 암호',
    비대칭: '비대칭키 암호',
    해시: '해시 함수',
    운영모드: '운영 모드',
    AES라운드: 'AES 라운드',
  }

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([cat, val]) => (
        <Card key={cat}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{CATEGORY_LABELS[cat] ?? cat}</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(val) ? (
              <div className="flex flex-wrap gap-2">
                {(val as string[]).map(item => (
                  <Badge key={item} variant="secondary" className="font-mono text-xs">{item}</Badge>
                ))}
              </div>
            ) : typeof val === 'object' && val !== null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(val as Record<string, unknown>).map(([k, v]) => (
                  <div key={k} className="rounded bg-muted px-3 py-2 text-xs">
                    <span className="font-semibold text-infosec">{k}</span>
                    <span className="text-muted-foreground ml-2">
                      {typeof v === 'object'
                        ? Object.entries(v as Record<string, unknown>)
                            .map(([ek, ev]) => `${ek}: ${Array.isArray(ev) ? ev.join(', ') : ev}`)
                            .join(' | ')
                        : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm">{String(val)}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* ── RSA Calculator ── */
function RsaCalculator() {
  const [p, setP] = useState('61')
  const [q, setQ] = useState('53')
  const [result, setResult] = useState<null | Record<string, string>>(null)
  const [error, setError] = useState('')

  function modInverse(a: bigint, m: bigint): bigint | null {
    let [old_r, r] = [a, m]
    let [old_s, s] = [1n, 0n]
    while (r !== 0n) {
      const q = old_r / r;
      [old_r, r] = [r, old_r - q * r];
      [old_s, s] = [s, old_s - q * s]
    }
    if (old_r !== 1n) return null
    return ((old_s % m) + m) % m
  }

  function gcd(a: bigint, b: bigint): bigint { return b === 0n ? a : gcd(b, a % b) }

  const calculate = () => {
    setError('')
    try {
      const bp = BigInt(p), bq = BigInt(q)
      if (bp < 2n || bq < 2n) { setError('p, q는 2 이상의 정수여야 합니다'); return }
      const n = bp * bq
      const phi = (bp - 1n) * (bq - 1n)
      // e 자동 선택: phi와 서로소인 가장 작은 e > 1
      let e = 2n
      while (e < phi && gcd(e, phi) !== 1n) e++
      const d = modInverse(e, phi)
      if (!d) { setError('d 계산 실패 — 다른 p, q 값을 시도하세요'); return }
      setResult({
        n: String(n),
        φn: String(phi),
        e: String(e),
        d: String(d),
        공개키: `(e=${e}, n=${n})`,
        개인키: `(d=${d}, n=${n})`,
      })
    } catch { setError('입력값을 확인하세요 (정수만 입력)') }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">RSA 계산기</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[['소수 p', p, setP], ['소수 q', q, setQ]].map(([label, val, setter]) => (
            <div key={String(label)}>
              <label className="text-xs font-medium text-muted-foreground">{String(label)}</label>
              <input
                type="number"
                value={String(val)}
                onChange={e => (setter as (v: string) => void)(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-md border bg-background font-mono"
              />
            </div>
          ))}
        </div>

        <Button onClick={calculate} style={{ backgroundColor: '#D4820F' }}>계산하기</Button>
        {error && <p className="text-sm text-red-600">{error}</p>}

        {result && (
          <div className="space-y-2">
            {Object.entries(result).map(([k, v]) => (
              <div key={k} className="flex gap-3 text-sm items-baseline">
                <span className="font-mono font-semibold text-infosec w-20 shrink-0">{k} =</span>
                <span className="font-mono break-all">{v}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              💡 시험 포인트: e·d ≡ 1 (mod φ(n)), 공개키로 암호화 → 개인키로 복호화
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ── DH Simulator ── */
function DhSimulator() {
  const [p, setP] = useState('23')
  const [g, setG] = useState('5')
  const [a, setA] = useState('6')
  const [b, setB] = useState('15')
  const [result, setResult] = useState<null | Record<string, string>>(null)

  function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let result = 1n
    base = base % mod
    while (exp > 0n) {
      if (exp % 2n === 1n) result = (result * base) % mod
      exp = exp / 2n
      base = (base * base) % mod
    }
    return result
  }

  const calculate = () => {
    try {
      const bp = BigInt(p), bg = BigInt(g), ba = BigInt(a), bb = BigInt(b)
      const A = modPow(bg, ba, bp)
      const B = modPow(bg, bb, bp)
      const Ka = modPow(B, ba, bp)
      const Kb = modPow(A, bb, bp)
      setResult({
        'Alice 공개값 A': `${bg}^${ba} mod ${bp} = ${A}`,
        'Bob 공개값 B':   `${bg}^${bb} mod ${bp} = ${B}`,
        'Alice 공유 비밀': `${B}^${ba} mod ${bp} = ${Ka}`,
        'Bob 공유 비밀':   `${A}^${bb} mod ${bp} = ${Kb}`,
        '검증': Ka === Kb ? `✅ 일치 (${Ka})` : '❌ 불일치',
      })
    } catch { /* 무시 */ }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Diffie-Hellman 키 교환 시뮬레이션</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {([['소수 p', p, setP], ['원시근 g', g, setG], ['Alice 비밀키 a', a, setA], ['Bob 비밀키 b', b, setB]] as const).map(([label, val, setter]) => (
            <div key={label}>
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input
                type="number"
                value={val}
                onChange={e => setter(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-md border bg-background font-mono"
              />
            </div>
          ))}
        </div>
        <Button onClick={calculate} style={{ backgroundColor: '#D4820F' }}>시뮬레이션</Button>
        {result && (
          <div className="space-y-1.5">
            {Object.entries(result).map(([k, v]) => (
              <div key={k} className="text-sm">
                <span className="font-medium text-infosec">{k}:</span>{' '}
                <span className="font-mono text-xs">{v}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              💡 함정: DH는 키 교환(비대칭)이지 암호화가 아님. MITM 취약점 있음.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ── Hash Comparison ── */
const HASH_ALGORITHMS = [
  { name: 'MD5',     outputBits: 128, status: '취약 (충돌 발견)', subtle: null },
  { name: 'SHA-1',   outputBits: 160, status: '취약 (Google 충돌)', subtle: 'SHA-1' },
  { name: 'SHA-256', outputBits: 256, status: '안전', subtle: 'SHA-256' },
  { name: 'SHA-512', outputBits: 512, status: '안전', subtle: 'SHA-512' },
]

function HashComparison() {
  const [input, setInput] = useState('hello')
  const [hashes, setHashes] = useState<Record<string, string>>({})

  const compute = async () => {
    const enc = new TextEncoder().encode(input)
    const results: Record<string, string> = {}
    for (const algo of HASH_ALGORITHMS) {
      if (algo.subtle) {
        try {
          const buf = await crypto.subtle.digest(algo.subtle, enc)
          results[algo.name] = Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, '0')).join('')
        } catch {
          results[algo.name] = '(계산 불가)'
        }
      } else {
        results[algo.name] = '(브라우저 미지원 — 128비트 출력)'
      }
    }
    setHashes(results)
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">해시 함수 비교</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-md border bg-background"
            placeholder="해시할 텍스트 입력"
          />
          <Button onClick={compute} style={{ backgroundColor: '#D4820F' }}>계산</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-3">알고리즘</th>
                <th className="text-left py-2 pr-3">출력(비트)</th>
                <th className="text-left py-2 pr-3">상태</th>
                <th className="text-left py-2">해시값</th>
              </tr>
            </thead>
            <tbody>
              {HASH_ALGORITHMS.map(algo => (
                <tr key={algo.name} className="border-b last:border-0">
                  <td className="py-2 pr-3 font-mono font-semibold">{algo.name}</td>
                  <td className="py-2 pr-3">{algo.outputBits}</td>
                  <td className={`py-2 pr-3 ${algo.status.includes('안전') ? 'text-green-600' : 'text-red-600'}`}>
                    {algo.status}
                  </td>
                  <td className="py-2 font-mono break-all text-muted-foreground max-w-xs">
                    {hashes[algo.name] ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          💡 함정: SHA-256 출력은 256비트(32바이트), SHA-512는 512비트(64바이트). 비트≠바이트 혼동 주의.
        </p>
      </CardContent>
    </Card>
  )
}
