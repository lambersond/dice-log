import * as Ably from 'ably'
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUserId } from '@/lib/user-cookies'

const PROD_ALLOWED_ORIGINS = new Set([
  'https://dice.illagria.com',
  'https://dice-log-zeta.vercel.app',
])

function corsHeaders(request: NextRequest) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }

  const origin = request.headers.get('origin')
  if (process.env.NODE_ENV === 'production') {
    if (origin && PROD_ALLOWED_ORIGINS.has(origin)) {
      headers['Access-Control-Allow-Origin'] = origin
    }
  } else {
    headers['Access-Control-Allow-Origin'] = origin ?? '*'
  }

  return headers
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(undefined, {
    status: 204,
    headers: corsHeaders(request),
  })
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.ABLY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing ABLY_API_KEY' }, { status: 500 })
  }

  const client = new Ably.Rest(apiKey)
  const clientId = await getOrCreateUserId()

  const tokenRequest = await client.auth.createTokenRequest({ clientId })

  return NextResponse.json(tokenRequest, { headers: corsHeaders(request) })
}
