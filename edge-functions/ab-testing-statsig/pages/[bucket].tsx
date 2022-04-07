import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import {
  Layout,
  Text,
  Page,
  Button,
  Link,
  Snippet,
  Code,
} from '@vercel/examples-ui'
import { useRouter } from 'next/router'
import Cookie from 'js-cookie'
import { Statsig } from 'statsig-react'

interface Props {
  bucket: string
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  return {
    props: {
      bucket: params?.bucket as string,
    },
  }
}

export const getStaticPaths: GetStaticPaths<{ bucket: string }> = async () => {
  // Buckets that we want to statically generate
  const buckets: string[] = ['a', 'b']

  return {
    paths: buckets.map((bucket) => ({
      params: {
        bucket,
      },
    })),
    fallback: 'blocking',
  }
}

function BucketPage({ bucket }: Props) {
  const { reload } = useRouter()

  function resetBucket() {
    Cookie.remove('uid')
    Statsig.logEvent('reset-bucket')
    reload()
  }

  return (
    <Page className="flex flex-col gap-12">
      <Head>
        <title>AB testing with Statsig - Vercel Example</title>
        <meta
          name="description"
          content="Vercel example how to use ab-testing-statsig"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="flex flex-col gap-6">
        <Text variant="h1">AB testing with Statsig</Text>
        <Text>
          In this demo we use Statsig&apos;s Edge SDK to pull experiment variant
          and show the resulting allocation. As long as you have a bucket
          assigned you will always see the same result, otherwise you will be
          assigned a bucket to maintain the odds in 50/50.
        </Text>
        <Text>
          Buckets are statically generated at build time in a{' '}
          <Code>/[bucket]</Code> page so its fast to rewrite to them.
        </Text>
        <Text>
          The middleware implementation is in <Code>pages/_middleware.ts</Code>:
        </Text>
        <Snippet>{`import { NextRequest, NextResponse } from 'next/server'
// \`statsig-node\` also works in the V8 environment of Edge Functions
import statsig from 'statsig-node'

// Store a cookie for the user
const UID_COOKIE = 'uid'

export async function middleware(req: NextRequest) {
  // Clone the URL
  const url = req.nextUrl.clone()

  // Just run for the / path
  if (req.nextUrl.pathname !== '/') {
    return NextResponse.next()
  }

  // Initialize the statsig client, rules are fetched in this step
  // and saved in memory for reuse in subsequent requests
  await statsig.initialize(process.env.STATSIG_SERVER_API_KEY as string, {
    // We only want to wait at a max 300ms for statsig to respond
    initTimeoutMs: 300,
  })

  // Get users UID from the cookie
  let userID = req.cookies[UID_COOKIE]

  // Set a userID if not present
  if (!userID) {
    userID = crypto.randomUUID()
  }

  // Get the experiment from statsig
  const experiment = await statsig.getExperiment({ userID }, 'new_homepage')

  // Get bucket from experiment
  const bucket = experiment.get('name', 'a')

  // Change the pathname to point to the correct bucket
  url.pathname = \`/${bucket}\`

  // Create a response
  const response = NextResponse.rewrite(url)

  // Set cookie if not present
  if (!req.cookies[UID_COOKIE]) {
    response.cookie(UID_COOKIE, userID)
  }

  // Return the response
  return response
}`}</Snippet>
        <Text>
          You can reset the bucket multiple times to get a different bucket
          assigned. You can configure your experiments, see diagnostics and
          results in the{' '}
          <Link href="https://console.statsig.com/">Statsig console</Link>.
        </Text>
        <pre className="bg-black text-white font-mono text-left py-2 px-4 rounded-lg text-sm leading-6">
          bucket: {bucket}
        </pre>
        <Button size="lg" onClick={resetBucket}>
          Reset bucket
        </Button>
      </section>

      <section className="flex flex-col gap-6">
        <Text variant="h2">Using metrics in your experiments</Text>
        <Text>
          <Link href="https://docs.statsig.com/metrics">Statsig Metrics</Link>{' '}
          are a way to track events that happen in your site. To enable them we
          use the <Code>StatsigProvider</Code> in{' '}
          <Link href="https://nextjs.org/docs/advanced-features/custom-app">
            <Code>pages/_app.tsx</Code>
          </Link>
          :
        </Text>
        <Snippet>{`import Cookies from 'js-cookie'
import { StatsigProvider } from 'statsig-react'

function App({ Component, pageProps }: AppProps) {
  const Layout = getLayout<LayoutProps>(Component)

  // middleware will automatically set a cookie for the user if they visit a page
  const userID = Cookies.get('uid')

  return (
    <StatsigProvider
      sdkKey={process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY!}
      waitForInitialization={true}
      user={{ userID }}
    >
      <Layout title="statsig-metric" path="solutions/statsig-metric">
        <Component {...pageProps} />
      </Layout>
    </StatsigProvider>
  )
}`}</Snippet>
        <Text>
          Now we can use <Code>Statsig.logEvent</Code> to track events during
          experiments:
        </Text>
        <Snippet>{`import { Statsig } from 'statsig-react';

...

export default function MyComponent(): JSX.Element {

  return
    <Button
      onClick={() => {
        // this can be any event like adding an item to a cart or clicking a CTA button.
        Statsig.logEvent('button_clicked');
      }}
    />;
}
`}</Snippet>
      </section>
    </Page>
  )
}

BucketPage.Layout = Layout

export default BucketPage
