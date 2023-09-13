import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Nunito } from '@next/font/google'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', display: 'swap' })

export default function App({ Component, pageProps }: AppProps) {
  return <main className={nunito.className}><Component {...pageProps} /></main>
}
