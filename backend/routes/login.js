const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRY = '30m';

// STUDENT LOGIN
router.post('/student', (req, res) => {
    const { student_id, password } = req.body;

    db.get(`SELECT * FROM Students WHERE student_id = ?`, [student_id], async (err, user) => {
        if (err || !user) return res.json({ success: false, message: 'Invalid ID' });

        const match = await bcrypt.compare(password, user.pass_hash);
        if (!match) return res.json({ success: false, message: 'Invalid password' });

        const token = jwt.sign(
            {
                name: user.username,
                roomNumber: user.room_id,
                role: 'student'
            },
            JWT_SECRET,
            { expiresIn: EXPIRY }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
        });
    });
});

// WARDEN LOGIN
router.post('/warden', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM Wardens WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) return res.json({ success: false, message: 'Invalid email' });

        const match = await bcrypt.compare(password, user.pass_hash);
        if (!match) return res.json({ success: false, message: 'Invalid password' });

        const token = jwt.sign(
            {
                name: user.username,
                role: 'warden'
            },
            JWT_SECRET,
            { expiresIn: EXPIRY }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
        });
    });
});

module.exports = router;
