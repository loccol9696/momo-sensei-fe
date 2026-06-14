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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // State Modal tạo Module
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");
  const [newModulePermission, setNewModulePermission] = useState("PUBLIC");
  const [newModulePassword, setNewModulePassword] = useState("");

  // State Modal chỉnh sửa Module
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [activeDropdownModuleId, setActiveDropdownModuleId] = useState(null);

  // Close dropdown menu on click outside
  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveDropdownModuleId(null);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  // --- API CALLS ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        // 1. Lấy thông tin Folder
        const folderRes = await axios.get(
          `/api/folders/${id}`,
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
        `/api/folders/${id}/modules?search=${searchQuery}&page=${page}&size=18`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        if (response.data.data.content !== undefined) {
          setModules(response.data.data.content);
          setTotalPages(response.data.data.totalPages || 0);
        } else {
          setModules(response.data.data);
          setTotalPages(0);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách học phần:", err);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Tự động tìm kiếm khi gõ hoặc đổi trang
  useEffect(() => {
    if (!loading) {
      const delayDebounceFn = setTimeout(() => fetchModules(), 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, page]);

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
        `/api/folders/${id}/modules`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.status === 200 || response.status === 201 || response.data.success) {
        toast.success("Tạo học phần thành công!");
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

  const handleOpenEditModal = (mod) => {
    setEditingModule(mod);
    setNewModuleName(mod.name);
    setNewModuleDesc(mod.description || "");
    setNewModulePermission(mod.permission || "PUBLIC");
    setNewModulePassword(""); // Do not pre-fill passwords
    setIsEditModalOpen(true);
  };

  const handleUpdateModule = async (e) => {
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

      const response = await axios.put(
        `/api/modules/${editingModule.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.data.success) {
        toast.success("Cập nhật học phần thành công!");
        resetForm();
        setEditingModule(null);
        setIsEditModalOpen(false);
        fetchModules();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật học phần.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteModule = async (modId) => {
    if (!window.confirm("Cậu có chắc muốn xóa học phần này không? 🌸")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `/api/modules/${modId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200 || response.data.success) {
        toast.success("Xóa học phần thành công!");
        fetchModules();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa học phần.");
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm kiếm học phần..."
            spellCheck={false}
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
        <>
          <div className="modules-grid">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="module-card"
                onClick={() => navigate(`/modules/${mod.id}`)}
              >
                {/* Ellipsis options trigger button (visible on hover) */}
                <button
                  className="module-card-options-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdownModuleId(activeDropdownModuleId === mod.id ? null : mod.id);
                  }}
                >
                  ⋮
                </button>

                {/* Options dropdown menu */}
                {activeDropdownModuleId === mod.id && (
                  <div className="module-card-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownModuleId(null);
                        handleOpenEditModal(mod);
                      }}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      className="dropdown-item delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownModuleId(null);
                        handleDeleteModule(mod.id);
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                )}

                <div className="module-icon">
                  <svg
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="svg-module-icon"
                  >
                    <path
                      d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"
                      fill="#fff5f7"
                      stroke="#ff89a9"
                    />
                    <path d="M14 2v6h6" stroke="#ff89a9" />
                    <line x1="16" y1="13" x2="8" y2="13" stroke="#ff89a9" />
                    <line x1="16" y1="17" x2="8" y2="17" stroke="#ff89a9" />
                    <line x1="10" y1="9" x2="8" y2="9" stroke="#ff89a9" />
                  </svg>
                </div>
                <div className="module-info">
                  <h4>{mod.name}</h4>
                  <p>{mod.totalCards || mod.totalTerms || 0} thuật ngữ</p>
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
        <div className="empty-modules">
          {searchQuery
            ? "Không tìm thấy học phần nào."
            : "Chưa có học phần nào. Tạo mới nhé!"}
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
            <h3 className="module-modal-title">Tạo Học Phần</h3>
            <form onSubmit={handleCreateModule}>
              <div className="module-form-group">
                <label className="module-form-label">Tên học phần (*)</label>
                <input
                  type="text"
                  className="module-form-input"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  autoFocus
                  spellCheck={false}
                />
              </div>
              <div className="module-form-group">
                <label className="module-form-label">Mô tả</label>
                <textarea
                  className="module-form-textarea"
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                  spellCheck={false}
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

      {/* MODAL CHỈNH SỬA MODULE */}
      {isEditModalOpen && (
        <div
          className="module-modal-overlay"
          onClick={() => {
            setIsEditModalOpen(false);
            setEditingModule(null);
            resetForm();
          }}
        >
          <div
            className="module-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="module-modal-title">Chỉnh Sửa Học Phần</h3>
            <form onSubmit={handleUpdateModule}>
              <div className="module-form-group">
                <label className="module-form-label">Tên học phần (*)</label>
                <input
                  type="text"
                  className="module-form-input"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  autoFocus
                  spellCheck={false}
                />
              </div>
              <div className="module-form-group">
                <label className="module-form-label">Mô tả</label>
                <textarea
                  className="module-form-textarea"
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                  spellCheck={false}
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
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingModule(null);
                    resetForm();
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isCreating}
                >
                  {isCreating ? "Đang lưu..." : "Cập nhật"}
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
