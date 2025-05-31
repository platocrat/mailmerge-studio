// Externals
import Link from 'next/link'
import type { Metadata } from 'next'
import { Mail, Github } from 'lucide-react'
import { Geist, Geist_Mono } from 'next/font/google'
// Locals
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className='min-h-screen flex flex-col bg-gray-50'>
          {/* Header */}
          <header className='bg-white shadow-sm'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <div className='flex justify-between items-center py-4'>
                <div className='flex items-center'>
                  <Link href='/' className='flex items-center'>
                    <Mail className='h-8 w-8 text-blue-600' />
                    <span className='ml-2 text-xl font-bold text-gray-900'>
                      { `MailMerge Studio` }
                    </span>
                  </Link>
                </div>
                <nav className='flex space-x-6'>
                  <Link href='/' className='text-gray-700 hover:text-blue-600 font-medium'>
                    { `Home` }
                  </Link>
                  <Link href='/demo' className='text-gray-700 hover:text-blue-600 font-medium'>
                    { `Demo` }
                  </Link>
                  <a
                    href='https://github.com/platocrat/mailmerge-studio'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-gray-700 hover:text-blue-600 font-medium flex items-center'
                  >
                    <Github className='h-4 w-4 mr-1' />
                    { `GitHub` }
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className='flex-grow'>
            {children}
          </main>

          {/* Footer */}
          <footer className='bg-white border-t border-gray-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
              <div className='flex flex-col md:flex-row justify-between items-center'>
                <div className='flex items-center'>
                  <Mail className='h-6 w-6 text-blue-600' />
                  <span className='ml-2 text-lg font-semibold text-gray-700'>
                    { `MailMerge Studio` }
                  </span>
                </div>
                <div className='mt-4 md:mt-0 text-center md:text-right'>
                  <p className='text-sm text-gray-500'>
                    &copy; { `2025 MailMerge Studio. All rights reserved.` }
                  </p>
                  <div className='mt-2 flex justify-center md:justify-end space-x-4'>
                    <a href='#' className='text-gray-500 hover:text-blue-600 text-sm'>
                      { `Privacy Policy` }
                    </a>
                    <a href='#' className='text-gray-500 hover:text-blue-600 text-sm'>
                      { `Terms of Service` }
                    </a>
                    <a href='#' className='text-gray-500 hover:text-blue-600 text-sm'>
                      { `Accessibility` }
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
