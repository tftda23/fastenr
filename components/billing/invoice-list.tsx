"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Calendar, FileText } from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  status: string
  total_amount: number
  due_date: string
  created_at: string
}

interface InvoiceListProps {
  invoices: Invoice[]
  onDownload: (invoiceId: string, invoiceNumber: string) => void
}

export function InvoiceList({ invoices, onDownload }: InvoiceListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'open':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAmount = (amount: number) => {
    return `£${(amount / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'open' && new Date(dueDate) < new Date()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Invoices
        </CardTitle>
        <CardDescription>
          View and download your invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No invoices yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => {
              const overdue = isOverdue(invoice.due_date, invoice.status)
              
              return (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{invoice.invoice_number}</h4>
                      <Badge 
                        className={getStatusColor(overdue ? 'overdue' : invoice.status)}
                        variant="secondary"
                      >
                        {overdue ? 'Overdue' : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {formatDate(invoice.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {formatDate(invoice.due_date)}
                      </div>
                      <div className="font-medium text-foreground">
                        {formatAmount(invoice.total_amount)}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(invoice.id, invoice.invoice_number)}
                    className="ml-4"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}