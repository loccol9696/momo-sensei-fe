import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./ProfileModal.css";

const ProfileModal = ({ isOpen, onClose }) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setProfileData(response.data.data);
      }
    } catch (err) {
      toast.error("Không thể tải thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    setIsChangingPwd(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        "http://localhost:8080/api/profile/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        toast.success("Đổi mật khẩu thành công!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Mật khẩu cũ không đúng.");
    } finally {
      setIsChangingPwd(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-card-modern" onClick={(e) => e.stopPropagation()}>
        {/* Phần Banner phía trên */}
        <div className="profile-banner">
          <button className="close-btn-white" onClick={onClose}>
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="loading-text">Đang tải... ⏳</div>
        ) : profileData ? (
          <div className="profile-body-modern">
            {/* Avatar nổi bật */}
            <div className="avatar-wrapper">
              <img
                src={
                  profileData.avatar ||
                  `https://api.dicebear.com/7.x/adventurer/svg?seed=${profileData.fullName}`
                }
                alt="Avatar"
              />
            </div>

            {/* Thông tin User */}
            <div className="user-details">
              <h2 className="user-name">{profileData.fullName}</h2>
              <p className="user-email">{profileData.email}</p>
            </div>

            {/* Form Đổi mật khẩu */}
            <div className="password-section">
              <h3 className="section-title">🔒 Đổi mật khẩu</h3>
              <form onSubmit={handleChangePassword} className="change-pwd-form">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Mật khẩu hiện tại"
                  required
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  required
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                  required
                />
                <button
                  type="submit"
                  className="btn-submit btn-change-pwd"
                  disabled={isChangingPwd}
                >
                  {isChangingPwd ? "Đang xử lý..." : "Lưu thay đổi"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="error-text">Không có dữ liệu.</div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
