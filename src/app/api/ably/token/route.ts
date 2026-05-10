import * as Ably from 'ably'
import { NextResponse } from 'next/server'
import { getOrCreateUserId } from '@/lib/user-cookies'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(undefined, { status: 204, headers: corsHeaders })
}

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing ABLY_API_KEY' }, { status: 500 })
  }

  const client = new Ably.Rest(apiKey)
  const clientId = await getOrCreateUserId()

  const tokenRequest = await client.auth.createTokenRequest({ clientId })

  return NextResponse.json(tokenRequest, { headers: corsHeaders })
}
