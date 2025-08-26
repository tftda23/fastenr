import { getServerSession } from "next-auth"
import { NextPage } from "next"
import { authOptions } from "@/lib/auth"
import { Suspense } from "react"
import NavbarAdmin from "@/components/navbars/NavbarAdmin"
import Billing from "@/components/dashboard/admin/Billing"

const AdminBilling: NextPage = () => {
  const session = getServerSession(authOptions)

  if (!session) {
    return <div>Sign in</div>
  }

  return (
    <>
      <NavbarAdmin />
      <Suspense fallback={<div>Loading...</div>}>
        <Billing />
      </Suspense>
    </>
  )
}

export default AdminBilling
