const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('../model/User');
const Role = require('../model/Role');
const HttpError = require('../model/http-error');


// Register a new user
exports.signupUser = async (req, res, next) => {
  const { name, email, password, phone,  } = req.body;
  const isRole = "User"

  const image = req.file ? req.file.path : null;
  if (!image) {
    return next(new HttpError('No image provided.', 422));
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new HttpError('User already exists, please check again.', 422));
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      return next(new HttpError('Password Hashing Failed, Could Not Create User', 500));
    }

    // Normalize the image path separator
    const imagePath = req.file.path.replace(/\\/g, '/');

    // Retrieve the role document based on the role name
    const userRole = await Role.findOne({ role: isRole });
    if (!userRole) {
      return next(new HttpError('Role not found, please provide a valid role.', 422));
    }
    // remember role is taken as name id is automatically addedd

    // Log role details to check if the role was found
    console.log("User Role Found:", userRole);

    // Create new user
    const createdUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      isRole: userRole._id,  // Set the role ID here
      image: `http://localhost:5000/${imagePath}`,
      rentedbooks: [],
      rentedhistory: [],
      payments: []
    });

    await createdUser.save();

    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
  } catch (err) {
    console.log(err);
    return next(new HttpError('Signup failed, please try again.', 500));
  }
};
// cant be given in raw because of image field


// Login a user
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  console.log(req.body); // Check the request body

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email }).populate('isRole');
    if (!existingUser) {
      return next(new HttpError('Invalid credentials, could not log you in(Email).', 401));
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
      return next(new HttpError('Invalid credentials, could not log you in(Password).', 401));
    }

    // Update lastLogin to current date and time
    existingUser.lastLogin = Date.now(); // Update lastLogin field
    await existingUser.save(); // Save the updated user document

    console.log("Logged In")
    console.log(isValidPassword)

    res.status(200).json({
      message: 'Logged In Successfully',
      user: existingUser.toObject({ getters: true })
    });
  } catch (err) {
    console.log(err);
    return next(new HttpError('Logging in failed, please try again.', 500));
  }
};

// Get user details by ID
exports.getUser = async (req, res, next) => {
  const userId = req.params.uid;

  try {
    const user = await User.findById(userId).populate('rentedbooks').populate('isRole','role');
    if (!user) {
      return next(new HttpError('User not found.', 404));
    }
    res.json({ user: user.toObject({ getters: true }) });
  } catch (err) {
    console.log(err)
    return next(new HttpError('Fetching user failed, please try again later.', 500));
  }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, '-password').populate('isRole','role'); // Exclude password field for security

    if (!users || users.length === 0) {
      return next(new HttpError('No users found.', 404));
    }

    res.status(200).json({
      users: users.map(user => user.toObject({ getters: true }))
    });
  } catch (err) {
    return next(new HttpError('Fetching users failed, please try again later.', 500));
  }
};

exports.updateUser = async (req, res, next) => {
  const userId = req.params.uid;
  const { name, phone } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new HttpError('User not found.', 404));
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    await user.save();

    // Fetch complete user data with populated books if available
    const updatedUser = await User.findById(userId).populate('rentedbooks'); // Assuming books is a populated field

    res.status(200).json({ user: updatedUser.toObject({ getters: true }) });
  } catch (err) {
    return next(new HttpError('Updating user failed, please try again later.', 500));
  }
};



// Delete user details
exports.deleteUser = async (req, res, next) => {
  const userId = req.params.uid;

  try {
    const user = await User.findById(userId).populate('rentedbooks');
    if (!user) {
      return next(new HttpError('User not found.', 404));
    }

    // Delete the user profile image from the filesystem
    if (user.image) {
      // Extract the relative path from the URL
      const imagePath = user.image.replace(/^http:\/\/localhost:5000/, ''); // This gets the relative path

      // Construct the absolute path
      const absolutePath = path.join('images', '..', imagePath); 

      fs.unlink(absolutePath, (err) => {
        if (err) {
          console.error('Failed to delete image:', err);
        }
      });
    }

    await user.deleteOne();

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (err) {
    return next(new HttpError('Deleting user failed, please try again later.', 500));
  }
};
