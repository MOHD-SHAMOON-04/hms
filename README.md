# HMS - Hostel Management System

---

# TABLES USED

## 📂 **1. Students**

| Column       | Type     | Constraints            |
|--------------|----------|------------------------|
| student_id   | BIGINT   | Primary Key            |
| username     | VARCHAR  |                        |
| email        | VARCHAR  |                        |
| pass_hash    | VARCHAR  |                        |
| admn_date    | DATE     |                        |
| phone_num    | VARCHAR  |                        |
| room_id      | VARCHAR  | Foreign Key → Rooms    |
| hostel_id    | VARCHAR  | Foreign Key → Hostels  |

---

## 📂 **2. Hostels**

| Column     | Type     | Constraints           |
|------------|----------|-----------------------|
| hostel_id  | VARCHAR  | Primary Key           |
| name       | VARCHAR  |                       |
| capacity   | INT      |                       |

---

## 📂 **3. Wardens**

| Column     | Type     | Constraints            |
|------------|----------|------------------------|
| warden_id  | VARCHAR  | Primary Key            |
| username   | VARCHAR  |                        |
| email      | VARCHAR  |                        |
| pass_hash  | VARCHAR  |                        |
| phone_num  | VARCHAR  |                        |
| hostel_id  | VARCHAR  | Foreign Key → Hostels  |

---

## 📂 **4. Complaints**

| Column        | Type     | Constraints               |
|---------------|----------|---------------------------|
| complaint_id  | VARCHAR  | Primary Key               |
| title         | TEXT     |                           |
| description   | TEXT     |                           |
| student_id    | BIGINT   | Foreign Key → Students    |
| created_date  | DATE     |                           |

---

## 📂 **5. Leaves**

| Column      | Type     | Constraints               |
|-------------|----------|---------------------------|
| leave_id    | VARCHAR  | Primary Key               |
| start_date  | DATE     |                           |
| end_date    | DATE     |                           |
| reason      | TEXT     |                           |
| student_id  | BIGINT   | Foreign Key → Students    |

---

## 📂 **6. Rooms**

| Column      | Type     | Constraints            |
|-------------|----------|------------------------|
| room_id     | VARCHAR  | Primary Key            |
| roomNumber  | INT      |                        |
| capacity    | INT      |                        |
| hostel_id   | VARCHAR  | Foreign Key → Hostels  |

---

## 📂 **7. Events**

| Column      | Type     | Constraints |
|-------------|----------|-------------|
| event_id    | VARCHAR  | Primary Key |
| title       | TEXT     |             |
| description | TEXT     |             |
| date        | DATE     |             |
| location    | TEXT     |             |

---

## 📂 **8. Events-R-Hostel** (Join Table)

| Column     | Type     | Constraints                       |
|------------|----------|-----------------------------------|
| event_id   | VARCHAR  | Foreign Key → Events              |
| hostel_id  | VARCHAR  | Foreign Key → Hostels             |

---
---

# 📘 **API Route Documentation**

### 🧠 **Base URL**  
```
http://localhost:3000/api
```

---

### 📂 **1. Login - Student**

#### `POST /api/login/student`

**Description**: Logs in a student and returns a JWT token.

**Request Body**:
```json
{
  "student_id": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": bool,
  "message": "string",
  "token": "string"
}
```
**Errors**:
```json
{
  "success": bool,
  "message": "string"
}
```

---

### 📂 **2. Login - Warden**

#### `POST /api/login/warden`

**Description**: Logs in a warden and returns a JWT token.

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": bool,
  "message": "string",
  "name": "string", 
  "token": "string"
}
```
**Errors**:
```json
{
  "success": bool,
  "message": "string"
}
```

---

### 📂 **3. Sign-up - Student**

#### `POST /api/signup/student`

**Description**: Registers a new student.

**Request Body**:
```json
{
  "student_id": "string",
  "username": "string",
  "email": "string",
  "password": "string",
  "phone_num": "string"
}
```

**Response**:
```json
{
  "success": bool,
  "message": "string"
}
```
**Errors**:
```json
{
  "success": bool,
  "message": "string"
}
```

---

### 📂 **4. Sign-up - Warden**

#### `POST /api/signup/warden`

**Description**: Registers a new warden.

**Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone_num": "string"
}
```

