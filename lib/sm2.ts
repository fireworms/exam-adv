export type Quality = 0 | 1 | 2 | 3 | 4 | 5

export interface SM2State {
  repetitions: number
  easeFactor: number
  interval: number
}

export function sm2Update(state: SM2State, quality: Quality): SM2State {
  const { repetitions, easeFactor, interval } = state

  if (quality < 3) {
    return { repetitions: 0, easeFactor, interval: 1 }
  }

  const newEF = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  )

  let newInterval: number
  if (repetitions === 0) newInterval = 1
  else if (repetitions === 1) newInterval = 6
  else newInterval = Math.round(interval * newEF)

  return { repetitions: repetitions + 1, easeFactor: newEF, interval: newInterval }
}

export const QUALITY_MAP = {
  어려움:   2 as Quality,
  보통:     3 as Quality,
  쉬움:     5 as Quality,
  헷갈림:   2 as Quality,
  익숙:     5 as Quality,
  이해완료: 4 as Quality,
  정답:     4 as Quality,
  오답:     1 as Quality,
} as const
