import mongoose, { Schema, Document as MongoDoc, Model } from 'mongoose';

export interface IDocument extends MongoDoc {
    userId: mongoose.Types.ObjectId;
    name: string;
    fileType: string; // 'pdf' | 'image' | 'docx' etc.
    url: string;      // Cloudinary secure URL
    publicId: string; // Cloudinary public_id for deletion
    sizeBytes: number;
    createdAt: Date;
}

const DocumentSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    fileType: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

const DocumentModel: Model<IDocument> =
    mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
export default DocumentModel;
