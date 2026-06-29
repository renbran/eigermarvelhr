import etisalat from '@/assets/images/01-ai-neural-network.png'
import emaar from '@/assets/images/02-cloud-integration.png'
import peaceHomes from '@/assets/images/03-cloud-storage.png'
import adnoc from '@/assets/images/04-lightning-speed.png'
import emiratesCatering from '@/assets/images/05-security-shield-left.png'
import emiratesCargo from '@/assets/images/06-security-shield-right.png'
import etihad from '@/assets/images/07-global-transform.png'
import rta from '@/assets/images/08-data-analytics.png'
import empower from '@/assets/images/09-automation-gears.png'
import dewa from '@/assets/images/10-rocket-launch.png'
import du from '@/assets/images/11-achievement-trophy.png'
import nakheel from '@/assets/images/12-growth-chart.png'

export interface PartnerLogo {
  name: string
  src: string
}

export const partnerLogos: PartnerLogo[] = [
  { name: 'Etisalat',               src: etisalat },
  { name: 'Emaar',                  src: emaar },
  { name: 'Peace Homes Contracting', src: peaceHomes },
  { name: 'ADNOC',                  src: adnoc },
  { name: 'Emirates Catering',      src: emiratesCatering },
  { name: 'Emirates Cargo',         src: emiratesCargo },
  { name: 'Etihad Airways',         src: etihad },
  { name: 'RTA Dubai',              src: rta },
  { name: 'Empower',                src: empower },
  { name: 'DEWA',                   src: dewa },
  { name: 'du Telecom',             src: du },
  { name: 'Nakheel',                src: nakheel },
]

export const industryClientLogos: Record<string, PartnerLogo[]> = {
  construction: [
    { name: 'Emaar',       src: emaar },
    { name: 'Nakheel',     src: nakheel },
    { name: 'Peace Homes', src: peaceHomes },
  ],
  hospitality: [
    { name: 'Emirates Catering', src: emiratesCatering },
    { name: 'Etihad Airways',    src: etihad },
  ],
  facilities: [
    { name: 'Empower', src: empower },
    { name: 'DEWA',    src: dewa },
  ],
  logistics: [
    { name: 'Emirates Cargo', src: emiratesCargo },
    { name: 'RTA Dubai',      src: rta },
  ],
}

export const heroTrustLogos: PartnerLogo[] = [
  { name: 'ADNOC',        src: adnoc },
  { name: 'Emaar',        src: emaar },
  { name: 'Etihad',       src: etihad },
  { name: 'DEWA',         src: dewa },
  { name: 'RTA Dubai',    src: rta },
]

// Backward compatibility
export const iconStyleLogos = partnerLogos.map(p => p.src)

export const industryIconMapping: Record<string, string> = {
  'Construction': peaceHomes,
  'Real Estate':  emaar,
  'Hospitality':  emiratesCatering,
  'Logistics':    emiratesCargo,
  'Facilities':   empower,
  'Utilities':    dewa,
  'Oil & Gas':    adnoc,
  'Aviation':     etihad,
  'Telecom':      etisalat,
  'Transport':    rta,
}

export const getCompanyLogo = (companyName?: string, industry?: string): string | undefined => {
  if (!companyName && !industry) return undefined
  const hash = (companyName || industry || '')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return iconStyleLogos[hash % iconStyleLogos.length]
}
