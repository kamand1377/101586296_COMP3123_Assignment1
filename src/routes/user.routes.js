const router = require('express').Router();
const { signupRules, loginRules } = require('../validators/user.validators');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/user.controller');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, signupRules, validate, ctrl.signup);
router.post('/login', authLimiter, loginRules, validate, ctrl.login);

module.exports = router;