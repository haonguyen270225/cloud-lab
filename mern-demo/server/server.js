
require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Đọc URI từ biến môi trường
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

const Student = require('./models/Student');

// Kết nối MongoDB Atlas
async function connectDB() {
    if (!MONGODB_URI) {
        throw new Error(
            'MONGODB_URI is missing. Please configure it in the environment.'
        );
    }

    if (
        MONGODB_URI.includes('username:demo123@') ||
        MONGODB_URI.includes('username:password@')
    ) {
        throw new Error(
            'MONGODB_URI contains placeholder credentials. Please update the environment variable.'
        );
    }

    await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 15000
    });

    console.log('MongoDB Connected Successfully');
    console.log('Database:', mongoose.connection.name);
    console.log('Collection:', Student.collection.name);
}

// Route mặc định
app.get('/', (req, res) => {
    res.send('Express Server is running');
});

// API kiểm tra backend
app.get('/api/hello', (req, res) => {
    res.json({
        message: 'Hello from Docker Backend!'
    });
});

// GET: Lấy danh sách sinh viên
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (err) {
        console.error('GET students error:', err.message);

        res.status(500).json({
            message: 'Error fetching students'
        });
    }
});

// POST: Thêm sinh viên
app.post('/api/students', async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (err) {
        console.error('POST student error:', err.message);

        res.status(500).json({
            message: 'Error creating student'
        });
    }
});

// PUT: Cập nhật sinh viên
app.put('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        res.status(200).json(student);
    } catch (err) {
        console.error('PUT student error:', err.message);

        res.status(500).json({
            message: 'Error updating student'
        });
    }
});

// DELETE: Xóa sinh viên
app.delete('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(
            req.params.id
        );

        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        res.status(200).json({
            message: 'Student deleted successfully',
            student
        });
    } catch (err) {
        console.error('DELETE student error:', err.message);

        res.status(500).json({
            message: 'Error deleting student'
        });
    }
});

// Chỉ khởi động server khi database kết nối thành công
async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    } catch (err) {
        console.error('Startup failed:', err.message);
        process.exit(1);
    }
}

startServer();