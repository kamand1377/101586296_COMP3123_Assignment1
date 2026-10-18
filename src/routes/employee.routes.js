const router = require('express').Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators/employee.validators');
const ctrl = require('../controllers/employee.controller');

router.use(auth); // every route below needs a valid JWT

router.get('/employees', ctrl.list);
router.post('/employees', v.createEmployeeRules, validate, ctrl.create);
router.get('/employees/:eid', v.eidParamRule, validate, ctrl.getOne);
router.put('/employees/:eid', v.eidParamRule, v.updateEmployeeRules, validate, ctrl.update);
router.delete('/employees', v.eidQueryRule, validate, ctrl.remove);

module.exports = router;