import { getAccountById, checkUserPermission } from "@/lib/supabase/queries"
import { getContacts } from "@/lib/supabase/contacts-queries"
import { calculateHealthScore } from "@/lib/health-score-engine"
import { notFound, redirect } from "next/navigation"
import AccountDetails from "@/components/accounts/account-details"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

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

    // Calculate dynamic health score for this account
    let accountWithDynamicHealth = account
    try {
      const healthComponents = await calculateHealthScore({
        id: account.id,
        organization_id: account.organization_id,
        arr: account.arr,
        created_at: account.created_at
      })
      
      accountWithDynamicHealth = {
        ...account,
        health_score: healthComponents.overall,
        health_components: healthComponents
      }
      
      console.log('Account details: Dynamic health score calculated:', {
        accountId: account.id,
        oldScore: account.health_score,
        newScore: healthComponents.overall,
        components: healthComponents
      })
    } catch (healthError) {
      console.error('Failed to calculate dynamic health score for account:', account.id, healthError)
      // Fall back to existing health score
    }

    // Then get contacts for this account
    const accountContacts = await getContacts({ account_id: params.id }).catch(() => ({ data: [], count: 0 }))

    return <AccountDetails account={accountWithDynamicHealth} canEdit={canEdit} canDelete={canDelete} accountContacts={accountContacts.data} />
  } catch {
    // Account not found or other error
    notFound()
  }
}
