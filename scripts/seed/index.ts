/**
 * 전체 시드 실행 진입점
 * 실행: npm run seed
 */
import { seedKorean } from './korean'
import { seedEnglish } from './english'
import { seedKoreanHistory } from './korean_history'
import { seedComputerGeneral } from './computer_general'
import { seedInfosec } from './infosec'

async function main() {
  console.log('🌱 시드 시작...\n')

  try {
    console.log('📖 국어 적재 중...')
    await seedKorean()

    console.log('🌍 영어 적재 중...')
    await seedEnglish()

    console.log('📜 한국사 적재 중...')
    await seedKoreanHistory()

    console.log('💻 컴퓨터일반 적재 중...')
    await seedComputerGeneral()

    console.log('🔐 정보보호론 적재 중...')
    await seedInfosec()

    console.log('\n✅ 시드 완료!')
  } catch (err) {
    console.error('❌ 시드 실패:', err)
    process.exit(1)
  }
}

main()
