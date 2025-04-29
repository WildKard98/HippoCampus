const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String },   // name shown to others
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    starredTerms: [
        {
            setId: { type: String, required: true },
            term: { type: String, required: true }
        }
    ],

    achievements: {
        type: [String], // 🏆 List of strings like ["Created 10 sets", "Golden Seahorse"]
        default: [],
    },

    userType: {
        type: String,
        enum: ["Normal", "Premium", "Admin"], // 👑 User levels
        default: "Normal",
    },

    userMajor: {
        type: String,
        default: "", // Example: "Biology", "Computer Science"
    },

    goldenSeahorse: {
        type: Number,
        default: 0, // 🎖️ Earned by completing tasks
    },

    platinumSeahorse: {
        type: Number,
        default: 0, // 🏅 Even rarer achievements
    },

    // 🖼️ Profile Info
    bio: { type: String, default: "" },
    profilePicture: { type: String, default: "" },

    // ✉️ Email Verification
    emailVerified: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now, // ⏰ Always good to track user creation time
    },
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);

