const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    image: { type: String },
    isRole: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    
    createdOn:{type: Date, default: Date.now },
    lastLogin:{type: Date, default: Date.now },

    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Books' }],
    genre: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }]
});

module.exports = mongoose.model('Admin', adminSchema);
