/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { config, proxy } from './proxy'
import { USER_COOKIE_OPTIONS, USER_ID_COOKIE } from '@/lib/user-cookies'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const buildRequest = (cookieHeader?: string) =>
  new NextRequest('http://localhost:3000/', {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  })

describe('proxy', () => {
  it('does not set a cookie when the user_id is already present', () => {
    const response = proxy(buildRequest(`${USER_ID_COOKIE}=existing-id`))

    expect(response.cookies.get(USER_ID_COOKIE)).toBeUndefined()
  })

  it('mints a UUID into user_id when the cookie is missing', () => {
    const response = proxy(buildRequest())

    const cookie = response.cookies.get(USER_ID_COOKIE)
    expect(cookie?.value).toMatch(UUID_PATTERN)
  })

  it('uses the shared cookie options when minting', () => {
    const response = proxy(buildRequest())

    const cookie = response.cookies.get(USER_ID_COOKIE)
    expect(cookie?.path).toBe(USER_COOKIE_OPTIONS.path)
    expect(cookie?.sameSite).toBe(USER_COOKIE_OPTIONS.sameSite)
    expect(cookie?.maxAge).toBe(USER_COOKIE_OPTIONS.maxAge)
    expect(cookie?.httpOnly).toBe(USER_COOKIE_OPTIONS.httpOnly)
  })

  it('mints a fresh UUID for each minted request', () => {
    const a = proxy(buildRequest())
    const b = proxy(buildRequest())

    expect(a.cookies.get(USER_ID_COOKIE)?.value).not.toBe(
      b.cookies.get(USER_ID_COOKIE)?.value,
    )
  })

  it('skips API, Next internals, and favicon via the matcher', () => {
    expect(config.matcher).toEqual([
      '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ])
  })
})
