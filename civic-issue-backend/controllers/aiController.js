// aiController.js
const classifyIssue = async (req, res) => {
    try {
        const { description } = req.body;
        const text = description.toLowerCase();

        let category = 'Other';
        let urgency = 'Medium';
        let department = 'General';
        let summary = '';

        // Category Detection 
        if (text.includes('pothole') || text.includes('road') || text.includes('pavement')) {
            category   = 'Pothole';
            department = 'Roads & Infrastructure';
        } else if (text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('dump')) {
            category   = 'Garbage';
            department = 'Waste Management';
        } else if (text.includes('light') || text.includes('lamp') || text.includes('dark') || text.includes('electricity')) {
            category   = 'Street Lighting';
            department = 'Street Lighting';
        } else if (text.includes('water') || text.includes('flood') || text.includes('drain') || text.includes('pipe') || text.includes('leak')) {
            category   = 'Water & Drainage';
            department = 'Water & Drainage';
        } else if (text.includes('vandal') || text.includes('graffiti') || text.includes('broken') || text.includes('damage')) {
            category   = 'Vandalism';
            department = 'Parks & Public Spaces';
        }

        //  Urgency Detection
        if (text.includes('urgent') || text.includes('critical') || text.includes('emergency') || text.includes('danger') || text.includes('accident')) {
            urgency = 'Critical';
        } else if (text.includes('serious') || text.includes('severe') || text.includes('major') || text.includes('bad')) {
            urgency = 'High';
        } else if (text.includes('minor') || text.includes('small') || text.includes('little')) {
            urgency = 'Low';
        }

        // Auto Summary 
        summary = `${urgency} priority ${category} issue reported. Assigned to ${department} department for resolution.`;

        res.status(200).json({
            category,
            urgency,
            department,
            summary
        });

    } catch (error) {
        console.error('AI classify error:', error);
        res.status(500).json({ message: 'Classification error' });
    }
};

module.exports = { classifyIssue };