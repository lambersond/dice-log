import { NextResponse, type NextRequest } from 'next/server'
import { USER_COOKIE_OPTIONS, USER_ID_COOKIE } from '@/lib/user-cookies'

export function proxy(request: NextRequest) {
  if (request.cookies.has(USER_ID_COOKIE)) {
    return NextResponse.next()
  }

  const id = crypto.randomUUID()
  const response = NextResponse.next()
  response.cookies.set(USER_ID_COOKIE, id, USER_COOKIE_OPTIONS)
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
