import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITask extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    priority: number;
    isCompleted: boolean;
    dueDate?: Date;
    createdAt: Date;
}

const TaskSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    priority: { type: Number, min: 1, max: 3, default: 2 },
    isCompleted: { type: Boolean, default: false },
    dueDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Drop old model if schema changed (for dev hot reloads)
const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
export default Task;
