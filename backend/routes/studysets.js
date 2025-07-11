const express = require('express');
const router = express.Router();
const StudySet = require('../models/StudySet');
const User = require('../models/User')

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
        const { title, description, terms, isPrivate } = req.body;
        console.log("🔧 Updating study set:", req.body);

        const updatedSet = await StudySet.findByIdAndUpdate(
            req.params.id,
            { title, description, terms, isPrivate },
            { new: true }
        );
        console.log("✅ Updated set:", updatedSet);
        res.json(updatedSet);
    } catch (error) {
        console.error("❌ Update failed:", error);
        res.status(500).json({ error: 'Failed to update study set' });
    }
});



// DELETE a study set and clean up starred terms
router.delete('/:id', async (req, res) => {
    try {
        const setId = req.params.id;

        // 1. Delete the set
        await StudySet.findByIdAndDelete(setId);

        // 2. Remove all starred terms pointing to this set
        await User.updateMany(
            {},
            { $pull: { starredTerms: { setId } } }
        );

        res.json({ message: "Study set and related starred terms removed." });
    } catch (error) {
        console.error("❌ Failed to delete study set:", error);
        res.status(500).json({ error: "Failed to delete study set." });
    }
});


module.exports = router;
