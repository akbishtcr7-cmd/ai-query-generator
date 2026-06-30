const router = require('express').Router();
const { getPendingQueries, reviewQuery, getAuditLogs, getAllUsers, updateUserRole, toggleUserStatus, getAdminStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin, isSuperAdmin } = require('../middleware/roleMiddleware');

router.use(protect, isAdmin);
router.get('/stats', getAdminStats);
router.get('/pending', getPendingQueries);
router.put('/pending/:id/review', reviewQuery);
router.get('/audit-logs', getAuditLogs);
router.get('/users', getAllUsers);
router.put('/users/:id/role', isSuperAdmin, updateUserRole);
router.put('/users/:id/toggle', toggleUserStatus);

module.exports = router;
