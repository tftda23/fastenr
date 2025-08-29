import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SurveyPreview from "@/components/surveys/survey-preview"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface PreviewPageProps {
  params: { id: string }
}

export default async function SurveyPreviewPage({ params }: PreviewPageProps) {
  const supabase = createClient()

  const { data: survey, error } = await supabase
    .from("surveys")
    .select(`
      *,
      organizations(name, logo_url)
    `)
    .eq("id", params.id)
    .single()

  if (error || !survey) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SurveyPreview survey={survey} />
    </div>
  )
}