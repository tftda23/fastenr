"use client"

import React, { useState, useEffect } from 'react'
import { HelpCircle, X, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import MarkdownRenderer from '@/components/ui/markdown-renderer'

interface HelpItem {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  videoUrl?: string
  relatedLinks?: { title: string; url: string }[]
}

interface HelpCategory {
  id: string
  title: string
  items: HelpItem[]
}

interface HelpSystemProps {
  pageContext: string
  className?: string
  variant?: 'button' | 'icon'
  size?: 'sm' | 'md' | 'lg'
}

// Help content database
const HELP_CONTENT: Record<string, HelpCategory[]> = {
  dashboard: [
    {
      id: 'overview',
      title: 'Dashboard Overview',
      items: [
        {
          id: 'dashboard-intro',
          title: 'Understanding Your Dashboard',
          content: `Your dashboard provides a comprehensive view of your customer success metrics. Here's what you'll find:

• **Stats Cards**: Key metrics including total accounts, health scores, and churn risk
• **Health vs Churn Scatter Plot**: Visual representation of account health and risk levels
• **Health Score Distribution**: Shows how your accounts are distributed across health score ranges
• **Recent Activity**: Latest engagements, goals, and NPS responses

Use the "All Accounts" and "My Accounts" tabs to filter data based on account ownership.`,
          tags: ['overview', 'metrics', 'navigation']
        },
        {
          id: 'health-scores',
          title: 'Health Score Interpretation',
          content: `Health scores range from 0-100 and indicate account wellness:

• **90-100 (Excellent)**: Highly engaged, low churn risk
• **70-89 (Good)**: Stable accounts with regular engagement
• **50-69 (Fair)**: Moderate engagement, watch for trends
• **30-49 (Poor)**: Low engagement, intervention needed
• **0-29 (Critical)**: High churn risk, immediate attention required

Health scores are calculated based on engagement frequency, feature adoption, support tickets, and NPS responses.`,
          tags: ['health-score', 'metrics', 'interpretation']
        },
        {
          id: 'churn-risk',
          title: 'Churn Risk Analysis',
          content: `Churn risk scores help identify accounts likely to cancel:

• **Low Risk (0-25)**: Stable accounts with good engagement
• **Medium Risk (26-50)**: Monitor for declining trends
• **High Risk (51-75)**: Proactive intervention recommended
• **Very High Risk (76-100)**: Immediate action required

The scatter plot shows the relationship between health scores and churn risk, helping you prioritize your efforts.`,
          tags: ['churn-risk', 'analysis', 'prioritization']
        }
      ]
    },
    {
      id: 'actions',
      title: 'Quick Actions',
      items: [
        {
          id: 'account-navigation',
          title: 'Navigating to Account Details',
          content: `Click on any account in the scatter plot or charts to view detailed information:

• Account overview and key metrics
• Engagement history and timeline
• Health score breakdown and trends
• Contact information and team members
• Recent activities and notes

You can also use the Accounts section in the sidebar for a full list view with filtering options.`,
          tags: ['navigation', 'accounts', 'details']
        },
        {
          id: 'ai-insights',
          title: 'AI Insights',
          content: `The AI Insights button provides intelligent analysis of your dashboard data:

• Identifies trends and patterns in your metrics
• Suggests actions for at-risk accounts
• Highlights opportunities for expansion
• Provides personalized recommendations

Click the AI Insights button in the top-right corner to get started.`,
          tags: ['ai', 'insights', 'recommendations']
        }
      ]
    }
  ],
  accounts: [
    {
      id: 'management',
      title: 'Account Management',
      items: [
        {
          id: 'account-overview',
          title: 'Account Overview',
          content: `The accounts page provides comprehensive account management capabilities:

• **Account List**: View all accounts with key metrics at a glance
• **Filtering**: Filter by health score, churn risk, owner, or custom criteria
• **Sorting**: Sort by any column to prioritize your work
• **Bulk Actions**: Perform actions on multiple accounts simultaneously

Use the search bar to quickly find specific accounts by name or other attributes.`,
          tags: ['accounts', 'management', 'filtering']
        },
        {
          id: 'account-details',
          title: 'Account Details Page',
          content: `Each account has a detailed view containing:

• **Overview Tab**: Key metrics, health score breakdown, and account information
• **Engagements Tab**: All interactions and touchpoints with the account
• **Contacts Tab**: Team members and stakeholders
• **Health History Tab**: Trends and historical data
• **Notes Tab**: Internal notes and observations

Use the edit button to update account information or add new contacts.`,
          tags: ['account-details', 'tabs', 'information']
        }
      ]
    }
  ],
  contacts: [
    {
      id: 'contact-management',
      title: 'Contact Management',
      items: [
        {
          id: 'contacts-overview',
          title: 'Managing Contacts',
          content: `The contacts system helps you manage relationships:

• **Contact List**: View all contacts across your accounts
• **Contact Groups**: Organize contacts into logical groups
• **Org Chart View**: Visualize organizational structure
• **Bulk Import**: Import contacts from CSV files
• **Integration Sync**: Sync with CRM systems like Salesforce and HubSpot

Use contact groups to segment communications and track engagement by role or department.`,
          tags: ['contacts', 'groups', 'organization']
        }
      ]
    }
  ],
  engagements: [
    {
      id: 'engagement-tracking',
      title: 'Engagement Tracking',
      items: [
        {
          id: 'engagements-overview',
          title: 'Recording Engagements',
          content: `Track all customer interactions to maintain engagement history:

• **Meeting Types**: Calls, meetings, emails, demos, training sessions
• **Participants**: Link contacts and team members to engagements
• **Outcomes**: Record next steps, decisions, and action items
• **Calendar Integration**: Schedule and track upcoming engagements
• **Automated Tracking**: Some engagements can be tracked automatically

Regular engagement tracking improves health score accuracy and provides valuable context for customer success activities.`,
          tags: ['engagements', 'tracking', 'calendar']
        }
      ]
    }
  ],
  health: [
    {
      id: 'health-monitoring',
      title: 'Health Score Monitoring',
      items: [
        {
          id: 'health-overview',
          title: 'Health Score System',
          content: `Our health scoring system evaluates multiple factors:

• **Engagement Frequency**: How often customers interact with your team
• **Feature Adoption**: Usage of key product features
• **Support Activity**: Frequency and severity of support tickets
• **NPS Responses**: Customer satisfaction and loyalty scores
• **Custom Metrics**: Industry-specific or custom health indicators

Health scores are updated in real-time and provide early warning signals for churn risk.`,
          tags: ['health-score', 'monitoring', 'factors']
        }
      ]
    }
  ]
}

const GENERAL_HELP: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    items: [
      {
        id: 'platform-overview',
        title: 'Platform Overview',
        content: `Welcome to your Customer Success platform! Here's how to get started:

1. **Set up your accounts**: Import or manually add your customer accounts
2. **Add contacts**: Import team members and stakeholders for each account
3. **Configure health scoring**: Customize health score factors for your business
4. **Start tracking engagements**: Record meetings, calls, and other interactions
5. **Monitor metrics**: Use the dashboard to track progress and identify trends

The platform is designed to help you proactively manage customer relationships and reduce churn.`,
        tags: ['getting-started', 'setup', 'overview']
      },
      {
        id: 'navigation',
        title: 'Navigation Tips',
        content: `Navigate efficiently using these tips:

• **Sidebar Navigation**: Access all major sections from the left sidebar
• **Search**: Use Ctrl+K (Cmd+K on Mac) for global search
• **Breadcrumbs**: Track your location and navigate back easily
• **Quick Actions**: Look for action buttons in the top-right of pages
• **Keyboard Shortcuts**: Many actions have keyboard shortcuts for power users

The tour feature (available from the dashboard) provides a guided walkthrough of key features.`,
        tags: ['navigation', 'shortcuts', 'tips']
      }
    ]
  }
]

