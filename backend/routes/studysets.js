const express = require('express');
const router = express.Router();

// Sample data
let studySets = [
  { id: 1, title: 'Biology Basics', terms: ['Cell', 'DNA', 'Evolution'] },
  { id: 2, title: 'Chemistry 101', terms: ['Atom', 'Molecule', 'Reaction'] },
];

// GET /api/studysets
router.get('/', (req, res) => {
  res.json(studySets);
});

// POST /api/studysets
router.post('/', (req, res) => {
  const newStudySet = {
    id: studySets.length + 1,
    title: req.body.title,
    terms: req.body.terms,
  };
  studySets.push(newStudySet);
  res.status(201).json(newStudySet);
});

module.exports = router;
