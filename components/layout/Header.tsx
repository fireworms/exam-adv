'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Moon, Sun, BookOpen, Menu, Search } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SUBJECT_META, SUBJECT_KEYS, type SubjectKey } from '@/lib/utils'

interface HeaderProps {
  onMenuToggle?: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [searchQ, setSearchQ] = useState('')

  const currentSubject = SUBJECT_KEYS.find(k => pathname.startsWith(`/${k}`))

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQ.trim()) return
    const target = currentSubject ? `/${currentSubject}/search?q=${encodeURIComponent(searchQ)}` : `/korean/search?q=${encodeURIComponent(searchQ)}`
    router.push(target)
    setSearchQ('')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-md hover:bg-accent"
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <BookOpen className="h-5 w-5" />
          <span className="hidden sm:inline">9급 합격노트</span>
        </Link>

        {/* 과목 전환 탭 (데스크탑) */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {SUBJECT_KEYS.map(key => {
            const meta = SUBJECT_META[key]
            const isActive = pathname.startsWith(`/${key}`)
            return (
              <Link
                key={key}
                href={`/${key}/dashboard`}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                }`}
                style={isActive ? { backgroundColor: meta.color } : undefined}
              >
                {meta.label}
              </Link>
            )
          })}
        </nav>

        {/* 통합 검색 (데스크탑) */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center ml-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="검색..."
              aria-label="전체 검색"
              className="pl-8 pr-3 py-1.5 text-sm rounded-md border bg-background w-44 focus:w-56 transition-all focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="다크모드 전환"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  )
}
