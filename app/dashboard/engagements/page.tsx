import EngagementsClient from "@/components/engagements/engagements-client"
import { getEngagements } from "@/lib/supabase/queries"

export default async function EngagementsPage() {
  try {
    const engagements = await getEngagements()
    return <EngagementsClient initialEngagements={engagements.data} canCreate={true} />
  } catch (error) {
    console.error("Error loading engagements:", error)
    return <EngagementsClient initialEngagements={[]} canCreate={true} />
  }
}
