import { Phone, Envelope, MapPin } from '@phosphor-icons/react'

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex flex-col leading-tight mb-4">
              <span className="text-xl font-bold tracking-tight">Eiger Marvel</span>
              <span className="text-sm text-accent font-semibold">Exceed Your Expectations</span>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Specialized HR & Management Consultants serving the MENA region since 2022.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide mb-4">Contact</h3>
            <div className="space-y-3">
              <a href="tel:+971586241100" className="flex items-center gap-2 text-sm hover:text-accent transition-colors">
                <Phone size={16} weight="bold" />
                <span>+971 58 624 1100</span>
              </a>
              <a href="mailto:info@em-gc.com" className="flex items-center gap-2 text-sm hover:text-accent transition-colors">
                <Envelope size={16} weight="bold" />
                <span>info@em-gc.com</span>
              </a>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} weight="bold" />
                <span>Dubai, UAE</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide mb-4">Company</h3>
            <div className="space-y-2">
              <button className="block text-sm hover:text-accent transition-colors">About Us</button>
              <button className="block text-sm hover:text-accent transition-colors">Services</button>
              <button className="block text-sm hover:text-accent transition-colors">Privacy Policy</button>
              <button className="block text-sm hover:text-accent transition-colors">Terms & Conditions</button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Eiger Marvel HR Consultancies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
