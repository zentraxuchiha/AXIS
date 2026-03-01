import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHabit extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    currentStreak: number;
    lastCompletedDate?: Date;
    history: Date[];
    createdAt: Date;
}

const HabitSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    currentStreak: { type: Number, default: 0 },
    lastCompletedDate: { type: Date },
    history: [{ type: Date }],
    createdAt: { type: Date, default: Date.now }
});

const Habit: Model<IHabit> = mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema);
export default Habit;
