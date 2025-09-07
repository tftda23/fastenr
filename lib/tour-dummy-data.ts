// Dummy data for tour - never saves to database
export const TOUR_DUMMY_ACCOUNTS = [
  {
    id: 'tour-account-1',
    name: 'TechCorp Solutions',
    health_score: 85,
    mrr: 2500,
    status: 'active',
    last_engagement: '2 days ago',
    churn_risk: 'low',
    contacts_count: 4,
    growth_trend: '+12%'
  },
  {
    id: 'tour-account-2',
    name: 'StartupXYZ',
    health_score: 92,
    mrr: 1200,
    status: 'active',
    last_engagement: '1 day ago',
    churn_risk: 'very_low',
    contacts_count: 2,
    growth_trend: '+28%'
  },
  {
    id: 'tour-account-3',
    name: 'Enterprise Co',
    health_score: 45,
    mrr: 8500,
    status: 'at_risk',
    last_engagement: '12 days ago',
    churn_risk: 'high',
    contacts_count: 8,
    growth_trend: '-8%'
  },
  {
    id: 'tour-account-4',
    name: 'Growth Inc',
    health_score: 78,
    mrr: 3200,
    status: 'active',
    last_engagement: '3 days ago',
    churn_risk: 'low',
    contacts_count: 5,
    growth_trend: '+15%'
  }
]

export const TOUR_DUMMY_CONTACTS = [
  {
    id: 'tour-contact-1',
    name: 'Sarah Johnson',
    email: 'sarah@techcorp.com',
    role: 'VP Customer Success',
    account_name: 'TechCorp Solutions',
    last_contact: '2 days ago',
    engagement_score: 8.5,
    status: 'active'
  },
  {
    id: 'tour-contact-2',
    name: 'Mike Chen',
    email: 'mike@techcorp.com',
    role: 'Implementation Manager',
    account_name: 'TechCorp Solutions',
    last_contact: '5 days ago',
    engagement_score: 7.2,
    status: 'active'
  },
  {
    id: 'tour-contact-3',
    name: 'Emily Rodriguez',
    email: 'emily@startupxyz.com',
    role: 'Founder & CEO',
    account_name: 'StartupXYZ',
    last_contact: '1 day ago',
    engagement_score: 9.8,
    status: 'champion'
  },
  {
    id: 'tour-contact-4',
    name: 'David Park',
    email: 'david@enterprise.com',
    role: 'IT Director',
    account_name: 'Enterprise Co',
    last_contact: '12 days ago',
    engagement_score: 3.2,
    status: 'unresponsive'
  },
  {
    id: 'tour-contact-5',
    name: 'Lisa Wang',
    email: 'lisa@growth.com',
    role: 'Operations Manager',
    account_name: 'Growth Inc',
    last_contact: '3 days ago',
    engagement_score: 7.8,
    status: 'active'
  }
]

export const TOUR_DUMMY_STATS = {
  totalAccounts: 47,
  activeAccounts: 42,
  atRiskAccounts: 5,
  churnedAccounts: 2,
  averageHealthScore: 78,
  averageChurnRisk: 25,
  totalARR: 1500000,
  npsScore: 72.5
}

export const TOUR_DUMMY_ACTIVITIES = [
  {
    id: 'tour-activity-1',
    type: 'engagement',
    title: 'QBR completed with TechCorp Solutions',
    description: 'Quarterly business review meeting concluded successfully',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    account: 'TechCorp Solutions',
    user: 'You'
  },
  {
    id: 'tour-activity-2',
    type: 'goal',
    title: 'Health score improved for StartupXYZ',
    description: 'Account health score increased from 85% to 92%',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    account: 'StartupXYZ',
    user: 'AI Analysis'
  },
  {
    id: 'tour-activity-3',
    type: 'nps',
    title: 'High churn risk detected for Enterprise Co',
    description: 'Account has not engaged for 12 days, usage down 40%',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    account: 'Enterprise Co',
    user: 'System Alert'
  }
]