import type { EdgeRequest, EdgeResponse } from 'next'
import { DOMAINS } from '@lib/domains'
import datadome from '@lib/datadome'

export async function middleware(req: EdgeRequest, res: EdgeResponse, next) {
  const proxy = DOMAINS[req.url.pathname]

  if (proxy) {
    res.rewrite(proxy.src)
    return
  }

  if (req.url.pathname === '/omit') {
    next()
    return
  }

  if (req.url.pathname === '/blocked') {
    req.headers.set('user-agent', 'BLOCKUA')
  }

  const latency = await datadome(
    req,
    res,
    req.url.pathname === '/no-connection' ? { Connection: 'close' } : {}
  )

  if (!latency) return

  res.setHeader(
    'x-datadome-latency',
    String(latency === true ? 'Unavailable' : latency)
  )

  next()
}
