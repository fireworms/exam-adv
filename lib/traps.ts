import type { TrapData } from '@/components/common/TrapCard'

/** 과목별로 다른 JSON 포맷 → 통일된 TrapData 배열로 변환 */
export function normalizeTrapData(subject: string, json: Record<string, unknown>): TrapData[] {

  // 국어: top_15_traps = [{rank, trap, frequency, countermeasure}]
  if (subject === 'korean') {
    const raw = (json.top_15_traps ?? []) as { rank: number; trap: string; frequency?: string; countermeasure?: string }[]
    const examples: Record<number, string> = {
      1:  '본문: "정부는 디지털 전환 정책을 추진하고 있다."\n오답 선지: "정부는 비용 절감을 위해 디지털 전환을 추진하고 있다." → \'비용 절감\'은 본문에 없는 단어',
      2:  '본문: "일부 기업에서는 재택근무가 생산성 향상에 효과적인 것으로 나타났다."\n오답 선지: "모든 기업에서 재택근무는 생산성 향상에 효과적이다."',
      3:  '본문: "과도한 스트레스는 수면 장애를 유발한다."\n오답 선지: "수면 장애가 심화되면 스트레스가 발생한다." → 원인·결과 방향이 뒤집힘',
      4:  '본문: "이 공법은 범죄 예방에 효과적일 수 있다."\n오답 선지: "이 공법은 범죄 예방에 반드시 효과적이다." → \'수 있다\'→\'반드시\'로 단정화',
      5:  '본문: "해당 정책은 일부 지역에 시범 적용되고 있다."\n오답 선지: "해당 정책은 전국 모든 지역에 적용되고 있다."',
      6:  '선지: "㉠에는 행정 절차의 복잡성이 언급되어 있으며, 이로 인해 민원 처리가 지연된다고 하였다."\n→ 앞부분(복잡성 언급)은 맞지만 \'지연된다\'는 본문에 없어 오답',
      7:  '본문: "2020년 이후 수출 규모가 지속적으로 증가하였다."\n오답 선지: "2020년 이후 수출이 감소하는 추세를 보였다."',
      8:  '개요 결론 부분에 "3. 현황 분석 — 통계 자료를 통한 실태 파악"이 배치\n→ 현황 분석은 본론 내용, 결론에는 기대 효과·향후 과제만',
      9:  '원문: "신청서를 제출받다" → 이미 옳은 표현\n오답 수정안: "신청서를 접수받다" → \'접수\'와 \'받다\'는 의미 중복으로 오히려 틀린 표현',
      10: '전제: "모든 공무원은 청렴하다. 김 씨는 공무원이다."\n오답 선지: "김 씨가 청렴할 수 있다." → 반드시 참인 결론인데 가능성으로 약화하면 틀림',
      11: '갑: "재정 지원 확대는 긍정적이나 수혜 자격 기준은 재검토가 필요하다."\n오답 선지: "갑은 을의 재정 지원 확대 방안에 전적으로 동의한다." → 부분 동의를 전적 동의로 과장',
      12: '논지: "정기적 운동은 심혈관 질환 위험을 낮춘다."\n오답 강화 선지: "운동은 기분을 좋게 한다." → 심혈관과 무관, 논지를 직접 강화하지 않음',
      13: '문맥: "그 임무를 완수하는 것이 쉽지 않았다."\n선지 어휘: ①수월하다 ②어렵다 ③힘겹다 ④녹록지 않다\n→ \'수월하다\'는 사전상 반의어라 오답, 문맥에 맞는 ④가 정답',
      14: '본문: "이것은 그가 제안한 정책이 낳은 결과다."\n선지: "이것이 가리키는 대상은 그가 제안한 행위다."\n→ \'이것\'은 명사(결과)를 가리키는데 선지는 동사구(제안한 행위)를 지시 대상으로 제시',
      15: '"(나) 그러나 이러한 관점에 반론이 제기된다." → 역접 접속사로 시작\n오답: (나)를 첫 번째 단락으로 배열 → 역접 접속사가 있으면 앞 단락이 반드시 존재',
    }
    return raw.map(t => ({
      rank: t.rank,
      title: t.trap,
      frequency: t.frequency,
      countermeasure: t.countermeasure,
      example: examples[t.rank],
    }))
  }

  // 영어: top_15_traps = [{id, trap, avoidance}]
  if (subject === 'english') {
    const raw = (json.top_15_traps ?? []) as { id: number; trap: string; avoidance?: string }[]
    const examples: Record<number, string> = {
      1:  '지문: "Despite the heavy rain, the outdoor concert was a huge success."\n오답 선지: "폭우 때문에 야외 콘서트는 실패로 끝났다."\n→ Despite(양보)를 because of(원인)로 혼동',
      2:  '(A) "These results suggest that sleep deprivation affects memory."\n(B) "Researchers conducted experiments on 200 college students."\n(C) "The findings were published in Nature."\n→ (A)가 These results로 시작 → 첫 단락 불가, 정답 순서: (B)-(A)-(C)',
      3:  '지문 흐름: "Regular exercise improves cardiovascular health and boosts mood. [빈칸] physical activity must be balanced with adequate rest."\n→ However가 빈칸에 들어가야 앞의 긍정 흐름을 전환',
      4:  '"The product warranty expires in 72 hours."\n오답 선지: "제품 보증은 3주 후 만료된다." → 72시간=3일, 3주(21일)와 혼동',
      5:  '"I know what she said at the meeting." (what=선행사 포함, 명사절)\n"He found the document that was missing." (that=관계대명사, 선행사 document 필요)\n오답: "I know that she said" → that절은 명사절로 쓰이나 선행사 없이 쓸 때는 what',
      6:  '"The professor insisted that every student submit the paper by Friday."\n오답: "submitted" → insist that 절에서 should 생략 시 반드시 동사원형',
      7:  '공고문: "No prior experience or qualifications required. All skill levels welcome."\n오답 선지: "지원자는 관련 분야 경력이 있어야 한다."\n→ No prior experience = 경험 불필요',
      8:  '"The company held a virtual meeting with overseas branches."\n오답 선지: "회사는 해외 지사와 시각적인 회의를 열었다."\n→ virtual(가상·온라인) ≠ visual(시각적)',
      9:  '이메일 구조: [1단락 칭찬] "Your team has done an exceptional job this quarter." [2~3단락 본론] [마지막] "Could you consider extending the deadline by two weeks?"\n→ 정답: 마감 연장 요청이 목적, \'칭찬\'을 목적으로 고르면 오답',
      10: '"Apart from the high cost, the venue was perfect for the event."\n오답 선지: "비용을 포함한 모든 면에서 행사장이 완벽했다."\n→ Apart from = ~을 제외하고(except for)',
      11: '공통지문: "assess the risk" → 문맥상 evaluate(분석·평가)\n오답 선지: "assess = 시험을 치르다" → 사전적 의미 중 시험 관련 의미로만 해석하는 함정',
      12: '"The cheetah runs three times as fast as the horse."\n오답 선지: "three times faster than" → 배수 표현은 반드시 \'배수+as+원급+as\'',
      13: '"If she had prepared better, she would be more confident now."\n→ if절: 과거완료(과거 사실 반대) / 주절: would+동사원형(현재 영향)\n오답: 주절을 \'would have been\'으로 쓰면 단순 과거완료 가정법으로 혼동',
      14: '지문 주제: 환경보호의 중요성\n어색한 문장 후보: "Economic growth is also an important goal for governments."\n→ 사실이지만 주제(환경보호)와 무관 → 정답',
      15: '"No sooner had the door opened than the alarm went off."\n오답: "No sooner the door had opened than..." → No sooner 뒤 반드시 도치(had+S+p.p.)',
    }
    return raw.map((t, i) => ({
      rank: i + 1,
      title: t.trap,
      countermeasure: t.avoidance,
      example: examples[i + 1],
    }))
  }

  // 한국사: top_15_traps = string[] (혼동 쌍)
  if (subject === 'korean-history') {
    const raw = (json.top_15_traps ?? []) as (string | { rank?: number; title?: string })[]
    const examples: string[] = [
      '문제: "고려 성종 때 거란의 1차 침입을 막아낸 인물은?"\n→ 강조(목종 폐위)와 강감찬(귀주대첩) 혼동 주의. 1차는 서희(외교담판), 3차가 강감찬.',
      '문제: "고려 불교 통합 운동에서 교관겸수를 주장한 인물은?"\n→ 의천(교관겸수·천태종)과 지눌(정혜쌍수·조계종) 혼동. 교관겸수=의천, 정혜쌍수=지눌.',
      '문제: "단군신화를 수록하고 향가를 전한 역사서는?"\n→ 삼국사기(김부식·합리주의)와 삼국유사(일연·불교·설화) 혼동. 단군·향가=삼국유사.',
      '문제: "삼국 시대 신라에서 우산국을 복속하고 국호를 신라로 확정한 왕은?"\n→ 지증왕(우산국·국호 신라·순장 금지)·법흥왕(율령·불교 공인·금관가야 병합)·진흥왕(화랑·한강) 구분 필수.',
      '문제: "고려에서 전민변정도감을 설치하여 권문세족을 억압한 왕은?"\n→ 광종(노비안검법·과거제)·성종(시무28조·12목)·공민왕(전민변정도감·반원) 혼동 빈출.',
      '문제: "조선에서 직전법을 시행하고 6조 직계제를 부활시킨 왕은?"\n→ 세조(직전법·6조 직계제)·세종(공법·훈민정음)·성종(경국대전·홍문관) 혼동. 직전법=세조.',
      '문제: "조선 후기 탕평 정치를 실시하고 균역법을 시행한 왕은?"\n→ 영조(균역법·탕평비·속대전)·정조(장용영·화성·초계문신·대전통편) 구분. 균역법=영조.',
      '문제: "토지를 공동 소유·경작하는 여전제를 주장한 실학자는?"\n→ 이익(영업전 한전론)·박지원(한전론·열하일기)·정약용(여전제·목민심서) 혼동. 여전제=정약용.',
      '문제: "\'아와 비아의 투쟁\'으로 역사를 설명한 민족주의 역사학자는?"\n→ 박은식(국혼·한국통사)·신채호(아와 비아·조선혁명선언)·정인보(조선의 얼) 구분. 아와 비아=신채호.',
      '문제: "상하이에서 한인애국단을 조직하고 이봉창·윤봉길 의거를 지휘한 인물은?"\n→ 한인애국단(김구)·의열단(김원봉) 혼동. 이봉창·윤봉길=한인애국단=김구.',
      '문제: "북만주에서 한국 독립군을 이끌고 쌍성보·대전자령 전투를 승리로 이끈 인물은?"\n→ 지청천(한국독립군·북만주)·양세봉(조선혁명군·남만주)·김원봉(조선의용대·관내) 구분.',
      '문제: "흥선대원군 집권기에 폐지된 기구는?"\n→ 비변사(흥선대원군 폐지)·통리기무아문(고종 친정기 설치) 혼동. 비변사 폐지=흥선대원군.',
      '문제: "정묘호란의 결과로 조선과 후금이 맺은 관계는?"\n→ 정묘호란(형제관계)·병자호란(군신관계·삼전도 굴욕) 혼동. 형제=정묘, 군신=병자.',
      '문제: "임진왜란 당시 행주산성에서 왜군을 격퇴한 인물은?"\n→ 진주성(김시민)·행주산성(권율)·의령 의병(곽재우) 구분. 행주=권율.',
      '문제: "홍범 14조를 반포하고 23부제를 실시한 개혁은?"\n→ 갑오 1차(군국기무처·은본위)·갑오 2차(홍범14조·내각·23부)·을미(단발령)·광무(구본신참) 구분.',
    ]
    return raw.map((t, i) => ({
      rank: i + 1,
      title: typeof t === 'string' ? t : (t.title ?? String(t)),
      example: examples[i],
    }))
  }

  // 컴퓨터일반: common_traps = {key: string | object}
  if (subject === 'computer-general') {
    const raw = json.common_traps as Record<string, unknown> ?? {}
    const examples: Record<string, string> = {
      DRAM_SRAM:        'Q: "SRAM에 대한 설명으로 옳은 것은?"\n오답 선지: "SRAM은 전원이 꺼져도 데이터를 보존한다."\n→ SRAM은 캐시용 고속 메모리지만 휘발성. 비휘발성은 ROM·플래시 메모리.',
      SNMP_DNS_DHCP:    'Q: "DNS에 대한 설명으로 옳지 않은 것은?"\n오답 선지: "DNS는 TCP만 사용한다."\n→ DNS는 기본적으로 UDP 53번 포트 사용 (대용량 전송 시 TCP도 사용).',
      ICMP_ARP:         'Q: "ARP의 동작 계층으로 옳은 것은?"\n오답 선지: "ARP는 데이터링크 계층(2계층)에서 동작한다."\n→ ARP는 IP→MAC 주소 변환, 네트워크 계층(3계층)으로 분류.',
      RAID_5_vs_6:      'Q: "RAID에 대한 설명으로 옳은 것은?"\n오답 선지: "RAID 6는 RAID 5보다 읽기·쓰기 성능이 모두 우수하다."\n→ RAID 6은 이중 패리티로 쓰기 오버헤드가 더 크고 느림.',
      교착상태_4조건:   'Q: "교착상태 예방 방법으로 옳은 것은?"\n오답 선지: "선점 조건을 허용하면 교착상태를 예방할 수 있다."\n→ 선점을 허용하는 것(선점 가능)이 예방법. 비선점이 4조건 중 하나.',
      HRN:              'Q: "HRN 스케줄링에 대한 설명으로 옳은 것은?"\n오답 선지: "HRN은 선점형 스케줄링이다."\n→ HRN(Highest Response-ratio Next)은 비선점형. 대기시간이 길수록 우선순위 상승.',
      SRT:              'Q: "다음 중 선점형 스케줄링 알고리즘은?"\n오답 선지에 SRT 미포함 또는 비선점으로 분류\n→ SRT(Shortest Remaining Time)는 선점형 SJF. 새 프로세스 도착 시 남은 시간 비교 후 교체.',
      BCNF_3NF:         'Q: "정규화에 대한 설명으로 옳은 것은?"\n오답 선지: "3NF를 만족하면 반드시 BCNF를 만족한다."\n→ BCNF가 3NF보다 강한 조건. 3NF ⊃ BCNF (BCNF면 3NF이나 역은 성립 안 함).',
      Optimal_페이지:   'Q: "페이지 교체 알고리즘 중 가장 이상적이나 구현 불가능한 것은?"\n→ OPT(Optimal): 미래 참조 열을 알아야 하므로 실제 구현 불가, 비교 기준용으로만 사용.',
      RSA:              'Q: "RSA에 대한 설명으로 옳지 않은 것은?"\n오답 선지: "RSA는 대칭키 암호화 방식이다."\n→ RSA는 비대칭키. 공개키로 암호화 → 개인키로 복호화 (또는 서명 역방향).',
      옵저버_패턴:      'Q: "GoF 디자인 패턴에서 행위 패턴에 해당하는 것은?"\n오답: 옵저버를 생성 패턴으로 분류\n→ 옵저버(Observer): 상태 변화 시 구독자에게 알림, 행위(Behavioral) 패턴.',
      경계값_분석:      'Q: "블랙박스 테스트 기법에 해당하는 것은?"\n오답 선지: "경계값 분석은 소스코드 내부 구조를 분석한다."\n→ 경계값 분석은 블랙박스(입출력 기반). 내부 구조 분석=화이트박스.',
      OAuth_2:          'Q: "OAuth 2.0에 대한 설명으로 옳은 것은?"\n오답 선지: "OAuth 2.0은 사용자 인증(Authentication) 프로토콜이다."\n→ OAuth 2.0은 권한 위임(Authorization) 프로토콜. 인증은 OpenID Connect가 담당.',
      Python_y_equals_x: 'x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)  # [1, 2, 3, 4] 출력\n→ 오답: "x는 변경되지 않는다." → y=x는 참조 복사, 같은 객체 공유.',
      C_swap_value_call: 'void swap(int a, int b) { int t=a; a=b; b=t; }\nswap(x, y); // x, y 변화 없음\n→ Call by Value: 복사본으로 교환, 원본 불변.\n포인터 사용 필요: swap(int *a, int *b)',
    }
    return Object.entries(raw).map(([key, val], i) => ({
      rank: i + 1,
      title: key.replace(/_/g, ' vs '),
      description: typeof val === 'string' ? val : JSON.stringify(val),
      example: examples[key],
    }))
  }

  // 정보보호론: common_traps = [{틀린생각, 정답}]
  if (subject === 'infosec') {
    const raw = (json.common_traps ?? []) as { 틀린생각: string; 정답: string }[]
    const examples: string[] = [
      'Q: "디피-헬만 키 교환에 대한 설명으로 옳은 것은?"\n오답: "디피-헬만은 데이터를 직접 암호화하는 대칭키 알고리즘이다."\n→ 디피-헬만은 공개된 채널에서 비밀키를 교환하는 비대칭 방식 키 합의 프로토콜.',
      'Q: "다음 중 기밀성을 보장하는 접근통제 모델은?"\n오답: "Biba 모델은 기밀성을 보장한다."\n→ BLP(Bell-LaPadula): 기밀성(상위→하위 읽기 금지), Biba: 무결성(하위→상위 쓰기 금지).',
      'Q: "타원곡선 암호(ECC)에 대한 설명으로 옳은 것은?"\n오답: "ECC는 동일한 키를 공유하는 대칭키 방식이다."\n→ ECC는 비대칭키. RSA보다 짧은 키로 동등한 보안 제공.',
      'Q: "생체인식에서 FRR이 낮아질수록 어떻게 되는가?"\n오답: "FRR이 낮으면 비인가자 수락 가능성이 낮아진다."\n→ FRR(False Rejection Rate)↓ = 정당한 사용자 거부율↓ = FAR(오수락율)↑ (트레이드오프).',
      'Q: "DNS 서버의 캐시를 조작하여 정상 사이트 접속 시 피싱 사이트로 유도하는 공격은?"\n오답: "Pharming은 이메일을 통해 링크를 클릭하게 만드는 공격이다."\n→ Pharming: DNS 캐시 오염 또는 hosts 파일 변조, Phishing: 이메일·메시지로 속임.',
      'Q: "CC(공통평가기준) EAL 등급 중 가장 높은 보증 수준은?"\n오답: "CC EAL 1이 가장 높은 등급이다."\n→ EAL 1(기능 테스트) ~ EAL 7(형식적 설계 검증), EAL 7이 최고.',
      'Q: "위치정보의 보호 및 이용 등에 관한 법률의 소관부처는?"\n오답: "과학기술정보통신부"\n→ 위치정보법 소관: 방송통신위원회. 개인정보보호법: 개인정보보호위원회.',
      'Q: "개인정보 처리방침에 대한 설명으로 옳은 것은?"\n오답: "처리방침은 내부 문서로 공개 의무가 없다."\n→ 개인정보 처리방침은 홈페이지 등에 공개 의무. 위반 시 과태료.',
      'Q: "개인정보를 처리할 때 우선시해야 하는 방법의 순서는?"\n오답: "가명처리를 먼저 하고 불가능한 경우 익명처리"\n→ 익명처리 우선, 불가능한 경우 가명처리(개인정보보호법 제3조).',
      'Q: "자동화된 결정에 대해 정보주체가 가지는 권리는?"\n오답: "정보주체는 자동화 결정을 승인할 권리를 가진다."\n→ 거부권·설명요구권을 가짐. 승인권이 아닌 이의제기권.',
      'Q: "개인정보를 제3자에게 제공할 수 있는 근거가 아닌 것은?"\n오답: "공공기관과의 계약 이행"\n→ 제3자 제공 근거: 정보주체 동의, 법령 의무. 공공기관 계약은 별도 요건 필요.',
      'Q: "개인정보의 파기 방법 및 절차의 기준은 무엇으로 정하는가?"\n오답: "총리령"\n→ 개인정보보호법 제21조: 파기 기준은 대통령령으로 정함.',
      'Q: "Kerberos v5에서 재생 공격을 방어하기 위해 사용하는 것은?"\n오답: "Kerberos v5는 타임스탬프만 사용하며 nonce는 사용하지 않는다."\n→ Kerberos v5는 nonce(임시 난수값)를 사용하여 재생 공격(Replay Attack) 방어.',
      'Q: "IPSec ESP 프로토콜에 대한 설명으로 옳지 않은 것은?"\n오답: "ESP는 인증만 제공하고 암호화는 제공하지 않는다."\n→ ESP: 기밀성(암호화)+무결성+선택적 인증. AH는 인증·무결성만(암호화 없음).',
      'Q: "AH(인증 헤더) 프로토콜에 대한 설명으로 옳은 것은?"\n오답: "AH는 페이로드를 암호화하여 기밀성을 제공한다."\n→ AH는 인증과 무결성만 제공. 암호화(기밀성)는 ESP가 담당.',
      'Q: "SHA-512의 해시 라운드 수는?"\n오답: "SHA-512는 SHA-256과 동일하게 64라운드를 수행한다."\n→ SHA-256: 512bit 블록·64라운드 / SHA-512: 1024bit 블록·80라운드.',
      'Q: "AES 마지막 라운드에서 생략되는 연산은?"\n오답: "ShiftRows"\n→ AES 일반 라운드: SubBytes→ShiftRows→MixColumns→AddRoundKey\n마지막 라운드: MixColumns 생략 (SubBytes→ShiftRows→AddRoundKey).',
      'Q: "UDP 프로토콜의 특징으로 옳은 것은?"\n오답: "UDP는 순서번호를 사용하여 패킷을 재조립한다."\n→ 순서번호(Sequence Number)는 TCP의 특징. UDP는 비연결형·비신뢰성.',
      'Q: "IPv6에서 지원하지 않는 주소 유형은?"\n오답: "애니캐스트"\n→ IPv6: 유니캐스트·멀티캐스트·애니캐스트 지원. 브로드캐스트는 IPv6에서 폐지됨.',
      'Q: "대량의 HTTP GET 요청으로 웹 서버를 마비시키는 공격의 대응 방안은?"\n오답: "입력값 검증 강화"\n→ HTTP GET Flooding은 DoS 공격, 입력검증과 무관. 대응: 트래픽 임계값 설정·CDN·방화벽.',
    ]
    return raw.map((t, i) => ({
      rank: i + 1,
      title: t.틀린생각,
      incorrect_form: t.틀린생각,
      correct_form: t.정답,
      example: examples[i],
    }))
  }

  return []
}
