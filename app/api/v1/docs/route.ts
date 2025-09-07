import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    message: "API Documentation Coming Soon",
    status: "disabled_for_launch",
    expected: "Q1 2025"
  }, { 
    status: 503,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}