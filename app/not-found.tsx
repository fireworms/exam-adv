import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto text-center py-20 space-y-4">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="text-xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm text-muted-foreground">요청한 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        대시보드로 돌아가기
      </Link>
    </div>
  )
}
