import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true, default: "Untitled Note" },
        content: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
