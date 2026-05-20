const QUIZ_APP_BASE_URL = process.env.NEXT_PUBLIC_QUIZ_APP_URL ?? ''

export function buildQuizDeepLink(examAppearedIn: string): string | null {
  if (!QUIZ_APP_BASE_URL || !examAppearedIn) return null

  const match = examAppearedIn.match(/(\d{4})\s*(지방직|국가직|서울시|법원직)\s*(\d+)번/)
  if (!match) return null

  const [, year, examType, no] = match
  const params = new URLSearchParams({ year, examType, questionNo: no })
  return `${QUIZ_APP_BASE_URL}/practice?${params.toString()}`
}
