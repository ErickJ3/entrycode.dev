import type { Metadata } from 'next'
import './globals.css'
import Providers from '~/lib/providers'
import { Header } from '~/components/header'

export const metadata: Metadata = {
  title: 'EntryCode',
  description: 'Your first contrib for open-source',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
