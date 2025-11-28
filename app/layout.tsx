import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '소문난 사랑궁합',
  description: '소문난 사랑궁합 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}





