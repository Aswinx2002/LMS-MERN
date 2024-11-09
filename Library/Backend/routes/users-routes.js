const express = require('express');
const userController = require('../controllers/user-controller');
const { check } = require('express-validator');
const userUpload = require('../middleware/user-upload');  // Multer file upload middleware
const router = express.Router();

router.post(
  '/signup',
  userUpload.single('image'),  // Handle image upload
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
    check('phone').not().isEmpty().isLength(10)
  ],
  userController.signupUser
);

router.post('/login', userController.loginUser);

router.get('/:uid', userController.getUser);
router.get('/', userController.getAllUsers);

router.patch('/:uid', userController.updateUser);
router.delete('/:uid', userController.deleteUser);

module.exports = router;
