// 국어 영역별 학습(area_details) JSON 필드명 → 한글 표시 라벨 매핑.
// 데이터 파일(요약노트_JSON.json)은 DB 적재 메인 소스라 키를 직접 바꾸지 않고,
// 화면 표시 단계에서만 한글 라벨로 변환한다.
const AREA_FIELD_LABELS: Record<string, string> = {
  // 최상위 필드
  name: '이름',
  出題_position: '출제 위치',
  format: '출제 형식',
  formats: '출제 형식',
  core_rules: '핵심 규칙',
  traps: '함정',
  common_traps: '빈출 함정',
  biggest_trap: '최대 함정',
  related_questions: '관련 기출',
  tools: '도구',
  principles: '원칙',
  solving_steps: '풀이 단계',
  question_types: '문제 유형',
  tip: '팁',
  clues: '단서',
  key_method: '핵심 방법',
  subcategories: '하위 분류',

  // 중첩 객체 필드
  rule: '규칙',
  examples: '예시',
  example: '예시',
  description: '설명',
  tool: '도구',
  principle: '원칙',
  step: '단계',
  action: '적용',
  type: '유형',
  clue: '단서',
  words: '단어',
  patterns: '패턴',
  verb_conjugation: '동사 활용',
  word_formation: '단어 형성',
  phonological_change: '음운 변동',
  diphthong_의: "이중모음 '의'",
}

/** area_details 필드 키를 한글 라벨로 변환. 매핑이 없으면 밑줄을 공백으로 바꿔 반환. */
export function areaFieldLabel(key: string): string {
  return AREA_FIELD_LABELS[key] ?? key.replace(/_/g, ' ')
}
