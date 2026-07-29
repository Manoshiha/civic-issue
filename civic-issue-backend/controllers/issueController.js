const db = require('../config/db');
const path = require('path');

// CREATE NEW ISSUE

const createIssue = async (req, res) => {
    try {
        const { title, description, category, urgency, lat, lng, location_address, ai_summary } = req.body;
        const user_id = req.user.id;

        // photo upload handling
        const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

        // find department based on category
        const categoryDeptMap = {
            'Pothole':          'Roads & Infrastructure',
            'Garbage':          'Waste Management',
            'Street Lighting':  'Street Lighting',
            'Water & Drainage': 'Water & Drainage',
            'Vandalism':        'Parks & Public Spaces',
            'Other':            'General'
        };

        const deptName = categoryDeptMap[category] || 'General';
        const [depts] = await db.query(
            'SELECT id FROM departments WHERE name = ?',
            [deptName]
        );
        const department_id = depts.length > 0 ? depts[0].id : null;

        // insert issue
        const [result] = await db.query(
            `INSERT INTO issues 
            (ticket_number, user_id, title, description, category, urgency, lat, lng, location_address, photo_url, department_id, ai_summary)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'TEMP',
                user_id,
                title,
                description,
                category,
                urgency || 'Medium',
                lat || null,
                lng || null,
                location_address || null,
                photo_url,
                department_id,
                ai_summary || null
            ]
        );

        // update ticket number after insert
        const ticketNumber = `CIV-${String(result.insertId).padStart(5, '0')}`;
        await db.query(
            'UPDATE issues SET ticket_number = ? WHERE id = ?',
            [ticketNumber, result.insertId]
        );

        res.status(201).json({
            message: '✅ Issue reported successfully!',
            issue_id: result.insertId,
            ticket_number: ticketNumber
        });

    } catch (error) {
        console.error('Create issue error:', error);
        res.status(500).json({ message: 'Server error while creating issue' });
    }
};

// GET ALL ISSUES (for live map)
const getAllIssues = async (req, res) => {
    try {
        const [issues] = await db.query(
            `SELECT 
                i.id, i.ticket_number, i.title, i.category,
                i.status, i.urgency, i.lat, i.lng,
                i.location_address, i.photo_url, i.upvote_count,
                i.created_at, d.name AS department_name
            FROM issues i
            LEFT JOIN departments d ON i.department_id = d.id
            ORDER BY i.created_at DESC`
        );

        res.status(200).json({ issues });

    } catch (error) {
        console.error('Get all issues error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET RECENT ISSUES (for landing page)
const getRecentIssues = async (req, res) => {
    try {
        const [issues] = await db.query(
            `SELECT 
                i.id, i.ticket_number, i.title, i.category,
                i.status, i.urgency, i.location_address,
                i.upvote_count, i.created_at
            FROM issues i
            ORDER BY i.created_at DESC
            LIMIT 5`
        );

        res.status(200).json({ issues });

    } catch (error) {
        console.error('Get recent issues error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// GET STATS (for landing page counters)

const getStats = async (req, res) => {
    try {
        const [total] = await db.query(
            'SELECT COUNT(*) AS total FROM issues'
        );
        const [resolved] = await db.query(
            'SELECT COUNT(*) AS resolved FROM issues WHERE status = "Resolved"'
        );
        const [inProgress] = await db.query(
            'SELECT COUNT(*) AS in_progress FROM issues WHERE status = "In Progress"'
        );
        const [open] = await db.query(
            'SELECT COUNT(*) AS open FROM issues WHERE status = "Open"'
        );

        res.status(200).json({
            total:       total[0].total,
            resolved:    resolved[0].resolved,
            in_progress: inProgress[0].in_progress,
            open:        open[0].open
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET MY ISSUES (citizen dashboard)
const getMyIssues = async (req, res) => {
    try {
        const user_id = req.user.id;

        const [issues] = await db.query(
            `SELECT 
                i.id, i.ticket_number, i.title, i.category,
                i.status, i.urgency, i.created_at,
                d.name AS department_name
            FROM issues i
            LEFT JOIN departments d ON i.department_id = d.id
            WHERE i.user_id = ?
            ORDER BY i.created_at DESC`,
            [user_id]
        );

        res.status(200).json({ issues });

    } catch (error) {
        console.error('My issues error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET SINGLE ISSUE BY ID (issue detail page)

const getIssueById = async (req, res) => {
    try {
        const { id } = req.params;

        const [issues] = await db.query(
            `SELECT 
                i.*, 
                u.full_name AS reported_by,
                d.name AS department_name
            FROM issues i
            LEFT JOIN users u ON i.user_id = u.id
            LEFT JOIN departments d ON i.department_id = d.id
            WHERE i.id = ?`,
            [id]
        );

        if (issues.length === 0) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        // get status history
        const [history] = await db.query(
            `SELECT 
                sh.old_status, sh.new_status,
                sh.official_response, sh.changed_at,
                u.full_name AS changed_by
            FROM status_history sh
            LEFT JOIN users u ON sh.changed_by = u.id
            WHERE sh.issue_id = ?
            ORDER BY sh.changed_at ASC`,
            [id]
        );

        res.status(200).json({
            issue:   issues[0],
            history: history
        });

    } catch (error) {
        console.error('Get issue by id error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// UPDATE ISSUE STATUS (authority dashboard)

const updateStatus = async (req, res) => {
    try {
        const { issue_id, new_status, official_response } = req.body;
        const changed_by = req.user.id;

        // get current status first
        const [issues] = await db.query(
            'SELECT status FROM issues WHERE id = ?',
            [issue_id]
        );

        if (issues.length === 0) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        const old_status = issues[0].status;

        // update issue status
        await db.query(
            'UPDATE issues SET status = ? WHERE id = ?',
            [new_status, issue_id]
        );

        // save to status history
        await db.query(
            `INSERT INTO status_history 
            (issue_id, changed_by, old_status, new_status, official_response)
            VALUES (?, ?, ?, ?, ?)`,
            [issue_id, changed_by, old_status, new_status, official_response || null]
        );

        res.status(200).json({
            message: `✅ Status updated to ${new_status}`,
            old_status,
            new_status
        });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// UPVOTE ISSUE
const upvoteIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // check if already upvoted
        const [existing] = await db.query(
            'SELECT id FROM upvotes WHERE issue_id = ? AND user_id = ?',
            [id, user_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Already upvoted this issue' });
        }

        // add upvote
        await db.query(
            'INSERT INTO upvotes (issue_id, user_id) VALUES (?, ?)',
            [id, user_id]
        );

        // increment count
        await db.query(
            'UPDATE issues SET upvote_count = upvote_count + 1 WHERE id = ?',
            [id]
        );

        res.status(200).json({ message: '✅ Upvoted successfully!' });

    } catch (error) {
        console.error('Upvote error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET DEPARTMENT ISSUES (authority dashboard)
const getDepartmentIssues = async (req, res) => {
    try {
        const department_id = req.user.department_id;

        const [issues] = await db.query(
            `SELECT 
                i.id, i.ticket_number, i.title, i.category,
                i.status, i.urgency, i.upvote_count, i.created_at,
                u.full_name AS reported_by
            FROM issues i
            LEFT JOIN users u ON i.user_id = u.id
            WHERE i.department_id = ?
            ORDER BY 
                FIELD(i.urgency, 'Critical', 'High', 'Medium', 'Low'),
                i.upvote_count DESC`,
            [department_id]
        );

        res.status(200).json({ issues });

    } catch (error) {
        console.error('Department issues error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createIssue,
    getAllIssues,
    getRecentIssues,
    getStats,
    getMyIssues,
    getIssueById,
    updateStatus,
    upvoteIssue,
    getDepartmentIssues
};