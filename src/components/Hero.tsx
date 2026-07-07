import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Premium cinematic hero component
 * - Fullscreen immersive scene
 * - Layered background with animated particles
 * - Global network visual (SVG lines connecting dots)
 * - Premium typography reveal
 * - Magnetic CTA with subtle hover glow
 */
const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      // Background particles fade in
      gsap.from('.hero-bg-particle', {
        opacity: 0,
        scale: 0.5,
        duration: 1.5,
        stagger: { each: 0.1, repeat: -1, yoyo: true },
        ease: 'sine.inOut',
      });

      // Title split‑type animation
      const split = titleRef.current?.querySelectorAll('.char') as NodeListOf<HTMLElement>;
      if (split) {
        gsap.from(split, {
          y: 100,
          opacity: 0,
          rotationX: 90,
          stagger: 0.03,
          duration: 0.8,
          ease: 'back.out(1.7)',
        });
      }

      // Subtitle fade in
      gsap.from(subtitleRef.current, { opacity: 0, y: 20, delay: 0.5, duration: 1 });

      // CTA magnetic effect
      gsap.from(ctaRef.current, {
        scale: 0.8,
        opacity: 0,
        delay: 0.8,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
      });

      // Global network animation (simple SVG lines)
      gsap.from('.network-line', {
        strokeDasharray: 100,
        strokeDashoffset: 100,
        duration: 2,
        repeat: -1,
        ease: 'none',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative h-screen overflow-hidden bg-background">
      {/* Layered animated background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="hero-bg-particle absolute rounded-full bg-white opacity-20"
            style={{
              width: `${Math.random() * 3 + 2}px`,
              height: `${Math.random() * 3 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Global network SVG overlay */}
      <svg className="absolute inset-0 pointer-events-none opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line className="network-line" x1="10" y1="20" x2="90" y2="80" stroke="var(--color-accent, #0090ff)" strokeWidth="0.2" />
        <line className="network-line" x1="20" y1="80" x2="80" y2="20" stroke="var(--color-gold-400, #C9A14A)" strokeWidth="0.2" />
      </svg>

      {/* Hero content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
        <h1 ref={titleRef} className="text-6xl md:text-8xl font-bold text-foreground leading-tight">
          {/* Split characters for animation */}
          {`We connect the world's best talent`.split('').map((ch, i) => (
            <span key={i} className="inline-block char">
              {ch}
            </span>
          ))}
        </h1>
        <p ref={subtitleRef} className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Premium executive recruitment powered by cutting‑edge technology and a global talent network.
        </p>
        <a
          ref={ctaRef}
          href="#contact"
          className="mt-8 inline-block rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-8 py-3 text-sm font-medium text-black shadow-lg shadow-gold-400/30 transition-all duration-300 hover:scale-105 hover:shadow-gold-400/50"
        >
          Get Started
        </a>
      </div>
    </section>
  );
};

export default Hero;
