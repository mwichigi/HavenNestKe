const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getRequests, createRequest, updateRequest } = require('../controllers/maintenanceController');

router.get('/', authMiddleware, getRequests);
router.post('/', authMiddleware, createRequest);
router.patch('/:id', authMiddleware, updateRequest);

module.exports = router;
