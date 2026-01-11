import companyLogo1 from '@/assets/images/company-logo.svg'
import companyLogo2 from '@/assets/images/company-logo-2.svg'
import companyLogo3 from '@/assets/images/company-logo-3.svg'
import companyLogo4 from '@/assets/images/company-logo-4.svg'
import companyLogo5 from '@/assets/images/company-logo-5.svg'
import companyLogo6 from '@/assets/images/company-logo-6.svg'
import companyLogo7 from '@/assets/images/company-logo-7.svg'
import companyLogo8 from '@/assets/images/company-logo-8.svg'

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

export const getCompanyLogo = (companyName?: string): string | undefined => {
  if (!companyName) return undefined
  
  const index = companyNames.findIndex(name => 
    companyName.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(companyName.toLowerCase())
  )
  
  if (index !== -1) {
    return companyLogos[index]
  }
  
  const hash = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return companyLogos[hash % companyLogos.length]
}
