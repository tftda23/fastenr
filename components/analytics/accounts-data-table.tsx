"use client"

import { useMemo } from "react"
import { useCurrencyConfig } from '@/lib/hooks/use-currency'
import { ColumnDef } from "@tanstack/react-table"
import { DataTable, HealthScoreBadge, StatusBadge } from "./data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

// Mock account data for demonstration
const generateAccountsData = () => {
  const tiers = ['Enterprise', 'Professional', 'Standard', 'Starter']
  const statuses = ['Active', 'At Risk', 'Churned', 'New']
  const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing']
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `acc-${i + 1}`,
    name: `Account ${i + 1}`,
    tier: tiers[Math.floor(Math.random() * tiers.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    industry: industries[Math.floor(Math.random() * industries.length)],
    healthScore: Math.floor(Math.random() * 100),
    revenue: Math.floor(Math.random() * 100000) + 10000,
    lastEngagement: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    csm: `CSM ${Math.floor(Math.random() * 10) + 1}`,
    contractValue: Math.floor(Math.random() * 500000) + 50000,
    renewalDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
    engagementCount: Math.floor(Math.random() * 50) + 5,
    supportTickets: Math.floor(Math.random() * 20),
    npsScore: Math.floor(Math.random() * 100),
  }))
}

interface AccountsDataTableProps {
  onViewAccount?: (accountId: string) => void
  onEditAccount?: (accountId: string) => void
  onDeleteAccount?: (accountId: string) => void
}

export function AccountsDataTable({ 
  onViewAccount, 
  onEditAccount, 
  onDeleteAccount 
}: AccountsDataTableProps) {
  const { formatCurrency } = useCurrencyConfig()
  const accountsData = useMemo(() => generateAccountsData(), [])

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Account Name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            <div className="text-sm text-muted-foreground">{row.original.industry}</div>
          </div>
        ),
      },
      {
        id: "tier",
        accessorKey: "tier",
        header: "Tier",
        cell: ({ row }) => {
          const tier = row.getValue("tier") as string
          const getVariant = (tier: string) => {
            switch (tier) {
              case 'Enterprise': return 'default'
              case 'Professional': return 'secondary'
              case 'Standard': return 'outline'
              default: return 'outline'
            }
          }
          return <Badge variant={getVariant(tier)}>{tier}</Badge>
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
      },
      {
        id: "healthScore",
        accessorKey: "healthScore",
        header: "Health Score",
        cell: ({ row }) => <HealthScoreBadge score={row.getValue("healthScore")} />,
      },
      {
        id: "revenue",
        accessorKey: "revenue",
        header: "Monthly Revenue",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("revenue"))
          return <div className="font-medium">{formatCurrency(amount)}</div>
        },
      },
      {
        id: "contractValue",
        accessorKey: "contractValue",
        header: "Contract Value",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("contractValue"))
          return <div className="font-medium">{formatCurrency(amount)}</div>
        },
      },
      {
        id: "csm",
        accessorKey: "csm",
        header: "CSM",
        cell: ({ row }) => (
          <div className="text-sm">{row.getValue("csm")}</div>
        ),
      },
      {
        id: "lastEngagement",
        accessorKey: "lastEngagement",
        header: "Last Engagement",
        cell: ({ row }) => {
          const date = row.getValue("lastEngagement") as Date
          return (
            <div className="text-sm">
              {format(date, "MMM dd, yyyy")}
            </div>
          )
        },
      },
      {
        id: "renewalDate",
        accessorKey: "renewalDate",
        header: "Renewal Date",
        cell: ({ row }) => {
          const date = row.getValue("renewalDate") as Date
          const daysUntilRenewal = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          const isUrgent = daysUntilRenewal <= 30
          
          return (
            <div className={`text-sm ${isUrgent ? 'text-red-600 font-medium' : ''}`}>
              {format(date, "MMM dd, yyyy")}
              {isUrgent && (
                <div className="text-xs text-red-500">
                  {daysUntilRenewal} days left
                </div>
              )}
            </div>
          )
        },
      },
      {
        id: "engagementCount",
        accessorKey: "engagementCount",
        header: "Engagements",
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("engagementCount")}</div>
        ),
      },
      {
        id: "npsScore",
        accessorKey: "npsScore",
        header: "NPS Score",
        cell: ({ row }) => {
          const score = row.getValue("npsScore") as number
          const getColor = (score: number) => {
            if (score >= 70) return "text-emerald-600/80"
            if (score >= 30) return "text-amber-600/80"
            return "text-red-600/80"
          }
          return <div className={`font-medium ${getColor(score)}`}>{score}</div>
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const account = row.original
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(account.id)}
                >
                  Copy account ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewAccount?.(account.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditAccount?.(account.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit account
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteAccount?.(account.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [onViewAccount, onEditAccount, onDeleteAccount]
  )

  return (
    <DataTable
      data={accountsData}
      columns={columns}
      title="Accounts Overview"
      description="Comprehensive view of all customer accounts with key metrics"
      searchPlaceholder="Search accounts by name, industry, or CSM..."
      exportFilename="accounts-overview"
    />
  )
}