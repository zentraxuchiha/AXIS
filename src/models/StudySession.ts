import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudySession extends Document {
    userId: mongoose.Types.ObjectId;
    subject: string;
    durationMinutes: number;
    notes?: string;
    date: Date;
}

const StudySessionSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    notes: { type: String },
    date: { type: Date, default: Date.now }
});

const StudySession: Model<IStudySession> =
    mongoose.models.StudySession || mongoose.model<IStudySession>('StudySession', StudySessionSchema);
export default StudySession;
