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
import { useToast } from "@/hooks/use-toast";
import { Zap, Mail, Slack, Calendar, AlertTriangle } from "lucide-react";

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
    // load accounts (adjust to your existing query path)
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Workflow</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Renewal Reminder" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Send reminder 30 days before contract end"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Trigger</Label>
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account_created">Account Created</SelectItem>
                  <SelectItem value="contract_ends_in">Contract Ends In (days)</SelectItem>
                  <SelectItem value="health_score_below">Health Score Below</SelectItem>
                  <SelectItem value="engagement_created">Engagement Created</SelectItem>
                </SelectContent>
              </Select>
              <small className="text-muted-foreground">
                Provide details in Trigger Config as JSON (e.g., {"{ \"days\": 30 }"} or {"{ \"threshold\": 60 }"}).
              </small>
            </div>
            <div>
              <Label>Action</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="send_email">Send Email</SelectItem>
                  <SelectItem value="send_slack">Send Slack Notification</SelectItem>
                  <SelectItem value="create_task">Create Task</SelectItem>
                  <SelectItem value="send_survey">Send Survey</SelectItem>
                  <SelectItem value="send_email_sequence">Send Email Sequence</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label>Scope</Label>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox id="scope_all" checked={scopeAll} onCheckedChange={(v) => setScopeAll(Boolean(v))} />
                <Label htmlFor="scope_all" className="font-normal">
                  All accounts
                </Label>
              </div>
            </div>
            {!scopeAll && (
              <div className="md:col-span-2">
                <Label>Select Accounts</Label>
                <div className="max-h-40 overflow-auto border rounded p-2 space-y-2">
                  {accounts.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedAccounts.includes(a.id)}
                        onChange={(e) =>
                          setSelectedAccounts((prev) =>
                            e.target.checked ? [...prev, a.id] : prev.filter((id) => id !== a.id)
                          )
                        }
                      />
                      {a.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trigger Configuration */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Trigger Configuration</Label>
            {triggerType === "health_score_below" && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Health Score Threshold</Label>
                  <Input
                    type="number"
                    value={triggerConfig.threshold}
                    onChange={(e) => setTriggerConfig(prev => ({ ...prev, threshold: parseInt(e.target.value) || 70 }))}
                    placeholder="70"
                  />
                </div>
                <div>
                  <Label>Score Type</Label>
                  <Select 
                    value={triggerConfig.score_type} 
                    onValueChange={(value) => setTriggerConfig(prev => ({ ...prev, score_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health_score">Health Score</SelectItem>
                      <SelectItem value="engagement_score">Engagement Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {triggerType === "contract_ends_in" && (
              <div>
                <Label>Days Before Contract End</Label>
                <Input
                  type="number"
                  value={triggerConfig.days}
                  onChange={(e) => setTriggerConfig(prev => ({ ...prev, days: parseInt(e.target.value) || 30 }))}
                  placeholder="30"
                />
              </div>
            )}
          </div>

          {/* Action Configuration */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Action Configuration</Label>
            {actionType === "send_email" && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Email Template</Label>
                  <Select 
                    value={actionConfig.email_template} 
                    onValueChange={(value) => setActionConfig(prev => ({ ...prev, email_template: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health_alert">Health Alert</SelectItem>
                      <SelectItem value="renewal_reminder">Renewal Reminder</SelectItem>
                      <SelectItem value="welcome">Welcome Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Recipients (comma-separated)</Label>
                  <Input
                    value={Array.isArray(actionConfig.recipients) ? actionConfig.recipients.join(", ") : actionConfig.recipients}
                    onChange={(e) => setActionConfig(prev => ({ ...prev, recipients: e.target.value.split(",").map(s => s.trim()) }))}
                    placeholder="csm@company.com, manager@company.com"
                  />
                </div>
              </div>
            )}
            {actionType === "send_slack" && (
              <div>
                <Label>Slack Channel</Label>
                <Input
                  value={actionConfig.slack_channel}
                  onChange={(e) => setActionConfig(prev => ({ ...prev, slack_channel: e.target.value }))}
                  placeholder="#customer-success"
                />
              </div>
            )}
            {actionType === "create_task" && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Task Title</Label>
                  <Input
                    value={actionConfig.task_title}
                    onChange={(e) => setActionConfig(prev => ({ ...prev, task_title: e.target.value }))}
                    placeholder="Follow up required"
                  />
                </div>
                <div>
                  <Label>Assignee</Label>
                  <Select 
                    value={actionConfig.task_assignee} 
                    onValueChange={(value) => setActionConfig(prev => ({ ...prev, task_assignee: value }))}
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
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={!canSave || saving}>
              {saving ? "Saving..." : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

