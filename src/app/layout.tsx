import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { CommandMenu } from '@/components/layout/CommandMenu'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'LLM Training Failure Diagnosis',
  description: 'A tool for diagnosing large model training failures.',
  openGraph: {
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
      },
    ],
  },
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
        <CommandMenu />
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  )
}
