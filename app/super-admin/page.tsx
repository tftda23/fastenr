import { Metadata } from "next"
import { SuperAdminPortal } from "@/components/super-admin/super-admin-portal"

export const metadata: Metadata = {
  title: "Super Admin Portal - Fastenr",
  description: "Fastenr staff billing and organization management",
}

export default function SuperAdminPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <SuperAdminPortal />
    </div>
  )
}