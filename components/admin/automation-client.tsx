"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, Plus, Settings, Play, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AutomationWorkflow } from "@/lib/types";
import CreateAutomationDialog from "./create-automation-dialog-new";
import EditAutomationDialog from "./edit-automation-dialog";
import { toggleAutomation } from "@/lib/supabase/automation.client"

interface AutomationClientProps {
  organizationId: string;
  initialAutomations: (AutomationWorkflow & { automation_workflow_accounts?: { account_id: string }[] })[];
}

export default function AutomationClient({ organizationId, initialAutomations }: AutomationClientProps) {
  const { toast } = useToast();
  const [automations, setAutomations] = useState(initialAutomations);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AutomationWorkflow & { automation_workflow_accounts?: { account_id: string }[] } | null>(null);
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalRuns: 0,
    successRate: 0,
    recentRuns: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, [organizationId]);

  const loadStats = async () => {
    try {
      const res = await fetch(`/api/admin/automation?organizationId=${organizationId}`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to load automation stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const onToggle = async (a: AutomationWorkflow, checked: boolean) => {
    // optimistic update
    setAutomations(prev => prev.map(x => x.id === a.id ? { ...x, enabled: checked, status: checked ? 'active' : 'paused' } : x));
    try {
      await toggleAutomation(a.id, checked);
      await loadStats(); // Refresh stats
    } catch {
      // revert on error
      setAutomations(prev => prev.map(x => x.id === a.id ? { ...x, enabled: !checked, status: !checked ? 'active' : 'paused' } : x));
    }
  };

  const onManualTrigger = async (workflowId: string) => {
    try {
      const res = await fetch(`/api/admin/automation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast({ title: "Automation triggered", description: data.message });
        await loadStats(); // Refresh stats
      } else {
        toast({ 
          variant: "destructive", 
          title: "Failed to trigger automation", 
          description: data.error 
        });
      }
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to trigger automation" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Automation Workflows</h2>
          <p className="text-muted-foreground">Automate customer success tasks and notifications</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <div className="grid gap-4">
        {automations.map((automation) => (
          <Card key={automation.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{automation.name}</h3>
                    <p className="text-sm text-muted-foreground">{automation.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span><strong>Trigger:</strong> {automation.trigger_type}</span>
                      <span><strong>Action:</strong> {automation.action_type}</span>
                      <span><strong>Scope:</strong> {automation.scope_all_accounts ? "All accounts" : "Selected accounts"}</span>
                      {automation.last_run_at && <span><strong>Last run:</strong> {new Date(automation.last_run_at).toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge
                    className={
                      automation.status === "active"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : automation.status === "paused"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {automation.status}
                  </Badge>
                  <Switch checked={automation.enabled} onCheckedChange={(v) => onToggle(automation, v)} />
                  <Button variant="outline" size="sm" onClick={() => onManualTrigger(automation.id)}>
                    <Play className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(automation)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time statistics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Automation Statistics
            </CardTitle>
            <CardDescription>Performance metrics for your workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingStats ? (
              <div className="text-center py-4 text-muted-foreground">Loading statistics...</div>
            ) : (
              <>
                <Row label="Total Workflows" value={stats.totalWorkflows} />
                <Row label="Active Workflows" value={stats.activeWorkflows} />
                <Row label="Total Executions" value={stats.totalRuns} />
                <Row label="Success Rate" value={`${Math.round(stats.successRate)}%`} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest automation executions</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="text-center py-4 text-muted-foreground">Loading activity...</div>
            ) : stats.recentRuns.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No recent activity</div>
            ) : (
              <div className="space-y-2">
                {stats.recentRuns.slice(0, 5).map((run: any) => (
                  <div key={run.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {run.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="truncate">{run.automation_workflows?.name || "Unknown"}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(run.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {showCreate &&
        <CreateAutomationDialog
          organizationId={organizationId}
          onClose={() => setShowCreate(false)}
          onCreated={(wf) => { setAutomations(prev => [wf as any, ...prev]); setShowCreate(false); }}
        />
      }

      {editing &&
        <EditAutomationDialog
          workflow={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setAutomations(prev => prev.map(a => a.id === updated.id ? (updated as any) : a));
            setEditing(null);
          }}
          onDeleted={() => {
            setAutomations(prev => prev.filter(a => a.id !== editing.id));
            setEditing(null);
            loadStats(); // Refresh stats after deletion
          }}
        />
      }
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function TemplateBtn({ label, trigger, action, onClick }: { label: string; trigger: string; action: string; onClick: () => void }) {
  return (
    <Button variant="outline" className="w-full justify-start bg-transparent" onClick={onClick} title={`${trigger} → ${action}`}>
      <Zap className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
