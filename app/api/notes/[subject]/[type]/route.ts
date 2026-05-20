import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// subject → data 디렉토리명 매핑
const DIR_MAP: Record<string, string> = {
  'korean':           'korean',
  'english':          'english',
  'korean-history':   'korean_history',
  'computer-general': 'computer_general',
  'infosec':          'infosec',
}

// type → 파일명 매핑
const FILE_MAP: Record<string, string> = {
  master: '요약노트_마스터.md',
  table:  '요약노트_표중심.md',
  trends: '트렌드분석.md',
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ subject: string; type: string }> }
) {
  const { subject, type } = await params

  const dir = DIR_MAP[subject]
  const fileName = FILE_MAP[type]

  if (!dir || !fileName) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const filePath = resolve(`data/${dir}/${fileName}`)

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found', available: false }, { status: 404 })
  }

  const content = readFileSync(filePath, 'utf-8')
  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
