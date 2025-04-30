const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/schema", async (req, res) => {
    try {
        // Getting all table names
        const tablesQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`;
        const tables = await new Promise((resolve, reject) => {
            db.all(tablesQuery, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(r => r.name));
            });
        });

        // For each table, get its schema via PRAGMA
        const schemaPromises = tables.map(table => {
            return new Promise((resolve, reject) => {
                db.all(`PRAGMA table_info(${table})`, [], (err, columns) => {
                    if (err) reject(err);
                    else resolve({ table, columns });
                });
            });
        });

        const schemas = await Promise.all(schemaPromises);
        res.json(schemas);
    } catch (err) {
        console.error("Error fetching schema:", err);
        res.status(500).json({ error: "Failed to fetch schema" });
    }
});

module.exports = router;
