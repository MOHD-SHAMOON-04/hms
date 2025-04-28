const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./hostel.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Hostels (
    hostel_id TEXT PRIMARY KEY,
    name TEXT,
    capacity INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Rooms (
    room_id TEXT PRIMARY KEY,
    roomNumber INTEGER,
    capacity INTEGER,
    hostel_id TEXT,
    FOREIGN KEY (hostel_id) REFERENCES Hostels(hostel_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Students (
    student_id INTEGER PRIMARY KEY,
    username TEXT,
    email TEXT,
    pass_hash TEXT,
    admn_date DATE,
    phone_num TEXT,
    room_id TEXT,
    hostel_id TEXT,
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id),
    FOREIGN KEY (hostel_id) REFERENCES Hostels(hostel_id)
  )`);


  db.run(`CREATE TABLE IF NOT EXISTS Wardens (
    warden_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    pass_hash TEXT NOT NULL,
    phone_num TEXT NOT NULL UNIQUE,
    hostel_id TEXT,
    FOREIGN KEY (hostel_id) REFERENCES Hostels(hostel_id)
);
`);

  db.run(`CREATE TABLE IF NOT EXISTS Events (
    event_id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    date DATE,
    location TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Complaints (
    complaint_id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    student_id INTEGER,
    created_date DATE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Leaves (
    leave_id TEXT PRIMARY KEY,
    start_date DATE,
    end_date DATE,
    reason TEXT,
    student_id INTEGER,
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Events_R_Hostel (
    event_id TEXT,
    hostel_id TEXT,
    PRIMARY KEY (event_id, hostel_id),
    FOREIGN KEY (event_id) REFERENCES Events(event_id),
    FOREIGN KEY (hostel_id) REFERENCES Hostels(hostel_id)
  )`);
});

// db.serialize(() => {
//     db.run(`INSERT OR IGNORE INTO Hostels (hostel_id, name, capacity) VALUES (?, ?, ?)`, ['H001', 'Hostel A', 100]);
//     db.run(`INSERT OR IGNORE INTO Hostels (hostel_id, name, capacity) VALUES (?, ?, ?)`, ['H002', 'Hostel B', 200]);
//     db.run(`INSERT OR IGNORE INTO Hostels (hostel_id, name, capacity) VALUES (?, ?, ?)`, ['H003', 'Hostel C', 150]);
// });

db.serialize(() => {
  db.run(`INSERT OR IGNORE INTO Rooms (room_id, roomNumber, capacity, hostel_id) VALUES (?, ?, ?, ?)`, ['R001', 101, 4, 'H001']);
  db.run(`INSERT OR IGNORE INTO Rooms (room_id, roomNumber, capacity, hostel_id) VALUES (?, ?, ?, ?)`, ['R002', 102, 4, 'H001']);
  db.run(`INSERT OR IGNORE INTO Rooms (room_id, roomNumber, capacity, hostel_id) VALUES (?, ?, ?, ?)`, ['R003', 201, 2, 'H002']);
  db.run(`INSERT OR IGNORE INTO Rooms (room_id, roomNumber, capacity, hostel_id) VALUES (?, ?, ?, ?)`, ['R004', 202, 2, 'H002']);
  db.run(`INSERT OR IGNORE INTO Rooms (room_id, roomNumber, capacity, hostel_id) VALUES (?, ?, ?, ?)`, ['R005', 301, 4, 'H003']);
  db.run(`INSERT OR IGNORE INTO Rooms (room_id, roomNumber, capacity, hostel_id) VALUES (?, ?, ?, ?)`, ['R006', 302, 4, 'H003']);
});



module.exports = db;
