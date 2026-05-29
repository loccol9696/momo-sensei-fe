import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Folders.css";

const Folders = () => {
  const [folders, setFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/folders?search=${searchQuery}&page=${page}&size=10`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setFolders(response.data.data.content);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách thư mục:", err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFolders();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, page]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim())
      return toast.warning("Cậu chưa nhập tên thư mục kìa!");

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/api/folders",
        { name: newFolderName },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("Tạo thư mục thành công! 🌸");
        setNewFolderName("");
        setIsCreateModalOpen(false);
        fetchFolders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi tạo thư mục.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="folders-container">
      {/* THANH ACTION BAR MỚI */}
      <div className="action-bar">
        {/* Nút quay lại về trang chủ */}
        <button className="btn-back" onClick={() => navigate("/")}>
          ⬅ Quay lại
        </button>

        {/* Cụm Tìm kiếm & Tạo mới ở bên phải */}
        <div className="action-right">
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm thư mục..."
          />
          <button
            className="btn-create-folder"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tạo mới
          </button>
        </div>
      </div>

      {folders.length > 0 ? (
        <div className="folders-grid">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="folder-card"
              onClick={() => navigate(`/folders/${folder.id}`)}
            >
              <div className="folder-icon">📁</div>
              <div className="folder-info">
                <h4>{folder.name}</h4>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-list">
          {searchQuery
            ? "Không tìm thấy thư mục nào phù hợp."
            : "Chưa có thư mục nào. Hãy tạo mới nhé! 🌸"}
        </div>
      )}

      {/* MODAL TẠO THƯ MỤC */}
      {isCreateModalOpen && (
        <div
          className="folder-modal-overlay"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="folder-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="folder-modal-title">Tạo Thư Mục Mới</h3>
            <form onSubmit={handleCreateFolder}>
              <div className="folder-form-group">
                <label className="folder-form-label">Tên thư mục</label>
                <input
                  type="text"
                  className="folder-form-input"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nhập tên thư mục..."
                  autoFocus
                />
              </div>
              <div className="folder-modal-actions">
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
                  disabled={isLoading}
                >
                  {isLoading ? "Đang tạo..." : "Xác nhận"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Folders;
