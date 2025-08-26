// lib/supabase/automation.server.ts
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { AutomationWorkflow } from "@/lib/types";

export async function getAutomations(organizationId: string) {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase
    .from("automation_workflows")
    .select(`
      *,
      automation_workflow_accounts (account_id)
    `)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as (AutomationWorkflow & { automation_workflow_accounts: { account_id: string }[] })[];
}
