import React from 'react'
import { DollarSign, PoundSterling, Euro, CircleDollarSign } from 'lucide-react'

interface CurrencyIconProps {
  currencyCode?: string
  className?: string
}

export function CurrencyIcon({ currencyCode = 'GBP', className = "h-4 w-4" }: CurrencyIconProps) {
  switch (currencyCode.toUpperCase()) {
    case 'USD':
    case 'CAD':
    case 'AUD':
      return <DollarSign className={className} />
    case 'GBP':
      return <PoundSterling className={className} />
    case 'EUR':
      return <Euro className={className} />
    case 'JPY':
    case 'CHF':
    case 'SEK':
    case 'NOK':
    case 'DKK':
    default:
      // For currencies without specific icons, use a generic currency icon
      return <CircleDollarSign className={className} />
  }
}

// Hook to get the appropriate currency icon component
export function useCurrencyIcon(currencyCode?: string) {
  return function CurrencyIconComponent(props: { className?: string }) {
    return <CurrencyIcon currencyCode={currencyCode} {...props} />
  }
}