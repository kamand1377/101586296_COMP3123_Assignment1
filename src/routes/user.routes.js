const router = require('express').Router();
const { signupRules, loginRules } = require('../validators/user.validators');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/user.controller');

// Read left to right: rules -> gatekeeper -> controller
router.post('/signup', signupRules, validate, ctrl.signup);
router.post('/login', loginRules, validate, ctrl.login);

module.exports = router;