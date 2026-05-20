import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { AppShell } from '@/components/layout/AppShell'
import './globals.css'

export const metadata: Metadata = {
  title: '9급 합격노트 — 5과목 통합 학습',
  description: '국어·영어·한국사·컴퓨터일반·정보보호론 9급 공무원 시험 대비 통합 학습 웹앱',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppShell>{children}</AppShell>
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
