
import { useEffect, useState } from "react";
import "./App.css";

// Sử dụng Vite Proxy để chuyển request đến Backend
const API_URL = "/api";

function App() {
  const [students, setStudents] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [editingId, setEditingId] = useState(null);

  // =========================
  // LẤY DANH SÁCH SINH VIÊN
  // =========================
  const loadStudents = () => {
    fetch(`${API_URL}/students`)
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // =========================
  // THÊM / CẬP NHẬT SINH VIÊN
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const studentData = {
      studentId,
      name,
      email,
    };

    try {
      if (editingId) {
        // CẬP NHẬT
        await fetch(`${API_URL}/students/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        });
      } else {
        // THÊM
        await fetch(`${API_URL}/students`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        });
      }

      // Xóa dữ liệu trong form
      setStudentId("");
      setName("");
      setEmail("");
      setEditingId(null);

      // Load lại danh sách
      loadStudents();
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // CHỌN SINH VIÊN ĐỂ SỬA
  // =========================
  const handleEdit = (student) => {
    setStudentId(student.studentId);
    setName(student.name);
    setEmail(student.email);

    setEditingId(student._id);
  };

  // =========================
  // XÓA SINH VIÊN
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa sinh viên này không?"
    );

    if (!confirmDelete) return;

    try {
      await fetch(`${API_URL}/students/${id}`, {
        method: "DELETE",
      });

      // Load lại danh sách sau khi xóa
      loadStudents();
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // GIAO DIỆN
  // =========================
  return (
    <div className="container">
      <h1 className="title">🎓 Danh sách sinh viên</h1>

      <form className="student-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="MSSV"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <input
          type="text"
          placeholder="Họ tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="btn-add" type="submit">
          {editingId ? "✏️ Cập nhật" : "➕ Thêm sinh viên"}
        </button>
      </form>

      <ul className="student-list">
        {students.map((student) => (
          <li className="student-item" key={student._id}>
            <span className="student-info">
              {student.studentId} - {student.name} - {student.email}
            </span>

            <div className="btn-group">
              <button
                className="btn-edit"
                onClick={() => handleEdit(student)}
              >
                ✏️ Sửa
              </button>

              <button
                className="btn-delete"
                onClick={() => handleDelete(student._id)}
              >
                🗑️ Xóa
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
