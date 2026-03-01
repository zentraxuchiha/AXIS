import { auth } from "@/auth";
import ReviewClient from "./ReviewClient";
import { redirect } from "next/navigation";

export default async function ReviewPage() {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!role) {
        redirect("/setup-role");
    }

    return <ReviewClient userRole={role} />;
}
