"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TesseractBackground } from '@/components/ui/tesseract';
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const mainRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal animations for content sections
      document.querySelectorAll('.reveal').forEach((element) => {
        let xOffset = 0;
        let yOffset = 30;

        if (element.classList.contains('reveal-left')) {
          xOffset = -60;
          yOffset = 0;
        } else if (element.classList.contains('reveal-right')) {
          xOffset = 60;
          yOffset = 0;
        }

        gsap.fromTo(element,
          { opacity: 0, x: xOffset, y: yOffset },
          {
            opacity: 1, x: 0, y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Background transitions to black as we enter the footer
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          backgroundColor: '#000000',
          ease: 'none',
          scrollTrigger: {
            trigger: '#section-cta',
            start: 'top 60%',
            end: 'top top',
            scrub: 1,
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <main ref={mainRef} className="text-foreground relative selection:bg-green-500/30">
      {/* Fixed dark background that transitions to black */}
      <div ref={bgRef} className="fixed inset-0 -z-20 bg-slate-900" />
      <TesseractBackground />

      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section id="section-hero" className="relative min-h-screen flex flex-col justify-center text-center">
          <div className="reveal">
            <h1 className="text-6xl md:text-8xl mb-6 font-bold tracking-tighter">
              Welcome to <span className="text-green-500">ITFix</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light">
              Fast, reliable IT support for your business. Submit a ticket and our expert team will get you back on track in no time.
            </p>
            <div className="flex justify-center">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-500 text-white h-16 px-12 text-xl rounded-full transition-transform hover:scale-105">
                <Link href="/login">
                  Get Started →
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features (Left Aligned for space on right) */}
        <section id="section-features" className="min-h-screen flex items-center py-24">
          <div className="w-full md:w-1/2 pr-0 md:pr-12 reveal reveal-left">
            <h2 className="text-5xl md:text-6xl font-bold mb-12 tracking-tight text-foreground">How We Help</h2>
            <div className="flex flex-col gap-8">
              <div className="bg-[#1e293b] rounded-2xl p-8 border border-[#334155] hover:border-green-500/50 transition-colors shadow-lg">
                <h3 className="text-3xl font-semibold mb-4 text-green-500">Fast Response</h3>
                <p className="text-slate-300 text-lg leading-relaxed font-light">
                  Our team responds to tickets within minutes, ensuring minimal downtime for your business operations. Time is money, and we save you both.
                </p>
              </div>
              <div className="bg-[#1e293b] rounded-2xl p-8 border border-[#334155] hover:border-green-500/50 transition-colors shadow-lg">
                <h3 className="text-3xl font-semibold mb-4 text-green-500">Expert Support</h3>
                <p className="text-slate-300 text-lg leading-relaxed font-light">
                  Certified IT professionals ready to solve complex hardware, software, and enterprise network issues before they escalate.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section (Right Aligned for space on left) */}
        <section id="section-impact" className="min-h-screen flex items-center justify-end py-24">
          <div className="w-full md:w-1/2 pl-0 md:pl-12 reveal reveal-right">
            <h2 className="text-5xl md:text-6xl font-bold mb-12 tracking-tight text-foreground">Our Impact</h2>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="bg-[#1e293b] p-8 rounded-2xl border border-[#334155] shadow-lg">
                <div className="text-5xl font-bold text-white mb-2">24/7</div>
                <div className="text-green-500 font-medium">Support Available</div>
              </div>
              <div className="bg-[#1e293b] p-8 rounded-2xl border border-[#334155] shadow-lg">
                <div className="text-5xl font-bold text-white mb-2">98%</div>
                <div className="text-green-500 font-medium">Resolution Rate</div>
              </div>
              <div className="bg-[#1e293b] p-8 rounded-2xl border border-[#334155] shadow-lg">
                <div className="text-5xl font-bold text-white mb-2">&lt;15m</div>
                <div className="text-green-500 font-medium">Avg Response</div>
              </div>
              <div className="bg-[#1e293b] p-8 rounded-2xl border border-[#334155] shadow-lg">
                <div className="text-5xl font-bold text-white mb-2">500+</div>
                <div className="text-green-500 font-medium">Companies Served</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Fused CTA + Footer (Inspired by screenshot) */}
      <section id="section-cta" className="relative min-h-[80vh] flex flex-col justify-between pt-32 pb-12 px-6 border-t border-[#334155] overflow-hidden">
        <div className="reveal max-w-7xl mx-auto w-full flex-grow flex flex-col justify-center items-center relative z-10">
          {/* Background huge typography effect */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-5 pointer-events-none">
            <span className="text-[20vw] font-bold tracking-tighter whitespace-nowrap overflow-hidden">IT-FIX</span>
          </div>

          {/* Centered Button */}
          <div className="flex justify-center mb-16 z-20">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-16 px-10 text-xl rounded-full shadow-lg transition-transform hover:scale-105">
              <Link href="/login" className="flex items-center gap-3">
                Open Portal 
                <span className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">→</span>
              </Link>
            </Button>
          </div>

          <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-16 mb-20">
            <div className="text-center lg:text-left max-w-md">
              <h2 className="text-4xl md:text-5xl font-medium leading-tight">
                Resolve IT issues with<br/>total comfort and control.
              </h2>
            </div>

            <div className="text-center lg:text-right max-w-sm">
              <p className="text-xl font-medium">info@itfix.com</p>
              <p className="text-xl font-medium">+213 555 123 456</p>
              <div className="mt-8 text-sm text-gray-500 tracking-widest uppercase lg:text-right">
                For Inquiries
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground font-mono tracking-widest uppercase border-t border-border pt-8 z-10 relative gap-6">
          <div>©2026 ITFIX. ALL RIGHTS RESERVED</div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
          </div>
          <div>Made By Estin Team</div>
        </div>
      </section>
    </main>
  );
}
