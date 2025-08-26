import { checkUserPermission, getAccounts } from "@/lib/supabase/queries"
import AccountsClient from "@/components/accounts/accounts-client"
import { redirect } from "next/navigation"

export default async function AccountsPage() {
  try {
    const [canCreate, initialData] = await Promise.all([checkUserPermission("read_write"), getAccounts(1, 20)])

    return <AccountsClient initialAccounts={initialData.data} canCreate={canCreate} />
  } catch (error) {
    console.error("Error loading accounts page:", error)
    redirect("/onboarding")
  }
}
