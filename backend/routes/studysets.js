const express = require('express');
const router = express.Router();
const StudySet = require('../models/StudySet');

// GET all public study sets
router.get('/public', async (req, res) => {
    try {
        const publicSets = await StudySet.find({ isPrivate: "Public" });
        res.json(publicSets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch public study sets' });
    }
});
// GET all study sets for a user (by username now)
router.get('/:username', async (req, res) => {
    try {
        const studySets = await StudySet.find({ username: req.params.username });
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

// Toggle like/unlike for a study set
router.put('/:id/like', async (req, res) => {
    const { username } = req.body; // Who is liking (passed from frontend)
    try {
        const studySet = await StudySet.findById(req.params.id);

        if (!studySet) {
            return res.status(404).json({ error: 'Study set not found' });
        }

        if (studySet.likes.includes(username)) {
            // If already liked, remove like (unlike)
            studySet.likes = studySet.likes.filter(user => user !== username);
        } else {
            // If not liked yet, add like
            studySet.likes.push(username);
        }

        await studySet.save();
        res.json(studySet);  // Send back the updated study set
    } catch (error) {
        console.error("❌ Failed to like/unlike set:", error);
        res.status(500).json({ error: 'Failed to toggle like' });
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
