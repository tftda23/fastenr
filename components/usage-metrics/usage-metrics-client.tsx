"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  Users, 
  MousePointer, 
  Eye, 
  Clock, 
  TrendingUp,
  Code, 
  Plus, 
  Copy, 
  CheckCircle2,
  Zap,
  Sparkles,
  Crown,
  ExternalLink,
  Settings,
  Building,
  Edit,
  Save,
  X,
  ChevronDown,
  ArrowLeft,
  Info,
  Trash2,
  Filter
} from "lucide-react"
import Link from "next/link"

interface UsageProduct {
  id: string
  name: string
  domain: string
  tracking_key: string
  created_at: string
  is_active: boolean
  last_activity_at: string | null
}

interface UsageMetrics {
  product_id: string
  tracked_account_id: string | null
  unique_users: number
  total_sessions: number
  avg_session_duration: number
  page_views: number
  feature_usage: any
  recorded_at: string
}

interface TrackedAccount {
  id: string
  account_id: string | null
  account_name: string | null
  account_domain: string | null
  product_id: string
  last_activity_at: string
  usage_tracking_products: { name: string }
}

interface UsageMetricsClientProps {
  products: UsageProduct[]
  metrics: UsageMetrics[] | null
  trackedAccounts: TrackedAccount[]
  hasData: boolean
  organization: any
}

