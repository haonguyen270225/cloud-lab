require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware đọc JSON từ req.body

app.use(cors());
app.use(express.json());

console.log('MONGODB_URI =', process.env.MONGODB_URI);

// Import Model
const Student = require('./models/Student');

// Kết nối MongoDB Atlas
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected Successfully');
        console.log('Database:', mongoose.connection.name);
         console.log('Collection:', Student.collection.name);
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
    }
}

connectDB();

// Route mặc định
app.get('/', (req, res) => {
    res.send('Express Server is running on port 5000');
});

// API test Docker
app.get('/api/hello', (req, res) => {
    res.json({
        message: 'Hello from Docker Backend!'
    });
});

// API GET /api/students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();

        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({
            message: 'Error fetching students',
            error: err.message
        });
    }
});

// API POST /api/students
app.post('/api/students', async (req, res) => {
    try {
        const student = await Student.create(req.body);

        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({
            message: 'Error creating student',
            error: err.message
        });
    }
});

// API PUT /api/students/:id
app.put('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({
            message: 'Error updating student',
            error: err.message
        });
    }
});

// API DELETE /api/students/:id
app.delete('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        res.status(200).json({
            message: 'Student deleted successfully',
            student: student
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error deleting student',
            error: err.message
        });
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});