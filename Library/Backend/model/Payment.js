const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Books' },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ['Card', 'UPI', 'Net Banking'], required: true },
    status: { type: String, enum: ['Paid', 'Pending','Cancelled'], default: 'Pending' }
});

module.exports = mongoose.model('Payment', paymentSchema);
