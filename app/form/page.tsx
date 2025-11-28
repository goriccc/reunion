'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { callClaudeAPI, getPrompts, ClaudeResponse, ClaudeMessage } from '@/app/utils/claude'

function FormContent() {
  const searchParams = useSearchParams()
  const gc = searchParams.get('gc')
  const ic = searchParams.get('ic')
  const titleParam = searchParams.get('title')
  
  let title = '지금 당장! 나의 \'재회 성공률\'은 몇 %일까?'
  if (titleParam) {
    try {
      title = decodeURIComponent(titleParam)
    } catch (e) {
      // 디코딩 실패 시 원본 값 사용
      title = titleParam
    }
  }

  // 제목별 콘텐츠 데이터
  const productContents: Record<string, {
    introduction: string
    recommendation: string
    menu: string
  }> = {
    '이번 달, 우린 다시 만날까? 냉혹한 \'재회 성공률\'': {
      introduction: `희망 고문은 이제 그만.<br><br>두 사람의 사주와 이번 달 운세(月運)가 만나 빚어내는 화학 작용을 분석하여, 재회가 성사될 확률을 수치화해 드립니다.<br><br>이번 달이 당신에게 '기회'인지 '위기'인지 판별하고, 재회를 위해 지금 당장 취해야 할 스탠스를 정해드립니다.`,
      recommendation: `👉 매일 아침 눈뜰 때마다 재회 가능성이 궁금하신 분<br>👉 막연한 기다림에 지쳐 포기하고 싶으신 분<br>👉 그 사람도 나를 그리워할지 운의 흐름이 궁금하신 분<br>👉 이번 달을 놓치면 후회할 것 같은 예감이 드는 분<br>👉 전문가의 냉정한 팩트 폭격이 필요하신 분`,
      menu: `1. 이번 달 재회 기상도 (맑음/흐림)<br>2. 하늘이 돕는 두 사람의 기운<br>3. <font color="#E53333"><b>[확률] 재회 성공 가능성 (퍼센트)</b></font><br>4. 운의 흐름이 가장 강력한 시기<br>5. 이번 달 서로에게 미치는 영향력<br>6. 재회를 가로막는 방해 요소 진단<br>7. 성공률을 1%라도 올리는 행동<br>8. 전문가의 최종 코멘트 (Go/Stop)`
    },
    '"자니?" 말고, 답장 100%를 부르는 \'연락의 길일(吉日)\'': {
      introduction: `아무 날이나 연락했다가 '읽씹' 당하지 마세요.<br><br>당신의 표현력(식상)이 상대의 마음(인성)에 정확히 꽂히는 날은 따로 있습니다.<br><br>이번 달 달력에서 당신의 진심이 통할 수 있는 '황금 타이밍'을 콕 집어 드립니다.<br><br>사주 명리학적으로 분석된 '귀인의 날'을 통해 재회의 물꼬를 트세요.`,
      recommendation: `👉 언제 연락해야 할지 날짜만 세고 계신 분<br>👉 한 번의 연락으로 흐름을 바꾸고 싶으신 분<br>👉 연락했다가 무시당할까 봐 두려우신 분<br>👉 내 진심이 왜곡되지 않고 전달되길 바라는 분<br>👉 감정적인 연락 실수를 막고 싶으신 분`,
      menu: `1. 이번 달 나의 '소통 에너지' 점수<br>2. <font color="#E53333"><b>[택일] 연락하기 가장 좋은 Best 3일</b></font><br>3. 절대 연락하면 안 되는 Worst 3일<br>4. 상대의 마음이 열리는 골든타임<br>5. 카톡 vs 전화? 운을 부르는 수단<br>6. 그의 심장을 저격할 핵심 키워드<br>7. <font color="#E53333"><b>[예측] 연락 후 예상되는 시나리오</b></font><br>8. 용기 내어 버튼을 누르세요`
    }
  }

  // 기본 콘텐츠 (제목이 매칭되지 않을 경우)
  const defaultContent = {
    introduction: `이별 후, 하루에도 수십 번씩 마음이 흔들립니다. '계속 기다리는 게 맞을까?', '이러다 정말 끝이면 어떡하지?'...<br>지금 당신이 가장 절실하게 듣고 싶은 대답은, <font color="#E53333"><b>"그래서, 가능성이 있긴 한 거야?"</b></font>라는 질문일 거예요.<br><br>그 사람의 생일(사주)을 몰라도 괜찮습니다. 이 콘텐츠는 '궁합'이 아닌, 오직 '당신'의 사주 명식 하나만을 분석합니다. 지금 이 순간, 내담자님에게 흐르고 있는 '재회 운'의 기운이 얼마나 강한지, 약한지를 정밀하게 추적합니다.<br><br>뜬구름 잡는 위로나 희망 고문이 아닙니다. 당신의 사주가 말해주는 냉정한 '재회 성공률'을 <font color="#E53333">명확한 퍼센트(%) 수치</font>로 보여드립니다. 나의 재회 운이 지금 '최상'인지, '최악'인지 '지금 당장' 확인하고, 가장 현명한 다음 단계를 준비하세요.`,
    recommendation: `👉 재회 가능성을 '정확한 수치(%)'로 확인하고 싶은 분<br>👉 '그 사람'의 생일을 몰라 궁합을 못 보시는 분<br>👉 지금 나의 '재회 운'이 강한지 약한지 궁금하신 분<br>👉 그를 계속 기다려야 할지 '포기'해야 할지 고민되는 분`,
    menu: `1. [나의 본질] 당신은 '이런' 사람입니다<br>2. 나의 기본 '연애 성향' 진단<br>3. 현재 나의 '재회운세' 흐름 분석<br>4. <font color="#E53333"><b>그래서, 나의 '재회 성공률'은 몇 %일까?</b></font><br>5. 재회운이 '상승'하는 시기<br>6. 재회운이 '하락'하는 시기<br>7. 재회 성공률을 높이는 행동`
  }

  const content = productContents[title] || defaultContent

  const [showPayment, setShowPayment] = useState(false)
  const [showCoinCharge, setShowCoinCharge] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [rememberBirthday, setRememberBirthday] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [showClaudeResult, setShowClaudeResult] = useState(false)
  const [claudeResult, setClaudeResult] = useState('')
  const [claudeSections, setClaudeSections] = useState<Array<{ title: string; content: string }>>([])
  const [savedResults, setSavedResults] = useState<
    Array<{
      id: string
      title: string
      savedAt: string
      sections: Array<{ title: string; content: string }>
    }>
  >([])
  const [isLoadingClaude, setIsLoadingClaude] = useState(false)

  // 본인 정보
  const [selfName, setSelfName] = useState('')
  const [selfGender, setSelfGender] = useState('')
  const [selfCalendar, setSelfCalendar] = useState('양력')
  const [selfYear, setSelfYear] = useState('')
  const [selfMonth, setSelfMonth] = useState('')
  const [selfDay, setSelfDay] = useState('')
  const [selfHour, setSelfHour] = useState('')

  // 이성 정보
  const [partnerName, setPartnerName] = useState('')
  const [partnerGender, setPartnerGender] = useState('')
  const [partnerCalendar, setPartnerCalendar] = useState('양력')
  const [partnerYear, setPartnerYear] = useState('')
  const [partnerMonth, setPartnerMonth] = useState('')
  const [partnerDay, setPartnerDay] = useState('')
  const [partnerHour, setPartnerHour] = useState('')

  const years = Array.from({ length: 80 }, (_, i) => 2025 - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  
  const hours = [
    { value: '', label: '태어난 시 - 모름' },
    { value: '子', label: '子(자) 23:30 ~ 01:29' },
    { value: '丑', label: '丑(축) 01:30 ~ 03:29' },
    { value: '寅', label: '寅(인) 03:30 ~ 05:29' },
    { value: '卯', label: '卯(묘) 05:30 ~ 07:29' },
    { value: '辰', label: '辰(진) 07:30 ~ 09:29' },
    { value: '巳', label: '巳(사) 09:30 ~ 11:29' },
    { value: '午', label: '午(오) 11:30 ~ 13:29' },
    { value: '未', label: '未(미) 13:30 ~ 15:29' },
    { value: '申', label: '申(신) 15:30 ~ 17:29' },
    { value: '酉', label: '酉(유) 17:30 ~ 19:29' },
    { value: '戌', label: '戌(술) 19:30 ~ 21:29' },
    { value: '亥', label: '亥(해) 21:30 ~ 23:29' },
  ]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!agreeTerms || !agreePrivacy) {
      alert('서비스 이용 약관 및 개인정보 수집 및 이용에 동의해주세요.')
      return
    }
    setShowPayment(true)
  }

  // 제목으로 productId 찾기
  const getProductIdByTitle = (title: string): number | null => {
    const productMap: Record<string, number> = {
      '이번 달, 우린 다시 만날까? 냉혹한 \'재회 성공률\'': 1,
      '"자니?" 말고, 답장 100%를 부르는 \'연락의 길일(吉日)\'': 2,
    }
    return productMap[title] || null
  }

  const handlePayment = async () => {
    // 본인 정보 검증
    if (!selfName || !selfGender || !selfYear || !selfMonth || !selfDay) {
      alert('본인 정보를 모두 입력해주세요.')
      return
    }

    setIsLoadingClaude(true)
    setShowPayment(false)
    setClaudeResult('')
    setClaudeSections([])
    setShowClaudeResult(false)

    try {
      // productId 가져오기
      const productId = getProductIdByTitle(title)
      if (!productId) {
        throw new Error('상품 정보를 찾을 수 없습니다.')
      }

      // 관리 정보(프롬프트) 가져오기
      const prompts = await getPrompts(productId)
      const menuSubtitleDev = prompts.menuSubtitleDev || ''
      const menuSubtitle = prompts.menuSubtitle || ''
      const charCount = prompts.subtitleCharCount || '1000'

      // 생년월일 조합
      const birthDate = `${selfYear}-${String(selfMonth).padStart(2, '0')}-${String(selfDay).padStart(2, '0')}`
      const birthTime = selfHour || '모름'

      const parseSubtitleList = (raw: string) => {
        if (!raw) return []
        return raw
          .split(/\n+/)
          .map(item => item.trim())
          .filter(Boolean)
      }

      const developerSubtitles = parseSubtitleList(menuSubtitleDev)
      const displaySubtitles = parseSubtitleList(menuSubtitle)

      const baseMessages: ClaudeMessage[] = []

      if (prompts.systemPrompt || prompts.worldview || prompts.personalityPrompt) {
        let systemContent = ''
        if (prompts.systemPrompt) {
          systemContent += `<시스템 프롬프트>\n${prompts.systemPrompt}\n\n`
        }
        if (prompts.worldview) {
          systemContent += `<세계관>\n${prompts.worldview}\n\n`
        }
        if (prompts.personalityPrompt) {
          systemContent += `<성격 프롬프트>\n${prompts.personalityPrompt}\n\n`
        }
        baseMessages.push({ role: 'user', content: systemContent.trim() })
      }

      let personalInfoMessage = `[본인 정보]\n`
      personalInfoMessage += `이름: ${selfName}\n`
      personalInfoMessage += `성별: ${selfGender}\n`
      personalInfoMessage += `생년월일: ${birthDate}\n`
      personalInfoMessage += `태어난 시: ${birthTime}\n\n`
      baseMessages.push({ role: 'user', content: personalInfoMessage })

      const formattingRule = `**중요 출력 형식 규칙:**\n- 마크다운 형식(**텍스트**, ##, ### 등)을 사용하지 마세요.\n- 볼드 표시(**), 이탤릭(*), 헤더(#) 등 모든 마크다운 특수문자를 사용하지 마세요.\n- 소제목은 아래 제공된 "고객 노출용 소제목" 텍스트를 첫 줄에 그대로 사용하세요.\n- 텍스트는 순수한 일반 텍스트로만 작성하세요.\n- 동일한 내용을 반복하지 말고 각 소제목마다 ${charCount}자 내외로 작성하세요.\n\n`

      const developerGuide = developerSubtitles.length > 0
        ? developerSubtitles.map((subtitle, idx) => `${idx + 1}. ${subtitle}`).join('\n')
        : ''
      const displayGuide = displaySubtitles.length > 0
        ? displaySubtitles.map((subtitle, idx) => `${idx + 1}. ${subtitle}`).join('\n')
        : ''

      let combinedInstruction = ''
      if (developerGuide) {
        combinedInstruction += `<상품 메뉴 소제목 (개발 로직용)>\n${developerGuide}\n\n`
        combinedInstruction += `${developerSubtitles.length > 0 ? '위 개발 로직용 항목 순서에 맞춰 ' : ''}전체 상담 내용을 한 번에 작성하세요.\n\n`
      }
      if (displayGuide) {
        combinedInstruction += `<상품 메뉴 소제목 (고객 노출용)>\n${displayGuide}\n\n`
        combinedInstruction += `각 소제목 블록은 위 목록의 제목을 첫 줄로 사용한 뒤, 그 아래에 내용을 작성하세요.\n\n`
      }
      combinedInstruction += formattingRule
      combinedInstruction += `위 정보를 바탕으로 상담 결과를 모두 작성해주세요.`

      const processResponse = (response: ClaudeResponse) => {
        let resultText = ''
        if (response.content && Array.isArray(response.content)) {
          resultText = response.content
            .map((block: any) => {
              if (block.type === 'text' && block.text) {
                return block.text
              }
              return block.text || ''
            })
            .join('')
        }
        const isTruncated = response.stop_reason === 'max_tokens'
        if (!resultText) {
          resultText = '결과를 생성할 수 없습니다.'
        }
        if (isTruncated) {
          resultText += '\n\n⚠️ [주의: 응답이 토큰 제한(8192 토큰)으로 인해 일부만 생성되었습니다. 이어서 작성 요청을 시도합니다.]'
        }
        return { text: resultText, isTruncated }
      }

      const fetchFullResponse = async () => {
        const conversation: ClaudeMessage[] = [
          ...baseMessages,
          { role: 'user', content: combinedInstruction }
        ]
        let accumulatedText = ''
        let attempt = 0
        let continueWriting = true

        while (continueWriting && attempt < 6) {
          attempt += 1
          const response = await callClaudeAPI(conversation)
          const { text, isTruncated } = processResponse(response)
          accumulatedText += accumulatedText ? `\n\n${text}` : text

          console.log('=== Claude 전체 응답 ===')
          console.log('시도 횟수:', attempt)
          console.log('Stop Reason:', response.stop_reason)
          console.log('Content Length:', text.length, '자')
          console.log('Usage:', response.usage)
          console.log('=======================')

          if (!isTruncated) {
            continueWriting = false
            break
          }

          conversation.push({ role: 'assistant', content: text })
          conversation.push({
            role: 'user',
            content: `[이전 응답 이어서 작성]\n이미 작성한 내용을 반복하지 말고, 남아있는 소제목의 상담 내용을 동일한 형식으로 계속 작성하세요.`
          })
        }

        return accumulatedText
      }

      const fullText = await fetchFullResponse()

      const splitByTitles = (text: string, titles: string[]) => {
        if (!titles.length) {
          return [{ title: title, content: text.trim() }]
        }

        const sections: Array<{ title: string; content: string }> = []
        let cursor = 0

        titles.forEach((sectionTitle, index) => {
          const safeTitle = sectionTitle.trim()
          const foundIndex = text.indexOf(safeTitle, cursor)
          if (foundIndex !== -1) {
            if (sections.length) {
              const previous = sections[sections.length - 1]
              previous.content = text.slice(cursor, foundIndex).trim()
            }
            sections.push({ title: safeTitle, content: '' })
            cursor = foundIndex + safeTitle.length
          }
        })

        if (sections.length) {
          sections[sections.length - 1].content = text.slice(cursor).trim()
          return sections.filter(section => section.content.length > 0)
        }

        return [{ title: title, content: text.trim() }]
      }

      const sections = splitByTitles(fullText, displaySubtitles.length ? displaySubtitles : developerSubtitles)

      setClaudeSections(sections)
      setClaudeResult(fullText)
      const resultEntry = { id: `${Date.now()}-${Math.random()}`, title, sections, savedAt: new Date().toISOString() }
      setSavedResults(prev => {
        return [resultEntry, ...prev.slice(0, 19)]
      })

      setShowClaudeResult(true)
    } catch (error) {
      console.error('Claude API 호출 오류:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : '상담 결과를 생성하는 중 오류가 발생했습니다.'
      console.error('Error details:', {
        message: errorMessage,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      })
      alert(`상담 결과 생성 오류:\n${errorMessage}\n\n브라우저 콘솔(F12)에서 자세한 오류 정보를 확인하세요.`)
      setShowClaudeResult(false)
    } finally {
      setIsLoadingClaude(false)
    }
  }

  const handleCoinCharge = () => {
    alert('코인 충전 기능은 구현되지 않았습니다.')
    setShowCoinCharge(false)
  }

  const openSavedResult = (entry: { title: string; sections: Array<{ title: string; content: string }> }) => {
    setClaudeSections(entry.sections)
    setClaudeResult(entry.sections.map(section => `${section.title}\n${section.content}`).join('\n\n'))
    setShowClaudeResult(true)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('saved_claude_results')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setSavedResults(parsed)
        }
      }
    } catch (error) {
      console.error('저장된 상담 결과를 불러오는 중 오류가 발생했습니다.', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('saved_claude_results', JSON.stringify(savedResults))
    } catch (error) {
      console.error('상담 결과를 저장하는 중 오류가 발생했습니다.', error)
    }
  }, [savedResults])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>
        {/* 썸네일 영역 */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            left: '10px', 
            backgroundColor: '#ff4444', 
            color: 'white', 
            padding: '4px 12px', 
            borderRadius: '4px', 
            fontSize: '12px',
            zIndex: 1
          }}>
            NEW
          </div>
          <img 
            src={title === '이번 달, 우린 다시 만날까? 냉혹한 \'재회 성공률\'' ? '/22.jpg' : '/11.jpg'} 
            alt="썸네일" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              borderRadius: '8px',
              display: 'block'
            }} 
          />
        </div>

        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            {title}
          </h1>
        </div>

        {/* 상품 소개 */}
        <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
            소개
          </h2>
          <div 
            style={{ fontSize: '14px', lineHeight: '1.8', marginBottom: '30px', color: '#333' }}
            dangerouslySetInnerHTML={{
              __html: content.introduction
            }}
          />
          
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '30px', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>이런 분께 추천해요✨</h3>
            <div 
              style={{ fontSize: '14px', lineHeight: '1.8', color: '#666' }}
              dangerouslySetInnerHTML={{
                __html: content.recommendation
              }}
            />
          </div>

          <div style={{ borderTop: '1px solid #ddd', paddingTop: '30px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>상품 메뉴 구성</h3>
            <div 
              style={{ fontSize: '14px', lineHeight: '1.8', color: '#666', fontWeight: 'bold' }}
              dangerouslySetInnerHTML={{
                __html: content.menu
              }}
            />
          </div>

          {/* 구분선 */}
          <div style={{ borderTop: '1px solid #ddd', margin: '30px 0' }}></div>

          {/* 전문가 섹션 - 이서윤 (이번 달, 우린 다시 만날까? 냉혹한 '재회 성공률' 제목일 때만 표시) */}
          {title === '이번 달, 우린 다시 만날까? 냉혹한 \'재회 성공률\'' && (
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '25%',
                  aspectRatio: '9/16',
                  flexShrink: 0,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#f0f0f0',
                }}>
                  <img
                    src="/1.jpg"
                    alt="이서윤 전문가"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                    재회 상담 전문가 1: 이서윤 (李瑞潤)
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.8',
                    color: '#333',
                  }}>
                    당신은 국내 최고의 재회 상담 전문가 이서윤입니다. 15년간 3,000건 이상의 재회 상담을 성공적으로 이끌어온 사주명리 전문가로, 천간, 오행, 십신, 일주 분석을 통해 헤어진 연인과의 재회 가능성과 최적의 타이밍을 제시합니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 전문가 섹션 - 최윤아 ("자니?" 말고, 답장 100%를 부르는 '연락의 길일(吉日)' 제목일 때만 표시) */}
          {title === '"자니?" 말고, 답장 100%를 부르는 \'연락의 길일(吉日)\'' && (
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '25%',
                  aspectRatio: '9/16',
                  flexShrink: 0,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#f0f0f0',
                }}>
                  <img
                    src="/2.jpg"
                    alt="최윤아 전문가"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                    재회 상담 전문가 2: 최윤아 (崔潤雅)
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.8',
                    color: '#333',
                  }}>
                    당신은 12년 경력의 재회 상담 전문가 최윤아입니다. 심리상담사 자격과 명리학을 결합하여, 사주 분석에 심리치료적 접근을 더한 독특한 상담 스타일로 2,800건의 재회 성공 사례를 만들어냈습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4444' }}>25,300원</span>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 본인 정보 */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #333' }}>
              본인 정보
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                이름
              </label>
              <input
                type="text"
                value={selfName}
                onChange={(e) => setSelfName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                성별
              </label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="selfGender"
                    value="남자"
                    checked={selfGender === '남자'}
                    onChange={(e) => setSelfGender(e.target.value)}
                    required
                  />
                  <span>남자</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="selfGender"
                    value="여자"
                    checked={selfGender === '여자'}
                    onChange={(e) => setSelfGender(e.target.value)}
                    required
                  />
                  <span>여자</span>
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                생년월일
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={selfCalendar}
                  onChange={(e) => setSelfCalendar(e.target.value)}
                  style={{
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                >
                  <option value="양력">양력</option>
                  <option value="음력">음력</option>
                  <option value="음력(윤)">음력(윤)</option>
                </select>
                <select
                  value={selfYear}
                  onChange={(e) => setSelfYear(e.target.value)}
                  required
                  style={{
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    outline: 'none',
                    minWidth: '100px'
                  }}
                >
                  <option value="">년</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>
                <select
                  value={selfMonth}
                  onChange={(e) => setSelfMonth(e.target.value)}
                  required
                  style={{
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    outline: 'none',
                    minWidth: '80px'
                  }}
                >
                  <option value="">월</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}월</option>
                  ))}
                </select>
                <select
                  value={selfDay}
                  onChange={(e) => setSelfDay(e.target.value)}
                  required
                  style={{
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    outline: 'none',
                    minWidth: '80px'
                  }}
                >
                  <option value="">일</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}일</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                태어난시
              </label>
              <select
                value={selfHour}
                onChange={(e) => setSelfHour(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  outline: 'none'
                }}
              >
                {hours.map(hour => (
                  <option key={hour.value} value={hour.value}>{hour.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 이성 정보 */}
          <div style={{ marginBottom: '40px', display: 'none' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #333' }}>
              이성 정보
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                이름
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                성별
              </label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="partnerGender"
                    value="남자"
                    checked={partnerGender === '남자'}
                    onChange={(e) => setPartnerGender(e.target.value)}
                  />
                  <span>남자</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="partnerGender"
                    value="여자"
                    checked={partnerGender === '여자'}
                    onChange={(e) => setPartnerGender(e.target.value)}
                  />
                  <span>여자</span>
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                생년월일
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={partnerCalendar}
                  onChange={(e) => setPartnerCalendar(e.target.value)}
                  style={{
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                >
                  <option value="양력">양력</option>
                  <option value="음력">음력</option>
                  <option value="음력(윤)">음력(윤)</option>
                </select>
                <select
                  value={partnerYear}
                  onChange={(e) => setPartnerYear(e.target.value)}
                  style={{
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    outline: 'none',
                    minWidth: '100px'
                  }}
                >
                  <option value="">년</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>
                <select
                  value={partnerMonth}
                  onChange={(e) => setPartnerMonth(e.target.value)}
                  style={{
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    outline: 'none',
                    minWidth: '80px'
                  }}
                >
                  <option value="">월</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}월</option>
                  ))}
                </select>
                <select
                  value={partnerDay}
                  onChange={(e) => setPartnerDay(e.target.value)}
                  style={{
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    outline: 'none',
                    minWidth: '80px'
                  }}
                >
                  <option value="">일</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}일</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                태어난시
              </label>
              <select
                value={partnerHour}
                onChange={(e) => setPartnerHour(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  outline: 'none'
                }}
              >
                {hours.map(hour => (
                  <option key={hour.value} value={hour.value}>{hour.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberBirthday}
                  onChange={(e) => setRememberBirthday(e.target.checked)}
                />
                <span style={{ fontSize: '14px' }}>생년월일 기억하기</span>
              </label>
            </div>
          </div>

          {/* 약관 동의 */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                />
                <span style={{ fontSize: '14px' }}>
                  서비스 이용 약관에 동의{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0070f3',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    [이용약관보기]
                  </button>
                </span>
              </label>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  required
                />
                <span style={{ fontSize: '14px' }}>
                  개인정보 수집 및 이용동의{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacy(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0070f3',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    [고지내용보기]
                  </button>
                </span>
              </label>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => window.history.back()}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              이전으로
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              결제하기
            </button>
          </div>
        </form>

        {/* 이용안내 */}
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>이용안내</h3>
          <table style={{ width: '100%', fontSize: '14px', lineHeight: '1.6' }}>
            <tbody>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: 'white' }}>
                  ※회원님의 실수로 인하여 결제된 서비스에 대해서는 교환및 환불이 안됩니다.
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: 'white' }}>
                  ※운세 결과는 60일간 메인→하단 비회원 다시보기에서 이용하실 수 있습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {savedResults.length > 0 && (
          <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#fff8f0', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>저장된 상담 결과</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {savedResults.map((entry) => (
                <div key={entry.id} style={{ backgroundColor: 'white', border: '1px solid #ffd5b0', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>{entry.title}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      저장 시각: {new Date(entry.savedAt).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <button
                    onClick={() => openSavedResult(entry)}
                    style={{
                      padding: '10px 18px',
                      backgroundColor: '#ff7f50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    다시 보기
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 결제 모달 */}
      {showPayment && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowPayment(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>결제하기</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>결제정보</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                      서비스명
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      소문난 사랑궁합
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                      이용금액
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      25,300원(25,300코인)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>카드결제</h3>
              <button
                type="button"
                onClick={handlePayment}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                카드결제
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>휴대폰 결제</h3>
              <button
                type="button"
                onClick={handlePayment}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                휴대폰 결제
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>실시간 계좌이체</h3>
              <button
                type="button"
                onClick={handlePayment}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                실시간 계좌이체
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowPayment(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                취소하기
              </button>
              <button
                type="button"
                onClick={() => setShowCoinCharge(true)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                코인충전하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 코인 충전 모달 */}
      {showCoinCharge && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowCoinCharge(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>코인충전하기</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>카드결제</h3>
              <button
                type="button"
                onClick={handleCoinCharge}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '20px'
                }}
              >
                카드결제
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>실시간 계좌이체</h3>
              <button
                type="button"
                onClick={handleCoinCharge}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '20px'
                }}
              >
                실시간 계좌이체
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>결제금액</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>충전코인</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>10,000원</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>10,300코인 (+3%)</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>30,000원</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>33,000코인 (+10%)</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>50,000원</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>60,000코인 (+20%)</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>100,000원</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>130,000코인 (+30%)</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCoinCharge(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                취소하기
              </button>
              <button
                type="button"
                onClick={handleCoinCharge}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                결제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 약관 모달 */}
      {showTerms && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowTerms(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>서비스 이용 약관 동의 안내</h2>
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                닫기
              </button>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
              <p>서비스 이용 약관 내용이 여기에 표시됩니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* Claude 결과 팝업 */}
      {showClaudeResult && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowClaudeResult(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 (고정) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 30px',
              borderBottom: '2px solid #e5e5e5',
              flexShrink: 0
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                상담 결과
              </h2>
              <button
                onClick={() => setShowClaudeResult(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            
            {/* 내용 영역 (스크롤 가능) */}
            <div 
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '20px 30px',
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#333',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                WebkitOverflowScrolling: 'touch',
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
              onWheel={(e) => {
                e.stopPropagation()
              }}
            >
              {claudeSections.map((section, index) => (
                <div key={`${section.title}-${index}`} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px', backgroundColor: '#fafafa' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 700 }}>{section.title}</h3>
                  <div>{section.content}</div>
                </div>
              ))}
              {isLoadingClaude && (
                <div style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>
                  다음 챕터를 생성 중입니다...
                </div>
              )}
            </div>
            
            {/* 버튼 영역 (고정) */}
            <div style={{
              padding: '20px 30px',
              borderTop: '1px solid #e5e5e5',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              flexShrink: 0
            }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                if (!claudeSections.length) {
                  alert('저장할 상담 결과가 없습니다.')
                  return
                }
                const entry = {
                  id: `${Date.now()}-${Math.random()}`,
                  title,
                  savedAt: new Date().toISOString(),
                  sections: claudeSections,
                }
                setSavedResults(prev => [entry, ...prev].slice(0, 20))
                alert('상담 결과가 저장되었습니다.')
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4a90e2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              결과 저장
            </button>
            <button
              onClick={() => setShowClaudeResult(false)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c5ce7',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              닫기
            </button>
          </div>
            </div>
          </div>
        </div>
      )}

      {/* 로딩 팝업 */}
      {isLoadingClaude && !showClaudeResult && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '20px',
              color: '#333'
            }}>
              상담 결과를 생성하는 중...
            </div>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #6c5ce7',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        </div>
      )}

      {/* 개인정보 모달 */}
      {showPrivacy && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowPrivacy(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>개인정보 수집 및 이용 동의 안내</h2>
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                닫기
              </button>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
              <p>개인정보 수집 및 이용 동의 내용이 여기에 표시됩니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', color: '#666', fontSize: '12px' }}>
        Copyrights © 2022 All Rights Reserved by Techenjoy Inc.
      </div>
    </div>
  )
}

export default function FormPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div>로딩 중...</div>
      </div>
    }>
      <FormContent />
    </Suspense>
  )
}

