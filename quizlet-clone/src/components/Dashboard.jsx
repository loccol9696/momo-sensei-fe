import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleTopicClick = (topic) => {
    if (topic === "folders") {
      navigate("/folders");
    } else {
      toast.info("Tính năng này đang được phát triển, cậu chờ chút nhé!");
    }
  };

  const topics = [
    {
      id: "folders",
      icon: "📁",
      title: "Thư mục học tập",
      description: "Tự tạo, quản lý và ôn tập các từ vựng theo chủ đề của riêng cậu.",
      active: true,
      badge: "Học ngay",
    },
    {
      id: "cadao",
      icon: "📜",
      title: "Ca dao tục ngữ",
      description: "Khám phá kho tàng ca dao, tục ngữ Việt Nam qua tranh minh họa dễ thương.",
      active: false,
      badge: "Sắp ra mắt",
    },
    {
      id: "jlpt",
      icon: "🎌",
      title: "Từ vựng JLPT",
      description: "Chinh phục kỳ thi tiếng Nhật với hàng ngàn thẻ từ vựng phân loại từ N5 đến N1.",
      active: false,
      badge: "Sắp ra mắt",
    },
    {
      id: "quiz-arena",
      icon: "🏆",
      title: "Đấu trường trắc nghiệm",
      description: "Cùng so tài trả lời nhanh các bộ câu hỏi thú vị và giành vị trí dẫn đầu bảng xếp hạng.",
      active: false,
      badge: "Sắp ra mắt",
    },
    {
      id: "match-game",
      icon: "🧩",
      title: "Game ghép thẻ",
      description: "Rèn luyện trí nhớ và phản xạ bằng cách ghép cặp từ vựng nhanh nhất có thể.",
      active: false,
      badge: "Sắp ra mắt",
    },
    {
      id: "stats",
      icon: "📊",
      title: "Sổ tay thành tích",
      description: "Xem lại thống kê số từ đã thuộc, thời gian học và chuỗi streak học tập hàng ngày.",
      active: false,
      badge: "Sắp ra mắt",
    },
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
