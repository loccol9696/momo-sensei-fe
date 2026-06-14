import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./SearchModules.css";

const PasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
    setPassword("");
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  return (
    <div className="password-modal-overlay" onClick={handleClose}>
      <div className="password-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="password-modal-title">Nhập Mật Khẩu</h3>

        <form onSubmit={handleSubmit}>
          <div className="password-form-group">
            <input
              type="password"
              className="password-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              autoFocus
              required
            />
          </div>
          <div className="password-modal-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={handleClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-modal-submit"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SearchModules = () => {
  const [modules, setModules] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Custom Password Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const fetchModules = async () => {
    if (!searchQuery.trim()) {
      setModules([]);
      setTotalPages(0);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/modules/search?search=${encodeURIComponent(searchQuery)}&page=${page}&size=6`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setModules(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm học phần:", err);
      toast.error("Không thể lấy danh sách học phần.");
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
      fetchModules();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, page]);

  const handleStudy = (moduleItem) => {
    if (moduleItem.permission === "PASSWORD" && moduleItem.ownerId !== user?.id) {
      setSelectedModule(moduleItem);
      setIsPasswordModalOpen(true);
    } else {
      navigate(`/modules/${moduleItem.id}`);
    }
  };

  const handlePasswordSubmit = async (password) => {
    try {
      const token = localStorage.getItem("token");
      await axios.get(
        `/api/modules/${selectedModule.id}?password=${encodeURIComponent(password)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      sessionStorage.setItem(`module_password_${selectedModule.id}`, password);
      setIsPasswordModalOpen(false);
      navigate(`/modules/${selectedModule.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Mật khẩu không đúng!");
    }
  };

  return (
    <div className="search-modules-container">
      <div className="search-modules-back-wrapper">
        <button className="btn-back" onClick={() => navigate("/dashboard")}>
          ← Quay lại
        </button>
      </div>

      <div className="search-modules-action-bar">
        <div className="search-modules-action-right">
          <input
            type="text"
            className="search-modules-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchModules();
              }
            }}
            placeholder="Tìm kiếm học phần..."
            spellCheck={false}
            autoFocus
          />
          <button className="btn-search-submit" onClick={fetchModules}>
            Tìm kiếm
          </button>
        </div>
      </div>

      {modules.length > 0 ? (
        <>
          <div className="search-modules-grid">
            {modules.map((m) => {
              const isOwner = m.ownerId === user?.id;
              let badgeText = "Công khai";
              let badgeClass = "badge-public";
              if (m.permission === "PRIVATE") {
                badgeText = "Riêng tư";
                badgeClass = "badge-private";
              } else if (m.permission === "PASSWORD") {
                badgeText = "Mật khẩu";
                badgeClass = "badge-password";
              }

              return (
                <div key={m.id} className="search-module-card">
                  <div className="search-module-card-header">
                    <span className={`permission-badge ${badgeClass}`}>{badgeText}</span>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span className="card-count" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ff89a9" }}>
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                        {m.totalCards || 0} thẻ
                      </span>
                      <span className="card-count" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={m.liked ? "#ff6b9e" : "none"} stroke="#ff6b9e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                        {m.totalLikes || 0}
                      </span>
                    </div>
                  </div>

                  <div className="search-module-card-body">
                    <h3 className="search-module-title">{m.name}</h3>
                    <p className="search-module-desc">
                      {m.description || "Không có mô tả nào cho học phần này."}
                    </p>
                  </div>

                  <div className="search-module-card-footer">
                    <div className="owner-info">
                      <img
                        src={m.ownerAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${m.ownerName || "owner"}`}
                        alt="Owner Avatar"
                        className="owner-avatar"
                      />
                      <span className="owner-name">
                        {isOwner ? "Tôi" : m.ownerName || "Người dùng"}
                      </span>
                    </div>

                    <button className="btn-study" onClick={() => handleStudy(m)}>
                      Học ngay
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="btn-page"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                Trước
              </button>
              <span className="page-info">Trang {page + 1} / {totalPages}</span>
              <button
                className="btn-page"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-search-list">
          {searchQuery
            ? "Không tìm thấy học phần nào phù hợp với từ khóa của cậu."
            : "Chưa tìm thấy học phần nào. Nhập từ khóa để bắt đầu tìm kiếm nhé!"}
        </div>
      )}

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
};

export default SearchModules;
