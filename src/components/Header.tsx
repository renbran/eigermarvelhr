import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { List, X, User as UserIcon, SignOut } from '@phosphor-icons/react'
import type { User, CandidateProfile } from '@/lib/types'
const logoIcon = 'https://res.cloudinary.com/dsl5fhclj/image/upload/v1769770778/krvcbd9clp1pfb8rbjxb.webp'

interface HeaderProps {
  onNavigate: (page: string) => void
  currentPage: string
  onAuthClick: (type: 'login' | 'register') => void
  currentUser?: User | null
  candidateProfile?: CandidateProfile | null
  onLogout?: () => void
}

export function Header({ onNavigate, currentPage, onAuthClick, currentUser, candidateProfile, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  type NavItem = { label: string; value: string; badge?: string }

  const baseNavItems: NavItem[] = [
    { label: 'Home', value: 'home' },
    { label: 'About', value: 'about' },
    { label: 'Solutions', value: 'solutions' },
    { label: 'Industries', value: 'industries' },
    { label: 'Resources', value: 'resources' },
    { label: 'Contact', value: 'contact' },
  ]

  const candidateNavItems: NavItem[] = [
    { label: 'Dashboard', value: 'dashboard' },
    ...baseNavItems
  ]

  const navItems = currentUser?.userType === 'candidate' ? candidateNavItems : baseNavItems

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    }
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-primary/98 backdrop-blur-md text-primary-foreground sticky top-0 z-50 shadow-lg border-b border-accent/20" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <button 
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-all duration-300 hover:scale-105 min-w-0"
              aria-label="Eiger Marvel Home"
            >
              <img 
                src={logoIcon} 
                alt="Eiger Marvel Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover shadow-md flex-shrink-0"
              />
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-base sm:text-xl font-bold tracking-tight break-words">Eiger Marvel</span>
                <span className="text-[10px] sm:text-xs gradient-gold-shine font-semibold whitespace-nowrap">Exceed Your Expectations</span>
              </div>
            </button>

            <nav className="hidden md:flex items-center gap-4 lg:gap-6" role="navigation" aria-label="Main navigation">
              {navItems.map(item => (
                <button
                  key={item.value}
                  onClick={() => onNavigate(item.value)}
                  className={`text-xs lg:text-sm font-semibold transition-all duration-300 relative py-2 whitespace-nowrap ${
                    currentPage === item.value 
                      ? 'text-accent' 
                      : 'text-primary-foreground/90 hover:text-accent'
                  }`}
                >
                  {item.label}
                  {currentPage === item.value && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-accent/80 to-accent rounded-full shadow-md shadow-accent/50" />
                  )}
                  {item.badge && (
                    <span className="absolute -top-2 -right-16 text-[10px] bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-2 py-0.5 rounded-full whitespace-nowrap font-bold shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right min-w-0">
                  <p className="text-xs sm:text-sm font-semibold truncate max-w-[150px]">
                    {candidateProfile?.fullName || currentUser.email}
                  </p>
                  {currentUser.isPremium && (
                    <p className="text-xs text-accent whitespace-nowrap">Premium Member</p>
                  )}
                </div>
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-accent cursor-pointer flex-shrink-0" onClick={() => onNavigate('dashboard')}>
                  <AvatarFallback className="bg-accent/20 text-accent font-semibold text-xs">
                    {candidateProfile ? getInitials(candidateProfile.fullName) : <UserIcon />}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-primary-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <SignOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onAuthClick('login')}
                  className="text-primary-foreground hover:text-accent hover:bg-accent/10 font-semibold transition-all text-xs sm:text-sm whitespace-nowrap"
                  data-auth="login"
                >
                  Login
                </Button>
                <Button 
                  size="sm"
                  onClick={() => onAuthClick('register')}
                  className="bg-gradient-to-r from-accent to-accent/90 text-accent-foreground hover:from-accent/90 hover:to-accent/80 font-semibold shadow-md hover:shadow-xl transition-all hover:scale-105 text-xs sm:text-sm whitespace-nowrap"
                  data-auth="register"
                >
                  Register
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden hover:bg-primary-foreground/10 p-2 rounded-lg transition-colors flex-shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen ? 'true' : 'false'}
          >
            {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary-foreground/20 py-4" role="navigation" aria-label="Mobile navigation">
            <nav className="flex flex-col gap-3">
              {navItems.map(item => (
                <button
                  key={item.value}
                  onClick={() => {
                    onNavigate(item.value)
                    setMobileMenuOpen(false)
                  }}
                  className={`text-left text-sm font-semibold py-2 px-4 rounded-lg transition-all break-words ${
                    currentPage === item.value 
                      ? 'bg-gradient-to-r from-accent to-accent/90 text-accent-foreground shadow-md' 
                      : 'text-primary-foreground hover:bg-primary-foreground/10'
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 text-[10px] bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
              <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-primary-foreground/20">
                {currentUser ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="text-sm font-semibold break-words">
                        {candidateProfile?.fullName || currentUser.email}
                      </p>
                      {currentUser.isPremium && (
                        <p className="text-xs text-accent">Premium Member</p>
                      )}
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="border-destructive text-destructive hover:bg-destructive/10"
                    >
                      <SignOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onAuthClick('login')
                        setMobileMenuOpen(false)
                      }}
                      className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                      data-auth="login"
                    >
                      Login
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        onAuthClick('register')
                        setMobileMenuOpen(false)
                      }}
                      className="bg-gradient-to-r from-accent to-accent/90 text-accent-foreground hover:from-accent/90 hover:to-accent/80 font-semibold shadow-md"
                      data-auth="register"
                    >
                      Register
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
