"use client";

import { useEffect, useRef } from "react";

interface Star {
    x: number; y: number; size: number; opacity: number; twinkle: number; twinkleSpeed: number;
}

interface GalaxyParticle {
    angle: number;
    radius: number;
    arm: number;
    spread: number;
    opacity: number;
    size: number;
    brightness: number;
}

export default function CosmicNebula() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number>(0);
    const timeRef = useRef(0);
    const panRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        // ── Background stars ──────────────────────────────────────────────────
        const stars: Star[] = Array.from({ length: 180 }, () => ({
            x: Math.random(), y: Math.random(),
            size: 0.4 + Math.random() * 1.1,
            opacity: 0.15 + Math.random() * 0.5,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.006 + Math.random() * 0.012,
        }));

        // ── Spiral galaxy particles ───────────────────────────────────────────
        // 2 arms, particles stored in polar form and rendered with y INVERTED
        // so arms sweep UPWARD from the bottom center
        const NUM_ARMS = 2;
        const PER_ARM = 600;
        const galaxyParticles: GalaxyParticle[] = [];

        for (let arm = 0; arm < NUM_ARMS; arm++) {
            for (let i = 0; i < PER_ARM; i++) {
                const t = i / PER_ARM;
                const angle = arm * Math.PI + t * Math.PI * 3.6;
                const radius = 20 + t * 350;
                const spread = (Math.random() - 0.5) * (25 + t * 70);

                galaxyParticles.push({
                    angle, radius, arm, spread,
                    opacity: 0.12 + (1 - t) * 0.72 + Math.random() * 0.18,
                    size: 0.4 + Math.random() * (t < 0.3 ? 2.0 : 1.2),
                    brightness: Math.floor(155 + (1 - t) * 100),
                });
            }
        }

        const draw = (t: number) => {
            const dt = Math.min(t - timeRef.current, 32);
            timeRef.current = t;

            // Slow right-to-left pan
            panRef.current += 0.10 * (dt / 16);

            const W = canvas.width;
            const H = canvas.height;

            ctx.clearRect(0, 0, W, H);

            // Galaxy core — bottom center, pan drifts left slowly and loops
            const panX = -((panRef.current * 0.45) % (W * 0.25));
            const cx = W * 0.5 + panX;
            const cy = H;           // ← anchored at bottom edge

            // ── 1. Twinkling stars ────────────────────────────────────────────
            for (const s of stars) {
                s.twinkle += s.twinkleSpeed;
                const tw = 0.7 + Math.sin(s.twinkle) * 0.3;
                ctx.beginPath();
                ctx.arc(s.x * W, s.y * H, s.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.opacity * tw})`;
                ctx.fill();
            }

            // ── 2. Wide atmospheric nebula bloom (upward from bottom) ─────────
            const atmo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 480);
            atmo.addColorStop(0, "rgba(255,255,255,0.08)");
            atmo.addColorStop(0.2, "rgba(255,255,255,0.05)");
            atmo.addColorStop(0.45, "rgba(255,255,255,0.02)");
            atmo.addColorStop(0.75, "rgba(255,255,255,0.005)");
            atmo.addColorStop(1, "rgba(0,0,0,0)");
            ctx.beginPath();
            ctx.arc(cx, cy, 480, 0, Math.PI * 2);
            ctx.fillStyle = atmo;
            ctx.fill();

            // ── 3. Spiral arms (y inverted → arms go UP) ─────────────────────
            const slowSpin = t * 0.000030;
            for (const p of galaxyParticles) {
                const a = p.angle + slowSpin;
                const perp = a + Math.PI / 2;
                const px = cx + Math.cos(a) * p.radius + Math.cos(perp) * p.spread;
                // KEY: subtract y so arms sweep upward
                const py = cy - Math.abs(Math.sin(a)) * p.radius * 0.55
                    - Math.abs(Math.sin(perp)) * Math.abs(p.spread) * 0.45
                    + Math.cos(a) * p.radius * 0.1; // slight horizontal tilt

                if (px < -20 || px > W + 20 || py < -30 || py > H + 30) continue;

                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.brightness},${p.brightness},${p.brightness},${p.opacity})`;
                ctx.fill();
            }

            // ── 4. Core halo ──────────────────────────────────────────────────
            const coreO = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
            coreO.addColorStop(0, "rgba(255,255,255,0.35)");
            coreO.addColorStop(0.3, "rgba(255,255,255,0.14)");
            coreO.addColorStop(0.7, "rgba(255,255,255,0.03)");
            coreO.addColorStop(1, "rgba(0,0,0,0)");
            ctx.beginPath();
            ctx.arc(cx, cy, 100, 0, Math.PI * 2);
            ctx.fillStyle = coreO;
            ctx.fill();

            // ── 5. Bright nucleus ─────────────────────────────────────────────
            const pulse = 0.88 + Math.sin(t * 0.0006) * 0.12;
            const coreI = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
            coreI.addColorStop(0, `rgba(255,255,255,${0.95 * pulse})`);
            coreI.addColorStop(0.45, `rgba(255,255,255,${0.45 * pulse})`);
            coreI.addColorStop(1, "rgba(255,255,255,0)");
            ctx.beginPath();
            ctx.arc(cx, cy, 28, 0, Math.PI * 2);
            ctx.fillStyle = coreI;
            ctx.fill();

            // ── 6. Lens flare — vertical streak going up ──────────────────────
            ctx.save();
            ctx.globalAlpha = 0.13 * pulse;
            const fv = ctx.createLinearGradient(cx, cy, cx, cy - H * 0.75);
            fv.addColorStop(0, "rgba(255,255,255,0.9)");
            fv.addColorStop(0.3, "rgba(255,255,255,0.3)");
            fv.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = fv;
            ctx.fillRect(cx - 1, cy - H * 0.75, 2, H * 0.75);
            // Horizontal streak
            ctx.globalAlpha = 0.08 * pulse;
            const fh = ctx.createLinearGradient(cx - 200, cy, cx + 200, cy);
            fh.addColorStop(0, "rgba(255,255,255,0)");
            fh.addColorStop(0.5, "rgba(255,255,255,1)");
            fh.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = fh;
            ctx.fillRect(cx - 200, cy - 1, 400, 2);
            ctx.restore();

            // ── 7. Bottom fade (hides hard edge of canvas) ────────────────────
            const bottomFade = ctx.createLinearGradient(0, H - 40, 0, H);
            bottomFade.addColorStop(0, "rgba(0,0,0,0)");
            bottomFade.addColorStop(1, "rgba(0,0,0,1)");
            ctx.fillStyle = bottomFade;
            ctx.fillRect(0, H - 40, W, 40);

            frameRef.current = requestAnimationFrame(draw);
        };

        frameRef.current = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(frameRef.current); ro.disconnect(); };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed bottom-0 left-0 right-0 w-full pointer-events-none"
            style={{ height: "520px", zIndex: 0 }}
            aria-hidden="true"
        />
    );
}
