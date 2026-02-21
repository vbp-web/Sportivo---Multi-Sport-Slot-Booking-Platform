import express from 'express';
import Slot from '../models/Slot';

const router = express.Router();

// GET /api/slots - Get available slots (with filters)
router.get('/', async (req, res) => {
    try {
        const { courtId, venueId, sportId, date, status } = req.query;

        // Build query filter
        const filter: any = {};

        if (courtId) filter.courtId = courtId;
        if (venueId) filter.venueId = venueId;
        if (sportId) filter.sportId = sportId;
        if (status) filter.status = status;

        if (date) {
            // Filter by specific date
            const startDate = new Date(date as string);
            const endDate = new Date(date as string);
            endDate.setHours(23, 59, 59, 999);
            filter.date = { $gte: startDate, $lte: endDate };
        }
        // When no date is specified, show ALL slots (not just future ones)

        const slots = await Slot.find(filter)
            .populate('courtId', 'name')
            .populate('sportId', 'name')
            .populate('venueId', 'name city')
            .sort({ date: 1, startTime: 1 });

        res.json({
            success: true,
            count: slots.length,
            data: slots
        });
        return;
    } catch (error: any) {
        console.error('Get slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching slots',
            error: error.message
        });
        return;
    }
});

// GET /api/slots/venue/:venueId - Get slots by venue
router.get('/venue/:venueId', async (req, res) => {
    try {
        const { venueId } = req.params;
        const { date, status } = req.query;

        const filter: any = { venueId };

        if (status) filter.status = status;

        if (date) {
            const startDate = new Date(date as string);
            const endDate = new Date(date as string);
            endDate.setHours(23, 59, 59, 999);
            filter.date = { $gte: startDate, $lte: endDate };
        } else {
            filter.date = { $gte: new Date() };
        }

        const slots = await Slot.find(filter)
            .populate('courtId', 'name')
            .populate('sportId', 'name')
            .sort({ date: 1, startTime: 1 });

        res.json({
            success: true,
            count: slots.length,
            data: slots
        });
        return;
    } catch (error: any) {
        console.error('Get venue slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
        return;
    }
});

// GET /api/slots/sport/:sportId - Get slots by sport
router.get('/sport/:sportId', async (req, res) => {
    try {
        const { sportId } = req.params;
        const { date, status } = req.query;

        const filter: any = { sportId };

        if (status) filter.status = status;

        if (date) {
            const startDate = new Date(date as string);
            const endDate = new Date(date as string);
            endDate.setHours(23, 59, 59, 999);
            filter.date = { $gte: startDate, $lte: endDate };
        } else {
            filter.date = { $gte: new Date() };
        }

        const slots = await Slot.find(filter)
            .populate('courtId', 'name')
            .populate('venueId', 'name city')
            .sort({ date: 1, startTime: 1 });

        res.json({
            success: true,
            count: slots.length,
            data: slots
        });
        return;
    } catch (error: any) {
        console.error('Get sport slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
        return;
    }
});

// GET /api/slots/:id - Get slot details
router.get('/:id', async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id)
            .populate('courtId', 'name')
            .populate('sportId', 'name')
            .populate('venueId', 'name city address');

        if (!slot) {
            res.status(404).json({
                success: false,
                message: 'Slot not found'
            });
            return;
        }

        res.json({
            success: true,
            data: slot
        });
        return;
    } catch (error: any) {
        console.error('Get slot error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
        return;
    }
});

export default router;
