import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./SignupModal.css";

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);

  if (!isOpen) return null;

  // Hàm dọn dẹp toàn bộ form
  const clearForm = () => {
    setStep(1);
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOtpValues(["", "", "", "", "", ""]);
    setShowConfirmBack(false);
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const handleSwitchToLogin = () => {
    clearForm();
    onSwitchToLogin();
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "/api/auth/register",
        {
          fullName: fullName,
          email: email,
          password: password,
        },
      );

      if (response.data.success) {
        toast.success("Đã gửi mã OTP đến email của cậu!");
        setStep(2);
      } else {
        toast.error(response.data.message || "Đăng ký thất bại");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        toast.error(
          err.response.data.message || "Email đã tồn tại hoặc lỗi dữ liệu.",
        );
      } else {
        toast.error("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.substring(value.length - 1);
    setOtpValues(newOtpValues);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const finalOtp = otpValues.join("");

    try {
      const response = await axios.post(
        "/api/auth/register/verify",
        {
          email: email,
          otpCode: finalOtp,
        },
      );

      if (response.data.success) {
        toast.success("Đăng ký thành công! Hãy đăng nhập nhé.");
        handleSwitchToLogin(); // Chuyển sang login và tự động xóa form
      } else {
        toast.error(response.data.message || "Xác thực thất bại");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        toast.error(
          err.response.data.message || "Mã OTP không đúng hoặc đã hết hạn.",
        );
      } else {
        toast.error("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmGoBack = () => {
    setStep(1);
    setShowConfirmBack(false);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="signup-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>
          ×
        </button>

        <div className="signup-header">
          <h2 className="signup-title">
            {step === 1 ? "Đăng ký" : "Xác thực OTP"}
          </h2>
          {step === 2 && !showConfirmBack && (
            <p className="otp-prompt">
              Vui lòng kiểm tra email <br />
              <b>{email}</b> để lấy mã nhé.
            </p>
          )}
        </div>

        {step === 1 ? (
          <>
            <form onSubmit={handleSignupSubmit} className="signup-form">
              <div className="input-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập tên của cậu..."
                  required
                />
              </div>

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
                  placeholder="Tạo mật khẩu..."
                  required
                />
              </div>

              <div className="input-group">
                <label>Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu..."
                  required
                />
              </div>

              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Đăng ký ngay"}
              </button>
            </form>

            <p className="login-prompt">
              Đã có tài khoản?{" "}
              <span className="login-link" onClick={handleSwitchToLogin}>
                Đăng nhập thôi
              </span>
            </p>
          </>
        ) : (
          <div className="otp-step-container">
            {showConfirmBack ? (
              <div className="custom-confirm">
                <p>
                  Cậu có chắc muốn quay lại không?
                  <br />
                  Mã OTP sẽ bị hủy đó nha
                </p>
                <div className="confirm-actions">
                  <button className="btn-confirm-yes" onClick={confirmGoBack}>
                    Đồng ý
                  </button>
                  <button
                    className="btn-confirm-no"
                    onClick={() => setShowConfirmBack(false)}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="signup-form">
                <div className="otp-container">
                  {otpValues.map((value, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      className="otp-box"
                      value={value}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      ref={(el) => (inputRefs.current[index] = el)}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isLoading || otpValues.join("").length < 6}
                >
                  {isLoading ? "Đang xử lý..." : "Xác nhận OTP"}
                </button>

                <p className="login-prompt">
                  <span
                    className="login-link"
                    onClick={() => setShowConfirmBack(true)}
                  >
                    Quay lại
                  </span>
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupModal;
