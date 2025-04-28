const express = require('express');
const router = express.Router();
const db = require('../db');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET;
// const EXPIRY = '30m';

router.post('/', (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }
    db.all(query, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
    console.log(`Executing query: ${query}`);
});

module.exports = router;