**Response**:
```json
{
  "success": bool,
  "message": "string"
}
```
**Errors**:
```json
{
  "success": bool,
  "message": "string"
}
```

---

### 📂 **5. Student - Init**

#### `POST /api/student/init`

**Description**: Initializes student data (room, maintenance requests, events).

**Request Body**:
```json
{
  "student_id": "string"
}
```

**Response**:
```json
{
  "success": bool,
  "message": "string"
  "roomDetails": {
    "room_id": "101",
    "roomNumber": "101",
    "hostel_id": "H1"
  },
  "maintenanceRequests": [
    { "complaint_id": "1", "title": "Water leakage", "description": "Water leaking from ceiling", "status": "received" }
  ],
  "events": [
    { "event_id": "E123", "title": "Hostel Clean-up", "description": "Monthly hostel clean-up event", "date": "2025-04-30", "location": "Main Hall" }
  ]
}
```
**Errors**:
```json
{
  "success": bool,
  "message": "string"
}
```

---

### 📂 **6. Warden - Init**

#### `POST /api/warden/init`

**Description**: Initializes warden data (rooms, maintenance requests, events, students).

**Request Body**:
```json
{
  "email": "string"
}
```

**Response**:
```json
{
  "success": bool,
  "message": "string"
  "rooms": [
    { "room_id": "101", "roomNumber": "101", "student_count": 3 },
    { "room_id": "102", "roomNumber": "102", "student_count": 2 }
  ],
  "maintenanceRequests": [
    { "complaint_id": "1", "title": "Water leakage", "description": "Water leaking from ceiling", "status": "received" }
  ],
  "events": [
    { "event_id": "E123", "title": "Hostel Clean-up", "description": "Monthly hostel clean-up event", "date": "2025-04-30", "location": "Main Hall" }
  ],
  "students": [
    { "username": "john", "student_id": "1", "email": "john@example.com", "phone_num": "1234567890", "roomNumber": "101" }
  ]
}
```
**Errors**:
```json
{
  "success": bool,
  "message": "string"
}
```

---

### 📂 **7. Student - Maintenance Request**

#### `POST /api/student/maintenance`

**Description**: Create a new maintenance request (complaint).

**Request Body**:
```json
{
  "complaint_id": "string",
  "student_id": "string",
  "title": "string",
  "description": "string",
  "created_date": date
}
```

**Response**:
```json
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "description": "string",
  "status": "string",
  "createdAt": date
}
```
**Errors**:
```json
{
  "success": bool,
  "message": "string"
}
```

---

### 📂 **8. Warden - Add Event**

#### `POST /api/warden/add-event`

**Description**: Add a new event for the hostel.

**Request Body**:
```json
{ 
  "title": "string", 
  "description": "string", 
  "date": date,
  "location": "string", 
  "hostel_id": "string"
}
```

**Response**:
```json
{
  "event_id": "string",
  "title": "string", 
  "description": "string", 
  "date": date,
  "location": "string", 
  "hostel_id": "string"
}
```
**Errors**:
```json
{
  "success": bool,
  "message": "string"
}
```

---

### 📂 **9. Query Execution**

#### `POST /api/query`

**Description**: Executes a raw SQL query passed in the request body.

**Request Body**:
```json
{
  "query": "string"
}
```

**Response**:
```json
{
  "rows": [
    { "student_id": 1, "username": "john", "email": "john@example.com", ... },
    ...
  ]
}
```

**Errors**:
```json
{
  "error": "Syntax error in SQL query"
}
```

---

### 📂 **10. Database Schema Viewer**

#### `GET /api/schema`

**Description**: Fetches the schema for all tables, including column names, types, constraints.

**Response**:
```json
[
  {
    "table": "Students",
    "columns": [
      { "cid": 0, "name": "student_id", "type": "BIGINT", "notnull": 1, "dflt_value": null, "pk": 1 },
      { "cid": 1, "name": "username", "type": "VARCHAR", "notnull": 0, "dflt_value": null, "pk": 0 },
      ...
    ]
  },
  ...
]
```

**Errors**:
```json
{
  "error": "Failed to fetch schema"
}
```
