import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWorkoutRoutine extends Document {
    userId: mongoose.Types.ObjectId;
    dayOfWeek: number; // 0-6 (Mon-Sun)
    exercises: {
        name: string;
        type: 'bodyweight' | 'gym';
        target: string;
        done: boolean;
    }[];
}

const WorkoutRoutineSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dayOfWeek: { type: Number, required: true }, // 0: Mon, 1: Tue, ..., 6: Sun
    exercises: [
        {
            name: { type: String, required: true },
            type: { type: String, enum: ['bodyweight', 'gym'], required: true },
            target: { type: String, required: true },
            done: { type: Boolean, default: false }
        }
    ]
});

// Compound index to ensure uniqueness per user per day
WorkoutRoutineSchema.index({ userId: 1, dayOfWeek: 1 }, { unique: true });

const WorkoutRoutine: Model<IWorkoutRoutine> = mongoose.models.WorkoutRoutine || mongoose.model<IWorkoutRoutine>('WorkoutRoutine', WorkoutRoutineSchema);
export default WorkoutRoutine;
