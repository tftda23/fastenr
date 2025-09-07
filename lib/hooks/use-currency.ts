"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, type CurrencyConfig, DEFAULT_CURRENCY_CONFIG } from '@/lib/currency'
import { CurrencyIcon, useCurrencyIcon } from '@/lib/currency-icon'

export function useCurrencyConfig() {
  const [config, setConfig] = useState<CurrencyConfig>(DEFAULT_CURRENCY_CONFIG)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCurrencyConfig() {
      try {
        const supabase = createClient()
        
        // Get current user's organization
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        if (!profile) {
          setIsLoading(false)
          return
        }

        // Get currency configuration for the organization
        const { data, error } = await supabase
          .rpc('get_org_currency_config', { org_id: profile.organization_id })
          .single()

        if (!error && data) {
          setConfig({
            currency_code: data.currency_code,
            currency_symbol: data.currency_symbol,
            currency_name: data.currency_name,
            decimal_places: data.decimal_places,
            symbol_position: data.symbol_position as 'before' | 'after',
            thousands_separator: data.thousands_separator,
            decimal_separator: data.decimal_separator
          })
        }
      } catch (error) {
        console.error('Error fetching currency config:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrencyConfig()
  }, [])

  const formatAmount = (amount: number | null | undefined) => {
    return formatCurrency(amount, config)
  }

  const CurrencyIconComponent = useCurrencyIcon(config.currency_code)

  return { 
    config, 
    isLoading, 
    formatCurrency: formatAmount,
    CurrencyIcon: CurrencyIconComponent
  }
}