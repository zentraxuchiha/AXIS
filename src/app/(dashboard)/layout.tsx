import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import ShootingStars from "@/components/ShootingStars";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SidebarProvider } from "@/context/SidebarContext";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) {
        redirect("/");
    }

    const userRole = (session.user as any).role;
    if (!userRole) {
        redirect("/setup-role");
    }

    return (
        <SidebarProvider>
            <div className="min-h-[100dvh] bg-black text-white flex relative overflow-x-hidden">
                {/* Global shooting star background — renders on every module */}
                <ShootingStars />

                <Sidebar userRole={userRole} />

                {/* Main content wrapper with margin-left compensating for the fixed sidebar width (w-72 = 18rem = 288px) */}
                <div className="flex-1 md:ml-72 min-h-screen">
                    <main className="w-full p-6 md:px-16 md:py-10">
                        <Header />
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
