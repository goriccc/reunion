'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SubPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/form')
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div>로딩 중...</div>
    </div>
  )
}


