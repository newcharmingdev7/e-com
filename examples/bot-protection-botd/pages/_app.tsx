import type { AppProps } from 'next/app'
import Botd from '@lib/botd/script'
import '../styles.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Botd
      onLoad={() => {
        // You can do a general page check here with Botd. We
        // are skipping this for demo purposes because each
        // page is calling botDetect() and logging the result
        //
        // await botDetect()
      }}
    >
      <Component {...pageProps} />
    </Botd>
  )
}

export default MyApp
