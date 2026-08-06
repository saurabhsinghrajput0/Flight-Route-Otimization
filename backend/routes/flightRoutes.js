const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { protect } = require('../middleware/authMiddleware');

router.get('/cities', protect, flightController.getCities);
router.post('/cities', protect, flightController.addCity);

router.get('/routes', protect, flightController.getRoutes);
router.post('/routes', protect, flightController.addRoute);

router.get('/optimize', protect, flightController.optimizeRoute);
router.post('/seed', protect, flightController.seedInitialData);

module.exports = router;
