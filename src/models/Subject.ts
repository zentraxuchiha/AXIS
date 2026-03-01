import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChapter {
    _id?: mongoose.Types.ObjectId;
    name: string;
    isCompleted: boolean;
}

export interface ISubject extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    chapters: IChapter[];
    notes?: string;
    createdAt: Date;
}

const ChapterSchema = new Schema({
    name: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
}, { _id: true });

const SubjectSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    chapters: { type: [ChapterSchema], default: [] },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
});

// Force delete cached model so Next.js picks up the new schema after changes
try { mongoose.deleteModel('Subject'); } catch (_) { }

const Subject: Model<ISubject> = mongoose.model<ISubject>('Subject', SubjectSchema);
export default Subject;
