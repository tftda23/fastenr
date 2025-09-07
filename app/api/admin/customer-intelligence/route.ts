import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { clearHealthScoreSettingsCache } from '@/lib/health-score-engine'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get current user and organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get current settings from app_settings
    const { data: settings } = await supabase
      .from('app_settings')
      .select(`
        health_score_template,
        health_score_engagement_weight,
        health_score_nps_weight,
        health_score_activity_weight,
        health_score_growth_weight,
        churn_risk_template,
        churn_risk_contract_weight,
        churn_risk_usage_weight,
        churn_risk_relationship_weight,
        churn_risk_satisfaction_weight,
        churn_risk_time_horizon
      `)
      .eq('organization_id', profile.organization_id)
      .single()

    const healthSettings = {
      health_score_template: settings?.health_score_template || 'balanced',
      health_score_engagement_weight: settings?.health_score_engagement_weight ?? 30,
      health_score_nps_weight: settings?.health_score_nps_weight ?? 25,
      health_score_activity_weight: settings?.health_score_activity_weight ?? 25,
      health_score_growth_weight: settings?.health_score_growth_weight ?? 20,
    }

    const churnSettings = {
      churn_risk_template: settings?.churn_risk_template || 'balanced',
      churn_risk_contract_weight: settings?.churn_risk_contract_weight ?? 40,
      churn_risk_usage_weight: settings?.churn_risk_usage_weight ?? 25,
      churn_risk_relationship_weight: settings?.churn_risk_relationship_weight ?? 20,
      churn_risk_satisfaction_weight: settings?.churn_risk_satisfaction_weight ?? 15,
      churn_risk_time_horizon: settings?.churn_risk_time_horizon ?? 90,
    }

    return NextResponse.json({
      health_settings: healthSettings,
      churn_settings: churnSettings
    })
  } catch (error) {
    console.error('Error fetching customer intelligence settings:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch settings' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get current user and organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { health_settings, churn_settings } = await request.json()

    // Prepare the update object
    const updateData: any = {}

    // Add health settings if provided
    if (health_settings) {
      updateData.health_score_template = health_settings.health_score_template
      updateData.health_score_engagement_weight = health_settings.health_score_engagement_weight
      updateData.health_score_nps_weight = health_settings.health_score_nps_weight
      updateData.health_score_activity_weight = health_settings.health_score_activity_weight
      updateData.health_score_growth_weight = health_settings.health_score_growth_weight
    }

    // Add churn settings if provided
    if (churn_settings) {
      updateData.churn_risk_template = churn_settings.churn_risk_template
      updateData.churn_risk_contract_weight = churn_settings.churn_risk_contract_weight
      updateData.churn_risk_usage_weight = churn_settings.churn_risk_usage_weight
      updateData.churn_risk_relationship_weight = churn_settings.churn_risk_relationship_weight
      updateData.churn_risk_satisfaction_weight = churn_settings.churn_risk_satisfaction_weight
      updateData.churn_risk_time_horizon = churn_settings.churn_risk_time_horizon
    }

    updateData.updated_at = new Date().toISOString()

    // Update or insert settings
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        organization_id: profile.organization_id,
        ...updateData
      })

    if (error) {
      console.error('Error updating customer intelligence settings:', error)
      return NextResponse.json({ 
        error: 'Failed to update settings' 
      }, { status: 500 })
    }

    // Clear health score cache when settings change
    clearHealthScoreSettingsCache(profile.organization_id)

    return NextResponse.json({ 
      success: true,
      message: 'Customer intelligence settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating customer intelligence settings:', error)
    return NextResponse.json({ 
      error: 'Failed to update settings' 
    }, { status: 500 })
  }
}