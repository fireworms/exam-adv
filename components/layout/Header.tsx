'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Moon, Sun, BookOpen, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { SUBJECT_META, SUBJECT_KEYS, type SubjectKey } from '@/lib/utils'

interface HeaderProps {
  onMenuToggle?: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const currentSubject = SUBJECT_KEYS.find(k => pathname.startsWith(`/${k}`))

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

        <div className="ml-auto flex items-center gap-2">
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
