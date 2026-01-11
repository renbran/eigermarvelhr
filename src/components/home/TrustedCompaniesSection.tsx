import { useEffect, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

const companyLogos = [
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768166497/czwia7hxms6vbeourjbg.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768166496/fnkqea64qupneagq6tsm.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768166496/jehdkefaqzbtjdfyg6vk.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768166496/atxw0ilmdrbmbgtwwhgo.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768166496/ytfrdtptnwk3ggzfhoap.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768166496/ggqiwqj4pcgbslg6m39v.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768166495/ifoyzalcpaejg5vun52t.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768166495/rqxwgkufl9elofdim8b4.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768166494/xx1x8milzkjhw3nbpqdz.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768166494/phyyutr2bpjgmfvlj7pg.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768166494/zqa5bb6lebtithvmzgxk.png',
  'https://res.cloudinary.com/dsl5fhclj/image/upload/v1768166494/tv9kj7qf0wdmvxuko8l7.png',
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
                <div className="bg-white rounded-xl p-6 flex items-center justify-center shadow-sm hover:shadow-md transition-all min-h-[120px] group">
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
