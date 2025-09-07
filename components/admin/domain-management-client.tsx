'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Plus, Trash2, RotateCcw, ExternalLink, Copy, Settings, Info } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Domain {
  id: string
  name: string
  status: string
  region: string
  createdAt: string
  records?: Array<{
    type: string
    name: string
    value: string
    status: string
    priority?: number
    ttl?: string
  }>
}

interface DomainDetails extends Domain {
  setupInstructions?: {
    steps: Array<{
      step: number
      title: string
      description: string
    }>
    tips: string[]
  }
}

export default function DomainManagementClient() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDomainDetails, setSelectedDomainDetails] = useState<DomainDetails | null>(null)
  const [showDnsDetails, setShowDnsDetails] = useState(false)
  const { toast } = useToast()

  const fetchDomains = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/email/domains')
      
      if (!response.ok) {
        throw new Error('Failed to fetch domains')
      }
      
      const data = await response.json()
      setDomains(data.domains || [])
    } catch (error) {
      console.error('Error fetching domains:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch domains',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDomainDetails = async (domainId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/email/domains/${domainId}/details`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch domain details')
      }
      
      const data = await response.json()
      setSelectedDomainDetails(data.domain)
      setShowDnsDetails(true)
    } catch (error) {
      console.error('Error fetching domain details:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch domain details',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const addDomain = async () => {
    if (!newDomain.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a domain name',
        variant: 'destructive'
      })
      return
    }

    // Prevent adding fastenr.co
    if (newDomain.toLowerCase().trim() === 'fastenr.co') {
      toast({
        title: 'Error',
        description: 'fastenr.co is reserved and cannot be added as a custom domain',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/email/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain.trim() })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to add domain')
      }

      toast({
        title: 'Success',
        description: 'Domain added successfully'
      })

      setNewDomain('')
      setShowAddForm(false)
      await fetchDomains()
    } catch (error) {
      console.error('Error adding domain:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add domain',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const verifyDomain = async (domainId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/email/domains/${domainId}/verify`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to verify domain')
      }

      toast({
        title: 'Success',
        description: 'Domain verification initiated'
      })

      await fetchDomains()
    } catch (error) {
      console.error('Error verifying domain:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to verify domain',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteDomain = async (domainId: string, domainName: string) => {
    if (!confirm(`Are you sure you want to delete the domain "${domainName}"? This cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/email/domains/${domainId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to delete domain')
      }

      toast({
        title: 'Success',
        description: 'Domain deleted successfully'
      })

      await fetchDomains()
    } catch (error) {
      console.error('Error deleting domain:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete domain',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: 'Value copied to clipboard'
    })
  }

  const getDomainStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'failed':
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  useEffect(() => {
    fetchDomains()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Domain Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage your Resend domains for sending emails
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Domain
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Domain</CardTitle>
            <CardDescription>
              Add a domain to use for sending emails. You'll need to configure DNS records after adding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDomain()}
              />
              <Button onClick={addDomain} disabled={loading}>
                Add
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false)
                  setNewDomain('')
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {domains.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No domains configured. Add a domain to start sending emails from your custom domain.
            </AlertDescription>
          </Alert>
        ) : (
          domains.map((domain) => (
            <Card key={domain.id} className={(domain as any).isDefault ? "border-blue-200 bg-blue-50" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{domain.name}</span>
                      {(domain as any).isDefault && (
                        <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                      )}
                      {getDomainStatusBadge(domain.status)}
                    </CardTitle>
                    <CardDescription>
                      {(domain as any).isDefault 
                        ? 'Default Fastenr domain - always available'
                        : `Created: ${new Date(domain.createdAt).toLocaleDateString()} • Region: ${domain.region}`
                      }
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {!(domain as any).isDefault && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchDomainDetails(domain.id)}
                          disabled={loading}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          DNS Setup
                        </Button>
                        {domain.status !== 'verified' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verifyDomain(domain.id)}
                            disabled={loading}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Verify
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteDomain(domain.id, domain.name)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {(domain as any).isDefault && (
                      <div className="text-xs text-muted-foreground px-3 py-2 bg-white rounded border">
                        Protected system domain
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {domain.records && domain.records.length > 0 && (
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-medium">DNS Records</h4>
                    <div className="space-y-2">
                      {domain.records.map((record, index) => (
                        <div key={index} className="border rounded p-3 text-sm">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1 flex-1">
                              <div className="flex space-x-4">
                                <span className="font-medium">{record.type}</span>
                                <span className="text-muted-foreground">{record.name || '@'}</span>
                                {record.priority && (
                                  <span className="text-muted-foreground">Priority: {record.priority}</span>
                                )}
                              </div>
                              <div className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                                {record.value}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(record.value)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          After adding a domain, click "DNS Setup" to see the exact DNS records you need to configure. 
          Once configured, use the "Verify" button to check if the records are properly set up.
        </AlertDescription>
      </Alert>

      {/* DNS Setup Dialog */}
      <Dialog open={showDnsDetails} onOpenChange={setShowDnsDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>DNS Setup for {selectedDomainDetails?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedDomainDetails && (
            <div className="space-y-6">
              {/* Setup Instructions */}
              {selectedDomainDetails.setupInstructions && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Setup Instructions</h3>
                  <div className="space-y-3">
                    {selectedDomainDetails.setupInstructions.steps.map((step) => (
                      <div key={step.step} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {step.step}
                        </div>
                        <div>
                          <h4 className="font-medium">{step.title}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DNS Records */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">DNS Records to Add</h3>
                <div className="space-y-3">
                  {selectedDomainDetails.records?.map((record, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{record.type}</Badge>
                              <span className="font-medium">{record.name}</span>
                              {record.priority && (
                                <Badge variant="secondary">Priority: {record.priority}</Badge>
                              )}
                              <Badge variant="outline">{record.ttl}</Badge>
                            </div>
                            <div className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
                              {record.value}
                            </div>
                            {record.type === 'TXT' && record.name === '_dmarc' && (
                              <div className="text-xs text-blue-600">
                                <Info className="w-3 h-3 inline mr-1" />
                                DMARC policy: Set to "none" for testing. Change to "quarantine" or "reject" in production.
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(record.value)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Tips */}
              {selectedDomainDetails.setupInstructions?.tips && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Important Tips</h3>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <ul className="space-y-1 text-sm">
                      {selectedDomainDetails.setupInstructions.tips.map((tip, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-yellow-600">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://resend.com/domains/${selectedDomainDetails.id}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View in Resend Dashboard
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => verifyDomain(selectedDomainDetails.id)}
                    disabled={loading}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Verify Domain
                  </Button>
                  <Button onClick={() => setShowDnsDetails(false)}>
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}