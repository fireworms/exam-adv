'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, AlertTriangle, Search, BarChart2,
  BookMarked, Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUBJECT_META, SUBJECT_KEYS, type SubjectKey } from '@/lib/utils'

const COMMON_NAV = [
  { href: '/dashboard',    label: '대시보드',   icon: LayoutDashboard },
  { href: '/notes/master', label: '마스터 노트', icon: FileText },
  { href: '/notes/table',  label: '표중심 노트', icon: FileText },
  { href: '/notes/json',   label: 'JSON 트리',  icon: FileText },
  { href: '/traps',        label: '함정 패턴',  icon: AlertTriangle },
  { href: '/search',       label: '검색',       icon: Search },
  { href: '/stats',        label: '통계',       icon: BarChart2 },
]

const SUBJECT_EXTRA_NAV: Record<string, { href: string; label: string }[]> = {
  'korean-history': [
    { href: '/korean-history/timeline',             label: '왕조 연표' },
    { href: '/korean-history/historical-figures',   label: '인물 사전' },
    { href: '/korean-history/historical-documents', label: '사료 모음' },
  ],
  'english': [
    { href: '/english/vocabulary',      label: '어휘 카드' },
    { href: '/english/grammar-patterns', label: '문법 패턴' },
    { href: '/english/idioms',           label: '관용구' },
  ],
  'computer-general': [
    { href: '/computer-general/flashcards', label: '플래시카드' },
    { href: '/computer-general/code-trace', label: '코드 트레이싱' },
  ],
  'infosec': [
    { href: '/infosec/crypto-lab',          label: '암호 실습실' },
    { href: '/infosec/law-explorer',        label: '법규 탐색기' },
    { href: '/infosec/ismsp-tree',          label: 'ISMS-P 트리' },
    { href: '/infosec/access-control-sim',  label: '접근통제 시뮬' },
  ],
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const currentSubject = SUBJECT_KEYS.find(k => pathname.startsWith(`/${k}`))

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-56 border-r bg-background transition-transform duration-200',
          'md:translate-x-0 md:static md:h-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full py-4 overflow-y-auto">
          {/* 전체 홈 */}
          <div className="px-3 mb-2">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                pathname === '/'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              )}
              onClick={onClose}
            >
              <Home className="h-4 w-4" />
              통합 대시보드
            </Link>
          </div>

          <div className="px-3 mb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">
              {currentSubject ? SUBJECT_META[currentSubject].label : '과목 선택'}
            </p>
          </div>

          {/* 과목별 공통 메뉴 */}
          {currentSubject && (
            <nav className="px-3 space-y-1">
              {COMMON_NAV.map(item => {
                const Icon = item.icon
                const href = `/${currentSubject}${item.href}`
                const isActive = pathname === href || pathname.startsWith(href + '/')
                const accentColor = SUBJECT_META[currentSubject].color
                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive
                        ? 'text-white font-medium'
                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                    )}
                    style={isActive ? { backgroundColor: accentColor } : undefined}
                    onClick={onClose}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* 과목 특화 메뉴 */}
          {currentSubject && SUBJECT_EXTRA_NAV[currentSubject] && (
            <nav className="px-3 space-y-1 mt-1 pt-2 border-t">
              {SUBJECT_EXTRA_NAV[currentSubject].map(item => {
                const isActive = pathname.startsWith(item.href)
                const accentColor = SUBJECT_META[currentSubject].color
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive
                        ? 'text-white font-medium'
                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                    )}
                    style={isActive ? { backgroundColor: accentColor } : undefined}
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* 과목 목록 */}
          <div className="mt-auto px-3 pt-4 border-t">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">과목</p>
            <nav className="space-y-1">
              {SUBJECT_KEYS.map(key => {
                const meta = SUBJECT_META[key]
                const isActive = pathname.startsWith(`/${key}`)
                return (
                  <Link
                    key={key}
                    href={`/${key}/dashboard`}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive ? 'text-white font-medium' : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                    )}
                    style={isActive ? { backgroundColor: meta.color } : undefined}
                    onClick={onClose}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                    {meta.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* 북마크 */}
          <div className="px-3 pt-2">
            <Link
              href="/bookmarks"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              onClick={onClose}
            >
              <BookMarked className="h-4 w-4" />
              북마크
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
