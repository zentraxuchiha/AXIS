import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    category: string;
    description?: string;
    date: Date;
    createdAt: Date;
}

const ExpenseSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
export default Expense;
