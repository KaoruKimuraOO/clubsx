import { rewrite, next } from '@vercel/edge'

export const config = {
  matcher: ['/((?!api|assets|chunks|[\\w-]+\\.\\w+).*)'],
}

export default function middleware(req: Request) {
  const url = new URL(req.url)

  const hostname = req.headers.get('host')?.split('.') ?? []
  const [tenant] = hostname
  const html = req.headers.get('accept')?.includes('text/html')

  if (html && hostname.length > 2) {
    const pathname = `/sites_/${tenant}${url.pathname}`
    return rewrite(new URL(pathname, url.href))
  }

  return next()
}
