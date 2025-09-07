import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  const apiDocs = {
    title: "fastenr API",
    version: "1.0.0",
    description: "External API for fastenr platform",
    baseUrl: "/api/v1",
    authentication: {
      type: "API Key",
      description:
        "Include your API key in the Authorization header as 'Bearer YOUR_API_KEY' or in the 'X-API-Key' header",
    },
    endpoints: {
      accounts: {
        "GET /accounts": {
          description: "List all accounts",
          parameters: {
            page: "Page number (default: 1)",
            limit: "Items per page (max: 100, default: 20)",
            search: "Search by name or domain",
            status: "Filter by status (active, at_risk, churned, onboarding)",
          },
          permissions: ["read"],
        },
        "POST /accounts": {
          description: "Create a new account",
          body: {
            name: "string (required)",
            domain: "string",
            industry: "string",
            size: "string (startup, small, medium, large, enterprise)",
            arr: "number",
            contract_start_date: "string (YYYY-MM-DD)",
            contract_end_date: "string (YYYY-MM-DD)",
            status: "string (active, at_risk, churned, onboarding)",
            salesforce_id: "string",
            hubspot_id: "string",
          },
          permissions: ["write"],
        },
        "GET /accounts/{id}": {
          description: "Get account by ID",
          permissions: ["read"],
        },
        "PUT /accounts/{id}": {
          description: "Update account",
          permissions: ["write"],
        },
        "DELETE /accounts/{id}": {
          description: "Delete account",
          permissions: ["delete"],
        },
      },
      engagements: {
        "GET /engagements": {
          description: "List engagements",
          parameters: {
            page: "Page number",
            limit: "Items per page",
            account_id: "Filter by account ID",
            type: "Filter by type (meeting, call, email, note, demo, training)",
          },
          permissions: ["read"],
        },
        "POST /engagements": {
          description: "Create engagement",
          body: {
            account_id: "string (required)",
            type: "string (required)",
            title: "string (required)",
            description: "string",
            outcome: "string (positive, neutral, negative, action_required)",
            scheduled_at: "string (ISO 8601)",
            completed_at: "string (ISO 8601)",
            duration_minutes: "number",
            attendees: "array",
            tags: "array of strings",
          },
          permissions: ["write"],
        },
      },
      health: {
        "POST /health": {
          description: "Submit health metrics",
          body: {
            account_id: "string (required)",
            metric_date: "string (YYYY-MM-DD)",
            login_frequency: "number",
            feature_adoption_score: "number (0-100)",
            support_tickets: "number",
            training_completion_rate: "number (0-100)",
            overall_health_score: "number (0-100)",
          },
          permissions: ["write"],
        },
        "GET /health": {
          description: "Get health metrics",
          parameters: {
            account_id: "Filter by account ID",
            start_date: "Start date (YYYY-MM-DD)",
            end_date: "End date (YYYY-MM-DD)",
          },
          permissions: ["read"],
        },
      },
      nps: {
        "POST /nps": {
          description: "Submit NPS survey",
          body: {
            account_id: "string (required)",
            score: "number (0-10, required)",
            feedback: "string",
            survey_date: "string (YYYY-MM-DD)",
            respondent_name: "string",
            respondent_email: "string",
          },
          permissions: ["write"],
        },
        "GET /nps": {
          description: "Get NPS surveys",
          parameters: {
            account_id: "Filter by account ID",
            start_date: "Start date (YYYY-MM-DD)",
            end_date: "End date (YYYY-MM-DD)",
          },
          permissions: ["read"],
        },
      },
    },
    webhooks: {
      "POST /webhooks/salesforce": {
        description: "Salesforce webhook endpoint",
        authentication: "Webhook signature verification",
      },
    },
    rateLimit: {
      limit: 100,
      window: "1 minute",
      description: "Rate limiting is applied per organization",
    },
    errors: {
      400: "Bad Request - Invalid parameters",
      401: "Unauthorized - Invalid or missing API key",
      403: "Forbidden - Insufficient permissions",
      404: "Not Found - Resource not found",
      429: "Too Many Requests - Rate limit exceeded",
      500: "Internal Server Error",
    },
  }

  return NextResponse.json(apiDocs)
}
