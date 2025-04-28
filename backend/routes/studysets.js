const express = require('express');
const router = express.Router();
const StudySet = require('../models/StudySet');

// GET all public study sets
router.get('/public', async (req, res) => {
    try {
        console.log("🔵 Fetching all PUBLIC study sets...");

        const publicSets = await StudySet.find({ isPrivate: "Public" });

        console.log(`🟢 Found ${publicSets.length} public set(s)`);
        console.log("🧩 Public sets found:", publicSets);

        res.json(publicSets);
    } catch (error) {
        console.error("❌ Failed to fetch public study sets:", error);
        res.status(500).json({ error: 'Failed to fetch public study sets' });
    }
});
// GET all study sets for a user (by username now)
router.get('/:username', async (req, res) => {
    try {
        console.log("🔵 Incoming request to fetch study sets for username:", req.params.username);

        const studySets = await StudySet.find({ username: req.params.username });

        console.log(`🟢 Found ${studySets.length} study set(s) for username: ${req.params.username}`);
        console.log("🧩 Study sets found:", studySets);

        res.json(studySets);
    } catch (error) {
        console.error("❌ Failed to fetch study sets for username:", req.params.username, error);
        res.status(500).json({ error: 'Failed to fetch study sets' });
    }
});


// POST a new study set
router.post('/', async (req, res) => {
    try {
        const { username, title, description, terms, isPrivate } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required.' });
        }

        const newStudySet = new StudySet({
            username,
            title,
            description,
            terms,
            isPrivate,
        });

        const savedStudySet = await newStudySet.save();
        res.status(201).json(savedStudySet);
    } catch (error) {
        console.error('Failed to create study set:', error);
        res.status(500).json({ error: 'Failed to create study set' });
    }
});

// PUT update a study set
router.put('/:id', async (req, res) => {
    try {
        const { isPrivate } = req.body;
        console.log("🔧 Updating isPrivate to:", isPrivate); // Good debug line

        // ✅ Use ONLY ONE: findByIdAndUpdate
        const updatedSet = await StudySet.findByIdAndUpdate(
            req.params.id,
            { isPrivate: isPrivate },
            { new: true }
        );

        console.log("✅ Updated set:", updatedSet);

        res.json(updatedSet);
    } catch (error) {
        console.error("❌ Update failed:", error);
        res.status(500).json({ error: 'Failed to update study set' });
    }
});


// DELETE a study set
router.delete('/:id', async (req, res) => {
    try {
        await StudySet.findByIdAndDelete(req.params.id);
        res.json({ message: 'Study set deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete study set' });
    }
});





module.exports = router;


//res.json(publicSets); // Send the public sets as a response