const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
    try {
      console.log("📥 Register body:", req.body); // <-- Add this line
  
      const { username, email, password } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "Email already in use." });
  
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
  
      const newUser = new User({ username, email, password: hashed });
      await newUser.save();
  
      res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
      console.error("❌ Error during registration:", err); // <-- Add this line
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

    // Create JWT
    const token = jwt.sign({ userId: user._id }, 'secretkey'); // Replace 'secretkey' with a .env secret later

    res.status(200).json({ token, user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

module.exports = router;
