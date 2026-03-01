"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import ParticleWave from "@/components/ParticleWave";

const FEATURES = [
  { icon: "◉", title: "Dashboard", desc: "Central command center — a single-glance overview of your entire life system with key stats from every module." },
  { icon: "◎", title: "Today", desc: "A focused daily planner. See tasks, routines, habits, and sessions for the current day in one view." },
  { icon: "⬡", title: "Goal Tracker", desc: "Set targets with deadlines and priorities. Track completion with progress bars and deadline countdowns." },
  { icon: "◈", title: "Habit Engine", desc: "Build streaks with daily check-ins, 7-day completion grids, and automatic streak calculation." },
  { icon: "△", title: "Focus Mode", desc: "Pomodoro timer with SVG progress ring, auto-session logging, and break management." },
  { icon: "⊞", title: "Time Analytics", desc: "Visualise focus hours with 7-day bar charts, top labels ranked by time, and session statistics." },
  { icon: "◫", title: "Attendance", desc: "Per-subject attendance tracking with SAFE / WARNING / DANGER status badges and 75% threshold alerts." },
  { icon: "⊡", title: "Study Tracker", desc: "Log study sessions by subject and duration. View weekly charts and subject-wise time distribution." },
  { icon: "⊟", title: "Academic Routines", desc: "Day-of-week timetable manager with time blocks, daily check-ins, and auto-resetting completion." },
  { icon: "⊠", title: "Subject Progress", desc: "Track chapters and units completed per subject with +/- controls, progress bars, and exam countdowns." },
  { icon: "⟐", title: "Expense Tracker", desc: "Log income and expenses with category breakdowns, transaction history, and financial analytics." },
  { icon: "⊕", title: "Train", desc: "Professional workout module with exercise library, sets tracking, and training session logs." },
  { icon: "⟡", title: "Weekly Review", desc: "Structured weekly reflection and review system to analyse progress and plan ahead." },
  { icon: "◇", title: "AXIS AI", desc: "AI-powered assistant for intelligent insights, recommendations, and personalised data analysis." },
  { icon: "⊙", title: "Documents", desc: "File management module for organising study materials, notes, and important documents." },
];

