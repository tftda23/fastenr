import AccountForm from "@/components/accounts/account-form"

export default function NewAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create New Account</h1>
        <p className="mt-1 text-sm text-gray-600">Add a new customer account to your organization.</p>
      </div>
      <AccountForm />
    </div>
  )
}