export function UsageMetricsClient({ products, metrics, trackedAccounts, hasData, organization }: UsageMetricsClientProps) {
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [selectedFramework, setSelectedFramework] = useState('vanilla')
  const [copiedCode, setCopiedCode] = useState(false)
  const [newProductName, setNewProductName] = useState('')
  const [newProductDomain, setNewProductDomain] = useState('')
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [createdProduct, setCreatedProduct] = useState<any>(null)
  const [isMultiTenant, setIsMultiTenant] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [editingProduct, setEditingProduct] = useState<UsageProduct | null>(null)
  const [editProductName, setEditProductName] = useState('')
  const [editProductDomain, setEditProductDomain] = useState('')
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false)
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([])
  const [selectedAccountForTracking, setSelectedAccountForTracking] = useState('multi-tenant')
  const [currentStep, setCurrentStep] = useState<'products' | 'get-code' | 'create-product'>('products')
  const [selectedProductForCode, setSelectedProductForCode] = useState<UsageProduct | null>(null)
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all')
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all')

  const handleCreateProduct = async () => {
    if (!newProductName.trim()) return
    
    setIsCreatingProduct(true)
    try {
      const response = await fetch('/api/usage-tracking/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName.trim(),
          domain: newProductDomain.trim() || null
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCreatedProduct(data.product)
        setNewProductName('')
        setNewProductDomain('')
        // Refresh the page to show the new product
        window.location.reload()
      } else {
        console.error('Failed to create product:', data.error)
        alert(`Failed to create product: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to create product:', error)
      alert('Failed to create product. Please try again.')
    } finally {
      setIsCreatingProduct(false)
    }
  }

  const handleEditProduct = (product: UsageProduct) => {
    setEditingProduct(product)
    setEditProductName(product.name)
    setEditProductDomain(product.domain || '')
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct || !editProductName.trim()) return
    
    setIsUpdatingProduct(true)
    try {
      const response = await fetch(`/api/usage-tracking/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editProductName.trim(),
          domain: editProductDomain.trim() || null
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Refresh the page to show updated product
        window.location.reload()
      } else {
        console.error('Failed to update product:', data.error)
        alert(`Failed to update product: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to update product:', error)
      alert('Failed to update product. Please try again.')
    } finally {
      setIsUpdatingProduct(false)
    }
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    setEditProductName('')
    setEditProductDomain('')
  }

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts?limit=100')
      const data = await response.json()
      if (response.ok && data.data) {
        setAvailableAccounts(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    }
  }

  const handleGetCode = async (product: UsageProduct) => {
    setSelectedProductForCode(product)
    setCreatedProduct(product)
    await fetchAccounts()
    setCurrentStep('get-code')
  }

  const handleBackToProducts = () => {
    setCurrentStep('products')
    setSelectedProductForCode(null)
    setCreatedProduct(null)
    setSelectedAccountForTracking('multi-tenant')
  }

  const handleCreateProductStep = () => {
    setCurrentStep('create-product')
  }

  const handleDeleteProduct = async (productId: string) => {
    setIsDeletingProduct(true)
    setProductToDelete(productId)
    
    try {
      const response = await fetch(`/api/usage-tracking/products/${productId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Refresh the page to show updated products list
        window.location.reload()
      } else {
        console.error('Failed to delete product:', data.error)
        alert(`Failed to delete product: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('Failed to delete product. Please try again.')
    } finally {
      setIsDeletingProduct(false)
      setProductToDelete(null)
    }
  }

  const generateEmbedCode = (trackingKey: string, framework: string, accountId?: string, accountName?: string) => {
    const baseUrl = process.env.NODE_ENV === 'development' ? window.location.origin : 'https://fastenr.co'

    switch (framework) {
      case 'vanilla':
        if (accountId && accountName) {
          return `<!-- Fastenr Analytics - Single Account Tracking -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/tracking/fastenr-analytics.js';
    script.onload = function() {
      fastenr('${trackingKey}', {
        debug: false, // Set to true for development
        apiUrl: '${baseUrl}/api/tracking',
        // Account tracking for: ${accountName}
        account: {
          id: '${accountId}',
          name: '${accountName}'
        }
      });
    };
    document.head.appendChild(script);
  })();
</script>`
        } else {
          return `<!-- Fastenr Analytics -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/tracking/fastenr-analytics.js';
    script.onload = function() {
      fastenr('${trackingKey}', {
        debug: false, // Set to true for development
        apiUrl: '${baseUrl}/api/tracking'
      });
    };
    document.head.appendChild(script);
  })();
</script>`
        }

      case 'react':
        if (accountId && accountName) {
          return `// Install: npm install fastenr-analytics (coming soon)
import { useEffect } from 'react';

// Fastenr Analytics Hook for Single Account Tracking
export function useFastenrAnalytics(trackingKey) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const script = document.createElement('script');
    script.src = '${baseUrl}/tracking/fastenr-analytics.js';
    script.onload = () => {
      window.fastenr('${trackingKey}', {
        debug: process.env.NODE_ENV === 'development',
        apiUrl: '${baseUrl}/api/tracking',
        // Account tracking for: ${accountName}
        account: {
          id: '${accountId}',
          name: '${accountName}'
        }
      });
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [trackingKey]);
}

// Usage in your app
function App() {
  useFastenrAnalytics('${trackingKey}');
  
  return <div>Your App</div>;
}`
        } else {
          return `// Install: npm install fastenr-analytics (coming soon)
import { useEffect } from 'react';

// Fastenr Analytics Hook
export function useFastenrAnalytics(trackingKey) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const script = document.createElement('script');
    script.src = '${baseUrl}/tracking/fastenr-analytics.js';
    script.onload = () => {
      window.fastenr('${trackingKey}', {
        debug: process.env.NODE_ENV === 'development',
        apiUrl: '${baseUrl}/api/tracking'
      });
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [trackingKey]);
}

// Usage in your app
function App() {
  useFastenrAnalytics('${trackingKey}');
  
  return <div>Your App</div>;
}`
        }

      case 'nextjs':
        return `// pages/_app.js or app/layout.js
import Script from 'next/script'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script 
        src="${baseUrl}/tracking/fastenr-analytics.js"
        onLoad={() => {
          fastenr('${trackingKey}', {
            debug: process.env.NODE_ENV === 'development',
            apiUrl: '${baseUrl}/api/tracking'
          });
        }}
      />
      <Component {...pageProps} />
    </>
  )
}`

      case 'vue':
        return `// main.js or App.vue
