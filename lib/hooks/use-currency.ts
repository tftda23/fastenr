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

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        if (profileError || !profile?.organization_id) {
          setIsLoading(false)
          return
        }

        // Get currency configuration for the organization
        const { data, error } = await supabase
          .from('organizations')
          .select('currency_code, currency_symbol, currency_name, decimal_places, symbol_position, thousands_separator, decimal_separator')
          .eq('id', profile.organization_id)
          .single()

        if (!error && data) {
          setConfig({
            currency_code: data.currency_code || DEFAULT_CURRENCY_CONFIG.currency_code,
            currency_symbol: data.currency_symbol || DEFAULT_CURRENCY_CONFIG.currency_symbol,
            currency_name: data.currency_name || DEFAULT_CURRENCY_CONFIG.currency_name,
            decimal_places: data.decimal_places || DEFAULT_CURRENCY_CONFIG.decimal_places,
            symbol_position: (data.symbol_position as 'before' | 'after') || DEFAULT_CURRENCY_CONFIG.symbol_position,
            thousands_separator: data.thousands_separator || DEFAULT_CURRENCY_CONFIG.thousands_separator,
            decimal_separator: data.decimal_separator || DEFAULT_CURRENCY_CONFIG.decimal_separator
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