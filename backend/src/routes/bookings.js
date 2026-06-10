const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getAllBookings,
} = require('../controllers/bookingController');

router.use(authenticate);

router.post('/', createBooking);
router.get('/my', getMyBookings);

router.get('/', requireAdmin, getAllBookings);
router.put('/:id/status', requireAdmin, updateBookingStatus);

module.exports = router;
