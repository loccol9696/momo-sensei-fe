import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import ProfileModal from "./ProfileModal";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="cute-nav">
        {/* Bấm vào Logo sẽ về trang chủ */}
        <div
          className="logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          🌸モモだよ
        </div>

        <div className="nav-buttons">
          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div
                className="user-profile"
                onClick={() => setIsProfileOpen(true)}
                style={{ cursor: "pointer" }}
              >
                <span className="greeting">
                  {user?.name || user?.fullName || "Đang tải..."}
                </span>
              </div>
              <button
                className="btn-login"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <button
                className="btn-login"
                onClick={() => setIsLoginOpen(true)}
              >
                Đăng nhập
              </button>
              <button
                className="btn-signup"
                onClick={() => setIsSignupOpen(true)}
              >
                Đăng ký ngay
              </button>
            </>
          )}
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};

export default Header;
