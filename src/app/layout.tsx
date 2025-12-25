import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'LLM Training Failure Diagnosis',
  description: 'A tool for diagnosing large model training failures.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  )
}
