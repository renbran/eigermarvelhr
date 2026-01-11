import companyLogo1 from '@/assets/images/company-logo.svg'
import companyLogo2 from '@/assets/images/company-logo-2.svg'
import companyLogo3 from '@/assets/images/company-logo-3.svg'
import companyLogo4 from '@/assets/images/company-logo-4.svg'
import companyLogo5 from '@/assets/images/company-logo-5.svg'
import companyLogo6 from '@/assets/images/company-logo-6.svg'
import companyLogo7 from '@/assets/images/company-logo-7.svg'
import companyLogo8 from '@/assets/images/company-logo-8.svg'

import aiNeuralNetwork from '@/assets/images/01-ai-neural-network.png'
import cloudIntegration from '@/assets/images/02-cloud-integration.png'
import cloudStorage from '@/assets/images/03-cloud-storage.png'
import lightningSpeed from '@/assets/images/04-lightning-speed.png'
import securityShieldLeft from '@/assets/images/05-security-shield-left.png'
import securityShieldRight from '@/assets/images/06-security-shield-right.png'
import globalTransform from '@/assets/images/07-global-transform.png'
import dataAnalytics from '@/assets/images/08-data-analytics.png'
import achievementTrophy from '@/assets/images/11-achievement-trophy.png'

export const companyLogos = [
  companyLogo1,
  companyLogo2,
  companyLogo3,
  companyLogo4,
  companyLogo5,
  companyLogo6,
  companyLogo7,
  companyLogo8,
]

export const iconStyleLogos = [
  aiNeuralNetwork,
  cloudIntegration,
  cloudStorage,
  lightningSpeed,
  securityShieldLeft,
  securityShieldRight,
  globalTransform,
  dataAnalytics,
  achievementTrophy,
]

export const companyNames = [
  'Emirates Group',
  'Emaar Properties',
  'Etisalat',
  'Dubai Airports',
  'ADNOC',
  'DP World',
  'Majid Al Futtaim',
  'Aramex',
]

export const industryIconMapping: Record<string, string> = {
  'Technology': aiNeuralNetwork,
  'IT': cloudIntegration,
  'Software': cloudStorage,
  'Finance': dataAnalytics,
  'Banking': securityShieldLeft,
  'Insurance': securityShieldRight,
  'Consulting': globalTransform,
  'Marketing': lightningSpeed,
  'Sales': achievementTrophy,
  'Engineering': aiNeuralNetwork,
  'Healthcare': securityShieldLeft,
  'Education': globalTransform,
  'Retail': cloudStorage,
  'Manufacturing': lightningSpeed,
  'Logistics': cloudIntegration,
  'Construction': securityShieldRight,
  'Real Estate': dataAnalytics,
  'Hospitality': achievementTrophy,
}

export const getCompanyLogo = (companyName?: string, industry?: string): string | undefined => {
  if (!companyName && !industry) return undefined
  
  if (companyName) {
    const index = companyNames.findIndex(name => 
      companyName.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(companyName.toLowerCase())
    )
    
    if (index !== -1) {
      return companyLogos[index]
    }
  }
  
  if (industry) {
    const industryKey = Object.keys(industryIconMapping).find(key =>
      industry.toLowerCase().includes(key.toLowerCase())
    )
    if (industryKey) {
      return industryIconMapping[industryKey]
    }
  }
  
  const hash = (companyName || industry || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return iconStyleLogos[hash % iconStyleLogos.length]
}
