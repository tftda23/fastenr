"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  MessageSquare,
  Target,
  TrendingUp,
  Settings,
  LogOut,
  Home,
  Shield,
  UserCog,
  CreditCard,
  Plug,
  Zap,
  Cog,
  ArrowLeft,
  ClipboardList,
  Mail,
  Building,
  Calendar,
} from "lucide-react"
import { signOut } from "@/lib/actions"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Accounts", href: "/dashboard/accounts", icon: Building },
  { name: "Contacts", href: "/dashboard/contacts", icon: Users },
  { name: "Engagements", href: "/dashboard/engagements", icon: MessageSquare },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Goals", href: "/dashboard/goals", icon: Target },
  { name: "Surveys", href: "/dashboard/surveys", icon: ClipboardList },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Health Scores", href: "/dashboard/health", icon: TrendingUp },
]

const adminNavigation = [
  { name: "Users", href: "/dashboard/admin/users", icon: UserCog },
  { name: "Subscription", href: "/dashboard/admin/subscription", icon: CreditCard },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Integrations", href: "/dashboard/admin/integrations", icon: Plug },
  { name: "Automation", href: "/dashboard/admin/automation", icon: Zap },
  { name: "Email Settings", href: "/dashboard/admin/email", icon: Mail },
  { name: "App Settings", href: "/dashboard/admin/settings", icon: Cog },
]

interface SidebarProps {
  userProfile: {
    full_name: string | null
    email: string
    role: string
  }
}

export default function Sidebar({ userProfile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter() // Added router for navigation
  const isAdmin = userProfile.role === "admin"
  const [showAdminNav, setShowAdminNav] = useState(false)

  useEffect(() => {
    setShowAdminNav(pathname.startsWith("/dashboard/admin"))
  }, [pathname])

  const handleExitAdmin = () => {
    router.push("/dashboard")
  }

  const currentNavigation = showAdminNav ? adminNavigation : navigation

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r border-border fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">
          <span className="font-bold">fastenr</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {showAdminNav && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitAdmin} // Use new handler that navigates to dashboard
              className="w-full justify-start mb-4 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Admin
            </Button>
          </>
        )}

        {currentNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? showAdminNav
                    ? "bg-orange-50 text-orange-700 border-r-2 border-orange-700 dark:bg-orange-950 dark:text-orange-300"
                    : "bg-blue-50 text-blue-700 border-r-2 border-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {userProfile.full_name?.charAt(0) || userProfile.email.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{userProfile.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {isAdmin && !showAdminNav && (
            <Button variant="ghost" size="sm" onClick={() => setShowAdminNav(true)} className="flex-1">
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          )}
          <Link href="/dashboard/settings" className={isAdmin && !showAdminNav ? "" : "flex-1"}>
            <Button variant="ghost" size="sm" className="w-full justify-center">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
