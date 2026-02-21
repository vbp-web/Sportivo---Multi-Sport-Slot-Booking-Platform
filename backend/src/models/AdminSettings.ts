import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminSettings extends Document {
    upiId: string;
    qrCodeUrl: string;
    businessName: string;
    updatedAt: Date;
    createdAt: Date;
}

const adminSettingsSchema = new Schema<IAdminSettings>(
    {
        upiId: {
            type: String,
            required: [true, 'UPI ID is required'],
            trim: true
        },
        qrCodeUrl: {
            type: String,
            required: [true, 'QR Code URL is required']
        },
        businessName: {
            type: String,
            default: 'Box Cricket Platform'
        }
    },
    {
        timestamps: true
    }
);

const AdminSettings = mongoose.model<IAdminSettings>('AdminSettings', adminSettingsSchema);

export default AdminSettings;
