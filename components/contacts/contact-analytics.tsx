"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Users, Crown, Building2, TrendingUp } from 'lucide-react'
import { Contact, ContactGroup } from '@/lib/types'

interface ContactAnalyticsProps {
  contacts: Contact[]
  contactGroups: ContactGroup[]
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function ContactAnalytics({ contacts, contactGroups }: ContactAnalyticsProps) {
  // Calculate analytics
  const totalContacts = contacts.length
  const activeContacts = contacts.filter(c => c.contact_status === 'active').length
  
  // Seniority distribution
  const seniorityData = contacts.reduce((acc, contact) => {
    const level = contact.seniority_level || 'Unknown'
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const seniorityChartData = Object.entries(seniorityData).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / totalContacts) * 100)
  }))

  // Decision maker distribution
  const decisionMakerData = contacts.reduce((acc, contact) => {
    const level = contact.decision_maker_level || 'Unknown'
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const decisionMakerChartData = Object.entries(decisionMakerData).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / totalContacts) * 100)
  }))

  // Relationship strength
  const relationshipData = contacts.reduce((acc, contact) => {
    const strength = contact.relationship_strength || 'unknown'
    acc[strength] = (acc[strength] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const relationshipChartData = Object.entries(relationshipData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    percentage: Math.round((value / totalContacts) * 100)
  }))

  // Account distribution
  const accountData = contacts.reduce((acc, contact) => {
    if (!contact.account_name) return acc
    acc[contact.account_name] = (acc[contact.account_name] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topAccounts = Object.entries(accountData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              {activeContacts} active ({Math.round((activeContacts/totalContacts)*100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decision Makers</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(decisionMakerData.Primary || 0) + (decisionMakerData.Influencer || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {decisionMakerData.Primary || 0} primary, {decisionMakerData.Influencer || 0} influencers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Champions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relationshipData.champion || 0}</div>
            <p className="text-xs text-muted-foreground">
              {relationshipData.supporter || 0} supporters, {relationshipData.detractor || 0} detractors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts Covered</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(accountData).length}</div>
            <p className="text-xs text-muted-foreground">
              Avg {Math.round(totalContacts / Object.keys(accountData).length)} contacts per account
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seniority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Seniority Distribution</CardTitle>
            <CardDescription>Contact distribution by seniority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={seniorityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {seniorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Decision Maker Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Decision Maker Levels</CardTitle>
            <CardDescription>Contact distribution by decision making influence</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={decisionMakerChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Relationship Strength */}
        <Card>
          <CardHeader>
            <CardTitle>Relationship Strength</CardTitle>
            <CardDescription>How contacts feel about your solution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={relationshipChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Accounts by Contact Count */}
        <Card>
          <CardHeader>
            <CardTitle>Top Accounts by Contacts</CardTitle>
            <CardDescription>Accounts with the most contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topAccounts.map((account, index) => (
                <div key={account.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium">{account.name}</span>
                  </div>
                  <Badge variant="secondary">{account.value} contacts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}