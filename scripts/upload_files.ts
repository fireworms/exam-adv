/**
 * md/pdf 파일을 Supabase Storage 'notes' 버킷에 업로드
 * 실행: npm run upload-files (SUPABASE_SERVICE_ROLE_KEY 필요)
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FILES = [
  { local: 'data/korean/요약노트_마스터.md',        bucket: 'notes', path: 'korean/master.md' },
  { local: 'data/korean/요약노트_표중심.md',        bucket: 'notes', path: 'korean/table.md' },
  { local: 'data/korean/요약노트_마스터.pdf',       bucket: 'notes', path: 'korean/master.pdf' },
  { local: 'data/korean/요약노트_표중심.pdf',       bucket: 'notes', path: 'korean/table.pdf' },

  { local: 'data/english/요약노트_마스터.md',       bucket: 'notes', path: 'english/master.md' },
  { local: 'data/english/요약노트_표중심.md',       bucket: 'notes', path: 'english/table.md' },
  { local: 'data/english/요약노트_마스터.pdf',      bucket: 'notes', path: 'english/master.pdf' },
  { local: 'data/english/요약노트_표중심.pdf',      bucket: 'notes', path: 'english/table.pdf' },

  { local: 'data/korean_history/요약노트_마스터.md',  bucket: 'notes', path: 'korean-history/master.md' },
  { local: 'data/korean_history/요약노트_표중심.md',  bucket: 'notes', path: 'korean-history/table.md' },
  { local: 'data/korean_history/요약노트_마스터.pdf', bucket: 'notes', path: 'korean-history/master.pdf' },
  { local: 'data/korean_history/요약노트_표중심.pdf', bucket: 'notes', path: 'korean-history/table.pdf' },
  { local: 'data/korean_history/트렌드분석.md',      bucket: 'notes', path: 'korean-history/trends.md' },

  { local: 'data/computer_general/요약노트_마스터.md',  bucket: 'notes', path: 'computer-general/master.md' },
  { local: 'data/computer_general/요약노트_표중심.md',  bucket: 'notes', path: 'computer-general/table.md' },
  { local: 'data/computer_general/요약노트_마스터.pdf', bucket: 'notes', path: 'computer-general/master.pdf' },
  { local: 'data/computer_general/요약노트_표중심.pdf', bucket: 'notes', path: 'computer-general/table.pdf' },
  { local: 'data/computer_general/트렌드분석.md',      bucket: 'notes', path: 'computer-general/trends.md' },

  { local: 'data/infosec/요약노트_마스터.md',         bucket: 'notes', path: 'infosec/master.md' },
  { local: 'data/infosec/요약노트_표중심.md',         bucket: 'notes', path: 'infosec/table.md' },
  { local: 'data/infosec/요약노트_마스터.pdf',        bucket: 'notes', path: 'infosec/master.pdf' },
  { local: 'data/infosec/요약노트_표중심.pdf',        bucket: 'notes', path: 'infosec/table.pdf' },
  { local: 'data/infosec/트렌드분석.md',             bucket: 'notes', path: 'infosec/trends.md' },
]

async function uploadFiles() {
  console.log('📤 파일 업로드 시작...\n')
  let ok = 0
  let fail = 0

  for (const f of FILES) {
    try {
      const content = readFileSync(resolve(f.local))
      const contentType = f.local.endsWith('.pdf') ? 'application/pdf' : 'text/markdown'
      const { error } = await supabase.storage
        .from(f.bucket)
        .upload(f.path, content, { upsert: true, contentType })

      if (error) throw error
      console.log(`  ✓ ${f.path}`)
      ok++
    } catch (err) {
      console.warn(`  ✗ ${f.local}: ${err}`)
      fail++
    }
  }

  console.log(`\n완료: 성공 ${ok}개 / 실패 ${fail}개`)
}

uploadFiles().catch(err => {
  console.error('❌ 업로드 실패:', err)
  process.exit(1)
})
