import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFocusSession extends Document {
    userId: mongoose.Types.ObjectId;
    label: string;
    durationMinutes: number;
    date: Date;
}

const FocusSessionSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, default: 'Deep Work' },
    durationMinutes: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const FocusSession: Model<IFocusSession> =
    mongoose.models.FocusSession || mongoose.model<IFocusSession>('FocusSession', FocusSessionSchema);
export default FocusSession;
