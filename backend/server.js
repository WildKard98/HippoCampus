const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoute = require('./routes/auth');
const studysetsRoute = require('./routes/studysets');
const generateSet = require('./routes/generateSet'); // (old spawn version ✅ keep for backup)
const aiRoute = require('./routes/ai'); // ⭐ New AI route
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/studysets', studysetsRoute);
app.use('/api/generateSet', generateSet); // (optional backup route)
app.use('/api/ai', aiRoute);          // ⭐ new clean AI API here

// Home Route
app.get('/', (req, res) => {
  res.send('🌱 WordNest backend is running!');
});

// Start the server
const PORT = process.env.PORT || 5001;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
