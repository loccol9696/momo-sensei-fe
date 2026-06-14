import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google"; // Import thư viện Google
import "./LoginModal.css";
import { AuthContext } from "../context/AuthContext";

// Thành phần xử lý nút bấm Google riêng để sử dụng hook useGoogleLogin
const GoogleLoginButton = ({ onGoogleSuccess, isLoading }) => {
  const loginWithGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => {
      // codeResponse.code chính là authorizationCode từ Google trả về
      onGoogleSuccess(codeResponse.code);
    },
    onError: (error) => {
      console.error("Google Login Failed:", error);
      toast.error("Đăng nhập bằng Google thất bại.");
    },
    flow: "auth-code", // Bắt buộc phải có để lấy authorizationCode thay vì token
  });

  return (
    <button
      type="button"
      className="btn-google"
      onClick={() => loginWithGoogle()}
      disabled={isLoading}
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="google-icon"
      />
      Đăng nhập bằng Google
    </button>
  );
};

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const clearForm = () => {
    setEmail("");
    setPassword("");
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const handleSwitchToSignup = () => {
    clearForm();
    onSwitchToSignup();
  };

  // Hàm xử lý chung khi backend trả về token + profile thành công
  const handleLoginSuccess = (responseData) => {
    const token = responseData.data?.token || responseData.token;
    const profile =
      responseData.data?.profile ||
      responseData.data?.user ||
      responseData.profile;

    if (token) {
      const displayName =
        profile?.fullName ||
        profile?.name ||
        email.split("@")[0] ||
        "Người dùng Google";

      const userData = {
        ...profile,
        name: displayName, // Giữ lại để đồng bộ
        fullName: displayName, // THÊM DÒNG NÀY (Đề phòng UI đọc fullName)
        avatar:
          profile?.avatar ||
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayName}`,
      };
      login(token, userData);
    }
    handleClose();
  };

  // 1. Xử lý Đăng nhập bằng Email + Password thông thường
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "/api/auth/login",
        {
          email: email,
          password: password,
        },
      );

      if (response.data.success) {
        toast.success("Đăng nhập thành công!");
        handleLoginSuccess(response.data);
      } else {
        toast.error(response.data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        toast.error(
          err.response.data.message || "Email hoặc mật khẩu không đúng.",
        );
      } else {
        toast.error("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Xử lý gửi Authorization Code lên Backend sau khi gọi Google xong
  const handleGoogleSuccess = async (authCode) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "/api/auth/login/google",
        {
          authorizationCode: authCode,
        },
      );

      if (response.data.success) {
        toast.success("Đăng nhập bằng Google thành công!");
        handleLoginSuccess(response.data);
      } else {
        toast.error(response.data.message || "Đăng nhập Google thất bại");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        toast.error(
          err.response.data.message || "Xác thực tài khoản Google thất bại.",
        );
      } else {
        toast.error("Không thể kết nối kết nối đến máy chủ backend.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Thay chuỗi CLIENT_ID của cậu vào thuộc tính clientId dưới đây nhé
    <GoogleOAuthProvider clientId="173731891323-3l6hf3pd1erom3j3vj0u13uf1jr5sn7k.apps.googleusercontent.com">
      <div className="modal-overlay" onClick={handleClose}>
        <div className="login-card" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
          <div className="login-header">
            <h2 className="login-title">Đăng nhập</h2>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của cậu..."
                required
              />
            </div>

            <div className="input-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng nhập ngay"}
            </button>
          </form>

          <div className="divider">
            <span>hoặc</span>
          </div>

          {/* Sử dụng component nút Google đã tách riêng ở trên */}
          <GoogleLoginButton
            onGoogleSuccess={handleGoogleSuccess}
            isLoading={isLoading}
          />

          <p className="signup-prompt">
            Chưa có tài khoản?{" "}
            <span className="signup-link" onClick={handleSwitchToSignup}>
              Đăng ký ở đây nhé
            </span>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginModal;
