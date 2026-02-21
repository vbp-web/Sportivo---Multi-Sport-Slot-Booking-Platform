import mongoose, { Schema } from 'mongoose';
import { ISport } from '../types';

const sportSchema = new Schema<ISport>(
    {
        name: {
            type: String,
            required: [true, 'Sport name is required'],
            unique: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        icon: {
            type: String
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
sportSchema.index({ isActive: 1 });

const Sport = mongoose.model<ISport>('Sport', sportSchema);

export default Sport;
