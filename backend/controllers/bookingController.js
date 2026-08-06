const Booking = require('../models/Booking');

const generatePNR = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnr = '';
    for (let i = 0; i < 6; i++) {
        pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
};

exports.createBooking = async (req, res) => {
    try {
        const { tripType, cabinClass, source, destination, departureDate, returnDate, passengers, specialFare, path, distance, price } = req.body;

        if (!source || !destination || !departureDate || !path || !price) {
            return res.status(400).json({ message: 'Missing required booking fields' });
        }

        const booking = await Booking.create({
            user: req.user._id,
            pnr: generatePNR(),
            tripType,
            cabinClass,
            source,
            destination,
            departureDate,
            returnDate,
            passengers,
            specialFare,
            path,
            distance,
            price
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create booking', error: error.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
};
