"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, UserCog, Mail, Calendar, ExternalLink, Shield, Trash2, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  full_name: string | null
  email: string
  role: "read" | "write" | "admin" | string
  created_at: string
}

interface Usage {
  activeUsers: number
  seatCap: number
  plan: "free_trial" | "premium" | "premium_discount" | string
  trialEndsAt: string | null
  pricing: {
    currency: string
    monthly: number
    perSeat: number
    trialFreeSeats: number
  }
}

interface UsersClientProps {
  organizationId: string
}

export default function UsersClient({ organizationId }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"read" | "write" | "admin">("read")
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteWarn, setInviteWarn] = useState<boolean>(false)
  const [savingRoleFor, setSavingRoleFor] = useState<string | null>(null)

  useEffect(() => {
    void load()
  }, [organizationId])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?organizationId=${organizationId}`, { cache: "no-store" })
      const data = await res.json()
      if (res.ok) {
        setUsers(data.users || [])
        setUsage(data.usage || null)
      } else {
        console.error(data.error || "Failed to load users")
      }
    } finally {
      setLoading(false)
    }
  }

  async function sendInvite() {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, organizationId }),
      })
      const data = await res.json()
      if (res.ok) {
        setInviteLink(data.link)
        setInviteWarn(Boolean(data.softWillExceed))
        setInviteEmail("")
      } else {
        alert(data.error || "Failed to create invite")
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function changeRole(userId: string, role: "read" | "write" | "admin") {
    setSavingRoleFor(userId)
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Failed to update role")
      } else {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
      }
    } finally {
      setSavingRoleFor(null)
    }
  }

  async function removeUser(userId: string) {
    if (!confirm("Remove this user from the organisation?")) return
    const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || "Failed to remove user")
    } else {
      setUsers(prev => prev.filter(u => u.id !== userId))
    }
  }

  const usageLabel = useMemo(() => {
    if (!usage) return ""
    return `${usage.activeUsers} / ${usage.seatCap} seats`
  }, [usage])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Usage summary skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-8 w-16 mt-2" />
                <Skeleton className="h-4 w-32 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Users table skeleton */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with usage */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Organisation Users</h2>
          <p className="text-muted-foreground">Invite users and manage permissions.</p>
        </div>
        <div className="flex items-center gap-2">
          {usage && (
            <>
              <Badge variant="secondary" className="cursor-default">
                <Shield className="h-3.5 w-3.5 mr-1" />
                {usage.plan === "free_trial" ? "Free trial" : usage.plan === "premium" ? "Premium" : "Premium (100+)"}
              </Badge>
              <Badge variant="outline" className="cursor-default">{usageLabel}</Badge>
              <Badge variant="outline" className="cursor-default">
                {usage.pricing.currency}{usage.pricing.monthly}/mo
              </Badge>
            </>
          )}
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Invite User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a user</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="name@company.com" />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="write">Write</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {inviteLink ? (
                  <div className="rounded-md border p-3">
                    <div className="text-sm mb-1">Invitation link</div>
                    <div className="text-xs break-all">{inviteLink}</div>
                    <div className="mt-2 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-transparent"
                        onClick={() => navigator.clipboard.writeText(inviteLink!)}
                      >
                        Copy Link
                      </Button>
                      <a href={inviteLink} target="_blank" rel="noreferrer">
                        <Button type="button" variant="outline" className="bg-transparent">
                          Open <ExternalLink className="h-4 w-4 ml-1" />
                        </Button>
                      </a>
                    </div>
                    {inviteWarn && (
                      <p className="text-amber-600 text-xs mt-2">
                        Heads up: accepting this invite will exceed your current seat cap. Increase seats in Subscription.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
              <DialogFooter>
                <Button onClick={sendInvite} disabled={!inviteEmail}>Create Invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users list */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserCog className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.full_name || "Unnamed User"}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-3 w-3 mr-1" />
                      {user.email}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Role select */}
                  <Select
                    value={user.role as any}
                    onValueChange={(v) => changeRole(user.id, v as any)}
                    disabled={savingRoleFor === user.id}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="write">Write</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="icon" onClick={() => removeUser(user.id)} title="Remove user" className="bg-transparent">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users yet</h3>
            <p className="text-muted-foreground mb-4">Invite your first team member to get started.</p>
            <Button onClick={() => setInviteOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Invite First User
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}