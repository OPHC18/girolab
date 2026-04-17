import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const version = process.env.VERCEL_GIT_COMMIT_SHA || 'dev'
  return NextResponse.json({ version }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
