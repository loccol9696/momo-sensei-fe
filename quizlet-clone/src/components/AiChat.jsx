import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./AiChat.css";

const AiChat = () => {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "model", text: "Hừm, lại mò vào đây để nhờ Momo Sensei giúp học tiếng Nhật à? Thôi được rồi, có gì thắc mắc thì hỏi nhanh lên nhé! 😒" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [isImmersiveView, setIsImmersiveView] = useState(false);
  const messagesEndRef = useRef(null);

  // Extract moduleId from pathname if we are on a module page (e.g. /modules/123)
  const match = location.pathname.match(/\/modules\/(\d+)/);
  const moduleId = match ? parseInt(match[1], 10) : null;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatTyping]);

  // Periodically check if immersive view (study/games) is active to hide the floating button
  useEffect(() => {
    const checkImmersive = () => {
      const immersiveElement = document.querySelector(".study-game-layout, .flashcard-fullscreen-overlay");
      setIsImmersiveView(!!immersiveElement);
    };

    checkImmersive();
    const timer = setInterval(checkImmersive, 500);
    return () => clearInterval(timer);
  }, [location]);

  const handleSendChatMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    const textToSend = customText !== null ? customText : chatInput;
    if (!textToSend || !textToSend.trim()) return;

    const userMsg = { role: "user", text: textToSend };
    setChatMessages((prev) => [...prev, userMsg]);

    if (customText === null) {
      setChatInput("");
    }

    setIsChatTyping(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/ai/chat",
        {
          moduleId: moduleId, // Sent if present, otherwise null
          message: textToSend,
          history: chatMessages
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (response.data.success) {
        const replyText = response.data.data;
        setChatMessages((prev) => [...prev, { role: "model", text: replyText }]);
      } else {
        setChatMessages((prev) => [...prev, { role: "model", text: "Momo Sensei gặp sự cố phản hồi. Cậu thử lại nhé! 🌸" }]);
      }
    } catch (err) {
      console.error("AI Chat error:", err);
      setChatMessages((prev) => [...prev, { role: "model", text: "Xin lỗi cậu, Momo Sensei không thể kết nối tới máy chủ lúc này. 🌸" }]);
    } finally {
      setIsChatTyping(false);
    }
  };



  // Hide AI button during immersive games or study mode
  if (isImmersiveView) return null;

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        className="btn-ai-chat-floating"
        onClick={() => setIsChatOpen(true)}
        title="Chat với Momo Sensei"
      >
        <img
          src="/momo-mascot.png"
          alt="Momo Sensei"
          className="ai-chat-floating-avatar"
        />
        <span className="ai-chat-floating-label">Momo AI</span>
      </button>

      {/* DRAWER */}
      {isChatOpen && (
        <>
          <div className="ai-chat-overlay" onClick={() => setIsChatOpen(false)} />
          <div className="ai-chat-drawer">
            <div className="ai-chat-header">
              <div className="ai-chat-title-group">
                <img
                  src="/momo-mascot.png"
                  alt="Momo Sensei Avatar"
                  className="ai-chat-avatar"
                />
                <div className="ai-chat-header-info">
                  <h3>Momo Sensei</h3>
                  <span className="ai-chat-status">Trợ lý học tập AI</span>
                </div>
              </div>
              <button className="btn-chat-close" onClick={() => setIsChatOpen(false)}>
                &times;
              </button>
            </div>

            <div className="ai-chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-message-row ${msg.role}`}>
                  <div className={`chat-message-bubble ${msg.role}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatTyping && (
                <div className="chat-message-row model">
                  <div className="chat-message-bubble model typing-bubble">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="ai-chat-footer">

              <form onSubmit={handleSendChatMessage} className="ai-chat-input-form">
                <input
                  type="text"
                  className="ai-chat-input"
                  placeholder="Hỏi Momo Sensei để học tập..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isChatTyping}
                />
                <button type="submit" className="btn-chat-send" disabled={isChatTyping || !chatInput.trim()}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AiChat;
