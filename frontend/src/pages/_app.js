import '@/styles/globals.css'
import '@/styles/global-vars.css'
import { PT_Sans, Montserrat } from 'next/font/google'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

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
  const router = useRouter();

  useEffect(() => {
    // Solo contar visitas que no sean de administración
    if (!router.pathname.startsWith('/administracion')) {
      const visitKey = 'et32_last_visit';
      const lastVisit = localStorage.getItem(visitKey);
      const now = Date.now();
      const ONE_HOUR = 3600000; // 1 hora en milisegundos

      if (!lastVisit || (now - parseInt(lastVisit) > ONE_HOUR)) {
        fetch('/api/stats', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isNewSession: true })
        })
        .then(() => localStorage.setItem(visitKey, now.toString()))
        .catch(err => console.error('Error tracking visit:', err));
      }
    }
  }, [router.pathname]);

  return (
    <main className={`${ptSans.variable} ${montserrat.variable} font-sans`}>
      <Component {...pageProps} />
    </main>
  )
}
