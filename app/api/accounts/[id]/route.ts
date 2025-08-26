import { type NextRequest, NextResponse } from "next/server"
import { getAccountById, updateAccount, deleteAccount, checkUserPermission } from "@/lib/supabase/queries"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const account = await getAccountById(params.id)
    return NextResponse.json({ data: account })
  } catch (error) {
    console.error("Error fetching account:", error)
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const hasPermission = await checkUserPermission("read_write")
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const account = await updateAccount(params.id, body)

    return NextResponse.json({ data: account })
  } catch (error) {
    console.error("Error updating account:", error)
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const hasPermission = await checkUserPermission("read_write_delete")
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    await deleteAccount(params.id)

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
