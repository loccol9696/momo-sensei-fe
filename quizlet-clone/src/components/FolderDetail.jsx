import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./FolderDetail.css";

const FolderDetail = () => {
  const { id } = useParams(); // folderId
  const navigate = useNavigate();

  // --- STATE ---
  const [folder, setFolder] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State Modal tạo Module
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");
  const [newModulePermission, setNewModulePermission] = useState("PUBLIC");
  const [newModulePassword, setNewModulePassword] = useState("");

  // --- API CALLS ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        // 1. Lấy thông tin Folder
        const folderRes = await axios.get(
          `http://localhost:8080/api/folders/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (folderRes.data.success) setFolder(folderRes.data.data);

        // 2. Lấy danh sách Modules
        fetchModules();
      } catch (err) {
        toast.error("Không thể tải dữ liệu!");
        navigate("/folders");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, navigate]);

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/folders/${id}/modules?search=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        setModules(response.data.data.content || response.data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách học phần:", err);
    }
  };

  // Tự động tìm kiếm khi gõ
  useEffect(() => {
    if (!loading) {
      const delayDebounceFn = setTimeout(() => fetchModules(), 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery]);

  // --- HANDLERS ---
  const resetForm = () => {
    setNewModuleName("");
    setNewModuleDesc("");
    setNewModulePermission("PUBLIC");
    setNewModulePassword("");
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleName.trim())
      return toast.warning("Cậu chưa nhập tên học phần kìa!");
    if (newModulePermission === "PASSWORD" && !newModulePassword.trim())
      return toast.warning("Hãy nhập mật khẩu nhé!");

    setIsCreating(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: newModuleName,
        description: newModuleDesc,
        permission: newModulePermission,
        password: newModulePermission === "PASSWORD" ? newModulePassword : null,
      };

      const response = await axios.post(
        `http://localhost:8080/api/folders/${id}/modules`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("Tạo học phần thành công! 🌸");
        resetForm();
        setIsCreateModalOpen(false);
        fetchModules();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi tạo học phần.");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading)
    return <div className="loading-text">Đang tải dữ liệu... ⏳</div>;

  return (
    <div className="folder-detail-container">
      {/* NÚT QUAY LẠI VỀ FOLDERS */}
      <div className="folder-detail-back-wrapper">
        <button className="btn-back" onClick={() => navigate("/folders")}>
          ← Quay lại
        </button>
      </div>

      {/* THANH ACTION BAR (Chứa Quay lại + Tìm kiếm + Tạo mới ngang hàng) */}
      <div className="module-action-bar">
        {/* Bên phải: Tìm kiếm và Tạo học phần */}
        <div className="action-right">
          <input
            type="text"
            className="module-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm học phần..."
          />
          <button
            className="btn-create-module"
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
          >
            Tạo học phần
          </button>
        </div>
      </div>

      {/* GRID MODULES */}
      {modules.length > 0 ? (
        <div className="modules-grid">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="module-card"
              onClick={() =>
                navigate(`/modules/${mod.id}`)
              } /* ĐÃ THÊM SỰ KIỆN CHUYỂN TRANG TẠI ĐÂY */
            >
              <div className="module-icon">📝</div>
              <div className="module-info">
                <h4>{mod.name}</h4>
                <p>{mod.totalTerms || 0} thuật ngữ</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-modules">
          {searchQuery
            ? "Không tìm thấy học phần nào."
            : "Chưa có học phần nào. Tạo mới nhé! 🌸"}
        </div>
      )}

      {/* MODAL TẠO MODULE */}
      {isCreateModalOpen && (
        <div
          className="module-modal-overlay"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="module-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="module-modal-title">Tạo Học Phần Mới 📝</h3>
            <form onSubmit={handleCreateModule}>
              <div className="module-form-group">
                <label className="module-form-label">Tên học phần (*)</label>
                <input
                  type="text"
                  className="module-form-input"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="module-form-group">
                <label className="module-form-label">Mô tả</label>
                <textarea
                  className="module-form-textarea"
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                />
              </div>
              <div className="module-form-group">
                <label className="module-form-label">Quyền truy cập (*)</label>
                <select
                  className="module-form-select"
                  value={newModulePermission}
                  onChange={(e) => setNewModulePermission(e.target.value)}
                >
                  <option value="PUBLIC">Công khai</option>
                  <option value="PRIVATE">Chỉ mình tôi</option>
                  <option value="PASSWORD">Cần mật khẩu</option>
                </select>
              </div>
              {newModulePermission === "PASSWORD" && (
                <div className="module-form-group">
                  <label className="module-form-label">Mật khẩu (*)</label>
                  <input
                    type="password"
                    className="module-form-input"
                    value={newModulePassword}
                    onChange={(e) => setNewModulePassword(e.target.value)}
                  />
                </div>
              )}
              <div className="module-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isCreating}
                >
                  {isCreating ? "Đang tạo..." : "Xác nhận"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderDetail;
