"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, Users, Crown, ChevronDown, ChevronRight } from 'lucide-react'
import { Contact } from '@/lib/types'

interface OrgChartViewProps {
  contacts: Contact[]
  onRefresh: () => void
}

export function OrgChartView({ contacts, onRefresh }: OrgChartViewProps) {
  // Simple org chart implementation
  const managersMap = new Map<string, Contact[]>()
  const rootContacts: Contact[] = []

  // Group contacts by manager
  contacts.forEach(contact => {
    if (contact.manager_id) {
      if (!managersMap.has(contact.manager_id)) {
        managersMap.set(contact.manager_id, [])
      }
      managersMap.get(contact.manager_id)!.push(contact)
    } else {
      rootContacts.push(contact)
    }
  })

  const ContactNode = ({ contact, level = 0 }: { contact: Contact; level?: number }) => {
    const directReports = managersMap.get(contact.id) || []
    const hasReports = directReports.length > 0

    return (
      <div className="space-y-2">
        <Card className={`${level > 0 ? 'ml-8' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {contact.first_name?.[0]}{contact.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{contact.full_name}</div>
                  <div className="text-sm text-muted-foreground">{contact.title}</div>
                  {contact.department && (
                    <div className="text-xs text-muted-foreground">{contact.department}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {contact.decision_maker_level === 'Primary' && (
                  <Badge variant="default">
                    <Crown className="h-3 w-3 mr-1" />
                    Primary DM
                  </Badge>
                )}
                {contact.seniority_level === 'C-Level' && (
                  <Badge variant="secondary">C-Level</Badge>
                )}
                {hasReports && (
                  <Badge variant="outline">{directReports.length} reports</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {hasReports && (
          <div className="space-y-2">
            {directReports.map(report => (
              <ContactNode key={report.id} contact={report} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Chart
          </CardTitle>
          <CardDescription>
            Visual representation of contact hierarchy and reporting structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{contacts.length}</div>
              <div className="text-sm text-muted-foreground">Total Contacts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{rootContacts.length}</div>
              <div className="text-sm text-muted-foreground">Top Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{managersMap.size}</div>
              <div className="text-sm text-muted-foreground">Managers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {rootContacts.length > 0 ? (
          rootContacts.map(contact => (
            <ContactNode key={contact.id} contact={contact} />
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Hierarchy Data</h3>
              <p className="text-muted-foreground">
                Add manager relationships to contacts to see the organization chart
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}