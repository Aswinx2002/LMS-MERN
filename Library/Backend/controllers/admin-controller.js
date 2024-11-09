const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const Admin = require('../model/Admin');
const Role = require('../model/Role');
const HttpError = require('../model/http-error');

// Register a new Admin
exports.signupAdmin = async (req, res, next) => {
    const { name, email, password, phone } = req.body;
    const image = req.file ? req.file.path : null;
    const isRole = "Admin"
  
    if (!image) {
      return next(new HttpError('No image provided.', 422));
    }
  
    try {
      // Check if Admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return next(new HttpError('Admin already exists, please check again.', 422));
      }
  
      // Hash password
      let hashedPassword;
      try {
        hashedPassword = await bcrypt.hash(password, 12);
      } catch (err) {
        return next(new HttpError('Password hashing failed, could not create Admin', 500));
      }
  
      // Normalize the image paths
      const imagePath = req.file.path.replace(/\\/g, '/');
  
      // Retrieve the role document based on the role name
      const AdminRole = await Role.findOne({ role: isRole });
      if (!AdminRole) {
        return next(new HttpError('Role not found, please provide a valid role.', 422));
      }
  
      // Create new Admin
      const createdAdmin = new Admin({
        name,
        phone,
        email,
        password: hashedPassword,
        isRole: AdminRole._id,
        image: `http://localhost:5000/${imagePath}`,
        books: [],
        genre: []
      });
  
      await createdAdmin.save();
  
      res.status(201).json({ Admin: createdAdmin.toObject({ getters: true }) });
    } catch (err) {
      console.error(err);
      return next(new HttpError('Signup failed, please try again.', 500));
    }
  };
  
  

// Login
exports.loginAdmin = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body); // Check the request body

  try {
    // Check if exists
    const existingAdmin = await Admin.findOne({ email }).populate('isRole');
    if (!existingAdmin) {
      return next(new HttpError('Invalid credentials, could not log you in.', 401));
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, existingAdmin.password);
    if (!isValidPassword) {
      return next(new HttpError('Invalid credentials, could not log you in.', 401));
    }

    // Update lastLogin to current date and time
    existingAdmin.lastLogin = Date.now(); // Update lastLogin field
    await existingAdmin.save(); // Save the updated Admin document

    res.status(200).json({
      message: 'Logged In Successfully',
      Admin: existingAdmin.toObject({ getters: true })
    });
  } catch (err) {
    console.log(err);
    return next(new HttpError('Logging in failed, please try again.', 500));
  }
};


// Get all Admin
exports.getAllAdmin = async (req, res, next) => {
  try {
    const Admins = await Admin.find({}, '-password').populate('isRole','role').populate('books').populate('genre');
    // Exclude password field for security

    if (!Admins || Admins.length === 0) {
      return next(new HttpError('No Admin found.', 404));
    }

    res.status(200).json({
        Admins: Admins.map(Admin => Admin.toObject({ getters: true }))
    });
  } catch (err) {
    return next(new HttpError('Fetching Admins failed, please try again later.', 500));
  }
};


// Get Admin
exports.getAdmin = async (req, res, next) => {
  const Id = req.params.aid;

  try {
    const admin = await Admin.findById(Id).populate('isRole','role').populate('books').populate('genre');
    if (!admin) {
      return next(new HttpError('Admin not found.', 404));
    }
    res.json({ Admin : admin.toObject({ getters: true }) });
  } catch (err) {
    console.log(err)
    return next(new HttpError('Fetching Admin failed, please try again later.', 500));
  }
};


// Update Admin details
exports.updateAdmin = async (req, res, next) => {
  const aid = req.params.aid;
  const { name, phone } = req.body;

  console.log(req.body) // returns null in form data

  try {
    const setAdmin = await Admin.findById(aid);
    if (!setAdmin) {
      return next(new HttpError('Admin not found.', 404));
    }

    setAdmin.name = name || setAdmin.name;
    setAdmin.phone = phone || setAdmin.phone;
    await setAdmin.save();

    res.status(200).json({ Admin: setAdmin.toObject({ getters: true }) });
  } catch (err) {
    console.log(err)
    return next(new HttpError('Updating Admin failed, please try again later.', 500));
  }
};


// Delete Admin details
exports.deleteAdmin = async (req, res, next) => {
  const aid = req.params.aid;

  try {
    const admin = await Admin.findById(aid).populate('books').populate('genre');
    if (!admin) {
      return next(new HttpError('Admin not found.', 404));
    }

    // Delete the Admin image from the filesystem
    if (admin.image) {
    // Extract the relative path from the URL
    const imagePath = admin.image.replace(/^http:\/\/localhost:5000/, ''); // This gets the relative path

    // Construct the absolute path
    const absolutePath = path.join('images', '..', imagePath); 

    fs.unlink(absolutePath, (err) => {
        if (err) {
        console.error('Failed to delete image:', err);
        }
    });
    }

    await Admin.deleteOne();

    res.status(200).json({ message: 'Admin deleted successfully.' });
  } catch (err) {
    console.log(err)
    return next(new HttpError('Deleting Admin failed, please try again later.', 500));
  }
};