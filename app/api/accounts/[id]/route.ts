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
    console.log('PUT /api/accounts/[id] - Account ID:', params.id)
    
    const hasPermission = await checkUserPermission("read_write")
    console.log('User has permission:', hasPermission)
    
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const account = await updateAccount(params.id, body)
    console.log('Updated account:', account)

    return NextResponse.json({ data: account })
  } catch (error) {
    console.error("Error updating account:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : 'Unknown error')
    return NextResponse.json({ error: `Failed to update account: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 })
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
