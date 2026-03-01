import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import DocumentModel from "@/models/Document";

const MAX_SIZE_BYTES = 800 * 1024; // 800 KB

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const docs = await DocumentModel.find({ userId: session.user.id }).sort({ createdAt: -1 });
        return NextResponse.json(docs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch documents", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        // ── 800 KB size limit ──
        if (file.size > MAX_SIZE_BYTES) {
            return NextResponse.json(
                { error: `File too large. Maximum allowed size is 800 KB. Your file is ${(file.size / 1024).toFixed(0)} KB.` },
                { status: 413 }
            );
        }

        // Determine resource type for Cloudinary
        const isImage = file.type.startsWith("image/");
        const resourceType = isImage ? "image" : "raw";

        // Convert file to base64 data URI for Cloudinary upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;

        // Upload to Cloudinary — user-isolated folder
        const uploadResult = await cloudinary.uploader.upload(dataUri, {
            folder: `axis/${session.user.id}/documents`,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true,
        });

        await connectToDatabase();
        const doc = await DocumentModel.create({
            userId: session.user.id,
            name: file.name,
            fileType: file.type,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            sizeBytes: file.size,
        });

        return NextResponse.json(doc, { status: 201 });
    } catch (error) {
        console.error("[DOCUMENTS POST] Error:", error);
        return NextResponse.json({ error: "Failed to upload document", details: String(error) }, { status: 500 });
    }
}
