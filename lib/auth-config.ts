// Authentication configuration
// This file controls which auth features are enabled

export const authConfig = {
  // Social login providers
  socialLogin: {
    enabled: true, // Set to true once OAuth providers are configured in Supabase
    providers: {
      google: {
        enabled: true, // Enable after setting up Google OAuth
        displayName: 'Google'
      },
      azure: {
        enabled: true, // Enable after setting up Microsoft/Azure OAuth
        displayName: 'Microsoft'
      },
      apple: {
        enabled: true, // Enable after setting up Apple OAuth
        displayName: 'Apple'
      }
    }
  },
  
  // Email/password login
  emailLogin: {
    enabled: true, // Always enabled
    requireEmailConfirmation: true
  },
  
  // Magic link login
  magicLink: {
    enabled: true, // Can be enabled without additional setup
    displayName: 'Magic Link'
  }
} as const

export type AuthProvider = keyof typeof authConfig.socialLogin.providers

// Helper functions
export const isSocialLoginEnabled = () => authConfig.socialLogin.enabled
export const isProviderEnabled = (provider: AuthProvider) => 
  authConfig.socialLogin.enabled && authConfig.socialLogin.providers[provider].enabled
export const getEnabledProviders = () => 
  Object.entries(authConfig.socialLogin.providers)
    .filter(([, config]) => config.enabled)
    .map(([key]) => key as AuthProvider)