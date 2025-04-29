const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoute = require('./routes/auth');
const studysetsRoute = require('./routes/studysets');
const generateSet = require('./routes/generateSet'); // (old spawn version ✅ keep for backup)
const aiRoute = require('./routes/ai'); // ⭐ New AI route
const puzzleSetRoutes = require('./routes/puzzlesets');
const app = express();

require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/studysets', studysetsRoute);
app.use('/api/generateSet', generateSet); // (optional backup route)
app.use('/api/ai', aiRoute);          // ⭐ new clean AI API here
app.use('/api/puzzlesets', puzzleSetRoutes);

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
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server listening on port ${PORT}`);
        });

    })
    .catch((err) => console.error('❌ MongoDB connection error:', err));
