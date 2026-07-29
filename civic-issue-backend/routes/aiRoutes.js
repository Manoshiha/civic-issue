const express = require('express');
const router = express.Router();
const { classifyIssue } = require('../controllers/aiController');

router.post('/classify', classifyIssue);

module.exports = router;