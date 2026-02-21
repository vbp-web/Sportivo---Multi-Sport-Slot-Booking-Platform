import mongoose, { Schema, Document } from 'mongoose';

export interface IFeature extends Document {
    name: string;
    description?: string;
    category?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const featureSchema = new Schema<IFeature>(
    {
        name: {
            type: String,
            required: [true, 'Feature name is required'],
            unique: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        category: {
            type: String,
            enum: ['booking', 'communication', 'analytics', 'support', 'automation', 'other'],
            default: 'other'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes
featureSchema.index({ isActive: 1 });
featureSchema.index({ category: 1 });
// name is already unique: true in schema definition


const Feature = mongoose.model<IFeature>('Feature', featureSchema);

export default Feature;
