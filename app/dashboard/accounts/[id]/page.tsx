import { getAccountById, checkUserPermission } from "@/lib/supabase/queries"
import { getContacts } from "@/lib/supabase/contacts-queries"
import { notFound, redirect } from "next/navigation"
import AccountDetails from "@/components/accounts/account-details"

export default async function AccountDetailsPage({ params }: { params: { id: string } }) {
  if (params.id === "new") {
    redirect("/dashboard/accounts/new")
  }

  try {
    // First get the account and permissions
    const [account, canEdit, canDelete] = await Promise.all([
      getAccountById(params.id),
      checkUserPermission("read_write"),
      checkUserPermission("read_write_delete"),
    ])

    if (!account) {
      notFound()
    }

    // Then get contacts for this account
    const accountContacts = await getContacts({ account_id: params.id }).catch(() => ({ data: [], count: 0 }))

    return <AccountDetails account={account} canEdit={canEdit} canDelete={canDelete} accountContacts={accountContacts.data} />
  } catch {
    // Account not found or other error
    notFound()
  }
}
