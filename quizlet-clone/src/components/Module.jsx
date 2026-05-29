import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Module.css";

const Module = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const fetchModule = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/modules/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setModuleData(response.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tải học phần!");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModule();
  }, [id]);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = () => {
    if (currentIndex < (moduleData?.cards?.length || 0) - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newTerm.trim() || !newDefinition.trim()) {
      return toast.warning("Thuật ngữ và định nghĩa không được để trống!");
    }

    setIsCreatingCard(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/api/modules/${id}/cards`,
        { term: newTerm, definition: newDefinition, imageUrl: newImageUrl },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Thêm thẻ thành công! 🎉");
      setNewTerm("");
      setNewDefinition("");
      setNewImageUrl("");
      setIsCreateCardModalOpen(false);
      fetchModule();
    } catch (err) {
      toast.error("Lỗi khi tạo thẻ.");
    } finally {
      setIsCreatingCard(false);
    }
  };

  if (loading)
    return <div className="loading-text">Đang tải học phần... ⏳</div>;
  if (!moduleData) return null;

  const currentCard =
    moduleData.cards && moduleData.cards.length > 0
      ? moduleData.cards[currentIndex]
      : null;

  return (
    <div className="module-detail-container">
      {/* HEADER GỌN */}
      <div className="module-header-container">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ⬅ Quay lại
          </button>
        </div>
        <div className="module-header-info">
          <h2 className="module-title">{moduleData.name}</h2>
          <p className="module-desc">{moduleData.description}</p>
        </div>
        <div className="header-right"></div>
      </div>

      {/* FLASHCARD */}
      {currentCard ? (
        <>
          <div className="flashcard-container" onClick={handleFlip}>
            <div className={`flashcard ${isFlipped ? "flipped" : ""}`}>
              <div className="flashcard-face flashcard-front">
                <div className="card-text">{currentCard.term}</div>
              </div>
              <div className="flashcard-face flashcard-back">
                <div className="card-text">{currentCard.definition}</div>
              </div>
            </div>
          </div>

          <div className="flashcard-controls">
            <button
              className="btn-control"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              ⬅ Trước
            </button>
            <div className="card-counter">
              {currentIndex + 1} / {moduleData.cards.length}
            </div>
            <button
              className="btn-control"
              onClick={handleNext}
              disabled={currentIndex === moduleData.cards.length - 1}
            >
              Sau ➡
            </button>
          </div>
        </>
      ) : (
        <div className="empty-cards-placeholder">
          Học phần này chưa có thẻ nào cả.
        </div>
      )}

      {/* META BOTTOM */}
      {/* <div className="module-meta-bottom">
        <span>
          Tác giả: <strong>{moduleData.ownerName}</strong>
        </span>
        <span>👁️ {moduleData.totalViews || 0} lượt xem</span>
        <span>❤️ {moduleData.totalLikes || 0} lượt thích</span>
        <span>📚 {moduleData.cards?.length || 0} thẻ</span>
      </div> */}

      {/* DANH SÁCH THẺ */}
      <div className="cards-list-section">
        <div className="cards-list-header">
          <h3>Các thẻ trong học phần</h3>
          <button
            className="btn-add-card"
            onClick={() => setIsCreateCardModalOpen(true)}
          >
            + Thêm thẻ mới
          </button>
        </div>
        <div className="cards-list">
          {moduleData.cards?.map((card, index) => (
            <div key={card.id} className="card-list-item">
              <div className="card-list-index">{index + 1}</div>
              <div className="card-list-content">
                <div className="card-list-term">{card.term}</div>
                <div className="card-list-divider"></div>
                <div className="card-list-def">{card.definition}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {isCreateCardModalOpen && (
        <div
          className="module-modal-overlay"
          onClick={() => setIsCreateCardModalOpen(false)}
        >
          <div
            className="module-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="module-modal-title">Thêm Thẻ Mới</h3>
            <form onSubmit={handleCreateCard}>
              <div className="module-form-group">
                <label>Thuật ngữ (*)</label>
                <input
                  className="module-form-input"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="module-form-group">
                <label>Định nghĩa (*)</label>
                <textarea
                  className="module-form-textarea"
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                />
              </div>
              <div className="module-form-group">
                <label>Ảnh (URL)</label>
                <input
                  className="module-form-input"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
              </div>
              <div className="module-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsCreateCardModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isCreatingCard}
                >
                  {isCreatingCard ? "Đang thêm..." : "Lưu thẻ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Module;
