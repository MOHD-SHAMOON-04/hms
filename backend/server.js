require('dotenv').config();
const express = require('express');
const signupRoutes = require('./routes/signup');
const loginRoutes = require('./routes/login');
const queryRoute = require('./routes/query');
const schemaRoutes = require("./routes/schema");
const studentRoutes = require('./routes/student');
const wardenRoutes = require('./routes/warden');
const cors = require('cors');
const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.get('/api', (req, res) => {
    res.send('Welcome to the Hostel Management System API!');
});

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL }));
app.use('/api/signup', signupRoutes);
app.use('/api/login', loginRoutes);

app.use('/api/query', queryRoute);
app.use("/api", schemaRoutes);

app.use('/api/student', studentRoutes);
app.use('/api/warden', wardenRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));
