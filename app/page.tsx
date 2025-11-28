'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('전체')

  const tabs = [
    { id: '전체', name: '전체' },
    { id: '전문사주', name: '전문사주' },
    { id: '사주타로', name: '사주타로' },
    { id: '타로', name: '타로' },
  ]

  const products = [
    {
      id: 1,
      title: '이번 달, 우린 다시 만날까? 냉혹한 \'재회 성공률\'',
      image: '/22.jpg',
      discount: 26,
      originalPrice: 42000,
      discountedPrice: 31000,
      reviewCount: 49,
      rank: { category: '재회', position: 9 },
      category: '전체',
    },
    {
      id: 2,
      title: '"자니?" 말고, 답장 100%를 부르는 \'연락의 길일(吉日)\'',
      image: '/11.jpg',
      discount: 26,
      originalPrice: 33000,
      discountedPrice: 24500,
      reviewCount: 54,
      rank: null,
      category: '전체',
    },
  ]

  const filteredProducts = selectedTab === '전체'
    ? products
    : products.filter(product => product.category === selectedTab)

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR')
  }

  const handleProductClick = (product: typeof products[0]) => {
    const title = encodeURIComponent(product.title)
    router.push(`/form?title=${title}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      padding: '0',
    }}>
      {/* 헤더 */}
      <header style={{
        backgroundColor: 'white',
        padding: '20px 16px',
        borderBottom: '1px solid #e5e5e5',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#000000',
            margin: 0,
            padding: 0,
          }}>
            재회
          </h1>
          <button
            onClick={() => router.push('/admin')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c5ce7',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            관리
          </button>
        </div>
        
        {/* 탭 네비게이션 */}
        <div style={{
          display: 'flex',
          gap: '8px',
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedTab === tab.id ? '#4a4a4a' : '#f5f5f5',
                color: selectedTab === tab.id ? '#ffffff' : '#666666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedTab === tab.id ? '600' : '400',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </header>

      {/* 상품 리스트 */}
      <main style={{
        padding: '16px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid #e5e5e5',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
              }}>
                {/* 썸네일 이미지 */}
                <div style={{
                  width: '100px',
                  height: '100px',
                  flexShrink: 0,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#f0f0f0',
                }}>
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                {/* 상품 정보 */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minWidth: 0,
                }}>
                  {/* 제목 */}
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#000000',
                    margin: '0 0 8px 0',
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {product.title}
                  </h3>

                  {/* 가격 및 정보 */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}>
                    {/* 할인율 및 가격 */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#ff4444',
                      }}>
                        {product.discount}%
                      </span>
                      <span style={{
                        fontSize: '13px',
                        color: '#999999',
                        textDecoration: 'line-through',
                      }}>
                        {formatPrice(product.originalPrice)}원
                      </span>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#000000',
                      }}>
                        {formatPrice(product.discountedPrice)}원
                      </span>
                    </div>

                    {/* 리뷰 및 순위 */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      {product.reviewCount > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#e3f2fd',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#1976d2',
                        }}>
                          <span>💬</span>
                          <span>{product.reviewCount}</span>
                        </div>
                      )}
                      {product.rank && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#fff3e0',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#f57c00',
                        }}>
                          <span>🔥</span>
                          <span>{product.rank.category} {product.rank.position}위</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
