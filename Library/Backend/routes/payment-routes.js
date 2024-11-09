const express = require('express');
const paymentController = require('../controllers/payment-controller'); // Adjust the path as necessary

const router = express.Router();

// Create a new payment
router.post('/', paymentController.createPayment);

// confirm payment by ID
router.patch('/:id', paymentController.confirmPayment);

// Get all payments
router.get('/', paymentController.getAllPayments);

// Delete a payment
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
