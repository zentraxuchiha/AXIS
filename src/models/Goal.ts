import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGoal extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    targetDate?: Date;
    priority: 1 | 2 | 3;
    isCompleted: boolean;
    createdAt: Date;
}

const GoalSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    targetDate: { type: Date },
    priority: { type: Number, enum: [1, 2, 3], default: 2 },
    isCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Goal: Model<IGoal> = mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);
export default Goal;
