const Payment = require('../model/Payment'); // Adjust the path as necessary
const User = require('../model/User'); // Adjust the path as necessary
const Books = require('../model/Books'); // Adjust the path as necessary
const HttpError = require('../model/http-error'); // Adjust the path as necessary

// Create a new payment with user and book checks
exports.createPayment = async (req, res, next) => {
    const { user, book, amount, paymentMethod, status } = req.body;

    try {
        // Check if user exists
        const existingUser = await User.findById(user);
        if (!existingUser) {
            return next(new HttpError('User not found', 404));
        }

        // Check if book exists
        const existingBook = await Books.findById(book);
        if (!existingBook) {
            return next(new HttpError('Book not found', 404));
        }

        // Create new payment
        const payment = new Payment({
            user,
            book,
            amount,
            paymentMethod,
            status
        });

        await payment.save();
        res.status(201).json(payment);
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};

// Get all payments
exports.getAllPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find().populate('user book');

        const existingPayments = await Payment.find();
        if (!existingPayments || existingPayments.length === 0 ) {
            return next(new HttpError('Payments not found', 404));
        }

        res.status(200).json(payments);
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};

// Confirm a payment
exports.confirmPayment = async (req, res, next) => {
    const { id } = req.params;

    try {
        const payment = await Payment.findById(id);
        if (!payment) {
            return next(new HttpError('Payment not found', 404));
        }

        // Update the status to 'Paid'
        payment.status = 'Paid';
        await payment.save();
        
        res.status(200).json({ message: 'Payment confirmed successfully', payment });
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};

// Delete a payment
exports.deletePayment = async (req, res, next) => {
    const { id } = req.params;

    try {
        const payment = await Payment.findByIdAndDelete(id);
        if (!payment) {
            return next(new HttpError('Payment not found', 404));
        }
        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};