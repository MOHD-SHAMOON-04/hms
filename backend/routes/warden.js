const express = require('express');
const router = express.Router();
const db = require('../db');

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
            // Fetch Rooms under Warden along with number of students in each room
            db.all(`
                SELECT 
                    r.*, 
                    (SELECT COUNT(*) FROM Students s WHERE s.room_id = r.room_id) AS student_count
                FROM Rooms r
                WHERE r.hostel_id = ?
            `, [hostel_id], (errRooms, rooms) => {
                if (errRooms) return res.json({ success: false, message: 'Error fetching rooms' });

                // Fetch Maintenance Requests for Students in Hostel from Complaints
                db.all(`
                    SELECT c.* 
                    FROM Complaints c 
                    JOIN Students s ON c.student_id = s.student_id 
                    WHERE s.hostel_id = ?
                `, [hostel_id], (errMaint, maintenanceRequests) => {
                    if (errMaint) return res.json({ success: false, message: 'Error fetching maintenance requests' });

                    // Fetch Events linked to the Hostel
                    db.all(`
                        SELECT e.* 
                        FROM Events e 
                        JOIN Events_R_Hostel er ON e.event_id = er.event_id 
                        WHERE er.hostel_id = ?
                    `, [hostel_id], (errEvents, events) => {
                        if (errEvents) return res.json({ success: false, message: 'Error fetching events' });

                        // Fetch Students under Warden with proper room number
                        db.all(`SELECT 
                                s.username,
                                s.student_id,
                                s.email,
                                s.phone_num,
                                s.hostel_id,
                                s.room_id,
                                r.roomNumber
                                FROM Students s
                                JOIN Rooms r ON s.room_id = r.room_id
                                WHERE s.hostel_id = ?`, [hostel_id], (errStudents, students) => {
                            if (errStudents) return res.json({ success: false, message: 'Error fetching students' });

                            res.json({
                                success: true,
                                rooms,
                                maintenanceRequests,
                                events,
                                students
                            });
                        });
                    });
                });
            });
        });
    });
});

// Helper to generate 4-character event ID
function generateEventId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'E';
    for (let i = 0; i < 3; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

router.post('/add-event', (req, res) => {
    const { title, description, date, location, hostel_id } = req.body;

    if (!title || !description || !date || !location || !hostel_id) {
        return res.json({ success: false, message: 'Missing required fields' });
    }

    const event_id = generateEventId();

    db.serialize(() => {
        // Insert into Events table
        db.run(`
            INSERT INTO Events (event_id, title, description, date, location)
            VALUES (?, ?, ?, ?, ?)
        `, [event_id, title, description, date, location], function (errEvent) {
            if (errEvent) {
                return res.json({ success: false, message: 'Error inserting event' });
            }

            // Insert into Events_R_Hostel mapping table
            db.run(`
                INSERT INTO Events_R_Hostel (event_id, hostel_id)
                VALUES (?, ?)
            `, [event_id, hostel_id], function (errMapping) {
                if (errMapping) {
                    return res.json({ success: false, message: 'Error linking event to hostel' });
                }

                return res.json({
                    success: true,
                    event_id,
                    title,
                    description,
                    date,
                    location,
                    hostel_id
                });
            });
        });
    });
});

module.exports = router;
