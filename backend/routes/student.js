const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/student/init
router.post('/init', (req, res) => {
    const { student_id } = req.body;

    if (!student_id) {
        return res.json({ success: false, message: 'Student ID is required' });
    }

    db.get(`SELECT * FROM Students WHERE student_id = ?`, [student_id], (err, student) => {
        if (err || !student) {
            return res.json({ success: false, message: 'Student not found' });
        }

        const { room_id, hostel_id } = student;

        db.serialize(() => {
            // Fetch Room Details
            db.get(`SELECT * FROM Rooms WHERE room_id = ?`, [room_id], (errRoom, roomDetails) => {
                if (errRoom) return res.json({ success: false, message: 'Error fetching room details' });

                // Fetch Maintainance Requests -- from table Complaints
                db.all(`SELECT * FROM Complaints WHERE student_id = ?`, [student_id], (errMaint, maintenanceRequests) => {
                    if (errMaint) return res.json({ success: false, message: 'Error fetching maintenance requests' });

                    // Fetch Events for Hostel
                    db.all(`SELECT e.* FROM Events e 
                              JOIN Events_R_Hostel er ON e.event_id = er.event_id 
                                WHERE er.hostel_id = ?`, [hostel_id], (errEvents, events) => {
                        if (errEvents) return res.json({ success: false, message: 'Error fetching events' });

                        res.json({
                            success: true,
                            roomDetails,
                            maintenanceRequests,
                            events
                        });
                    });
                });
            });
        });
    });
});

// STUDENT - Create a Maintenance Request
router.post('/maintenance', (req, res) => {
    const { complaint_id, student_id, title, description, created_date } = req.body;

    if (!complaint_id || !student_id || !title || !description || !created_date) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const query = `
        INSERT INTO Complaints (complaint_id, title, description, student_id, created_date)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [complaint_id, title, description, student_id, created_date], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'Failed to create complaint.' });
        }

        res.json({
            complaint_id,
            student_id,
            title,
            description,
            created_date
        });
    });
});

module.exports = router;
