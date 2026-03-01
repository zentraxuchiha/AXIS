import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAcademicRoutine extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    subject?: string;
    dayOfWeek: number; // 0=Mon, 6=Sun
    time: string;      // "HH:MM"
    completedOn?: Date; // Date of last completion (for daily reset)
    createdAt: Date;
}

const AcademicRoutineSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    subject: { type: String },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    time: { type: String, required: true },
    completedOn: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const AcademicRoutine: Model<IAcademicRoutine> =
    mongoose.models.AcademicRoutine || mongoose.model<IAcademicRoutine>('AcademicRoutine', AcademicRoutineSchema);
export default AcademicRoutine;
