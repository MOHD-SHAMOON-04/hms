const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Utility: Generate random 4-char base64 string
const generateWardenId = () => Buffer.from(crypto.randomBytes(3)).toString('base64').slice(0, 4);

// STUDENT SIGNUP
router.post('/student', async (req, res) => {
    const { student_id, username, email, password, phone_num } = req.body;
    const pass_hash = await bcrypt.hash(password, 10);
    const admn_date = new Date().toISOString().split('T')[0];

    db.run(
        `INSERT INTO Students (student_id, username, email, pass_hash, admn_date, phone_num)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [student_id, username, email, pass_hash, admn_date, phone_num],
        function (err) {
            if (err) return res.json({ success: false, message: 'Student already exists or invalid data.' });
            res.json({ success: true, message: 'Student registered successfully.' });
        }
    );
});

// WARDEN SIGNUP
router.post('/warden', async (req, res) => {
    const { username, email, password, phone_num } = req.body;
    const pass_hash = await bcrypt.hash(password, 10);
    const warden_id = generateWardenId();

    db.run(
        `INSERT INTO Wardens (warden_id, username, email, pass_hash, phone_num)
         VALUES (?, ?, ?, ?, ?)`,
        [warden_id, username, email, pass_hash, phone_num],
        function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    return res.json({ success: false, message: 'Warden with same email or phone number already exists.' });
                }
                return res.json({ success: false, message: 'Warden could not be registered.' });
            }
            res.json({ success: true, message: 'Warden registered successfully.' });
        }
    );
});


module.exports = router;
