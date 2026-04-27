import '@/styles/globals.css'
import '@/styles/global-vars.css'
import { PT_Sans } from 'next/font/google'

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
})

export default function App({ Component, pageProps }) {
  return (
    <main className={`${ptSans.variable} font-sans`}>
      <Component {...pageProps} />
    </main>
  )
}
