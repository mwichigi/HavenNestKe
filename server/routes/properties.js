const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const {
  getProperties, getProperty, createProperty,
  toggleSaveProperty, bookViewing
} = require('../controllers/propertyController');

router.get('/', getProperties);
router.get('/:id', getProperty);
router.post('/', authMiddleware, requireRole('landlord','developer','agency'), createProperty);
router.post('/:id/save', authMiddleware, toggleSaveProperty);
router.post('/:id/view', authMiddleware, bookViewing);

module.exports = router;
