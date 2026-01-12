import { useEffect, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

const companyLogos = [
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768167980/pi5au781emmzlrkhkrdz.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768167979/tw61y7zrf7gm8hpayl3l.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768167979/av0n5tdsx4o2z2ozqovj.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768167979/atxw0ilmdrbmbgtwwhgo.png',
]

export function TrustedCompaniesSection() {
  const [api, setApi] = useState<import('@/components/ui/carousel').CarouselApi | null>(null)

  useEffect(() => {
    if (!api) return
    const interval = setInterval(() => {
      api.scrollNext()
    }, 5000) // slower autoplay: 5s between slides
    return () => clearInterval(interval)
  }, [api])

  return (
    <section className="py-12 sm:py-16 bg-black border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words">
            Trusted by Leading UAE Companies
          </h2>
          <p className="text-gray-400 break-words px-4">
            Connecting top talent with premier employers across the MENA region
          </p>
        </div>

        <Carousel
          setApi={setApi}
          opts={{ loop: true, align: 'start' }}
          className="relative"
        >
          <CarouselContent className="items-center">
            {companyLogos.map((logo, idx) => (
              <CarouselItem
                key={idx}
                className="basis-1/2 md:basis-1/4"
              >
                <div className="bg-transparent rounded-xl p-6 flex items-center justify-center border border-white/10 hover:border-white/20 shadow-sm hover:shadow-md transition-all min-h-[120px] group">
                  <div className="w-32 h-16 sm:w-40 sm:h-20">
                    <img
                      src={logo}
                      alt={`Company logo ${idx + 1}`}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
