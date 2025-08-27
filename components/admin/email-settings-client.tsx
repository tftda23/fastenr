"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail, Send } from "lucide-react"

export default function EmailSettingsClient() {
  const [testing, setTesting] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const { toast } = useToast()

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the test email to",
        variant: "destructive"
      })
      return
    }

    setTesting(true)
    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          testType: "send", 
          testEmail: testEmail 
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast({
          title: result.mock ? "Test Email Logged" : "Test Email Sent",
          description: result.message,
          variant: result.sent || result.mock ? "default" : "destructive"
        })
      } else {
        throw new Error(result.error || "Failed to send test email")
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      toast({
        title: "Test Failed",
        description: "Failed to send test email",
        variant: "destructive"
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Settings</h1>
        <p className="text-muted-foreground">Configure and test your email delivery settings</p>
      </div>


      {/* Test Email Sending */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Test Email
          </CardTitle>
          <CardDescription>
            Send a test email to verify your email delivery is working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Test Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={sendTestEmail} 
            disabled={testing || !testEmail}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {testing ? "Sending..." : "Send Test Email"}
          </Button>
        </CardContent>
      </Card>

    </div>
  )
}