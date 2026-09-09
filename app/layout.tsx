import './globals.css'
import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Providers } from './providers'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Undanganku — Undangan Digital Indonesia',
  description: 'Pilih template, isi data, dan bagikan undangan pernikahanmu dalam hitungan menit.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
