import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SUBJECT_KEYS = ['korean', 'english', 'korean-history', 'computer-general', 'infosec'] as const
export type SubjectKey = typeof SUBJECT_KEYS[number]

export const SUBJECT_META: Record<SubjectKey, { label: string; color: string; lightColor: string }> = {
  'korean':           { label: '국어',      color: '#E04B2A', lightColor: '#F9D1C8' },
  'english':          { label: '영어',      color: '#1A6FBF', lightColor: '#C8DEF5' },
  'korean-history':   { label: '한국사',    color: '#7B5EA7', lightColor: '#DDD5F0' },
  'computer-general': { label: '컴퓨터일반', color: '#2E9E4F', lightColor: '#C5EDD4' },
  'infosec':          { label: '정보보호론', color: '#D4820F', lightColor: '#FDE8BE' },
}

export const EXAM_DATE = new Date('2026-06-20')

export function getDDayCount(): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exam = new Date(EXAM_DATE)
  exam.setHours(0, 0, 0, 0)
  return Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
