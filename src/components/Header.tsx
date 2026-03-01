"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

import { useSidebar } from "@/context/SidebarContext";

export function Header() {
    const { data: session } = useSession();
    const { toggle } = useSidebar();

    if (!session?.user) return null;

    return (
        <header className="flex justify-between items-center py-6 border-b-4 border-white mb-10 md:mb-16 relative bg-black gap-4">
            {/* Extreme Left / Logo & Profile Group */}
            <div className="flex items-center gap-4 md:gap-10 overflow-hidden">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={toggle}
                    className="md:hidden w-12 h-12 border-2 border-white flex flex-col items-center justify-center gap-1 bg-black hover:bg-white transition-colors group"
                >
                    <span className="w-5 h-[2px] bg-white group-hover:bg-black transition-colors" />
                    <span className="w-5 h-[2px] bg-white group-hover:bg-black transition-colors" />
                    <span className="w-5 h-[2px] bg-white group-hover:bg-black transition-colors" />
                </button>

                <div className="flex items-center flex-shrink-0">
                    <img src="/logo.png" alt="AXIS" className="w-20 h-20 md:w-32 md:h-32 object-contain opacity-100" />
                </div>

                <div className="w-[2px] h-12 md:h-20 bg-white/20 mx-1 md:mx-2" />

                <div className="flex items-center gap-4 md:gap-6 min-w-0">
                    {session.user.image ? (
                        <div className="relative w-10 h-10 md:w-16 md:h-16 overflow-hidden border-2 border-white shadow-[3px_3px_0px_white] md:shadow-[5px_5px_0px_white] flex-shrink-0">
                            <Image
                                src={session.user.image}
                                alt={session.user.name || "User"}
                                fill
                                className="object-cover grayscale contrast-150"
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-white border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_white] md:shadow-[5px_5px_0px_white] flex-shrink-0">
                            <span className="text-lg md:text-2xl font-bold text-black font-sans">
                                {session.user.name?.[0] || "U"}
                            </span>
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="text-[0.5rem] md:text-[0.65rem] text-white/40 uppercase tracking-[0.4em] font-bold mb-1 truncate">ACCOUNT</span>
                        <span className="text-white text-lg md:text-2xl font-black tracking-widest uppercase truncate">{session.user.name}</span>
                    </div>
                </div>
            </div>

            {/* Extreme Right / Logout Box */}
            <div className="flex items-center flex-shrink-0">
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-[0.6rem] md:text-xs font-black tracking-[0.3em] uppercase text-white/40 hover:text-white transition-all duration-300"
                >
                    LOGOUT
                </button>
            </div>
        </header>
    );
}
