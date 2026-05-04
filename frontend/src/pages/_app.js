import '@/styles/globals.css'
import '@/styles/global-vars.css'
import { PT_Sans, Montserrat } from 'next/font/google'

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-montserrat',
})

export default function App({ Component, pageProps }) {
  return (
    <main className={`${ptSans.variable} ${montserrat.variable} font-sans`}>
      <Component {...pageProps} />
    </main>
  )
}
