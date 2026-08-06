const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pnr: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'CONFIRMED'
    },
    tripType: {
        type: String,
        required: true,
        default: 'One Way'
    },
    cabinClass: {
        type: String,
        required: true,
        default: 'Economy'
    },
    source: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    departureDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date
    },
    passengers: {
        adults: { type: Number, default: 1 },
        children: { type: Number, default: 0 },
        infants: { type: Number, default: 0 }
    },
    specialFare: {
        type: String,
        default: 'None'
    },
    path: {
        type: [String],
        required: true
    },
    distance: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
