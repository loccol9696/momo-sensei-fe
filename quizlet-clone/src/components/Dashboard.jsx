import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Dashboard.css";

const FolderIcon = () => (
  <svg
    width="64"
    height="64"
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

const SearchIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block" }}
  >
    {/* Magnifying Glass Handle */}
    <rect
      x="38.5"
      y="38.5"
      width="8"
      height="18"
      rx="4"
      transform="rotate(-45 38.5 38.5)"
      fill="url(#handleGrad)"
      stroke="#FF89A9"
      strokeWidth="3"
    />
    {/* Magnifying Glass Ring */}
    <circle
      cx="28"
      cy="28"
      r="15"
      fill="url(#lensGrad)"
      stroke="#FF89A9"
      strokeWidth="3"
    />
    {/* Lens Reflection (Cute crescent highlight instead of 3D glossy) */}
    <path
      d="M20 22C21.5 20 23.5 19 26 19"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* A couple of cute sparkles (magic/search effect) */}
    <path
      d="M49 14L50.2 17.5L53.5 18.7L50.2 19.9L49 23.4L47.8 19.9L44.5 18.7L47.8 17.5L49 14Z"
      fill="#FFF"
    />
    <path
      d="M49 14L50.2 17.5L53.5 18.7L50.2 19.9L49 23.4L47.8 19.9L44.5 18.7L47.8 17.5L49 14Z"
      stroke="#FF89A9"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M13 45L13.8 47.3L16 48L13.8 48.7L13 51L12.2 48.7L10 48L12.2 47.3L13 45Z"
      fill="#FFF"
    />
    <path
      d="M13 45L13.8 47.3L16 48L13.8 48.7L13 51L12.2 48.7L10 48L12.2 47.3L13 45Z"
      stroke="#FF89A9"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="handleGrad" x1="38.5" y1="38.5" x2="46.5" y2="56.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FF89A9" />
        <stop offset="100%" stopColor="#FF6B9E" />
      </linearGradient>
      <linearGradient id="lensGrad" x1="13" y1="13" x2="43" y2="43" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="60%" stopColor="#FFF0F5" />
        <stop offset="100%" stopColor="#FFE0EA" />
      </linearGradient>
    </defs>
  </svg>
);

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleTopicClick = (topic) => {
    if (topic === "folders") {
      navigate("/folders");
    } else if (topic === "search") {
      navigate("/search-modules");
    } else {
      toast.info("Tính năng này đang được phát triển, cậu chờ chút nhé!");
    }
  };

  const topics = [
    {
      id: "folders",
      icon: <FolderIcon />,
      title: "Thư mục học tập",
      description: "Tự tạo, quản lý và ôn tập các từ vựng theo chủ đề của riêng cậu.",
      active: true,
      badge: "Học ngay",
    },
    {
      id: "search",
      icon: <SearchIcon />,
      title: "Tìm kiếm học phần",
      description: "Tìm kiếm các học phần từ người khác.",
      active: true,
      badge: "Tìm ngay",
    },
    // {
    //   id: "cadao",
    //   icon: "📜",
    //   title: "Ca dao tục ngữ",
    //   description: "Khám phá kho tàng ca dao, tục ngữ Việt Nam qua tranh minh họa dễ thương.",
    //   active: false,
    //   badge: "Sắp ra mắt",
    // },
    // {
    //   id: "jlpt",
    //   icon: "🎌",
    //   title: "Từ vựng JLPT",
    //   description: "Chinh phục kỳ thi tiếng Nhật với hàng ngàn thẻ từ vựng phân loại từ N5 đến N1.",
    //   active: false,
    //   badge: "Sắp ra mắt",
    // },
    // {
    //   id: "quiz-arena",
    //   icon: "🏆",
    //   title: "Đấu trường trắc nghiệm",
    //   description: "Cùng so tài trả lời nhanh các bộ câu hỏi thú vị và giành vị trí dẫn đầu bảng xếp hạng.",
    //   active: false,
    //   badge: "Sắp ra mắt",
    // },
    // {
    //   id: "match-game",
    //   icon: "🧩",
    //   title: "Game ghép thẻ",
    //   description: "Rèn luyện trí nhớ và phản xạ bằng cách ghép cặp từ vựng nhanh nhất có thể.",
    //   active: false,
    //   badge: "Sắp ra mắt",
    // },
    // {
    //   id: "stats",
    //   icon: "📊",
    //   title: "Sổ tay thành tích",
    //   description: "Xem lại thống kê số từ đã thuộc, thời gian học và chuỗi streak học tập hàng ngày.",
    //   active: false,
    //   badge: "Sắp ra mắt",
    // },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-back-wrapper">
        <button className="btn-back" onClick={() => navigate("/")}>
          ← Quay lại
        </button>
      </div>

      <div className="topics-grid">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className={`topic-card ${!topic.active ? "coming-soon" : ""}`}
            onClick={() => handleTopicClick(topic.id)}
          >
            {!topic.active && <span className="badge-soon">{topic.badge}</span>}
            <div className="topic-icon">{topic.icon}</div>
            <h3>{topic.title}</h3>
            <p>{topic.description}</p>
            {topic.active ? (
              <span className="topic-btn">{topic.badge}</span>
            ) : (
              <span className="topic-btn disabled">Đang phát triển...</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
