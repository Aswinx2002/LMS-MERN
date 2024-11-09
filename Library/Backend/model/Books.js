const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: { type: String, required: true ,unique: true },
    author:{ type: String, required: true },
    genre:{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' },
    publication:{ type: String, required: true },
    description:{ type: String, required: true},
    price: { type: Number },
    rentalcost:{ type: Number },
    image: { type: String }, // URL or file path 
    addedOn:{type: Date, default: Date.now },
    updatedOn:{type: Date, default: Date.now }
});

module.exports = mongoose.model('Books', bookSchema);
