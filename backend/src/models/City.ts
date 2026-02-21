import mongoose, { Schema } from 'mongoose';
import { ICity } from '../types';

const citySchema = new Schema<ICity>(
    {
        name: {
            type: String,
            required: [true, 'City name is required'],
            unique: true,
            trim: true
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true
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
// name is already unique: true in schema definition
citySchema.index({ state: 1 });
citySchema.index({ isActive: 1 });


const City = mongoose.model<ICity>('City', citySchema);

export default City;
