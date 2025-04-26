const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(400).json({ message: "Username already taken." });

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: "Email already in use." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        console.log("🔥 New user created:", newUser);

        const token = jwt.sign({ username: newUser.username }, 'secretkey');

        res.status(201).json({
            token,
            user: {
                username: newUser.username,
                email: newUser.email,
            }
        });

    } catch (err) {
        console.error("❌ Error during registration:", err);
        res.status(500).json({ message: "Something went wrong." });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ username: user.username }, 'secretkey');

        console.log("🔥 Logged-in user:", user);

        res.status(200).json({
            token,
            user: {
                username: user.username,
                email: user.email,
            }
        });

    } catch (err) {
        res.status(500).json({ error: 'Login failed.' });
    }
});

router.post('/check-availability', async (req, res) => {
    const { username, email } = req.body;
  
    try {
      if (username) {
        const user = await User.findOne({ username });
        if (user) return res.json({ usernameTaken: true });
      }
      if (email) {
        const user = await User.findOne({ email });
        if (user) return res.json({ emailTaken: true });
      }
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
  
module.exports = router;
