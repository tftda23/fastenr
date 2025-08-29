// lib/supabase/automation.client.ts
// Uses your existing client helper (createClientComponentClient)
import type { AutomationWorkflow } from "@/lib/types";
// ⬇️ Adjust the path if your wrapper lives elsewhere
import { createClient as createSupabaseClient } from "@/lib/supabase/client";

export async function createAutomation(input: {
  organization_id: string;
  name: string;
  description?: string;
  status?: "draft" | "active" | "paused";
  enabled?: boolean;
  scope_all_accounts: boolean;
  account_ids?: string[];
  trigger_type: string;
  trigger_config?: Record<string, any>;
  condition_config?: Record<string, any>;
  action_type: string;
  action_config?: Record<string, any>;
}) {
  const supabase = createSupabaseClient();

  const { data: workflow, error } = await (supabase as any)
    .from("automation_workflows")
    .insert([
      {
        organization_id: input.organization_id,
        name: input.name,
        description: input.description ?? null,
        status: input.status ?? "draft",
        enabled: input.enabled ?? false,
        scope_all_accounts: input.scope_all_accounts,
        trigger_type: input.trigger_type,
        trigger_config: input.trigger_config ?? {},
        condition_config: input.condition_config ?? {},
        action_type: input.action_type,
        action_config: input.action_config ?? {},
      },
    ])
    .select()
    .single();

  if (error) throw error;

  if (!input.scope_all_accounts && input.account_ids?.length) {
    const rows = input.account_ids.map((account_id) => ({
      workflow_id: workflow.id,
      account_id,
    }));
    const { error: waErr } = await (supabase as any).from("automation_workflow_accounts").insert(rows);
    if (waErr) throw waErr;
  }

  return workflow as AutomationWorkflow;
}

export async function updateAutomation(
  workflowId: string,
  updates: Partial<AutomationWorkflow> & { account_ids?: string[] }
) {
  const supabase = createSupabaseClient();
  const { account_ids, ...wfUpdates } = updates;

  if (Object.keys(wfUpdates).length) {
    const { error } = await (supabase as any)
      .from("automation_workflows")
      .update(wfUpdates)
      .eq("id", workflowId);
    if (error) throw error;
  }

  if (account_ids) {
    const { error: delErr } = await supabase
      .from("automation_workflow_accounts")
      .delete()
      .eq("workflow_id", workflowId);
    if (delErr) throw delErr;

    if (account_ids.length) {
      const rows = account_ids.map((account_id) => ({ workflow_id: workflowId, account_id }));
      const { error: insErr } = await (supabase as any)
        .from("automation_workflow_accounts")
        .insert(rows);
      if (insErr) throw insErr;
    }
  }
}

export async function toggleAutomation(workflowId: string, enabled: boolean) {
  const supabase = createSupabaseClient();
  const { error } = await (supabase as any)
    .from("automation_workflows")
    .update({ enabled, status: enabled ? "active" : "paused" })
    .eq("id", workflowId);

  if (error) throw error;
}

export async function deleteAutomation(workflowId: string) {
  const supabase = createSupabaseClient();
  
  // First delete related records
  await supabase
    .from("automation_workflow_accounts")
    .delete()
    .eq("workflow_id", workflowId);
    
  await supabase
    .from("automation_runs")
    .delete()
    .eq("workflow_id", workflowId);
    
  await supabase
    .from("automation_jobs")
    .delete()
    .eq("workflow_id", workflowId);

  // Then delete the workflow
  const { error } = await supabase
    .from("automation_workflows")
    .delete()
    .eq("id", workflowId);

  if (error) throw error;
}
