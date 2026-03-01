"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ParticleWave from "@/components/ParticleWave";

export default function SetupRolePage() {
    const router = useRouter();
    const { data: session, status, update } = useSession();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && (session?.user as any)?.role) {
            router.push("/");
        }
    }, [session, status, router]);

    const selectRole = async (role: string) => {
        setLoading(true);
        try {
            const res = await fetch("/api/user/role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });

            if (res.ok) {
                await update({ role }); // Force NextAuth to refresh its token/session
                router.push("/");
                router.refresh();
            } else {
                console.error("Failed to set role");
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <main className="relative w-full h-[100dvh] bg-black overflow-hidden font-sans text-white">
            <ParticleWave />
            <div className="fixed inset-0 z-10 pointer-events-none bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.8)_100%)]" />

            <div className="relative z-20 flex flex-col items-center justify-center w-full h-full p-6 text-center max-w-4xl mx-auto">
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h1 className="text-4xl md:text-5xl font-black tracking-[1em] mr-[-1em] uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        IDENTITY
                    </h1>
                    <p className="text-white/60 text-[0.65rem] tracking-[0.5em] uppercase mt-4 font-bold">
                        Choose your path.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                    <button
                        onClick={() => selectRole("student")}
                        disabled={loading}
                        className="group relative p-8 flex flex-col items-center justify-center overflow-hidden transition-all duration-700 cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <h2 className="text-xl md:text-3xl font-black tracking-[0.3em] md:tracking-[0.5em] mr-[-0.3em] md:mr-[-0.5em] uppercase mb-6 relative z-10 text-white group-hover:text-white/80 transition-colors">
                            Student
                        </h2>
                        <div className="w-0 group-hover:w-16 h-[2px] bg-white transition-all duration-700 mb-6" />
                        <p className="text-[0.6rem] font-bold tracking-[0.3em] uppercase text-white/40 group-hover:text-white/80 transition-colors text-center relative z-10 leading-loose">
                            Academic mastery.<br />Focus tracking.<br />Routine discipline.
                        </p>
                    </button>

                    <button
                        onClick={() => selectRole("working_professional")}
                        disabled={loading}
                        className="group relative p-8 flex flex-col items-center justify-center overflow-hidden transition-all duration-700 cursor-pointer border-t border-white/10 md:border-t-0 md:border-l"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <h2 className="text-xl md:text-3xl font-black tracking-[0.3em] md:tracking-[0.5em] mr-[-0.3em] md:mr-[-0.5em] uppercase mb-6 relative z-10 text-white group-hover:text-white/80 transition-colors text-center leading-normal">
                            Professional
                        </h2>
                        <div className="w-0 group-hover:w-16 h-[2px] bg-white transition-all duration-700 mb-6" />
                        <p className="text-[0.6rem] font-bold tracking-[0.3em] uppercase text-white/40 group-hover:text-white/80 transition-colors text-center relative z-10 leading-loose">
                            Career scaling.<br />Habit architecture.<br />Time defense.
                        </p>
                    </button>
                </div>
            </div>
        </main>
    );
}
