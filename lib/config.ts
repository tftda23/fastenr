// Centralized configuration for environment-specific URLs and settings

export const config = {
  // App URL configuration
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://fastenr.com'),
    name: 'Fastenr',
    description: 'Customer Success Platform',
  },

  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://fastenr.com'),
  },

  // External service URLs
  services: {
    hubspot: {
      redirectUri: process.env.HUBSPOT_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://fastenr.com')}/api/integrations/hubspot/callback`,
    },
    salesforce: {
      redirectUri: process.env.SALESFORCE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://fastenr.com')}/api/integrations/salesforce/callback`,
    },
  },

  // Environment detection
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },

  // SEO and metadata
  seo: {
    domain: process.env.NEXT_PUBLIC_DOMAIN || 'fastenr.com',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://fastenr.com',
  },
}

// Helper functions
export const getBaseUrl = () => {
  // For server-side rendering
  if (typeof window === 'undefined') {
    // In production, use the configured URL
    if (config.env.isProduction) {
      return config.seo.siteUrl
    }
    // In development, use localhost with dynamic port detection
    return config.app.url
  }
  
  // For client-side, use the current origin
  return window.location.origin
}

export const getApiUrl = (path: string = '') => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export const getAbsoluteUrl = (path: string = '') => {
  return `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
}