import express from 'express';
import Court from '../models/Court';

const router = express.Router();

// GET /api/courts/:id - Get court details (public)
router.get('/:id', async (req, res) => {
    try {
        const court = await Court.findById(req.params.id)
            .populate('sportId', 'name')
            .populate('venueId', 'name city address');

        if (!court) {
            res.status(404).json({
                success: false,
                message: 'Court not found'
            });
            return;
        }

        res.json({
            success: true,
            data: court
        });
        return;
    } catch (error: any) {
        console.error('Get court error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
        return;
    }
});

export default router;
