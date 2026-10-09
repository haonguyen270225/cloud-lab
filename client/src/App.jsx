
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

function App() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Tải danh sách sinh viên
  const loadStudents = async () => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/students`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu sinh viên không hợp lệ.");
      }

      setStudents(data);
    } catch (err) {
      console.error("Lỗi tải sinh viên:", err);
      setError(
        "Không thể tải danh sách sinh viên. Hãy kiểm tra kết nối và thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Thêm hoặc cập nhật sinh viên
  const handleSubmit = async (e) => {
    e.preventDefault();

    const studentData = {
      studentId: studentId.trim(),
      name: name.trim(),
      email: email.trim(),
    };

    if (!studentData.studentId || !studentData.name || !studentData.email) {
      setError("Vui lòng nhập đầy đủ MSSV, họ tên và email.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingId
        ? `${API_URL}/students/${editingId}`
        : `${API_URL}/students`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP ${response.status}`);
      }

      setStudentId("");
      setName("");
      setEmail("");
      setEditingId(null);

      await loadStudents();
    } catch (err) {
      console.error("Lỗi lưu sinh viên:", err);
      setError(`Không thể lưu sinh viên: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Chọn sinh viên để sửa
  const handleEdit = (student) => {
    setStudentId(student.studentId);
    setName(student.name);
    setEmail(student.email);
    setEditingId(student._id);
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hủy chỉnh sửa
  const handleCancelEdit = () => {
    setStudentId("");
    setName("");
    setEmail("");
    setEditingId(null);
    setError("");
  };

  // Xóa sinh viên
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sinh viên này không?")) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/students/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Không thể xóa sinh viên: HTTP ${response.status}`);
      }

      await loadStudents();
    } catch (err) {
      console.error("Lỗi xóa sinh viên:", err);
      setError(err.message);
    }
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="dashboard">
        <header className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" />
              STUDENT MANAGEMENT SYSTEM
            </div>

            <h1 className="title">
              Quản lý sinh viên
              <span className="title-accent">thông minh.</span>
            </h1>

            <p className="hero-description">
              Mọi thông tin sinh viên, được quản lý đơn giản và hiệu quả
              trong một không gian duy nhất.
            </p>

            <div className="hero-tags">
              <span>✦ Hiện đại</span>
              <span>◈ Trực quan</span>
              <span>↗ Dễ sử dụng</span>
            </div>
          </div>

          <div className="student-art" aria-label="Minh họa sinh viên đang học">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-spark spark-one">✦</div>
            <div className="art-spark spark-two">✧</div>
            <div className="art-bubble bubble-one">{"</>"}</div>
            <div className="art-bubble bubble-two">✎</div>

            <div className="student-character">
              <div className="character-cap">
                <span />
              </div>
              <div className="character-face">
                <div className="character-hair" />
                <div className="character-eyes">
                  <i />
                  <i />
                </div>
                <div className="character-smile" />
                <div className="character-cheek cheek-left" />
                <div className="character-cheek cheek-right" />
              </div>
              <div className="character-neck" />
              <div className="character-body">
                <div className="character-collar" />
                <div className="character-badge">✦</div>
              </div>
              <div className="character-book">📚</div>
            </div>

            <div className="art-caption">
              <span className="caption-icon">✦</span>
              <div>
                <strong>Keep learning</strong>
                <small>Build your future</small>
              </div>
              <span className="caption-check">✓</span>
            </div>
          </div>
        </header>

        <section className="workspace">
          <div className="section-heading">
            <div>
              <span className="section-kicker">WORKSPACE / 01</span>
              <h2>{editingId ? "Cập nhật thông tin" : "Thêm sinh viên mới"}</h2>
            </div>

            <div className="form-symbol">{editingId ? "✎" : "+"}</div>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <span>⚠</span>
              <p>{error}</p>
              <button type="button" onClick={loadStudents}>
                Thử lại ↻
              </button>
            </div>
          )}

          <form className="student-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>MÃ SINH VIÊN</span>
              <input
                type="text"
                placeholder="Ví dụ: SV001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>HỌ VÀ TÊN</span>
              <input
                type="text"
                placeholder="Nhập họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>ĐỊA CHỈ EMAIL</span>
              <input
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <div className="form-actions">
              <button
                className="btn-add"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Đang lưu..."
                  : editingId
                    ? "✓ Cập nhật"
                    : "+ Thêm sinh viên"}
              </button>

              {editingId && (
                <button
                  className="btn-cancel"
                  type="button"
                  onClick={handleCancelEdit}
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="directory">
          <div className="section-heading directory-heading">
            <div>
              <span className="section-kicker">DATABASE / 02</span>
              <h2>Danh sách sinh viên</h2>
              <p className="section-subtitle">
                Thông tin được đồng bộ từ cơ sở dữ liệu.
              </p>
            </div>

            <button
              className="refresh-button"
              type="button"
              onClick={loadStudents}
              title="Tải lại danh sách"
              aria-label="Tải lại danh sách"
            >
              ↻
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="loading-spinner" />
              <p>Đang kết nối dữ liệu...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <span>✧</span>
              <h3>Chưa có sinh viên nào</h3>
              <p>Thêm sinh viên đầu tiên bằng biểu mẫu phía trên nhé.</p>
            </div>
          ) : (
            <ul className="student-list">
              {students.map((student, index) => (
                <li className="student-item" key={student._id}>
                  <div className="student-avatar">
                    {student.name?.trim()?.charAt(0)?.toUpperCase() || "S"}
                  </div>

                  <div className="student-info">
                    <strong>{student.name}</strong>
                    <span>
                      {student.studentId} <i>·</i> {student.email}
                    </span>
                  </div>

                  <span className="student-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn-edit"
                      onClick={() => handleEdit(student)}
                      aria-label={`Sửa ${student.name}`}
                    >
                      ✎ <span>Sửa</span>
                    </button>

                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => handleDelete(student._id)}
                      aria-label={`Xóa ${student.name}`}
                    >
                      × <span>Xóa</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="dashboard-footer">
          <div className="footer-brand">
            <span className="footer-mark">S.</span>
            <span>STUDENT SPACE <small>· MANAGEMENT SYSTEM</small></span>
          </div>

          <div className="total-counter" aria-live="polite">
            <span className="counter-label">TOTAL STUDENTS</span>
            <strong>{loading ? "—" : String(students.length).padStart(2, "0")}</strong>
            <span className="counter-spark">✦</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default App;