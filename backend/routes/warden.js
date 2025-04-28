const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/warden/init
router.post('/init', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: 'Email is required' });
    }

    db.get(`SELECT * FROM Wardens WHERE email = ?`, [email], (err, warden) => {
        if (err || !warden) {
            return res.json({ success: false, message: 'Warden not found' });
        }

        const { hostel_id } = warden;

        db.serialize(() => {
            // Fetch Rooms under Warden
            db.all(`SELECT * FROM Rooms WHERE hostel_id = ?`, [hostel_id], (errRooms, rooms) => {
                if (errRooms) return res.json({ success: false, message: 'Error fetching rooms' });

                // Fetch Maintenance Requests for Students in Hostel from Complaints
                db.all(`SELECT c.* FROM Complaints c 
                          JOIN Students s ON c.student_id = s.student_id 
                            WHERE s.hostel_id = ?`, [hostel_id], (errMaint, maintenanceRequests) => {
                    if (errMaint) return res.json({ success: false, message: 'Error fetching maintenance requests' });

                    // Fetch Events
                    db.all(`SELECT e.* FROM Events e 
                              JOIN Events_R_Hostel er ON e.event_id = er.event_id 
                                WHERE er.hostel_id = ?`, [hostel_id], (errEvents, events) => {
                        if (errEvents) return res.json({ success: false, message: 'Error fetching events' });

                        res.json({
                            success: true,
                            rooms,
                            maintenanceRequests,
                            events
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
