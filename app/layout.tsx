import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Razz - Card Reveal Game',
  description: 'A full-stack raffle/turn-based card-reveal game app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0b0f17] text-zinc-200 antialiased`}> 
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}



