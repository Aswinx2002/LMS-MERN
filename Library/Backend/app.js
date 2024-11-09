const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const HttpError = require('./model/http-error');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

const roleRoutes = require('./routes/role-routes');
const userRoutes = require('./routes/users-routes');
const adminRoutes = require('./routes/admin-routes')
const genreRoutes = require('./routes/genre-routes');
const bookRoutes = require('./routes/book-routes');
const paymentRoutes = require('./routes/payment-routes');



// Middleware to parse JSON data
app.use(bodyParser.json());

// Serve static files (uploaded images)
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

// CORS policy handling
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
    );
    next();
});

// API Routes

app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/genre', genreRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/payment', paymentRoutes);


// Middleware for handling unimplemented routes
app.use((req, res, next) => {
    const error = new HttpError('Could not find the page you were looking for :(', 404);
    throw error;
});

// Error handling middleware
app.use((err, req, res, next) => {
    // Delete uploaded files if there was an error
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }

    // If the response is already sent, pass the error to the next middleware
    if (res.headerSent) {
        return next(err);
    }
    res.status(err.code || 500);
    res.json({ message: err.message || 'An unknown error occurred!' });
});

// MongoDB connection
mongoose.connect('mongodb+srv://aswinajith277:aswin2002@faith.uhkmz.mongodb.net/MachineTest?retryWrites=true&w=majority&appName=Faith')
    .then(() => {
        app.listen(5000, () => {
            console.log('Server is running on port 5000');
        });
    })
    .catch(err => {
        console.log(err);
    });


    