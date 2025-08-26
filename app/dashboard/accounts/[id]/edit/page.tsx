import { getAccountById, checkUserPermission } from "@/lib/supabase/queries"
import { redirect, notFound } from "next/navigation"
import AccountForm from "@/components/accounts/account-form"

export default async function EditAccountPage({ params }: { params: { id: string } }) {
  const hasPermission = await checkUserPermission("read_write")

  if (!hasPermission) {
    redirect("/dashboard/accounts")
  }

  try {
    const account = await getAccountById(params.id)
    return <AccountForm account={account} isEditing={true} />
  } catch (error) {
    notFound()
  }
}
