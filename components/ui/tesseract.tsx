"use client";
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function TesseractBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for DOM to settle so section IDs exist
    const ctx = gsap.context(() => {
      const shape = shapeRef.current;
      const icon = iconRef.current;
      if (!shape || !icon) return;

      // Query all faces globally (not scoped)
      const faces = document.querySelectorAll('.cube-face');

      // ── Force initial state — GSAP caches stale values across renders ──
      gsap.set(shape, { x: 0, scale: 1 });
      faces.forEach((face) => {
        (face as HTMLElement).style.borderRadius = '0%';
        (face as HTMLElement).style.removeProperty('clip-path');
      });

      // ── Phase 1: Hero → Features ("How We Help") ──
      // Cube (0%) → rounded cube (15%), drifts right
      ScrollTrigger.create({
        trigger: '#section-features',
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1.5,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(shape, {
            x: `${p * 25}vw`,
            scale: 1 - (p * 0.2),
          });
          // 0% → 15% border-radius
          faces.forEach((face) => {
            (face as HTMLElement).style.borderRadius = `${p * 15}%`;
          });
        },
      });

      // ── Phase 2: Features → Impact ("Our Impact") ──
      // 15% rounded cube → more rounded (35%), slides to left
      ScrollTrigger.create({
        trigger: '#section-impact',
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1.5,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(shape, {
            x: `${25 - (p * 50)}vw`,
            scale: 0.8 + (p * 0.3),
          });
          // 15% → 35% border-radius
          faces.forEach((face) => {
            (face as HTMLElement).style.borderRadius = `${15 + p * 20}%`;
          });
        },
      });

      // ── Phase 3: Impact → CTA/Footer ──
      // 35% rounded → full circle (50%), centers, scales up huge
      ScrollTrigger.create({
        trigger: '#section-cta',
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1.5,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(shape, {
            x: `${-25 + (p * 25)}vw`,
            scale: 1.1 + (p * 1.4),
          });
          // 35% → 50% border-radius (full circle)
          faces.forEach((face) => {
            (face as HTMLElement).style.borderRadius = `${35 + p * 15}%`;
          });
          gsap.set(icon, { opacity: 1 - p });
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center"
      style={{ opacity: 0.25 }}
    >
      <div
        ref={shapeRef}
        className="relative w-96 h-96 flex items-center justify-center"
        style={{ perspective: '1000px' }}
      >
        {/* Center Icon */}
        <div ref={iconRef} className="absolute text-green-500 z-50 animate-pulse">
          <Cpu size={80} strokeWidth={1} />
        </div>

        {/* Outer Cube */}
        <div className="absolute inset-0 w-full h-full preserve-3d animate-spin-slow">
          <CubeFace offset="12rem" axis="" />
          <CubeFace offset="12rem" axis="rotateY(180deg)" />
          <CubeFace offset="12rem" axis="rotateY(90deg)" />
          <CubeFace offset="12rem" axis="rotateY(-90deg)" />
          <CubeFace offset="12rem" axis="rotateX(90deg)" />
          <CubeFace offset="12rem" axis="rotateX(-90deg)" />
        </div>

        {/* Inner Cube */}
        <div className="absolute inset-16 w-64 h-64 preserve-3d animate-spin-reverse-slow">
          <CubeFace offset="8rem" axis="" color="border-green-500/50" />
          <CubeFace offset="8rem" axis="rotateY(180deg)" color="border-green-500/50" />
          <CubeFace offset="8rem" axis="rotateY(90deg)" color="border-green-500/50" />
          <CubeFace offset="8rem" axis="rotateY(-90deg)" color="border-green-500/50" />
          <CubeFace offset="8rem" axis="rotateX(90deg)" color="border-green-500/50" />
          <CubeFace offset="8rem" axis="rotateX(-90deg)" color="border-green-500/50" />
        </div>
      </div>
    </div>
  );
}

function CubeFace({ offset, axis, color = "border-green-600/30" }: { offset: string; axis: string; color?: string }) {
  const transform = axis ? `${axis} translateZ(${offset})` : `translateZ(${offset})`;
  return (
    <div
      className={`cube-face absolute inset-0 w-full h-full border-2 bg-transparent ${color}`}
      style={{
        transform,
        backfaceVisibility: 'visible',
        borderRadius: '0%',
      }}
    />
  );
}
