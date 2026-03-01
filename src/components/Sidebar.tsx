"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const getNavItems = (role: string) => {
    const core = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Today", href: "/today" },
        { name: "Focus", href: "/focus" },
        { name: "AXIS AI", href: "/smart" },
        { name: "Expense", href: "/expense" },
        { name: "Weekly Review", href: "/review" },
        { name: "Train", href: "/train" },
        { name: "Notes", href: "/notes" },
    ];

    const student = [
        { name: "Attendance", href: "/attendance" },
        { name: "Study Tracker", href: "/study-tracker" },
        { name: "Academic Routines", href: "/academic-routines" },
        { name: "Subject Progress", href: "/subject-progress" },
        { name: "Documents", href: "/documents" },
    ];

    const wp = [
        { name: "Time Analytics", href: "/time-analytics" },
        { name: "Goal Tracker", href: "/goals" },
        { name: "Habit Tracker", href: "/habits" },
        { name: "Focus Mode", href: "/focus-mode" },
    ];

    return [
        ...core,
        ...(role === 'student' ? student : []),
        ...(role === 'working_professional' ? wp : [])
    ];
};

import { useSidebar } from "@/context/SidebarContext";

export function Sidebar({ userRole }: { userRole: string }) {
    const pathname = usePathname();
    const navItems = getNavItems(userRole);
    const { isOpen, close } = useSidebar();

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity duration-300 md:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={close}
            />

            <aside className={`fixed left-0 top-0 h-full w-72 bg-black border-r-2 border-white flex-col z-[60] overflow-hidden transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:flex`}>
                {/* Geometric Texture Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                <div className="absolute top-0 right-0 w-32 h-32 border-b-2 border-l-2 border-white/20 transform translate-x-16 -translate-y-16 rotate-45 pointer-events-none" />

                <div className="relative p-8 mt-4 flex justify-between items-center">
                    <h1 className="text-4xl font-black tracking-[0.5em] uppercase text-white">Axis</h1>
                    {/* Mobile Close Button */}
                    <button
                        onClick={close}
                        className="md:hidden text-white/40 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 relative px-4 overflow-y-auto no-scrollbar">
                    <ul className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/today" && pathname.startsWith(item.href));
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={close}
                                        prefetch={false}
                                        className={`relative flex items-center justify-between px-6 py-4 font-bold tracking-[0.25em] transition-all duration-300 group overflow-hidden border-2
                                            ${isActive ? "bg-white text-black border-white" : "text-white border-transparent hover:border-white/30"}
                                        `}
                                    >

                                        {!isActive && (
                                            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none z-0" style={{ willChange: 'transform' }} />
                                        )}

                                        <span className={`relative z-10 text-[0.7rem] ${isActive ? "" : "group-hover:text-black transition-colors duration-300"} 
                                            ${item.name === "AXIS AI" ? "glitch-text" : ""}`}
                                            data-text={item.name === "AXIS AI" ? "AXIS AI" : undefined}
                                        >
                                            {item.name.toUpperCase()}
                                        </span>

                                        {isActive && (
                                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-black border-b-[8px] border-b-transparent" />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="relative p-8 border-t-2 border-white/20 bg-black flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-white" />
                        <p className="text-white text-[0.6rem] font-bold uppercase tracking-[0.3em] leading-loose italic">
                            Build your day.<br />Shape your life.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            const { signOut } = require("next-auth/react");
                            signOut({ callbackUrl: "/login" });
                        }}
                        className="w-full border-2 border-white/20 py-3 text-[0.65rem] font-black uppercase tracking-[0.4em] text-white hover:bg-white hover:text-black transition-all duration-300"
                    >
                        Log Out
                    </button>
                </div>
            </aside>
        </>
    );
}
