const express = require('express');
const Admin = require('../controllers/admin-controller');
const { check } = require('express-validator');
const adminUpload = require('../middleware/admin-upload')
const router = express.Router();

// Route for Service Provider signup with separate file upload for logo
router.post('/signup',adminUpload.single('image'), 
    [
      check('name').not().isEmpty(),
      check('email').normalizeEmail().isEmail(),
      check('password').isLength({ min: 6 }),
      check('phone').not().isEmpty().isLength(10)
    ],
    Admin.signupAdmin);

router.post('/login', Admin.loginAdmin);

router.get('/', Admin.getAllAdmin);
router.get('/:aid', Admin.getAdmin);

router.patch('/:aid', Admin.updateAdmin);
router.delete('/:aid', Admin.deleteAdmin);

module.exports = router;
