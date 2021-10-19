import { NextFetchEvent, NextResponse } from 'next/server'

export function middleware(ev: NextFetchEvent) {
  const req = ev.request
  const country = req.geo.country?.toLowerCase() || 'us'

  req.nextUrl.pathname = `/${country}`
  ev.respondWith(NextResponse.rewrite(ev.request.nextUrl))
}
