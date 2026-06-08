import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  // Giữ lại state cho 2 form này để phục vụ nút "Bắt đầu học thôi"
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const switchToSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const switchToLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const handleStartLearning = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      setIsSignupOpen(true);
    }
  };

  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Học từ vựng siêu dễ thương! </h1>
          <p>
            Tạo thẻ ghi nhớ, ôn tập mỗi ngày và chinh phục mọi kỳ thi một cách
            nhẹ nhàng nhất.
          </p>
          <button className="btn-start" onClick={handleStartLearning}>
            Bắt đầu học thôi
          </button>
        </div>
        <div className="hero-image">
          <div className="cute-mascot">ʕ•ᴥ•ʔ</div>
        </div>
      </header>

      {/* Các Modal phục vụ cho người dùng chưa đăng nhập bấm từ màn hình Home */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={switchToSignup}
      />

      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
    </div>
  );
};

export default Home;
