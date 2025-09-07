"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAutomation } from "@/lib/supabase/automation.client"
import { useToast } from "@/lib/hooks/use-toast";
import { Zap, Mail, Slack, Calendar, AlertTriangle, CheckCircle } from "lucide-react";

interface Props {
  organizationId: string;
  onCreated: (wf: any) => void;
  onClose: () => void;
}

export default function CreateAutomationDialog({ organizationId, onCreated, onClose }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: Basic, 2: Trigger, 3: Action, 4: Review
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("account_created");
  const [actionType, setActionType] = useState("send_email");
  const [scopeAll, setScopeAll] = useState(true);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [users, setUsers] = useState<{ id: string; full_name?: string; email: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // UI-driven configuration instead of JSON
  const [triggerConfig, setTriggerConfig] = useState({
    threshold: 70,
    days: 30,
    score_type: "health_score"
  });
  const [actionConfig, setActionConfig] = useState({
    email_template: "health_alert",
    recipients: ["csm@company.com"],
    slack_channel: "#customer-success",
    task_title: "Follow up required",
    task_assignee: ""
  });

  useEffect(() => {
    // Load accounts
    (async () => {
      try {
        const res = await fetch(`/api/accounts?limit=200`, { cache: "no-store" });
        const json = await res.json();
        setAccounts(json.data ?? []);
      } catch {
        // ignore
      }
    })();

    // load users for assignee dropdown
    (async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const users = await res.json();
          setUsers(users);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const canSave = useMemo(
    () =>
      name.trim().length > 2 &&
      triggerType &&
      actionType &&
      (scopeAll || selectedAccounts.length > 0),
    [name, triggerType, actionType, scopeAll, selectedAccounts]
  );

  const onSave = async () => {
    setSaving(true);
    try {
      const wf = await createAutomation({
        organization_id: organizationId,
        name,
        description,
        status: "draft",
        enabled: false,
        scope_all_accounts: scopeAll,
        account_ids: scopeAll ? [] : selectedAccounts,
        trigger_type: triggerType,
        trigger_config: triggerConfig,
        condition_config: {},
        action_type: actionType,
        action_config: actionConfig,
      });
      toast({ title: "Automation created", description: "You can enable it once you're ready." });
      onCreated(wf);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Failed to create automation",
        description: e?.message ?? "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  const triggerOptions = [
    { value: "account_created", label: "Account Created", icon: Calendar, description: "When a new account is added" },
    { value: "health_score_below", label: "Health Score Alert", icon: AlertTriangle, description: "When health score drops below threshold" },
    { value: "contract_ends_in", label: "Contract Expiring", icon: Calendar, description: "When contract expires in X days" },
    { value: "engagement_created", label: "New Engagement", icon: Calendar, description: "When an engagement is logged" },
  ];

  const actionOptions = [
    { value: "send_email", label: "Send Email", icon: Mail, description: "Send automated email notification" },
    { value: "send_slack", label: "Slack Message", icon: Slack, description: "Post message to Slack channel" },
    { value: "create_task", label: "Create Task", icon: Calendar, description: "Create follow-up task" },
    { value: "send_email_sequence", label: "Email Sequence", icon: Mail, description: "Start multi-step email sequence" },
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Workflow Name</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g., Health Score Alert" 
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this automation does..."
                rows={3}
              />
            </div>
            <div className="space-y-3">
              <Label>Scope</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="scope-all" 
                    checked={scopeAll} 
                    onCheckedChange={(checked) => setScopeAll(checked as boolean)} 
                  />
                  <Label htmlFor="scope-all">Apply to all accounts</Label>
                </div>
                {!scopeAll && (
                  <div className="ml-6 space-y-2">
                    <Label className="text-sm text-muted-foreground">Select specific accounts:</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {accounts.map((account) => (
                        <div key={account.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={account.id}
                            checked={selectedAccounts.includes(account.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAccounts([...selectedAccounts, account.id]);
                              } else {
                                setSelectedAccounts(selectedAccounts.filter(id => id !== account.id));
                              }
                            }}
                          />
                          <Label htmlFor={account.id} className="text-sm">{account.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-lg">Choose a Trigger</Label>
              <p className="text-sm text-muted-foreground">When should this automation run?</p>
            </div>
            <div className="grid gap-3">
              {triggerOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-colors ${
                      triggerType === option.value ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setTriggerType(option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium">{option.label}</h3>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        {triggerType === option.value && (
                          <CheckCircle className="h-5 w-5 text-blue-600 ml-auto" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {renderTriggerConfig()}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-lg">Choose an Action</Label>
              <p className="text-sm text-muted-foreground">What should happen when the trigger fires?</p>
            </div>
            <div className="grid gap-3">
              {actionOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-colors ${
                      actionType === option.value ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setActionType(option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="font-medium">{option.label}</h3>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        {actionType === option.value && (
                          <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {renderActionConfig()}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-lg">Review & Create</Label>
              <p className="text-sm text-muted-foreground">Review your automation settings</p>
            </div>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div><strong>Name:</strong> {name}</div>
                <div><strong>Description:</strong> {description}</div>
                <div><strong>Scope:</strong> {scopeAll ? "All accounts" : `${selectedAccounts.length} selected accounts`}</div>
                <div><strong>Trigger:</strong> {triggerOptions.find(t => t.value === triggerType)?.label}</div>
                <div><strong>Action:</strong> {actionOptions.find(a => a.value === actionType)?.label}</div>
              </CardContent>
            </Card>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Ready to Create</h4>
                  <p className="text-sm text-blue-700">Your automation will be created in draft mode. You can enable it when ready.</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderTriggerConfig = () => {
    switch (triggerType) {
      case "health_score_below":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configure Health Score Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Health Score Threshold</Label>
                <Input
                  type="number"
                  value={triggerConfig.threshold}
                  onChange={(e) => setTriggerConfig({...triggerConfig, threshold: parseInt(e.target.value) || 70})}
                  placeholder="70"
                />
                <p className="text-xs text-muted-foreground mt-1">Trigger when health score drops below this value</p>
              </div>
            </CardContent>
          </Card>
        );
      case "contract_ends_in":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configure Contract Expiration Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Days Before Expiration</Label>
                <Input
                  type="number"
                  value={triggerConfig.days}
                  onChange={(e) => setTriggerConfig({...triggerConfig, days: parseInt(e.target.value) || 30})}
                  placeholder="30"
                />
                <p className="text-xs text-muted-foreground mt-1">Trigger X days before contract expires</p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  const renderActionConfig = () => {
    switch (actionType) {
      case "send_email":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configure Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Email Template</Label>
                <Select 
                  value={actionConfig.email_template} 
                  onValueChange={(value) => setActionConfig({...actionConfig, email_template: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health_alert">Health Score Alert</SelectItem>
                    <SelectItem value="renewal_reminder">Renewal Reminder</SelectItem>
                    <SelectItem value="onboarding_welcome">Onboarding Welcome</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recipients (comma-separated)</Label>
                <Input
                  value={actionConfig.recipients.join(", ")}
                  onChange={(e) => setActionConfig({...actionConfig, recipients: e.target.value.split(",").map(s => s.trim())})}
                  placeholder="csm@company.com, manager@company.com"
                />
              </div>
            </CardContent>
          </Card>
        );
      case "send_slack":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configure Slack Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Slack Channel</Label>
                <Input
                  value={actionConfig.slack_channel}
                  onChange={(e) => setActionConfig({...actionConfig, slack_channel: e.target.value})}
                  placeholder="#customer-success"
                />
              </div>
            </CardContent>
          </Card>
        );
      case "create_task":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configure Task Creation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Task Title</Label>
                <Input
                  value={actionConfig.task_title}
                  onChange={(e) => setActionConfig({...actionConfig, task_title: e.target.value})}
                  placeholder="Follow up with account"
                />
              </div>
              <div>
                <Label>Assign To</Label>
                <Select 
                  value={actionConfig.task_assignee} 
                  onValueChange={(value) => setActionConfig({...actionConfig, task_assignee: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Automation Workflow</DialogTitle>
          <div className="flex items-center space-x-2 mt-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && <div className="w-8 h-0.5 bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {step === 1 && "Basic Information"}
            {step === 2 && "Choose Trigger"}
            {step === 3 && "Choose Action"}
            {step === 4 && "Review & Create"}
          </div>
        </DialogHeader>

        <div className="py-4">
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
          >
            {step > 1 ? "Back" : "Cancel"}
          </Button>
          <div className="space-x-2">
            {step < 4 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!name.trim() || (!scopeAll && selectedAccounts.length === 0))}
              >
                Next
              </Button>
            ) : (
              <Button onClick={onSave} disabled={saving || !canSave}>
                {saving ? "Creating..." : "Create Automation"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}