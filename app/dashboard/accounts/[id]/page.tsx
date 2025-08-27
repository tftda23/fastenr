import { getAccountById, checkUserPermission } from "@/lib/supabase/queries"
import { notFound, redirect } from "next/navigation"
import AccountDetails from "@/components/accounts/account-details"

export default async function AccountDetailsPage({ params }: { params: { id: string } }) {
  if (params.id === "new") {
    redirect("/dashboard/accounts/new")
  }

  try {
    const [account, canEdit, canDelete] = await Promise.all([
      getAccountById(params.id),
      checkUserPermission("read_write"),
      checkUserPermission("read_write_delete"),
    ])

    return <AccountDetails account={account} canEdit={canEdit} canDelete={canDelete} />
  } catch (error) {
    // Account not found
    notFound()
  }
}
