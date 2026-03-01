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

export function Navigation({ userRole }: { userRole: string }) {
    const pathname = usePathname();
    const navItems = getNavItems(userRole);

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-md border-t border-white/10 z-50 md:hidden overflow-x-auto no-scrollbar">
            <ul className="flex items-center px-6 py-4 min-w-max gap-8">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/today" && pathname.startsWith(item.href));
                    return (
                        <li key={item.name} className="flex-shrink-0">
                            <Link
                                href={item.href}
                                prefetch={false}
                                className={`flex flex-col items-center gap-1 uppercase tracking-widest text-[0.55rem] font-bold transition-all ${isActive ? "text-white" : "text-white/40 hover:text-white"
                                    }`}
                            >
                                <span className={`w-1 h-1 rounded-full mb-1 transition-all duration-300 ${isActive ? "bg-white scale-125 shadow-[0_0_8px_white]" : "bg-transparent opacity-0"}`} />
                                {item.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
