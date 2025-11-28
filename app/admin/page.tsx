'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const products = [
  {
    id: 1,
    title: '이번 달, 우린 다시 만날까? 냉혹한 \'재회 성공률\'',
  },
  {
    id: 2,
    title: '"자니?" 말고, 답장 100%를 부르는 \'연락의 길일(吉日)\'',
  },
]

export default function AdminPage() {
  const router = useRouter()
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [worldview, setWorldview] = useState('')
  const [personalityPrompt, setPersonalityPrompt] = useState('')
  const [menuSubtitleDev, setMenuSubtitleDev] = useState('')
  const [menuSubtitle, setMenuSubtitle] = useState('')
  const [subtitleCharCount, setSubtitleCharCount] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keyStatus, setKeyStatus] = useState<{
    configured: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    // 첫 번째 상품을 기본 선택
    if (products.length > 0 && selectedProductId === null) {
      setSelectedProductId(products[0].id)
    }
    
    // Supabase 키 체크
    checkSupabaseKeys()
  }, [])

  const checkSupabaseKeys = async () => {
    try {
      const response = await fetch('/api/check-supabase')
      const data = await response.json()
      setKeyStatus({
        configured: data.configured,
        message: data.message,
      })
    } catch (error) {
      setKeyStatus({
        configured: false,
        message: '키 체크 중 오류가 발생했습니다.',
      })
    }
  }

  useEffect(() => {
    // 선택된 상품의 프롬프트 불러오기
    if (selectedProductId !== null) {
      loadPrompts(selectedProductId)
    }
  }, [selectedProductId])

  const loadPrompts = async (productId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/prompts?productId=${productId}`)
      if (!response.ok) {
        throw new Error('프롬프트를 불러오는데 실패했습니다.')
      }
      const data = await response.json()
      setSystemPrompt(data.systemPrompt || '')
      setWorldview(data.worldview || '')
      setPersonalityPrompt(data.personalityPrompt || '')
      setMenuSubtitleDev(data.menuSubtitleDev || '')
      setMenuSubtitle(data.menuSubtitle || '')
      // subtitleCharCount가 있으면 사용, 없으면 빈 문자열
      const charCount = data.subtitleCharCount
      setSubtitleCharCount(charCount !== null && charCount !== undefined && charCount !== '' ? String(charCount) : '')
    } catch (err) {
      console.error('Error loading prompts:', err)
      setError(err instanceof Error ? err.message : '프롬프트를 불러오는데 실패했습니다.')
      // 에러 발생 시 빈 값으로 설정
      setSystemPrompt('')
      setWorldview('')
      setPersonalityPrompt('')
      setMenuSubtitleDev('')
      setMenuSubtitle('')
      setSubtitleCharCount('1000')
    } finally {
      setLoading(false)
    }
  }

  const handleProductChange = (productId: number) => {
    setSelectedProductId(productId)
  }

  const handleSave = async () => {
    if (selectedProductId === null) return

    setLoading(true)
    setError(null)
    setSaved(false)

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProductId,
          systemPrompt,
          worldview,
          personalityPrompt,
          menuSubtitleDev,
          menuSubtitle,
          subtitleCharCount,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '저장에 실패했습니다.')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Error saving prompts:', err)
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (selectedProductId === null) return
    
    if (confirm('현재 상품의 프롬프트를 초기화하시겠습니까?')) {
      setSystemPrompt('')
      setWorldview('')
      setPersonalityPrompt('')
      setMenuSubtitle('')
    }
  }

  const selectedProduct = products.find(p => p.id === selectedProductId)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '2px solid #e5e5e5',
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#333',
            margin: 0,
          }}>
            관리 페이지
          </h1>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c5ce7',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            홈으로
          </button>
        </div>

        {/* Supabase 키 상태 */}
        {keyStatus && (
          <div style={{
            padding: '12px 20px',
            backgroundColor: keyStatus.configured ? '#e8f5e9' : '#ffebee',
            color: keyStatus.configured ? '#2e7d32' : '#c62828',
            borderRadius: '6px',
            marginBottom: '20px',
            border: `1px solid ${keyStatus.configured ? '#4caf50' : '#ef5350'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{keyStatus.message}</span>
              <button
                onClick={checkSupabaseKeys}
                style={{
                  padding: '4px 12px',
                  backgroundColor: 'transparent',
                  color: keyStatus.configured ? '#2e7d32' : '#c62828',
                  border: `1px solid ${keyStatus.configured ? '#4caf50' : '#ef5350'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                다시 확인
              </button>
            </div>
          </div>
        )}

        {/* 상품 선택 */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#333',
          }}>
            상품 선택
          </label>
          <select
            value={selectedProductId || ''}
            onChange={(e) => handleProductChange(Number(e.target.value))}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 15px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: loading ? '#f5f5f5' : 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </select>
          {selectedProduct && (
            <p style={{
              marginTop: '10px',
              fontSize: '14px',
              color: '#666',
              fontStyle: 'italic',
            }}>
              현재 선택: {selectedProduct.title}
            </p>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#ff4444',
            color: 'white',
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* 저장 성공 메시지 */}
        {saved && (
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            저장되었습니다!
          </div>
        )}

        {/* 로딩 메시지 */}
        {loading && (
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            처리 중...
          </div>
        )}

        {/* 시스템 프롬프트 */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#333',
          }}>
            시스템 프롬프트
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="시스템 프롬프트를 입력하세요..."
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '15px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontFamily: 'inherit',
              resize: 'vertical',
              backgroundColor: loading ? '#f5f5f5' : 'white',
            }}
          />
        </div>

        {/* 세계관 */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#333',
          }}>
            세계관
          </label>
          <textarea
            value={worldview}
            onChange={(e) => setWorldview(e.target.value)}
            placeholder="세계관을 입력하세요..."
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '15px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontFamily: 'inherit',
              resize: 'vertical',
              backgroundColor: loading ? '#f5f5f5' : 'white',
            }}
          />
        </div>

        {/* 성격 프롬프트 */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#333',
          }}>
            성격 프롬프트
          </label>
          <textarea
            value={personalityPrompt}
            onChange={(e) => setPersonalityPrompt(e.target.value)}
            placeholder="성격 프롬프트를 입력하세요..."
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '15px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontFamily: 'inherit',
              resize: 'vertical',
              backgroundColor: loading ? '#f5f5f5' : 'white',
            }}
          />
        </div>

        {/* 상품 메뉴 소제목 (개발 로직용) */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#333',
          }}>
            상품 메뉴 소제목 (개발 로직용)
          </label>
          <textarea
            value={menuSubtitleDev}
            onChange={(e) => setMenuSubtitleDev(e.target.value)}
            placeholder="개발 로직용 메뉴 소제목을 입력하세요..."
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '15px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontFamily: 'inherit',
              resize: 'vertical',
              backgroundColor: loading ? '#f5f5f5' : 'white',
            }}
          />
        </div>

        {/* 상품 메뉴 소제목 (고객 노출용) */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#333',
          }}>
            상품 메뉴 소제목 (고객 노출용)
          </label>
          <textarea
            value={menuSubtitle}
            onChange={(e) => setMenuSubtitle(e.target.value)}
            placeholder="고객에게 노출될 메뉴 소제목을 입력하세요..."
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '15px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontFamily: 'inherit',
              resize: 'vertical',
              backgroundColor: loading ? '#f5f5f5' : 'white',
            }}
          />
        </div>

        {/* 소제목당 글자수 */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#333',
          }}>
            소제목당 글자수
          </label>
          <input
            type="number"
            value={subtitleCharCount}
            onChange={(e) => setSubtitleCharCount(e.target.value)}
            placeholder="1000"
            disabled={loading}
            min="1"
            style={{
              width: '100%',
              padding: '12px 15px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontFamily: 'inherit',
              backgroundColor: loading ? '#f5f5f5' : 'white',
            }}
          />
          <p style={{
            marginTop: '8px',
            fontSize: '13px',
            color: '#666',
            fontStyle: 'italic',
          }}>
            각 소제목당 작성할 글자수를 입력하세요.
          </p>
        </div>

        {/* 버튼 */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleReset}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#f5f5f5' : '#f5f5f5',
              color: loading ? '#999' : '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            초기화
          </button>
          <button
            onClick={handleSave}
            disabled={selectedProductId === null || loading}
            style={{
              padding: '12px 24px',
              backgroundColor: (selectedProductId === null || loading) ? '#ccc' : '#6c5ce7',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (selectedProductId === null || loading) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
