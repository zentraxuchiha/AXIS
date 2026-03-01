"use client";

import React, { useMemo } from 'react';

interface DataPoint {
    label: string;
    value: number;
}

interface GradientLineGraphProps {
    data: DataPoint[];
    height?: number;
    strokeColor?: string;
    gradientStart?: string;
    gradientEnd?: string;
}

const GradientLineGraph: React.FC<GradientLineGraphProps> = ({
    data,
    height = 200,
    strokeColor = "#ffffff",
    gradientStart = "rgba(255, 255, 255, 0.15)",
    gradientEnd = "rgba(255, 255, 255, 0)"
}) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };

    const { points, pathData, areaData, labels, maxValue, minValue } = useMemo(() => {
        if (!data || data.length === 0) return { points: [], pathData: "", areaData: "", labels: [], maxValue: 0, minValue: 0 };

        const values = data.map(d => d.value);
        const minVal = Math.min(...values, 0);
        const maxVal = Math.max(...values, 100);
        const range = maxVal - minVal;

        const chartWidth = 1000;
        const chartHeight = height - margin.top - margin.bottom;

        const xStep = chartWidth / (data.length - 1 || 1);

        const pts = data.map((d, i) => ({
            x: i * xStep,
            y: chartHeight - ((d.value - minVal) / (range || 1)) * chartHeight
        }));

        // Generate smooth cubic bezier path
        let path = `M ${pts[0].x},${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(i - 1, 0)];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[Math.min(i + 2, pts.length - 1)];

            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;

            path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
        }

        const area = `${path} L ${pts[pts.length - 1].x},${chartHeight} L 0,${chartHeight} Z`;

        return {
            points: pts,
            pathData: path,
            areaData: area,
            labels: data.map(d => d.label),
            maxValue: maxVal,
            minValue: minVal
        };
    }, [data, height]);

    if (!data || data.length === 0) {
        return (
            <div style={{ height }} className="flex items-center justify-center border border-white/10 text-white/20 text-[0.6rem] uppercase tracking-widest">
                Insufficient Data for Analytics
            </div>
        );
    }

    return (
        <div className="w-full relative group pl-10">
            {/* Y-Axis Labels */}
            <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between items-end pr-4 pointer-events-none w-10">
                <span className="text-[8px] font-black text-white/20 uppercase">₹{maxValue.toLocaleString()}</span>
                <span className="text-[8px] font-black text-white/20 uppercase">₹{(maxValue / 2).toLocaleString()}</span>
                <span className="text-[8px] font-black text-white/20 uppercase">₹{minValue.toLocaleString()}</span>
            </div>

            <svg
                viewBox={`-10 0 1020 ${height - margin.top - margin.bottom}`}
                className="w-full overflow-visible"
                preserveAspectRatio="none"
                style={{ height: height - margin.top - margin.bottom }}
            >
                <defs>
                    <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={gradientStart} />
                        <stop offset="100%" stopColor={gradientEnd} />
                    </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="0" x2="1000" y2="0" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
                <line x1="0" y1="50%" x2="1000" y2="50%" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
                <line x1="0" y1="100%" x2="1000" y2="100%" stroke="white" strokeOpacity="0.05" strokeWidth="1" />

                {/* Area Fill */}
                <path d={areaData} fill="url(#graphGradient)" className="transition-all duration-1000" />

                {/* Main Line */}
                <path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-1000"
                />

                {/* Interaction Points */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill="white"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg"
                    />
                ))}
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-4 px-1">
                {labels.map((label, i) => (
                    <span key={i} className="text-[8px] font-black text-white/20 uppercase tracking-tighter">
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default GradientLineGraph;
