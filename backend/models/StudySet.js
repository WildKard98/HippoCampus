const mongoose = require('mongoose');

const StudySetSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    terms: [
        {
            term: { type: String, required: true },
            definition: { type: String, required: true },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isPrivate: {
        type: String,
        required: true,
    },
    likes: {
        type: [String], 
        default: []
    }
    
}, { timestamps: true });

module.exports = mongoose.model('StudySet', StudySetSchema);
