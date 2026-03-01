import { auth } from "@/auth";
import TrainStudent from "./TrainStudent";
import TrainProfessional from "./TrainProfessional";
import { redirect } from "next/navigation";

export default async function TrainPageWrapper() {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!role) {
        redirect("/setup-role");
    }

    if (role === "student") {
        return <TrainStudent />;
    }

    return <TrainProfessional />;
}
