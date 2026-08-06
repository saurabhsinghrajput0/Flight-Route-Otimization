const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, bookingController.createBooking)
    .get(protect, bookingController.getUserBookings);

module.exports = router;