const VALUES = [
  { label: "MISSION", heading: "Eliminate noise. Amplify output.", text: "AXIS exists to strip away the distractions of modern productivity tools and deliver a system that is raw, direct, and effective. No fluff. Just results." },
  { label: "VISION", heading: "A generation that owns its time.", text: "We envision a world where students and professionals take complete control of their daily systems — where discipline becomes the default, and every action is intentional and tracked." },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  // Intersection observer for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("animate-in-visible");
      }),
      { threshold: 0.12 }
    );
    sectionsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRef = (el: HTMLDivElement | null) => {
    if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el);
  };

  const handleGetStarted = () => signIn("google", { callbackUrl: "/setup-role" });

  return (
    <div className="bg-black text-white overflow-x-hidden" style={{
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: '50px 50px'
    }}>
      {/* ╔══════════════════════════════════════════════════════════════╗
                ║  SECTION 1 — HERO                                           ║
                ╚══════════════════════════════════════════════════════════════╝ */}
      <section className="relative h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        <ParticleWave />
        {/* Vignette */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.8)_100%)]" />
        {/* Scanlines */}
        <div className="absolute inset-0 z-[15] pointer-events-none opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%), linear-gradient(90deg, rgba(255,0,0,0.02), rgba(0,255,0,0.01), rgba(0,0,255,0.02))',
            backgroundSize: '100% 2px, 3px 100%'
          }}
        />

        <div className="relative z-20 text-center px-6">
          {/* Nav */}
          <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-5 bg-black/60 backdrop-blur-md border-b border-white/5">
            <div className="w-16 h-16 overflow-hidden flex items-start justify-center animate-logo-pulse-subtle">
              <img src="/logo.png" alt="AXIS" className="w-16 h-auto scale-150 origin-top object-contain" />
            </div>
            <div className="hidden md:flex items-center gap-10">
              {["About", "Features", "Mission"].map((s) => (
                <a key={s} href={`#${s.toLowerCase()}`} className="text-[0.6rem] font-black tracking-[0.35em] uppercase text-white/40 hover:text-white transition-colors">
                  {s}
                </a>
              ))}
              <button onClick={handleGetStarted} className="text-[0.6rem] font-black tracking-[0.3em] uppercase border border-white/20 px-5 py-2 hover:bg-white hover:text-black transition-all">
                GET STARTED
              </button>
            </div>
          </nav>

          <div className="mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-5xl md:text-8xl font-black tracking-[1.2em] md:tracking-[1.5em] mr-[-1.2em] md:mr-[-1.5em] uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              AXIS
            </h1>
            <p className="text-white/50 text-[0.65rem] md:text-xs tracking-[0.5em] uppercase mt-5 font-bold">
              Discipline over dopamine.
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <button onClick={handleGetStarted}
              className="group relative inline-flex flex-col items-center justify-center p-8 overflow-hidden transition-all duration-700 cursor-pointer text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <span className="relative z-10 text-xs md:text-sm font-black tracking-[0.4em] uppercase group-hover:text-white/80 transition-colors">
                Get Started
              </span>
              <div className="w-0 group-hover:w-16 h-[2px] bg-white transition-all duration-700 mt-4" />
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 z-20 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/40" />
        </div>

        {/* Bottom fade — smooth hero-to-content transition */}
        <div className="absolute bottom-0 left-0 right-0 h-40 z-30 pointer-events-none bg-gradient-to-t from-black via-black/80 to-transparent" />
      </section>

      {/* ╔══════════════════════════════════════════════════════════════╗
                ║  SECTION 2 — ABOUT                                          ║
                ╚══════════════════════════════════════════════════════════════╝ */}
      <section id="about" ref={addRef} className="scroll-reveal relative py-32 md:py-44 px-8 md:px-24 border-t border-white/5">
        {/* Ambient glow */}
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full bg-white/[0.015] blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <p className="text-[0.55rem] font-black tracking-[0.5em] uppercase text-white/30 mb-6">ABOUT AXIS</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] uppercase">
            One system to<br />
            <span className="text-white/30">rule your day.</span>
          </h2>
          <div className="mt-12 md:mt-16 grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-sm md:text-base leading-relaxed text-white/50 font-medium">
                AXIS is a full-stack productivity operating system built with Next.js, MongoDB, and NextAuth.
                It combines 15+ modules into a single dark, high-contrast interface — designed to eliminate every
                distraction between you and raw progress. Goals, habits, focus sessions, attendance,
                study hours, expenses, workouts, and AI insights — all unified under one roof.
              </p>
              <p className="text-sm md:text-base leading-relaxed text-white/50 font-medium mt-6">
                Role-based access (Student / Professional) ensures you only see what matters.
                Every interaction is designed for zero-friction input and instant visual feedback.
                No tutorials needed. No learning curve. Just open and execute.
              </p>
            </div>
            <div>
              <p className="text-[0.55rem] font-black tracking-[0.4em] uppercase text-white/25 mb-4">DEVELOPED BY</p>
              <h3 className="text-2xl md:text-3xl font-black tracking-wide uppercase">Soumya Biswas</h3>
              <a href="mailto:soumyabiswas2004@gmail.com"
                className="text-xs text-white/40 hover:text-white tracking-widest cursor-text select-text mt-2 inline-block transition-colors lowercase">
                soumyabiswas2004@gmail.com
              </a>
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[0.5rem] font-black tracking-[0.3em] uppercase text-white/20 w-16">STACK</span>
                  <span className="text-xs font-bold text-white/50">Next.js · MongoDB · NextAuth · SWR · Tailwind</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[0.5rem] font-black tracking-[0.3em] uppercase text-white/20 w-32">PREVIOUS PROJECT</span>
                  <a href="https://equipment-controller2.netlify.app/" target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold text-white/50 hover:text-white underline underline-offset-2 transition-colors">EQUIPMENT CONTROLLER</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[0.5rem] font-black tracking-[0.3em] uppercase text-white/20 w-16">DESIGN</span>
                  <span className="text-xs font-bold text-white/50">Monochrome · Zero-Noise UI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 border-t border-white/10 pt-12">
            {[
              { val: "15+", label: "Modules" },
              { val: "AI", label: "Powered" },
              { val: "0", label: "Distractions" },
              { val: "24/7", label: "Cloud Synced" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-black text-white">{s.val}</div>
                <p className="text-[0.55rem] font-bold tracking-[0.3em] uppercase text-white/30 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════════════╗
                ║  SECTION 3 — FEATURES                                       ║
                ╚══════════════════════════════════════════════════════════════╝ */}
      <section id="features" ref={addRef} className="scroll-reveal relative py-32 md:py-44 px-8 md:px-24 border-t border-white/5 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/[0.012] blur-[140px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <p className="text-[0.55rem] font-black tracking-[0.5em] uppercase text-white/30 mb-6">15 MODULES</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] uppercase mb-20">
            The full arsenal.<br />
            <span className="text-white/30">Nothing missing.</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="group border border-white/10 hover:border-white/30 p-8 transition-all duration-500 hover:bg-white/[0.02]">
                <div className="text-3xl mb-6 opacity-40 group-hover:opacity-100 transition-opacity">{f.icon}</div>
                <h3 className="text-sm font-black tracking-[0.3em] uppercase mb-3">{f.title}</h3>
                <p className="text-xs leading-relaxed text-white/40 group-hover:text-white/60 transition-colors">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════════════╗
                ║  SECTION 4 — MISSION / VISION                               ║
                ╚══════════════════════════════════════════════════════════════╝ */}
      <section id="mission" ref={addRef} className="scroll-reveal relative py-32 md:py-44 px-8 md:px-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-24">
          {VALUES.map((v) => (
            <div key={v.label} className="relative">
              <p className="text-[0.5rem] font-black tracking-[0.5em] uppercase text-white/20 mb-4">{v.label}</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.15] uppercase mb-6">{v.heading}</h2>
              <p className="text-sm md:text-base leading-relaxed text-white/45 font-medium max-w-xl">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════════════╗
                ║  SECTION 5 — PRINCIPLES                                     ║
                ╚══════════════════════════════════════════════════════════════╝ */}
      <section ref={addRef} className="scroll-reveal relative py-32 md:py-44 px-8 md:px-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-[0.55rem] font-black tracking-[0.5em] uppercase text-white/30 mb-6">PRINCIPLES</p>
          <div className="flex flex-col md:flex-row gap-16 items-center">
            {/* Principles list */}
            <div className="flex-1 space-y-0">
              {[
                { num: "01", title: "ABSOLUTE CLARITY", text: "Every pixel has a purpose. No decoration, no distraction." },
                { num: "02", title: "ZERO FRICTION", text: "Log a goal in 2 seconds. Check in a habit with one tap." },
                { num: "03", title: "DATA OWNERSHIP", text: "Your habits, your numbers, your progress — always accessible." },
                { num: "04", title: "NO GAMIFICATION", text: "We don't trick you into using the app. You use it because it works." },
              ].map((p) => (
                <div key={p.num} className="group flex gap-6 md:gap-10 py-8 border-b border-white/5 hover:border-white/20 transition-colors">
                  <span className="text-[0.6rem] font-black tracking-[0.3em] text-white/15 group-hover:text-white/40 transition-colors pt-1">{p.num}</span>
                  <div>
                    <h3 className="text-sm font-black tracking-[0.25em] uppercase mb-2">{p.title}</h3>
                    <p className="text-xs text-white/35 leading-relaxed">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Logo with Glitch Effect */}
            <div className="hidden md:flex items-center justify-center flex-shrink-0 relative group">
              {/* Layer 1: Cyan Shift */}
              <img
                src="/logo.png"
                alt=""
                className="w-[280px] h-auto absolute opacity-0 mix-blend-screen animate-glitch-cyan pointer-events-none"
              />
              {/* Layer 2: Red Shift */}
              <img
                src="/logo.png"
                alt=""
                className="w-[280px] h-auto absolute opacity-0 mix-blend-screen animate-glitch-red pointer-events-none"
              />
              {/* Layer 3: Base / White Bloom */}
              <img
                src="/logo.png"
                alt="AXIS Logo"
                className="w-[280px] h-auto relative z-10 animate-logo-bloom mix-blend-screen"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════════════╗
                ║  SECTION 6 — CTA FOOTER                                     ║
                ╚══════════════════════════════════════════════════════════════╝ */}
      <section ref={addRef} className="scroll-reveal relative py-40 md:py-56 px-8 text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-7xl font-black tracking-tight uppercase leading-[1.05]">
            Ready to take<br />
            <span className="text-white/25">control?</span>
          </h2>
          <p className="text-xs text-white/35 tracking-[0.3em] uppercase mt-6 font-bold">No credit card. No setup fee. Just start.</p>
          <button onClick={handleGetStarted}
            className="mt-14 bg-white text-black text-xs font-black tracking-[0.4em] uppercase px-12 py-4 hover:bg-white/85 transition-colors">
            GET STARTED
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 md:px-24 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[0.55rem] font-black tracking-[0.5em] uppercase text-white/20">AXIS © 2026</span>
        <p className="text-[0.5rem] tracking-[0.3em] uppercase text-white/15 font-bold">DISCIPLINE OVER DOPAMINE</p>
      </footer>

      {/* ── Scroll reveal CSS ─────────────────────────────────────────── */}
      <style jsx global>{`
                .scroll-reveal {
                    opacity: 0;
                    transform: translateY(50px);
                    transition: opacity 0.9s ease-out, transform 0.9s ease-out;
                }
                .animate-in-visible {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
                @keyframes logo-bloom {
                    0% { filter: brightness(0.8) contrast(1.2); }
                    50% { filter: brightness(2.8) contrast(1.6); }
                    100% { filter: brightness(0.8) contrast(1.2); }
                }
                .animate-logo-bloom {
                    animation: logo-bloom 6s infinite ease-in-out;
                }
                @keyframes logo-bloom-subtle {
                    0% { filter: brightness(0.9) contrast(1.1); }
                    50% { filter: brightness(1.8) contrast(1.3); }
                    100% { filter: brightness(0.9) contrast(1.1); }
                }
                .animate-logo-pulse-subtle {
                    animation: logo-bloom-subtle 4s infinite ease-in-out;
                }
                @keyframes glitch-cyan {
                    0% { opacity: 0; transform: translate(0); filter: hue-rotate(180deg) brightness(2) contrast(1.5); }
                    92% { opacity: 0; transform: translate(0); }
                    94% { opacity: 0.8; transform: translate(-15px, 6px); }
                    96% { opacity: 0.3; transform: translate(20px, -3px); }
                    98% { opacity: 0.7; transform: translate(-8px, 12px); }
                    100% { opacity: 0; transform: translate(0); }
                }
                @keyframes glitch-red {
                    0% { opacity: 0; transform: translate(0); filter: hue-rotate(0deg) brightness(2) contrast(1.5); }
                    92% { opacity: 0; transform: translate(0); }
                    94% { opacity: 0.8; transform: translate(15px, -6px); }
                    96% { opacity: 0.3; transform: translate(-20px, 3px); }
                    98% { opacity: 0.7; transform: translate(8px, -12px); }
                    100% { opacity: 0; transform: translate(0); }
                }
                .animate-glitch-cyan {
                    animation: glitch-cyan 4s infinite linear;
                }
                .animate-glitch-red {
                    animation: glitch-red 4.2s infinite linear;
                }
            `}</style>
    </div>
  );
}
