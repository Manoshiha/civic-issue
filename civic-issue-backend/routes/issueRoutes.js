const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    createIssue,
    getAllIssues,
    getRecentIssues,
    getStats,
    getMyIssues,
    getIssueById,
    updateStatus,
    upvoteIssue,
    getDepartmentIssues
} = require('../controllers/issueController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

//  Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Public Routes
router.get('/all',    getAllIssues);
router.get('/recent', getRecentIssues);
router.get('/stats',  getStats);

// Protected citizen routes 
router.get('/my-issues',   verifyToken, getMyIssues);
router.post('/create',     verifyToken, upload.single('photo'), createIssue);
router.post('/:id/upvote', verifyToken, upvoteIssue);

//  Protected authority routes
router.get('/department',    verifyToken, authorizeRole('authority', 'admin'), getDepartmentIssues);
router.put('/update-status', verifyToken, authorizeRole('authority', 'admin'), updateStatus);

//  This MUST be last! 
router.get('/:id', getIssueById);

module.exports = router;