import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIncome extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    category: string;
    description?: string;
    date: Date;
    createdAt: Date;
}

const IncomeSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

const Income: Model<IIncome> = mongoose.models.Income || mongoose.model<IIncome>('Income', IncomeSchema);
export default Income;
