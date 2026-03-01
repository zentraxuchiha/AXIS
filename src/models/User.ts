import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
    tier: 'FREE' | 'PREMIUM';
    role?: 'student' | 'working_professional';
    aiUsageCount: number;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    googleId: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    tier: { type: String, enum: ['FREE', 'PREMIUM'], default: 'FREE' },
    role: { type: String, enum: ['student', 'working_professional'] },
    aiUsageCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
