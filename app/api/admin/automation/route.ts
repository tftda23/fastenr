import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

async function requireAdmin(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const { data: profile } = await supabase.from("user_profiles").select("role, organization_id").eq("id", user.id).single()
  if (!profile || profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) }
  }
  return { user, organizationId: profile.organization_id as string }
}

/** ---------- GET: automation statistics ---------- */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const admin = await requireAdmin(supabase)
    if ("error" in admin) return admin.error

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get("organizationId") || admin.organizationId

    // Get automation statistics
    const { data: workflows } = await supabase
      .from("automation_workflows")
      .select("id, status, enabled, run_count, success_count, failure_count")
      .eq("organization_id", organizationId)

    const { data: recentRuns } = await supabase
      .from("automation_runs")
      .select(`
        id,
        status,
        created_at,
        workflow_id,
        automation_workflows!inner(name)
      `)
      .eq("automation_workflows.organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(10)

    const stats = {
      totalWorkflows: workflows?.length || 0,
      activeWorkflows: workflows?.filter(w => w.enabled).length || 0,
      totalRuns: workflows?.reduce((sum, w) => sum + (w.run_count || 0), 0) || 0,
      successRate: workflows?.length ? 
        (workflows.reduce((sum, w) => sum + (w.success_count || 0), 0) / 
         Math.max(1, workflows.reduce((sum, w) => sum + (w.run_count || 0), 0)) * 100) : 0,
      recentRuns: recentRuns || []
    }

    return NextResponse.json(stats)
  } catch (e) {
    console.error("Automation stats error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** ---------- POST: trigger automation manually ---------- */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const admin = await requireAdmin(supabase)
    if ("error" in admin) return admin.error

    const body = await request.json().catch(() => ({}))
    const { workflowId, accountId } = body as { workflowId?: string; accountId?: string }

    if (!workflowId) {
      return NextResponse.json({ error: "workflowId is required" }, { status: 400 })
    }

    // Get workflow details
    const { data: workflow, error: workflowError } = await supabase
      .from("automation_workflows")
      .select("*")
      .eq("id", workflowId)
      .eq("organization_id", admin.organizationId)
      .single()

    if (workflowError || !workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    // Create automation job for manual execution
    const { data: job, error: jobError } = await supabase
      .from("automation_jobs")
      .insert({
        workflow_id: workflowId,
        account_id: accountId,
        job_type: "manual_trigger",
        payload: { triggered_by: admin.user.id },
        priority: 10 // High priority for manual triggers
      })
      .select()
      .single()

    if (jobError) {
      console.error("Job creation error:", jobError)
      return NextResponse.json({ error: "Failed to queue automation" }, { status: 500 })
    }

    // For demo purposes, immediately "process" the job
    await processAutomationJob(supabase, job.id)

    return NextResponse.json({ 
      success: true, 
      message: "Automation triggered successfully",
      jobId: job.id 
    })
  } catch (e) {
    console.error("Automation trigger error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Simple job processor (in a real system, this would be a background worker)
async function processAutomationJob(supabase: any, jobId: string) {
  try {
    // Update job status to processing
    await supabase
      .from("automation_jobs")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", jobId)

    // Get job details
    const { data: job } = await supabase
      .from("automation_jobs")
      .select(`
        *,
        automation_workflows(*)
      `)
      .eq("id", jobId)
      .single()

    if (!job) return

    // Create automation run record
    const { data: run } = await supabase
      .from("automation_runs")
      .insert({
        workflow_id: job.workflow_id,
        account_id: job.account_id,
        status: "running",
        trigger_data: job.payload,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    // Simulate automation execution
    let success = true
    let result = {}
    let errorMessage = null

    try {
      // Here you would implement the actual automation logic
      switch (job.automation_workflows.action_type) {
        case "send_email":
          result = { email_sent: true, recipients: job.automation_workflows.action_config.recipients }
          break
        case "send_slack":
          result = { slack_sent: true, channel: job.automation_workflows.action_config.slack_channel }
          break
        case "create_task":
          result = { task_created: true, title: job.automation_workflows.action_config.task_title }
          break
        default:
          result = { action: "simulated" }
      }
    } catch (error: any) {
      success = false
      errorMessage = error.message
    }

    // Update run status
    await supabase
      .from("automation_runs")
      .update({
        status: success ? "success" : "failed",
        result: result,
        error_message: errorMessage,
        finished_at: new Date().toISOString()
      })
      .eq("id", run.id)

    // Update job status
    await supabase
      .from("automation_jobs")
      .update({ 
        status: success ? "completed" : "failed",
        error_message: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId)

    // Update workflow stats
    await supabase
      .from("automation_workflows")
      .update({
        run_count: job.automation_workflows.run_count + 1,
        success_count: success ? job.automation_workflows.success_count + 1 : job.automation_workflows.success_count,
        failure_count: success ? job.automation_workflows.failure_count : job.automation_workflows.failure_count + 1,
        last_run_at: new Date().toISOString()
      })
      .eq("id", job.workflow_id)

  } catch (error) {
    console.error("Job processing error:", error)
    // Mark job as failed
    await supabase
      .from("automation_jobs")
      .update({ 
        status: "failed",
        error_message: error instanceof Error ? error.message : String(error),
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId)
  }
}