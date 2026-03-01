"use client";

import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import ParticleWave from "@/components/ParticleWave";

export default function LoginPage() {
  return (
    <main className="relative w-full h-[100dvh] bg-black overflow-hidden font-sans">
      {/* Background Animation */}
      <ParticleWave />

      {/* Vignette Overlay */}
      <div className="fixed inset-0 z-10 pointer-events-none bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.8)_100%)]" />

      {/* Subtle Scanlines */}
      <div className="fixed inset-0 z-[15] pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02))',
          backgroundSize: '100% 2px, 3px 100%'
        }}
      />

      {/* UI Overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full p-6 text-center">
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-white text-5xl md:text-6xl font-black tracking-[1.5em] mr-[-1.5em] uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            AXIS
          </h1>
          <p className="text-white/60 text-[0.65rem] tracking-[0.5em] uppercase mt-4 font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            Discipline over dopamine.
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <GoogleSignInButton />
        </div>
      </div>
    </main>
  );
}
