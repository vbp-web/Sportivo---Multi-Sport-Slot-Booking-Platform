import { Request, Response } from 'express';
import Slot from '../models/Slot';
import Court from '../models/Court';

// Get available slots
export const getAvailableSlots = async (req: Request, res: Response) => {
    try {
        const { courtId, date, startDate, endDate } = req.query;

        const query: any = { status: 'available' };

        if (courtId) query.court = courtId;

        if (date) {
            query.date = new Date(date as string);
        } else if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            };
        }

        const slots = await Slot.find(query)
            .populate('courtId', 'name')
            .populate('sportId', 'name icon')
            .populate('venueId', 'name city')
            .sort({ date: 1, startTime: 1 });

        return res.json(slots);
    } catch (error) {
        console.error('Get slots error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get slots by venue
export const getSlotsByVenue = async (req: Request, res: Response) => {
    try {
        const { venueId } = req.params;
        const { date, sportId } = req.query;

        // Get courts for this venue
        const courtQuery: any = { venue: venueId, isActive: true };
        if (sportId) courtQuery.sport = sportId;

        const courts = await Court.find(courtQuery);
        const courtIds = courts.map(court => court._id);

        // Get slots for these courts
        const slotQuery: any = {
            court: { $in: courtIds },
            status: 'available'
        };

        if (date) {
            slotQuery.date = new Date(date as string);
        }

        const slots = await Slot.find(slotQuery)
            .populate('courtId', 'name')
            .populate('sportId', 'name icon')
            .sort({ date: 1, startTime: 1 });

        return res.json(slots);
    } catch (error) {
        console.error('Get venue slots error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get slot details
export const getSlotDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const slot = await Slot.findById(id)
            .populate('courtId', 'name capacity')
            .populate('sportId', 'name icon')
            .populate('venueId', 'name city address upiQRCode');

        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        return res.json(slot);
    } catch (error) {
        console.error('Get slot details error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
