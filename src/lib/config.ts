// lib/config.ts
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    timeout: 30000,
  },
  billing: {
    defaultCurrency: 'USD',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    taxRates: {
      standard: 0.1, // 10%
      reduced: 0.05, // 5%
    },
  },
  features: {
    enableAdvancedAnalytics: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_ANALYTICS === 'true',
    enableExport: process.env.NEXT_PUBLIC_ENABLE_EXPORT === 'true',
    enablePdfGeneration: process.env.NEXT_PUBLIC_ENABLE_PDF_GENERATION === 'true',
  },
} as const;