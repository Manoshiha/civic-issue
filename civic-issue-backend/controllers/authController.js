const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER

const register = async (req, res) => {
    try {
        const { full_name, email, password, role, department_id } = req.body;

        // 1. Check all fields exist
        if (!full_name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // 2. Check if email already exists
        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Insert into database
        const [result] = await db.query(
            'INSERT INTO users (full_name, email, password, role, department_id) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, role, department_id || null]
        );

        // 5. Return success
        res.status(201).json({
            message: '✅ Registration successful!',
            user_id: result.insertId
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check fields exist
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        // 2. Find user in database
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = users[0];

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            {
                id:            user.id,
                role:          user.role,
                department_id: user.department_id
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Return token + role (React uses role to redirect)
        res.status(200).json({
            message: '✅ Login successful!',
            token,
            user: {
                id:            user.id,
                full_name:     user.full_name,
                email:         user.email,
                role:          user.role,
                department_id: user.department_id
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};


// GET PROFILE (protected route)

const getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, full_name, email, role, department_id, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user: users[0] });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, getProfile };