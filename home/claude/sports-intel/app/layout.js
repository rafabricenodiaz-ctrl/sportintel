// app/layout.js
import { Syne, DM_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
})

export const metadata = {
  title: 'Sports Intel',
  description: 'Live odds, value bets, and soccer fixtures — all in one dashboard.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
