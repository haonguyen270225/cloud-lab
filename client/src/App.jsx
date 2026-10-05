import { useEffect, useState } from "react";
import "./App.css";
function App() {
  const [students, setStudents] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [editingId, setEditingId] = useState(null);

  const loadStudents = () => {
    fetch("http://localhost:5000/api/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const studentData = {
      studentId,
      name,
      email,
    };

    try {
      if (editingId) {
        await fetch(
          `http://localhost:5000/api/students/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(studentData),
          }
        );
      } else {
        await fetch(
          "http://localhost:5000/api/students",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(studentData),
          }
        );
      }

      setStudentId("");
      setName("");
      setEmail("");
      setEditingId(null);

      loadStudents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (student) => {
    setStudentId(student.studentId);
    setName(student.name);
    setEmail(student.email);

    setEditingId(student._id);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa sinh viên này không?"
    );

    if (!confirmDelete) return;

    try {
      await fetch(
        `http://localhost:5000/api/students/${id}`,
        {
          method: "DELETE",
        }
      );

      loadStudents();
    } catch (error) {
      console.error(error);
    }
  };

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