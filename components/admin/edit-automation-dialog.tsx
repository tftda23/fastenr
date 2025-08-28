"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertTriangle } from "lucide-react";
import type { AutomationWorkflow } from "@/lib/types";
import { updateAutomation, deleteAutomation } from "@/lib/supabase/automation.client"

export default function EditAutomationDialog({
  workflow,
  onSaved,
  onDeleted,
  onClose,
}: {
  workflow: AutomationWorkflow & { automation_workflow_accounts?: { account_id: string }[] };
  onSaved: (wf: AutomationWorkflow) => void;
  onDeleted?: () => void;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(workflow.name);
  const [description, setDescription] = useState(workflow.description ?? "");
  const [triggerType, setTriggerType] = useState(workflow.trigger_type);
  const [actionType, setActionType] = useState(workflow.action_type);
  const [scopeAll, setScopeAll] = useState(workflow.scope_all_accounts);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; full_name?: string; email: string }[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
    workflow.automation_workflow_accounts?.map((a) => a.account_id) ?? []
  );
  
  // UI-driven configuration instead of raw JSON
  const [triggerConfig, setTriggerConfig] = useState({
    threshold: workflow.trigger_config?.threshold ?? 70,
    days: workflow.trigger_config?.days ?? 30,
    score_type: workflow.trigger_config?.score_type ?? "health_score"
  });
  const [actionConfig, setActionConfig] = useState({
    email_template: workflow.action_config?.email_template ?? "health_alert",
    recipients: workflow.action_config?.recipients ?? ["csm@company.com"],
    slack_channel: workflow.action_config?.slack_channel ?? "#customer-success",
    task_title: workflow.action_config?.task_title ?? "Follow up required",
    task_assignee: workflow.action_config?.task_assignee ?? ""
  });
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
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

  const onSave = async () => {
    setSaving(true);
    try {
      const updates = {
        name,
        description,
        trigger_type: triggerType,
        trigger_config: triggerConfig,
        condition_config: {},
        action_type: actionType,
        action_config: actionConfig,
        scope_all_accounts: scopeAll,
        account_ids: scopeAll ? [] : selectedAccounts,
      } as any;

      await updateAutomation(workflow.id, updates);

      onSaved({
        ...workflow,
        ...updates,
      });
      toast({ title: "Automation updated" });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: e?.message ?? "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteAutomation(workflow.id);
      toast({ title: "Automation deleted" });
      onDeleted?.();
      onClose();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete",
        description: e?.message ?? "Unknown error",
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Workflow</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Trigger</Label>
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account_created">Account Created</SelectItem>
                  <SelectItem value="contract_ends_in">Contract Ends In (days)</SelectItem>
                  <SelectItem value="health_score_below">Health Score Below</SelectItem>
                  <SelectItem value="engagement_created">Engagement Created</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Action</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger>
                  <SelectValue />
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
                <Checkbox
                  id="scope_all"
                  checked={scopeAll}
                  onCheckedChange={(v) => setScopeAll(Boolean(v))}
                />
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
                            e.target.checked
                              ? [...prev, a.id]
                              : prev.filter((id) => id !== a.id)
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

          <div className="flex justify-between">
            <div className="flex gap-2">
              {!showDeleteConfirm ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Are you sure?</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={onDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={onSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

