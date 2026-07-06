const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const {
  getDashboard, getTenants, createLease, respondToMaintenance,
  getViewingRequests, respondToViewing, getLandlordLeases, signLeaseAsLandlord
} = require('../controllers/landlordController');

// All landlord routes require auth + landlord/developer/agency role
const guard = [authMiddleware, requireRole('landlord', 'developer', 'agency')];

router.get('/dashboard', ...guard, getDashboard);
router.get('/tenants', ...guard, getTenants);
router.post('/leases', ...guard, createLease);
router.patch('/maintenance/:id', ...guard, respondToMaintenance);
router.get('/viewings', ...guard, getViewingRequests);
router.patch('/viewings/:id', ...guard, respondToViewing);
router.get('/leases', ...guard, getLandlordLeases);
router.patch('/leases/:id/sign', ...guard, signLeaseAsLandlord);

module.exports = router;