export function HelpSystem({ pageContext, className, variant = 'button', size = 'md' }: HelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  // Get help content for current page
  const pageHelpContent = HELP_CONTENT[pageContext] || []
  const allHelpContent = [...pageHelpContent, ...GENERAL_HELP]

  // Filter content based on search
  const filteredContent = searchQuery
    ? allHelpContent.map(category => ({
        ...category,
        items: category.items.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      })).filter(category => category.items.length > 0)
    : allHelpContent

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Auto-expand categories when searching
  useEffect(() => {
    if (searchQuery) {
      setExpandedCategories(new Set(filteredContent.map(cat => cat.id)))
    }
  }, [searchQuery, filteredContent])

  const HelpButton = () => {
    if (variant === 'icon') {
      return (
        <Button
          variant="ghost"
          size={size === 'sm' ? 'sm' : 'default'}
          onClick={() => setIsOpen(true)}
          className={cn("p-2", className)}
          title="Help"
        >
          <HelpCircle className={cn(
            size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
          )} />
        </Button>
      )
    }

    return (
      <Button
        variant="outline"
        size={size}
        onClick={() => setIsOpen(true)}
        className={cn("gap-2", className)}
      >
        <HelpCircle className={cn(
          size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
        )} />
        Help
      </Button>
    )
  }

  if (!isOpen) {
    return <HelpButton />
  }

  return (
    <>
      <HelpButton />
      
      {/* Help Panel Overlay */}
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/10"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Help Panel */}
        <div className="ml-auto w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col h-full relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h2 className="text-lg font-semibold">Help & Documentation</h2>
              <p className="text-sm text-muted-foreground capitalize">{pageContext} Section</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredContent.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No help topics found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search terms</p>
              </div>
            ) : (
              filteredContent.map((category) => (
                <Card key={category.id} className="border border-border">
                  <div 
                    className="px-6 py-3 cursor-pointer border-b border-border"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <h3 className="text-sm font-semibold">{category.title}</h3>
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  
                  {expandedCategories.has(category.id) && (
                    <CardContent className="pt-4 space-y-3">
                      {category.items.map((item) => (
                        <div key={item.id} className="space-y-3">
                          <h4 className="font-medium text-sm mb-3">{item.title}</h4>
                          <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                            {item.content.split('\n\n').map((paragraph, pIndex) => {
                              if (paragraph.trim().startsWith('•')) {
                                // Handle bullet lists
                                const listItems = paragraph.split('\n').filter(line => line.trim().startsWith('•'))
                                return (
                                  <ul key={pIndex} className="list-disc list-inside space-y-1 ml-2">
                                    {listItems.map((listItem, lIndex) => (
                                      <li key={lIndex} className="text-sm">
                                        <span dangerouslySetInnerHTML={{
                                          __html: listItem.replace(/^• /, '').replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                                        }} />
                                      </li>
                                    ))}
                                  </ul>
                                )
                              } else {
                                // Handle regular paragraphs
                                return (
                                  <p key={pIndex} className="text-sm" dangerouslySetInnerHTML={{
                                    __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                                  }} />
                                )
                              }
                            })}
                          </div>
                          {item.tags && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {item.relatedLinks && (
                            <div className="space-y-1">
                              {item.relatedLinks.map((link, index) => (
                                <a
                                  key={index}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                  {link.title}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Need more help? Contact our support team
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// Convenience component for specific page contexts
export function DashboardHelp(props: Omit<HelpSystemProps, 'pageContext'>) {
  return <HelpSystem {...props} pageContext="dashboard" />
}

export function AccountsHelp(props: Omit<HelpSystemProps, 'pageContext'>) {
  return <HelpSystem {...props} pageContext="accounts" />
}

export function ContactsHelp(props: Omit<HelpSystemProps, 'pageContext'>) {
  return <HelpSystem {...props} pageContext="contacts" />
}

export function EngagementsHelp(props: Omit<HelpSystemProps, 'pageContext'>) {
  return <HelpSystem {...props} pageContext="engagements" />
}

export function HealthHelp(props: Omit<HelpSystemProps, 'pageContext'>) {
  return <HelpSystem {...props} pageContext="health" />
}