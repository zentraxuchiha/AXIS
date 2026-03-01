"use client";

import { useEffect, useRef } from "react";

interface Star {
    id: number;
    x: number;      // start X (vw %)
    y: number;      // start Y (vh %)
    angle: number;  // travel angle in degrees (30–60 = diagonal down-right)
    length: number; // tail length in px
    duration: number; // animation ms
}

let starId = 0;

export default function ShootingStars() {
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const spawnStar = () => {
        const container = containerRef.current;
        if (!container) return;

        const id = ++starId;
        const angle = 30 + Math.random() * 25;          // 30°–55°
        const length = 120 + Math.random() * 180;        // 120–300px tail
        const duration = 3000 + Math.random() * 2000;      // 3000–5000ms (Much slower)
        const startX = Math.random() * 80;               // 0–80vw
        const startY = Math.random() * 50;               // 0–50vh

        const star = document.createElement("div");
        star.style.cssText = `
            position: fixed;
            top: ${startY}vh;
            left: ${startX}vw;
            width: ${length}px;
            height: 1px;
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%);
            transform: rotate(${angle}deg);
            transform-origin: left center;
            pointer-events: none;
            z-index: 0;
            opacity: 0;
            animation: shootingStar ${duration}ms linear forwards;
        `;
        star.id = `star-${id}`;

        container.appendChild(star);

        // Remove element after animation
        setTimeout(() => {
            star.remove();
        }, duration + 100);
    };

    const scheduleNext = () => {
        // Random interval between 12000ms–20000ms (Much more rare)
        const delay = 12000 + Math.random() * 8000;
        timeoutRef.current = setTimeout(() => {
            spawnStar();
            // Occasionally fire a second star 200–500ms after the first
            // Occasionally fire a second star 1000–2000ms after the first
            if (Math.random() > 0.8) {
                setTimeout(spawnStar, 1000 + Math.random() * 1000);
            }
            scheduleNext();
        }, delay);
    };

    useEffect(() => {
        // Inject keyframes once
        const styleId = "shooting-star-keyframes";
        if (!document.getElementById(styleId)) {
            const style = document.createElement("style");
            style.id = styleId;
            style.textContent = `
                @keyframes shootingStar {
                    0%   { opacity: 0; transform: rotate(var(--angle, 40deg)) translateX(0); }
                    20%  { opacity: 1; }
                    80%  { opacity: 1; }
                    100% { opacity: 0; transform: rotate(var(--angle, 40deg)) translateX(400px); }
                }
            `;
            document.head.appendChild(style);
        }

        // Fire the first star quickly then settle into rhythm
        const initTimeout = setTimeout(() => {
            spawnStar();
            scheduleNext();
        }, 1500);

        return () => {
            clearTimeout(initTimeout);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 overflow-hidden pointer-events-none"
            style={{ zIndex: 0 }}
            aria-hidden="true"
        />
    );
}