<script>
export default {
  mounted() {
    if (typeof window === 'undefined') return;
    
    const script = document.createElement('script');
    script.src = '${baseUrl}/tracking/fastenr-analytics.js';
    script.onload = () => {
      window.fastenr('${trackingKey}', {
        debug: process.env.NODE_ENV === 'development',
        apiUrl: '${baseUrl}/api/tracking'
      });
    };
    document.head.appendChild(script);
  }
}
</script>`

      default:
        return generateEmbedCode(trackingKey, 'vanilla')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    })
  }

  // If we have data, show the dashboard
  return (
    <div className="space-y-6">
      {/* Master Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Filter by Product</Label>
              <Select value={selectedProductFilter} onValueChange={setSelectedProductFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map(product => {
                    const productMetrics = metrics?.filter(m => m.product_id === product.id) || []
                    return (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({productMetrics.length} sessions)
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            
            {/* Account Filter - Show only if there are tracked accounts */}
            {trackedAccounts && trackedAccounts.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Filter by Account</Label>
                <Select value={selectedAccountFilter} onValueChange={setSelectedAccountFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {trackedAccounts.map(account => {
                      const accountMetrics = metrics?.filter(m => m.tracked_account_id === account.id) || []
                      const displayName = account.account_name || account.account_id || account.account_domain || `Account ${account.id.slice(-6)}`
                      
                      return (
                        <SelectItem key={account.id} value={account.id}>
                          {displayName} ({accountMetrics.length} sessions)
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Button - Always Available */}
      <div className="flex justify-end">
        <Button onClick={() => setShowSetupDialog(true)} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Setup & Embed Codes
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {(() => {
                    if (!metrics) return 0
                    let filteredMetrics = metrics
                    if (selectedProductFilter !== 'all') {
                      filteredMetrics = filteredMetrics.filter(m => m.product_id === selectedProductFilter)
                    }
                    if (selectedAccountFilter !== 'all') {
                      filteredMetrics = filteredMetrics.filter(m => m.tracked_account_id === selectedAccountFilter)
                    }
                    return filteredMetrics.reduce((acc, m) => acc + m.unique_users, 0)
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Unique Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {(() => {
                    if (!metrics) return 0
                    let filteredMetrics = metrics
                    if (selectedProductFilter !== 'all') {
                      filteredMetrics = filteredMetrics.filter(m => m.product_id === selectedProductFilter)
                    }
                    if (selectedAccountFilter !== 'all') {
                      filteredMetrics = filteredMetrics.filter(m => m.tracked_account_id === selectedAccountFilter)
                    }
                    return filteredMetrics.reduce((acc, m) => acc + m.page_views, 0)
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Page Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {(() => {
                    if (!metrics) return 0
                    let filteredMetrics = metrics
                    if (selectedProductFilter !== 'all') {
                      filteredMetrics = filteredMetrics.filter(m => m.product_id === selectedProductFilter)
                    }
                    if (selectedAccountFilter !== 'all') {
                      filteredMetrics = filteredMetrics.filter(m => m.tracked_account_id === selectedAccountFilter)
                    }
                    return filteredMetrics.length > 0 ? Math.round(filteredMetrics.reduce((acc, m) => acc + m.avg_session_duration, 0) / filteredMetrics.length) : 0
                  })()}s
                </p>
                <p className="text-xs text-muted-foreground">Avg Session</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {(() => {
                    if (!metrics) return 0
                    let filteredMetrics = metrics
                    if (selectedProductFilter !== 'all') {
                      filteredMetrics = filteredMetrics.filter(m => m.product_id === selectedProductFilter)
                    }
                    if (selectedAccountFilter !== 'all') {
                      filteredMetrics = filteredMetrics.filter(m => m.tracked_account_id === selectedAccountFilter)
                    }
                    return filteredMetrics.reduce((acc, m) => acc + m.total_sessions, 0)
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products and Analytics will be implemented next */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Analytics Dashboard</CardTitle>
          <CardDescription>
            Detailed metrics and insights coming in the next implementation phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Full analytics dashboard with charts, user journeys, and behavioral insights will be available here.
          </p>
        </CardContent>
      </Card>

      {/* Setup Dialog - Available from anywhere */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {currentStep === 'get-code' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToProducts}
                  className="mr-2 p-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <Zap className="h-5 w-5 mr-2 text-blue-600" />
              {currentStep === 'products' && 'Setup Usage Tracking'}
              {currentStep === 'get-code' && `Get Code - ${selectedProductForCode?.name}`}
              {currentStep === 'create-product' && 'Create New Product'}
            </DialogTitle>
            <DialogDescription>
              {currentStep === 'products' && 'Manage your tracking products and get embed codes'}
              {currentStep === 'get-code' && 'Choose your tracking mode and framework'}
              {currentStep === 'create-product' && 'Add a new product to track'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Products Management View */}
            {currentStep === 'products' && (
              <>
                {/* Show existing products */}
                {products.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Your Tracking Products</h3>
                      {(products.length === 0 || organization?.premiumAccess?.hasPremium) && (
                        <Button onClick={handleCreateProductStep} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {products.map((product) => (
                        <Card key={product.id} className="border">
                          <CardContent className="p-4">
                            {editingProduct?.id === product.id ? (
                              // Edit Mode
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor={`edit-name-${product.id}`}>Product Name</Label>
                                  <Input
                                    id={`edit-name-${product.id}`}
                                    value={editProductName}
                                    onChange={(e) => setEditProductName(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`edit-domain-${product.id}`}>Domain (Optional)</Label>
                                  <Input
                                    id={`edit-domain-${product.id}`}
                                    value={editProductDomain}
                                    onChange={(e) => setEditProductDomain(e.target.value)}
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={handleUpdateProduct}
                                    disabled={!editProductName.trim() || isUpdatingProduct}
                                  >
                                    {isUpdatingProduct ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEdit}
                                    disabled={isUpdatingProduct}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{product.name}</h4>
                                  {product.domain && (
                                    <p className="text-sm text-muted-foreground">{product.domain}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Created: {new Date(product.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={product.is_active ? "default" : "secondary"}>
                                    {product.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    onClick={() => handleEditProduct(product)}
                                    variant="outline"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleGetCode(product)}
                                  >
                                    <Code className="h-4 w-4 mr-2" />
                                    Get Code
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to delete "${product.name}"? This will permanently remove all associated tracking data.`)) {
                                        handleDeleteProduct(product.id)
                                      }
                                    }}
                                    disabled={isDeletingProduct && productToDelete === product.id}
                                  >
                                    {isDeletingProduct && productToDelete === product.id ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Initial setup or no products */}
                {products.length === 0 && (
                  <div className="text-center space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Get Started with Usage Tracking</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add innovative user tracking to your application in minutes. No user authentication required.
                      </p>
                      <Button onClick={handleCreateProductStep} size="lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Product
                      </Button>
                    </div>
                  </div>
                )}

                {/* Premium upsell for free users with existing products */}
                {products.length >= 1 && !organization?.premiumAccess?.hasPremium && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Crown className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="font-medium text-yellow-800">Premium Required</span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      Upgrade to premium to track multiple products and unlock advanced features.
                    </p>
                    <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                      <Link href="/dashboard/admin/subscription">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Premium
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Features Information - Show when no products exist */}
                {products.length === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">What Gets Tracked</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Unique Users</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Innovative fingerprinting without requiring login
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <MousePointer className="h-4 w-4 text-green-600" />
                            <span className="font-medium">User Engagement</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Clicks, scrolls, form interactions, and behavioral patterns
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Eye className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Page Views</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Page visits and navigation patterns
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">Session Data</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Time spent, session duration, and user flow
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Create Product View */}
            {currentStep === 'create-product' && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="product-name">Product Name *</Label>
                    <Input
                      id="product-name"
                      placeholder="My Web App"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="product-domain">Domain (Optional)</Label>
                    <Input
                      id="product-domain"
                      placeholder="myapp.com"
                      value={newProductDomain}
                      onChange={(e) => setNewProductDomain(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Restrict tracking to specific domain for security
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={handleCreateProduct}
                      disabled={!newProductName.trim() || isCreatingProduct}
                    >
                      {isCreatingProduct ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Product
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentStep('products')}
                      disabled={isCreatingProduct}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Get Code View */}
            {currentStep === 'get-code' && selectedProductForCode && (
              <div className="space-y-6">
                {/* Account Selection */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">Choose Tracking Mode</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1">
                      <Info className="h-3 w-3 text-blue-600 inline mr-1" />
                      <span className="text-xs text-blue-700">Optional</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="multi-tenant"
                        name="account-tracking"
                        value="multi-tenant"
                        checked={selectedAccountForTracking === 'multi-tenant'}
                        onChange={(e) => setSelectedAccountForTracking(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div>
                        <label htmlFor="multi-tenant" className="text-sm font-medium text-gray-900">
                          Multi-tenant tracking
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Track all users and accounts together (default)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        id="single-account"
                        name="account-tracking"
                        value="single-account"
                        checked={selectedAccountForTracking !== 'multi-tenant' && selectedAccountForTracking !== ''}
                        onChange={() => {
                          if (availableAccounts.length > 0) {
                            setSelectedAccountForTracking(availableAccounts[0].id)
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                      />
                      <div className="flex-1">
                        <label htmlFor="single-account" className="text-sm font-medium text-gray-900">
                          Single account tracking
                        </label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Track usage for one specific account only
                        </p>
                        {selectedAccountForTracking !== 'multi-tenant' && availableAccounts.length > 0 && (
                          <Select 
                            value={selectedAccountForTracking} 
                            onValueChange={setSelectedAccountForTracking}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an account" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name} {account.domain && `(${account.domain})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Framework Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Select Framework</h3>
                  <Tabs value={selectedFramework} onValueChange={setSelectedFramework}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="vanilla">HTML/JS</TabsTrigger>
                      <TabsTrigger value="react">React</TabsTrigger>
                      <TabsTrigger value="nextjs">Next.js</TabsTrigger>
                      <TabsTrigger value="vue">Vue</TabsTrigger>
                    </TabsList>

                    <TabsContent value={selectedFramework} className="mt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Embed Code</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const selectedAccount = selectedAccountForTracking === 'multi-tenant' 
                                ? null 
                                : availableAccounts.find(acc => acc.id === selectedAccountForTracking)
                              copyToClipboard(generateEmbedCode(selectedProductForCode.tracking_key, selectedFramework, selectedAccount?.id, selectedAccount?.name))
                            }}
                          >
                            {copiedCode ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            {copiedCode ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <Textarea
                          value={(() => {
                            const selectedAccount = selectedAccountForTracking === 'multi-tenant' 
                              ? null 
                              : availableAccounts.find(acc => acc.id === selectedAccountForTracking)
                            return generateEmbedCode(selectedProductForCode.tracking_key, selectedFramework, selectedAccount?.id, selectedAccount?.name)
                          })()}
                          readOnly
                          className="font-mono text-sm h-64"
                        />
                        <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
                          <strong>Tracking Key:</strong> {selectedProductForCode.tracking_key}<br />
                          {selectedProductForCode.domain && (
                            <><strong>Domain:</strong> {selectedProductForCode.domain}<br /></>
                          )}
                          <strong>Mode:</strong> {selectedAccountForTracking === 'multi-tenant' ? 'Multi-tenant tracking' : 
                            `Single account (${availableAccounts.find(acc => acc.id === selectedAccountForTracking)?.name || 'Unknown'})`
                          }
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}