import aiNeuralNetwork from '@/assets/images/01-ai-neural-network.png'
import cloudIntegration from '@/assets/images/02-cloud-integration.png'
import cloudStorage from '@/assets/images/03-cloud-storage.png'
import lightningSpeed from '@/assets/images/04-lightning-speed.png'
import securityShieldLeft from '@/assets/images/05-security-shield-left.png'
import securityShieldRight from '@/assets/images/06-security-shield-right.png'
import globalTransform from '@/assets/images/07-global-transform.png'
import dataAnalytics from '@/assets/images/08-data-analytics.png'
import automationGears from '@/assets/images/09-automation-gears.png'
import rocketLaunch from '@/assets/images/10-rocket-launch.png'
import achievementTrophy from '@/assets/images/11-achievement-trophy.png'
import growthChart from '@/assets/images/12-growth-chart.png'

export const iconStyleLogos = [
  aiNeuralNetwork,
  cloudIntegration,
  cloudStorage,
  lightningSpeed,
  securityShieldLeft,
  securityShieldRight,
  globalTransform,
  dataAnalytics,
  automationGears,
  rocketLaunch,
  achievementTrophy,
  growthChart,
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
  'Engineering': automationGears,
  'Healthcare': securityShieldLeft,
  'Education': globalTransform,
  'Retail': growthChart,
  'Manufacturing': automationGears,
  'Logistics': rocketLaunch,
  'Construction': securityShieldRight,
  'Real Estate': dataAnalytics,
  'Hospitality': achievementTrophy,
  'Analytics': growthChart,
  'AI': aiNeuralNetwork,
  'Automation': automationGears,
  'Innovation': rocketLaunch,
}

export const getCompanyLogo = (companyName?: string, industry?: string): string | undefined => {
  if (!companyName && !industry) return undefined
  
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
