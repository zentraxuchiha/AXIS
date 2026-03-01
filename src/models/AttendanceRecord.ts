import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendanceRecord extends Document {
    userId: mongoose.Types.ObjectId;
    subject: string;
    date: Date;
    status: 'present' | 'absent';
    type: 'theory' | 'practical';
    createdAt: Date;
}

const AttendanceRecordSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent'], required: true },
    type: { type: String, enum: ['theory', 'practical'], required: true, default: 'theory' },
    createdAt: { type: Date, default: Date.now }
});

const AttendanceRecord: Model<IAttendanceRecord> =
    mongoose.models.AttendanceRecord || mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);
export default AttendanceRecord;
