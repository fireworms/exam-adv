import { BookmarksClient } from './BookmarksClient'

export default function BookmarksPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">북마크</h1>
      <BookmarksClient />
    </div>
  )
}
