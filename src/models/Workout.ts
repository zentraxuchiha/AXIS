import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWorkout extends Document {
    userId: mongoose.Types.ObjectId;
    type: string;
    durationMinutes: number;
    caloriesBurned?: number;
    date: Date;
}

const WorkoutSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    caloriesBurned: { type: Number },
    date: { type: Date, default: Date.now }
});

const Workout: Model<IWorkout> = mongoose.models.Workout || mongoose.model<IWorkout>('Workout', WorkoutSchema);
export default Workout;
