// src/app/layout.tsx
// Externals
import { Metadata } from 'next'
import { ReactNode } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
// Locals
import { Header, Footer } from '@/components/Nav'
import { SessionLayout } from '@/components/Layouts'
import ProgressBar from '@/components/Progress/ProgressBar'
// CSS
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'MailMerge Studio',
  description: 'Transform your emails into dashboards with no code.',
}

/**
 * @dev Root layout for the app
 * @param {Object} param0 - The props object
 * @param {React.ReactNode} param0.children - The children components
 * @returns {React.ReactNode} The root layout component
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ProgressBar>
          <SessionLayout>
            <div className='min-h-screen flex flex-col bg-gray-50'>
              <Header />

              {/* Main content */}
              <main className='flex-grow text-black'>
                { children }
              </main>

              <Footer />
            </div>
          </SessionLayout>
        </ProgressBar>
      </body>
    </html>
  )
}
