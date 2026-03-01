import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import DocumentModel from "@/models/Document";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();

        // Find and verify ownership before deleting
        const doc = await DocumentModel.findOneAndDelete({ _id: id, userId: session.user.id });
        if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        // Determine resource_type for deletion
        const isImage = doc.fileType.startsWith("image/");
        const resourceType = isImage ? "image" : "raw";

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(doc.publicId, { resource_type: resourceType });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete document", details: String(error) }, { status: 500 });
    }
}
