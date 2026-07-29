const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/leaderboard', async (req, res) => {
    try {
        // issues by category
        const [byCategory] = await db.query(
            `SELECT category, COUNT(*) AS total 
             FROM issues GROUP BY category`
        );

        // best departments
        const [byDepartment] = await db.query(
            `SELECT d.name, 
                COUNT(i.id) AS total,
                SUM(CASE WHEN i.status = 'Resolved' THEN 1 ELSE 0 END) AS resolved
             FROM issues i
             LEFT JOIN departments d ON i.department_id = d.id
             GROUP BY d.name`
        );

        // top citizens
        const [topCitizens] = await db.query(
            `SELECT u.full_name, COUNT(i.id) AS total_reported
             FROM issues i
             LEFT JOIN users u ON i.user_id = u.id
             GROUP BY u.full_name
             ORDER BY total_reported DESC
             LIMIT 5`
        );

        // city health score
        const [total] = await db.query('SELECT COUNT(*) AS total FROM issues');
        const [resolved] = await db.query('SELECT COUNT(*) AS resolved FROM issues WHERE status = "Resolved"');
        const healthScore = total[0].total > 0
            ? Math.round((resolved[0].resolved / total[0].total) * 100)
            : 0;

        res.status(200).json({
            health_score:  healthScore,
            by_category:   byCategory,
            by_department: byDepartment,
            top_citizens:  topCitizens
        });

    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;