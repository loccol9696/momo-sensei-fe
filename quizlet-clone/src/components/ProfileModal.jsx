import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./ProfileModal.css";
import { AuthContext } from "../context/AuthContext";

const ProfileModal = ({ isOpen, onClose }) => {
  const { updateUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // State cho Cập nhật thông tin
  const [fullName, setFullName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Ref tới thẻ input file ẩn
  const fileInputRef = useRef(null);

  // State cho Đổi mật khẩu
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      setActiveTab("profile");
      resetPasswordForm();
      setSelectedFile(null);
    }
  }, [isOpen]);

  const resetPasswordForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const data = response.data.data;
        setProfileData(data);
        setFullName(data.fullName || "");
        setAvatarPreview(data.avatar || "");
      }
    } catch (err) {
      toast.error("Không thể tải thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn tệp hình ảnh (jpg, png...).");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Kích thước ảnh quá lớn (tối đa 2MB).");
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("fullName", fullName);

      if (selectedFile) {
        formData.append("avatarFile", selectedFile);
      }

      const response = await axios.patch(
        "/api/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Cập nhật hồ sơ thành công!");
        const updatedData = response.data.data;
        setProfileData(updatedData);
        setAvatarPreview(updatedData.avatar);
        setSelectedFile(null);
        updateUser({
          name: updatedData.fullName,
          fullName: updatedData.fullName,
          avatar: updatedData.avatar,
        });
      }
    } catch (err) {
      console.error(err);
      // Bắt message lỗi từ Backend trả về
      toast.error(err.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setIsUpdatingProfile(false);
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

      // Gửi request lên endpoint dành riêng cho password
      const response = await axios.put(
        "/api/profile/password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Đổi mật khẩu thành công!");
        resetPasswordForm();
      }
    } catch (err) {
      // Backend sẽ trả về message chuẩn từ ErrorCode (ví dụ: "Mật khẩu hiện tại không chính xác!")
      toast.error(err.response?.data?.message || "Hành động thất bại. Vui lòng thử lại.");
    } finally {
      setIsChangingPwd(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-card-modern" onClick={(e) => e.stopPropagation()}>
        <div className="profile-banner">
          <button className="close-btn-white" onClick={onClose}>×</button>
        </div>

        {isLoading ? (
          <div className="loading-text">Đang tải... ⏳</div>
        ) : profileData ? (
          <div className="profile-body-modern">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*"
            />

            <div className="avatar-wrapper">
              <div
                className="avatar-container"
                onClick={handleAvatarClick}
                title="Nhấn để chọn ảnh từ máy tính"
              >
                <img
                  src={avatarPreview || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`}
                  alt="Avatar"
                />
                <div className="avatar-overlay">
                  <span>Tải ảnh lên</span>
                </div>
              </div>
            </div>

            <div className="user-details">
              <h2 className="user-name">{profileData.fullName}</h2>
              <p className="user-email">{profileData.email}</p>
            </div>

            <div className="tab-navigation">
              <button
                className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                Hồ sơ
              </button>
              <button
                className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                Bảo mật
              </button>
            </div>

            {/* TAB HỒ SƠ */}
            {activeTab === "profile" && (
              <div className="tab-content fade-in">
                <form onSubmit={handleUpdateProfile} className="profile-form">
                  <div className="input-group">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ví dụ: Lộc"
                      required
                    />
                  </div>
                  <button type="submit" className="btn-submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </form>
              </div>
            )}

            {/* TAB BẢO MẬT */}
            {activeTab === "password" && (
              <div className="tab-content fade-in">

                {/* KIỂM TRA TÀI KHOẢN GOOGLE ĐỂ HIỂN THỊ GIAO DIỆN TƯƠNG ỨNG */}
                {profileData.googleAccount ? (
                  <div className="google-account-notice">
                    <div className="notice-icon">🌐</div>
                    <h3>Tài khoản liên kết Google</h3>
                    <p>
                      Tài khoản của bạn được bảo mật thông qua Google.
                      Bạn không cần và không thể thiết lập mật khẩu riêng tại đây.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="profile-form">
                    <div className="input-group">
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Mật khẩu hiện tại"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mật khẩu mới"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Xác nhận mật khẩu mới"
                        required
                      />
                    </div>
                    <button type="submit" className="btn-submit" disabled={isChangingPwd}>
                      {isChangingPwd ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </button>
                  </form>
                )}

              </div>
            )}

          </div>
        ) : (
          <div className="error-text">Không có dữ liệu.</div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;