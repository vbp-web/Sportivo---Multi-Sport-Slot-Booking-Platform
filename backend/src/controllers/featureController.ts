import { Request, Response } from 'express';
import Feature from '../models/Feature';

// Get all features
export const getAllFeatures = async (req: Request, res: Response): Promise<void> => {
    try {
        const features = await Feature.find().sort({ category: 1, name: 1 });

        res.status(200).json({
            success: true,
            data: features
        });
        return;
    } catch (error: any) {
        console.error('Error fetching features:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch features',
            error: error.message
        });
        return;
    }
};

// Get active features only
export const getActiveFeatures = async (req: Request, res: Response): Promise<void> => {
    try {
        const features = await Feature.find({ isActive: true }).sort({ category: 1, name: 1 });

        res.status(200).json({
            success: true,
            data: features
        });
        return;
    } catch (error: any) {
        console.error('Error fetching active features:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active features',
            error: error.message
        });
        return;
    }
};

// Create a new feature
export const createFeature = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, category } = req.body;

        // Check if feature already exists
        const existingFeature = await Feature.findOne({ name });
        if (existingFeature) {
            res.status(400).json({
                success: false,
                message: 'Feature with this name already exists'
            });
            return;
        }

        const feature = await Feature.create({
            name,
            description,
            category: category || 'other'
        });

        res.status(201).json({
            success: true,
            message: 'Feature created successfully',
            data: feature
        });
        return;
    } catch (error: any) {
        console.error('Error creating feature:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create feature',
            error: error.message
        });
        return;
    }
};

// Update a feature
export const updateFeature = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, category, isActive } = req.body;

        const feature = await Feature.findByIdAndUpdate(
            id,
            { name, description, category, isActive },
            { new: true, runValidators: true }
        );

        if (!feature) {
            res.status(404).json({
                success: false,
                message: 'Feature not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Feature updated successfully',
            data: feature
        });
        return;
    } catch (error: any) {
        console.error('Error updating feature:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update feature',
            error: error.message
        });
        return;
    }
};

// Delete a feature
export const deleteFeature = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const feature = await Feature.findByIdAndDelete(id);

        if (!feature) {
            res.status(404).json({
                success: false,
                message: 'Feature not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Feature deleted successfully'
        });
        return;
    } catch (error: any) {
        console.error('Error deleting feature:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete feature',
            error: error.message
        });
        return;
    }
};

// Toggle feature status
export const toggleFeatureStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const feature = await Feature.findById(id);
        if (!feature) {
            res.status(404).json({
                success: false,
                message: 'Feature not found'
            });
            return;
        }

        feature.isActive = !feature.isActive;
        await feature.save();

        res.status(200).json({
            success: true,
            message: `Feature ${feature.isActive ? 'activated' : 'deactivated'} successfully`,
            data: feature
        });
        return;
    } catch (error: any) {
        console.error('Error toggling feature status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle feature status',
            error: error.message
        });
        return;
    }
};
