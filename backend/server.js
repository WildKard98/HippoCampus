const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoute = require('./routes/auth');
const studysetsRoute = require('./routes/studysets');

require('dotenv').config();


const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/auth', authRoute);
app.use('/api/studysets', studysetsRoute);

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
