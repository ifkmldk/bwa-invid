import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BWA Invites',
  description: 'Undangan digital Indonesia.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
