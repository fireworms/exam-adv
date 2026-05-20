import type { TrapData } from '@/components/common/TrapCard'

/** 과목별로 다른 JSON 포맷 → 통일된 TrapData 배열로 변환 */
export function normalizeTrapData(subject: string, json: Record<string, unknown>): TrapData[] {
  // 국어: top_15_traps = [{rank, trap, frequency, countermeasure}]
  if (subject === 'korean') {
    const raw = (json.top_15_traps ?? []) as { rank: number; trap: string; frequency?: string; countermeasure?: string }[]
    return raw.map(t => ({
      rank: t.rank,
      title: t.trap,
      frequency: t.frequency,
      countermeasure: t.countermeasure,
    }))
  }

  // 영어: top_15_traps = [{id, trap, avoidance}]
  if (subject === 'english') {
    const raw = (json.top_15_traps ?? []) as { id: number; trap: string; avoidance?: string }[]
    return raw.map((t, i) => ({
      rank: i + 1,
      title: t.trap,
      countermeasure: t.avoidance,
    }))
  }

  // 한국사: top_15_traps = string[] (혼동 쌍)
  if (subject === 'korean-history') {
    const raw = (json.top_15_traps ?? []) as (string | { rank?: number; title?: string })[]
    return raw.map((t, i) => ({
      rank: i + 1,
      title: typeof t === 'string' ? t : (t.title ?? String(t)),
    }))
  }

  // 컴퓨터일반: common_traps = {key: string | object}
  if (subject === 'computer-general') {
    const raw = json.common_traps as Record<string, unknown> ?? {}
    return Object.entries(raw).map(([key, val], i) => ({
      rank: i + 1,
      title: key.replace(/_/g, ' vs '),
      description: typeof val === 'string' ? val : JSON.stringify(val),
    }))
  }

  // 정보보호론: common_traps = [{틀린생각, 정답}]
  if (subject === 'infosec') {
    const raw = (json.common_traps ?? []) as { 틀린생각: string; 정답: string }[]
    return raw.map((t, i) => ({
      rank: i + 1,
      title: t.틀린생각,
      incorrect_form: t.틀린생각,
      correct_form: t.정답,
    }))
  }

  return []
}
