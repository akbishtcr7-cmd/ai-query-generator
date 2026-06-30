const router = require('express').Router();
const {
  createSandbox, getSandboxes, getSandbox,
  addTable, simulateQuery, getTableData,
  resetVirtualData, deleteSandbox, updateSandboxPassword,
} = require('../controllers/sandboxController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/',            getSandboxes);
router.post('/',           createSandbox);
router.get('/:id',         getSandbox);
router.delete('/:id',      deleteSandbox);
router.post('/:id/table',          addTable);
router.post('/:id/simulate',       simulateQuery);
router.get('/:id/table/:tableName', getTableData);
router.post('/:id/reset',          resetVirtualData);
router.put('/:id/password',        updateSandboxPassword);

module.exports = router;
