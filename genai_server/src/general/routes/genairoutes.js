const express = require('express');
const { processPrompt } = require('../controllers/genaicontroller');

const router = express.Router();

// POST route to process a prompt
router.post('/prompt', processPrompt);

module.exports = router;
