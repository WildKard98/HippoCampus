const express = require('express');
const router = express.Router();
const StudySet = require('../models/StudySet');

// GET all study sets for a user (by username now)
router.get('/:username', async (req, res) => {
    try {
        const studySets = await StudySet.find({ username: req.params.username });
        res.json(studySets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch study sets' });
    }
});

// POST a new study set
router.post('/', async (req, res) => {
    try {
        const { username, title, description, terms } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required.' });
        }

        const newStudySet = new StudySet({
            username: username,
            title,
            description,
            terms,
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
        const updatedSet = await StudySet.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSet);
    } catch (error) {
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
