const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getStats } = require('../controllers/adminController');

router.get('/stats', authenticate, requireAdmin, getStats);

module.exports = router;
