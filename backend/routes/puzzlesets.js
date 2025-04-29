const express = require('express');
const router = express.Router();
const PuzzleSet = require('../models/PuzzleSet');

// GET all public puzzle sets
router.get('/public', async (req, res) => {
    try {
        const publicSets = await PuzzleSet.find({ isPrivate: "Public" });
        res.json(publicSets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch public Puzzle sets' });
    }
});
// GET all Puzzle sets for a user (by username now)
router.get('/:username', async (req, res) => {
    try {
        const puzzleSets = await PuzzleSet.find({ username: req.params.username });
        res.json(puzzleSets);
    } catch (error) {
        console.error("❌ Failed to fetch Puzzle sets for username:", req.params.username, error);
        res.status(500).json({ error: 'Failed to fetch Puzzle sets' });
    }
});


// POST a new Puzzle set
router.post('/', async (req, res) => {
    try {
        const { username, title, description, terms, isPrivate } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required.' });
        }
        const newPuzzleSet = new PuzzleSet({
            username,
            title,
            description,
            terms,
            isPrivate,
        });

        const savedPuzzleSet = await newPuzzleSet.save();
        res.status(201).json(savedPuzzleSet);
    } catch (error) {
        console.error('Failed to create Puzzle set:', error);
        res.status(500).json({ error: 'Failed to create Puzzle set' });
    }
});

// Toggle like/unlike for a Puzzle set
router.put('/:id/like', async (req, res) => {
    const { username } = req.body; // Who is liking (passed from frontend)
    try {
        const puzzleSet = await PuzzleSet.findById(req.params.id);

        if (!puzzleSet) {
            return res.status(404).json({ error: 'Puzzle set not found' });
        }

        if (puzzleSet.likes.includes(username)) {
            // If already liked, remove like (unlike)
            puzzleSet.likes = puzzleSet.likes.filter(user => user !== username);
        } else {
            // If not liked yet, add like
            puzzleSet.likes.push(username);
        }

        await puzzleSet.save();
        res.json(puzzleSet);  // Send back the updated Puzzle set
    } catch (error) {
        console.error("❌ Failed to like/unlike set:", error);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
});


// PUT update a puzzle set
router.put('/:id', async (req, res) => {
    try {
        const { title, description, terms, isPrivate } = req.body;
        console.log("🔧 Updating Puzzle set:", req.body);

        const updatedSet = await PuzzleSet.findByIdAndUpdate(
            req.params.id,
            { title, description, terms, isPrivate },
            { new: true }
        );
        console.log("✅ Updated set:", updatedSet);
        res.json(updatedSet);
    } catch (error) {
        console.error("❌ Update failed:", error);
        res.status(500).json({ error: 'Failed to update Puzzle set' });
    }
});



// DELETE a Puzzle set
router.delete('/:id', async (req, res) => {
    try {
        await PuzzleSet.findByIdAndDelete(req.params.id);
        res.json({ message: 'Puzzle set deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete Puzzle set' });
    }
});


module.exports = router;
