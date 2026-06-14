import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Folders.css";

const FolderIcon = () => (
  <svg
    width="54"
    height="54"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block" }}
  >
    {/* Folder Back Tab */}
    <path
      d="M6 18C6 14.6863 8.68629 12 12 12H24L30 18H52C55.3137 18 58 20.6863 58 24V48C58 51.3137 55.3137 54 52 54H12C8.68629 54 6 51.3137 6 48V18Z"
      fill="url(#folderBackGrad)"
      stroke="#FF89A9"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Folder Front Cover */}
    <path
      d="M6 26C6 22.6863 8.68629 20 12 20H52C55.3137 20 58 22.6863 58 26V48C58 51.3137 55.3137 54 52 54H12C8.68629 54 6 51.3137 6 48V26Z"
      fill="url(#folderFrontGrad)"
      stroke="#FF89A9"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {/* Heart in the center */}
    <path
      d="M32 31C32 31 30.5 28.5 28.5 28.5C26.5 28.5 25 30 25 31.8C25 35 28.5 38 32 40C35.5 38 39 35 39 31.8C39 30 37.5 28.5 35.5 28.5C33.5 28.5 32 31 32 31Z"
      fill="#FF6B9E"
    />
    <defs>
      <linearGradient id="folderBackGrad" x1="6" y1="12" x2="58" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF2F6" />
        <stop offset="100%" stopColor="#FFE5ED" />
      </linearGradient>
      <linearGradient id="folderFrontGrad" x1="6" y1="20" x2="58" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFE5ED" />
        <stop offset="100%" stopColor="#FFC8D7" />
      </linearGradient>
    </defs>
  </svg>
);

const Folders = () => {
  const [folders, setFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [activeDropdownFolderId, setActiveDropdownFolderId] = useState(null);

  // Close dropdown menu on click outside
  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveDropdownFolderId(null);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const [newFolderName, setNewFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/folders?search=${searchQuery}&page=${page}&size=18`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setFolders(response.data.data.content);
        setTotalPages(response.data.data.totalPages || 0);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách thư mục:", err);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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
        "/api/folders",
        { name: newFolderName },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("Tạo thư mục thành công!");
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

  const handleOpenEditModal = (folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setIsEditModalOpen(true);
  };

  const handleUpdateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim())
      return toast.warning("Cậu chưa nhập tên thư mục kìa!");

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/folders/${editingFolder.id}`,
        { name: newFolderName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.data.success) {
        toast.success("Cập nhật thư mục thành công!");
        setNewFolderName("");
        setEditingFolder(null);
        setIsEditModalOpen(false);
        fetchFolders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật thư mục.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm("Cậu có chắc chắn muốn xóa thư mục này không? 🌸")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `/api/folders/${folderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.data.success) {
        toast.success("Xóa thư mục thành công!");
        fetchFolders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa thư mục.");
    }
  };

  return (
    <div className="folders-container">
      {/* NÚT QUAY LẠI VỀ DASHBOARD */}
      <div className="folders-back-wrapper">
        <button className="btn-back" onClick={() => navigate("/dashboard")}>
          ← Quay lại
        </button>
      </div>

      {/* THANH ACTION BAR MỚI */}
      <div className="action-bar">
        {/* Cụm Tìm kiếm & Tạo mới ở bên phải */}
        <div className="action-right">
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm kiếm thư mục..."
            spellCheck={false}
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
        <>
          <div className="folders-grid">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="folder-card"
                onClick={() => navigate(`/folders/${folder.id}`)}
              >
                {/* Ellipsis options trigger button (visible on hover) */}
                <button
                  className="folder-card-options-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdownFolderId(activeDropdownFolderId === folder.id ? null : folder.id);
                  }}
                >
                  ⋮
                </button>

                {/* Options dropdown menu */}
                {activeDropdownFolderId === folder.id && (
                  <div className="folder-card-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownFolderId(null);
                        handleOpenEditModal(folder);
                      }}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      className="dropdown-item delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownFolderId(null);
                        handleDeleteFolder(folder.id);
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                )}

                <div className="folder-icon">
                  <FolderIcon />
                </div>
                <div className="folder-info">
                  <h4>{folder.name}</h4>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="btn-page"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </button>
              <span className="page-info">Trang {page + 1} / {totalPages}</span>
              <button
                className="btn-page"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-list">
          {searchQuery
            ? "Không tìm thấy thư mục nào phù hợp."
            : "Chưa có thư mục nào. Hãy tạo mới nhé!"}
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
                  spellCheck={false}
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

      {/* MODAL CHỈNH SỬA THƯ MỤC */}
      {isEditModalOpen && (
        <div
          className="folder-modal-overlay"
          onClick={() => {
            setIsEditModalOpen(false);
            setEditingFolder(null);
            setNewFolderName("");
          }}
        >
          <div
            className="folder-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="folder-modal-title">Chỉnh Sửa Thư Mục</h3>
            <form onSubmit={handleUpdateFolder}>
              <div className="folder-form-group">
                <label className="folder-form-label">Tên thư mục (*)</label>
                <input
                  type="text"
                  className="folder-form-input"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nhập tên thư mục..."
                  autoFocus
                  spellCheck={false}
                />
              </div>
              <div className="folder-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingFolder(null);
                    setNewFolderName("");
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang lưu..." : "Cập nhật"}
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
