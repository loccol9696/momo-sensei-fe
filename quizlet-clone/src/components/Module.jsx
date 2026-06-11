import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import "./Module.css";

const PasswordModal = ({ isOpen, onClose, onSubmit }) => {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
    setPassword("");
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  return (
    <div className="password-modal-overlay" onClick={handleClose}>
      <div className="password-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="password-modal-title">Nhập Mật Khẩu</h3>

        <form onSubmit={handleSubmit}>
          <div className="password-form-group">
            <input
              type="password"
              className="password-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              autoFocus
              required
            />
          </div>
          <div className="password-modal-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={handleClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-modal-submit"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Module = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password modal states for locked module
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideState, setSlideState] = useState("none");

  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  // State Import nhiều thẻ
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [rawText, setRawText] = useState("");
  const [cardSeparator, setCardSeparator] = useState("\\n");
  const [termSeparator, setTermSeparator] = useState("-");

  // State Chỉnh sửa thẻ
  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editTerm, setEditTerm] = useState("");
  const [editDefinition, setEditDefinition] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  // State Sửa chung & Sắp xếp thẻ (Bulk Edit & Reorder)
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [bulkCards, setBulkCards] = useState([]);
  const [bulkDeletedIds, setBulkDeletedIds] = useState([]);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const [studyOnlyStarred, setStudyOnlyStarred] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showFirst, setShowFirst] = useState("term"); // "term" or "definition"
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledCards, setShuffledCards] = useState([]);

  // Trạng thái học tập trực tiếp (Study Mode inline)
  const [isStudyConfigOpen, setIsStudyConfigOpen] = useState(false);
  const [studyMode, setStudyMode] = useState("choice"); // "choice" | "write"
  const [studyStarredOnly, setStudyStarredOnly] = useState(false);

  const [isStudying, setIsStudying] = useState(false);
  const [studyQuestions, setStudyQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [studyCurrentIndex, setStudyCurrentIndex] = useState(0);
  const [studyStep, setStudyStep] = useState("playing"); // "playing" | "summary"

  // Trạng thái câu trả lời hiện tại
  const [studyUserAnswer, setStudyUserAnswer] = useState("");
  const [studySelectedOption, setStudySelectedOption] = useState("");
  const [studyChecked, setStudyChecked] = useState(false);
  const [studyIsCorrect, setStudyIsCorrect] = useState(false);
  const [studyCorrectAnswer, setStudyCorrectAnswer] = useState("");
  const [studyChecking, setStudyChecking] = useState(false);

  // Thống kê bài học
  const [studyStats, setStudyStats] = useState({
    correct: 0,
    incorrect: 0,
    wrongQuestions: []
  });

  // Trạng thái trò chơi trực tiếp (Match Game inline)
  const [isGameConfigOpen, setIsGameConfigOpen] = useState(false);
  const [gameStarredOnly, setGameStarredOnly] = useState(false);
  const [gameMode, setGameMode] = useState("match"); // "match" | ...

  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const [gameElements, setGameElements] = useState([]);
  const [loadingGame, setLoadingGame] = useState(false);
  const [gameLevel, setGameLevel] = useState(1);
  const [gameStep, setGameStep] = useState("playing"); // "playing" | "summary"

  const [gameSelected, setGameSelected] = useState(null); // { cardId, cardType, content }
  const [gameMatchedCardIds, setGameMatchedCardIds] = useState([]); // array of matched card IDs
  const [gameWrongElements, setGameWrongElements] = useState([]); // elements showing red incorrect state
  const [gameTime, setGameTime] = useState(0); // in seconds
  const [gameChecking, setGameChecking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Trạng thái Trò chơi Trọng lực (Gravity Game)
  const [gravityStep, setGravityStep] = useState("playing"); // "playing" | "summary"
  const [gravityScore, setGravityScore] = useState(0);
  const [gravityLives, setGravityLives] = useState(3);
  const [gravityWords, setGravityWords] = useState([]);
  const [gravityInput, setGravityInput] = useState("");
  const [gravityInputWrong, setGravityInputWrong] = useState(false);
  const [gravityShowType, setGravityShowType] = useState("definition"); // "definition" | "term"
  const [gravityFlashRed, setGravityFlashRed] = useState(false);
  const [gravitySpawnedCardIds, setGravitySpawnedCardIds] = useState([]);
  const [exitConfirm, setExitConfirm] = useState({ isOpen: false, message: "", onConfirm: null });

  // Trạng thái Trò chơi Momo Runner
  const [runnerStep, setRunnerStep] = useState("playing"); // "playing" | "summary"
  const [runnerScore, setRunnerScore] = useState(0);
  const [runnerCoins, setRunnerCoins] = useState(0);
  const [runnerCombo, setRunnerCombo] = useState(0);
  const [runnerLives, setRunnerLives] = useState(3);
  const [runnerQuestions, setRunnerQuestions] = useState([]);
  const runnerCanvasRef = React.useRef(null);

  // Game Timer Hook
  useEffect(() => {
    let timerId = null;
    if (isPlayingGame && gameStep === "playing") {
      timerId = setInterval(() => {
        setGameTime((prevTime) => prevTime + 0.1);
      }, 100);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isPlayingGame, gameStep]);



  const isOwner = moduleData?.ownerId === user?.id;
  const activeCards = moduleData?.cards?.filter(card => !card.deleted && !card.isDeleted) || [];
  const starredCards = activeCards.filter(card => card.isStarred || card.starred) || [];
  const baseStudyCards = studyOnlyStarred ? activeCards.filter(card => card.isStarred || card.starred) : activeCards;
  const studyCards = isShuffled ? shuffledCards : baseStudyCards;

  const fetchModule = async (retryPassword = null) => {
    try {
      const token = localStorage.getItem("token");
      const urlPassword = retryPassword || sessionStorage.getItem(`module_password_${id}`) || "";
      const response = await axios.get(
        `http://localhost:8080/api/modules/${id}${urlPassword ? `?password=${encodeURIComponent(urlPassword)}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setModuleData(response.data.data);
        setIsPasswordModalOpen(false);
        if (urlPassword) {
          sessionStorage.setItem(`module_password_${id}`, urlPassword);
        }
      }
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || "";
      if (status === 403 && (message.includes("mật khẩu") || message.includes("Mật khẩu"))) {
        sessionStorage.removeItem(`module_password_${id}`);
        if (retryPassword) {
          toast.error(message || "Mật khẩu không đúng!");
        } else {
          setIsPasswordModalOpen(true);
        }
        return;
      }
      toast.error(message || "Không thể tải học phần!");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (password) => {
    fetchModule(password);
  };

  const handlePasswordCancel = () => {
    setIsPasswordModalOpen(false);
    navigate(-1);
  };

  const handleShareModule = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/modules/${id}/share`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (response.data.success && response.data.data) {
        const shareLink = response.data.data;
        await navigator.clipboard.writeText(shareLink);
        toast.success("Sao chép liên kết chia sẻ thành công!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể chia sẻ học phần này!");
    }
  };

  useEffect(() => {
    fetchModule();
  }, [id]);

  // Synchronize shuffled cards when base study cards change
  useEffect(() => {
    if (isShuffled) {
      const baseIds = new Set(baseStudyCards.map(c => c.id));
      // Keep only cards that are still in base study cards, and update their latest properties
      const updatedShuffled = shuffledCards
        .filter(c => baseIds.has(c.id))
        .map(c => baseStudyCards.find(bc => bc.id === c.id));

      // Find cards that are in base study cards but not in shuffledCards yet
      const shuffledIds = new Set(updatedShuffled.map(c => c.id));
      const newCards = baseStudyCards.filter(c => !shuffledIds.has(c.id));

      setShuffledCards([...updatedShuffled, ...newCards]);
    }
  }, [moduleData, studyOnlyStarred, isShuffled]);

  const handleFlip = () => {
    if (slideState !== "none") return;
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (slideState !== "none") return;
    if (currentIndex < studyCards.length - 1) {
      setSlideState("slide-out-left");
      setTimeout(() => {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
        setSlideState("slide-in-right");
        setTimeout(() => {
          setSlideState("none");
        }, 250);
      }, 200);
    }
  };

  const handlePrev = () => {
    if (slideState !== "none") return;
    if (currentIndex > 0) {
      setSlideState("slide-out-right");
      setTimeout(() => {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev - 1);
        setSlideState("slide-in-left");
        setTimeout(() => {
          setSlideState("none");
        }, 250);
      }, 200);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isStudying || isPlayingGame) return;

      const activeEl = document.activeElement?.tagName;
      if (activeEl === "INPUT" || activeEl === "TEXTAREA" || document.activeElement?.isContentEditable) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        if (currentIndex < studyCards.length - 1) {
          handleNext();
        }
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) {
          handlePrev();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, studyCards.length, isFlipped, slideState, isStudying, isPlayingGame]);

  // Refs for Gravity Game loop to prevent stale states
  const requestRef = React.useRef(null);
  const previousTimeRef = React.useRef(null);
  const gravityWordsRef = React.useRef([]);
  const gravityLivesRef = React.useRef(3);
  const gravityScoreRef = React.useRef(0);
  const gravitySpawnedCardIdsRef = React.useRef([]);
  const studyQuestionsRef = React.useRef([]);
  const boardHeight = 440; // board play area height in px

  // Sync refs with states
  useEffect(() => {
    gravityWordsRef.current = gravityWords;
  }, [gravityWords]);

  useEffect(() => {
    gravityLivesRef.current = gravityLives;
  }, [gravityLives]);

  useEffect(() => {
    gravityScoreRef.current = gravityScore;
  }, [gravityScore]);

  useEffect(() => {
    gravitySpawnedCardIdsRef.current = gravitySpawnedCardIds;
  }, [gravitySpawnedCardIds]);

  useEffect(() => {
    studyQuestionsRef.current = studyQuestions;
  }, [studyQuestions]);

  // Main game tick loop at 60fps
  const gravityTick = (time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000; // in seconds

      let lifeLost = false;
      const currentWords = gravityWordsRef.current;
      const updated = currentWords
        .map((w) => {
          if (w.isFading) return w;
          // Gradually speed up based on current score (4% increase per correct answer)
          const currentSpeed = w.speed * (1 + (gravityScoreRef.current / 100) * 0.04);
          const newY = w.y + currentSpeed * deltaTime;
          return { ...w, y: newY };
        })
        .filter((w) => {
          // Check boundary hit
          if (w.y >= boardHeight - 40 && !w.isFading) {
            lifeLost = true;
            return false; // remove
          }
          return true;
        });

      setGravityWords(updated);

      // Check if game is completed (all words spawned and all cleared/answered)
      if (updated.length === 0 && gravitySpawnedCardIdsRef.current.length >= studyQuestionsRef.current.length && studyQuestionsRef.current.length > 0) {
        setGravityStep("summary");
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
        }
      }

      if (lifeLost) {
        setGravityLives((prevLives) => {
          const nextLives = prevLives - 1;
          if (nextLives <= 0) {
            setGravityStep("summary");
            if (requestRef.current) {
              cancelAnimationFrame(requestRef.current);
              requestRef.current = null;
            }
          }
          return nextLives;
        });
        setGravityFlashRed(true);
        setTimeout(() => setGravityFlashRed(false), 200);
      }
    }

    previousTimeRef.current = time;
    if (gravityLivesRef.current > 0 && isPlayingGame && gameMode === "gravity" && gravityStep === "playing") {
      requestRef.current = requestAnimationFrame(gravityTick);
    }
  };

  // Trigger animation loop
  useEffect(() => {
    if (isPlayingGame && gameMode === "gravity" && gravityStep === "playing" && gravityLivesRef.current > 0) {
      previousTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(gravityTick);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isPlayingGame, gameMode, gravityStep]);

  // Spawning timer loop based on score difficulty
  useEffect(() => {
    let spawnIntervalId = null;
    if (isPlayingGame && gameMode === "gravity" && gravityStep === "playing" && gravityLives > 0) {
      // Balanced spawn rate acceleration: start at 3.0 seconds, decrease by 100ms per correct answer, down to a minimum of 1.5 seconds.
      const spawnInterval = Math.max(1500, 3000 - (gravityScore / 100) * 100);
      spawnIntervalId = setInterval(() => {
        spawnNewWord();
      }, spawnInterval);
    }

    return () => {
      if (spawnIntervalId) clearInterval(spawnIntervalId);
    };
  }, [isPlayingGame, gameMode, gravityStep, gravityLives, gravityScore, gravitySpawnedCardIds]);

  // Check if gravity game has finished (all questions spawned and all cleared from screen)
  useEffect(() => {
    if (
      isPlayingGame &&
      gameMode === "gravity" &&
      gravityStep === "playing" &&
      studyQuestions.length > 0 &&
      gravitySpawnedCardIds.length >= studyQuestions.length &&
      gravityWords.length === 0
    ) {
      setGravityStep("summary");
    }
  }, [gravityWords, gravitySpawnedCardIds, studyQuestions, isPlayingGame, gameMode, gravityStep]);

  const createFallingWordObject = (questionObj) => {
    const card = activeCards.find((c) => c.id === questionObj.cardId);
    const textToShow = gravityShowType === "term" ? card?.term : card?.definition;
    const answerToType = gravityShowType === "term" ? card?.definition : card?.term;

    return {
      id: `${questionObj.cardId}-${Date.now()}-${Math.random()}`,
      cardId: questionObj.cardId,
      text: textToShow || "Question",
      answer: answerToType || "Answer",
      x: 5 + Math.random() * 70, // random x between 5% and 75%
      y: -20, // start just offscreen
      speed: 30 + Math.random() * 15, // pixels per second
      isFading: false
    };
  };

  const spawnNewWord = () => {
    if (studyQuestions.length === 0) return;

    if (gravitySpawnedCardIds.length >= studyQuestions.length) return;

    const spawnedSet = new Set(gravitySpawnedCardIds);
    const availableQuestions = studyQuestions.filter((q) => !spawnedSet.has(q.cardId));

    if (availableQuestions.length === 0) return;

    const randomQ = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    const newWordObj = createFallingWordObject(randomQ);

    setGravityWords((prevWords) => [...prevWords, newWordObj]);
    setGravitySpawnedCardIds((prevSpawned) => [...prevSpawned, randomQ.cardId]);
  };

  const handleStartGravityGame = async () => {
    setLoadingGame(true);
    setGravityScore(0);
    setGravityLives(3);
    setGravityWords([]);
    setGravityInput("");
    setGravityStep("playing");
    setGravitySpawnedCardIds([]);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/study/write/${id}?isStarred=${gameStarredOnly}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const questionsList = response.data.data;
        if (questionsList.length === 0) {
          toast.warning("Học phần không có câu hỏi phù hợp để tạo trò chơi!");
          return;
        }
        setStudyQuestions(questionsList);

        // Spawn first word immediately
        const firstQ = questionsList[Math.floor(Math.random() * questionsList.length)];
        const card = activeCards.find((c) => c.id === firstQ.cardId);
        const textToShow = gravityShowType === "term" ? card?.term : card?.definition;
        const answerToType = gravityShowType === "term" ? card?.definition : card?.term;

        setGravityWords([{
          id: `${firstQ.cardId}-${Date.now()}`,
          cardId: firstQ.cardId,
          text: textToShow || "Question",
          answer: answerToType || "Answer",
          x: 10 + Math.random() * 60,
          y: -10,
          speed: 35,
          isFading: false
        }]);
        setGravitySpawnedCardIds([firstQ.cardId]);

        setGameMode("gravity");
        setIsPlayingGame(true);
        setIsGameConfigOpen(false);
      }
    } catch (err) {
      toast.error("Không thể tải câu hỏi Trọng lực!");
    } finally {
      setLoadingGame(false);
    }
  };

  const handleGravitySubmit = (e) => {
    e.preventDefault();
    if (!gravityInput.trim()) return;

    const typedAnswer = gravityInput.trim().toLowerCase();

    const normalizeText = (text) => {
      if (!text) return "";
      return text.toLowerCase().trim();
    };

    // Find match synchronously to avoid React state updater async race conditions
    const matchedWord = gravityWords.find(
      (w) => normalizeText(w.answer) === typedAnswer && !w.isFading
    );

    if (matchedWord) {
      setGravityWords((prevWords) =>
        prevWords.map((w) => (w.id === matchedWord.id ? { ...w, isFading: true } : w))
      );

      setTimeout(() => {
        setGravityWords((words) => words.filter((w) => w.id !== matchedWord.id));
      }, 400);

      setGravityScore((prev) => prev + 100);
      setGravityInput("");
      toast.dismiss();
    } else {
      setGravityInputWrong(true);
      setGravityInput("");
      setTimeout(() => setGravityInputWrong(false), 500);
    }
  };

  const handleStartStudy = async () => {
    const currentTotalCount = studyStarredOnly ? starredCards.length : activeCards.length;

    if (studyStarredOnly && starredCards.length === 0) {
      return toast.warning("Học phần này chưa có thẻ nào được gắn sao!");
    }
    if (!studyStarredOnly && activeCards.length === 0) {
      return toast.warning("Học phần này chưa có thẻ nào!");
    }

    if (studyMode === "choice" && currentTotalCount < 4) {
      return toast.warning("Cần ít nhất 4 thẻ để tạo bài học trắc nghiệm!");
    }

    setLoadingQuestions(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/study/${studyMode}/${id}?isStarred=${studyStarredOnly}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStudyQuestions(response.data.data);
        setStudyCurrentIndex(0);
        setStudyUserAnswer("");
        setStudySelectedOption("");
        setStudyChecked(false);
        setStudyStats({
          correct: 0,
          incorrect: 0,
          wrongQuestions: []
        });
        setStudyStep("playing");
        setIsStudying(true);
        setIsStudyConfigOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi khởi tạo câu hỏi!");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleCheckStudyAnswer = async (e, choiceAnswer = null) => {
    if (e) e.preventDefault();
    if (studyChecked || studyChecking) return;

    const answer = studyMode === "choice" ? choiceAnswer : studyUserAnswer;
    if (studyMode === "write" && !answer.trim()) {
      return toast.warning("Vui lòng nhập câu trả lời!");
    }

    setStudyChecking(true);
    const currentQuestion = studyQuestions[studyCurrentIndex];

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/api/study/check",
        {
          cardId: currentQuestion.cardId,
          userAnswer: answer
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const result = response.data.data;
        const answerCorrect = result.isCorrect !== undefined ? result.isCorrect : result.correct;
        setStudyIsCorrect(answerCorrect);
        setStudyCorrectAnswer(result.correctAnswer);
        setStudyChecked(true);

        if (studyMode === "choice") {
          setStudySelectedOption(answer);
        }

        if (answerCorrect) {
          setStudyStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
        } else {
          setStudyStats((prev) => ({
            ...prev,
            incorrect: prev.incorrect + 1,
            wrongQuestions: [
              ...prev.wrongQuestions,
              {
                question: currentQuestion.question,
                correctAnswer: result.correctAnswer,
                userAnswer: answer
              }
            ]
          }));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi kiểm tra đáp án!");
    } finally {
      setStudyChecking(false);
    }
  };

  const handleNextStudyQuestion = () => {
    if (studyCurrentIndex < studyQuestions.length - 1) {
      setStudyCurrentIndex((prev) => prev + 1);
      setStudyUserAnswer("");
      setStudySelectedOption("");
      setStudyChecked(false);
      setStudyIsCorrect(false);
      setStudyCorrectAnswer("");
    } else {
      setStudyStep("summary");
    }
  };

  const handleBackToModule = () => {
    setIsStudying(false);
    setStudyStep("playing");
  };

  const handleRestartStudy = async () => {
    setLoadingQuestions(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/study/${studyMode}/${id}?isStarred=${studyStarredOnly}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStudyQuestions(response.data.data);
        setStudyCurrentIndex(0);
        setStudyUserAnswer("");
        setStudySelectedOption("");
        setStudyChecked(false);
        setStudyIsCorrect(false);
        setStudyCorrectAnswer("");
        setStudyStats({
          correct: 0,
          incorrect: 0,
          wrongQuestions: []
        });
        setStudyStep("playing");
        setIsStudying(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi khởi tạo câu hỏi!");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleStartRunnerGame = async () => {
    setLoadingGame(true);
    setRunnerScore(0);
    setRunnerCoins(0);
    setRunnerCombo(0);
    setRunnerLives(3);
    setRunnerStep("playing");
    setRunnerQuestions([]);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/study/choice/${id}?isStarred=${gameStarredOnly}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const questionsList = response.data.data;
        if (questionsList.length === 0) {
          toast.warning("Học phần không có câu hỏi phù hợp để tạo trò chơi!");
          return;
        }
        setRunnerQuestions(questionsList);
        setGameMode("runner");
        setIsPlayingGame(true);
        setIsGameConfigOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tải câu hỏi trắc nghiệm!");
    } finally {
      setLoadingGame(false);
    }
  };

  // --- MOMO RUNNER PHYSICS & CANVAS DRAWING LOOP ---
  const runnerStateRef = React.useRef({
    momo: {
      x: 150,
      lane: 1,
      y: 190,
      targetY: 190,
      state: "running",
      jumpTime: 0,
      slideTime: 0,
      invincibleTime: 0,
      shieldTime: 0,
      magnetTime: 0,
      superTime: 0,
      doubleExpTime: 0,
      slowTime: 0,
      width: 45,
      height: 45
    },
    monster: {
      distance: 135,
      width: 60,
      height: 70,
      frame: 0,
      animTime: 0
    },
    bgOffset1: 0,
    bgOffset2: 0,
    bgOffset3: 0,
    obstacles: [],
    coins: [],
    gate: null,
    nextGateDistance: 500,
    totalDistanceScrolled: 0,
    lastTime: 0,
    shakeTime: 0,
    fogTime: 0,
    obstacleSpawnTimer: 2.0,
    coinSpawnTimer: 1.0,
    particleEffects: [],
    isGameOver: false,
    score: 0,
    coinsCollected: 0,
    combo: 0,
    lives: 3,
    notification: null
  });

  const triggerLaneChange = (direction) => {
    const state = runnerStateRef.current;
    if (state.isGameOver) return;
    const nextLane = Math.max(0, Math.min(3, state.momo.lane + direction));
    if (nextLane !== state.momo.lane) {
      state.momo.lane = nextLane;
      state.momo.targetY = 130 + nextLane * 60;
    }
  };

  const triggerJump = () => {
    const state = runnerStateRef.current;
    if (state.isGameOver || state.momo.state !== "running") return;
    state.momo.state = "jumping";
    state.momo.jumpTime = 0;
  };

  const triggerSlide = () => {
    const state = runnerStateRef.current;
    if (state.isGameOver || state.momo.state !== "running") return;
    state.momo.state = "sliding";
    state.momo.slideTime = 0;
  };

  const handleCanvasClick = (e) => {
    const canvas = runnerCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickY = ((e.clientY - rect.top) / rect.height) * 400;

    let clickedLane = -1;
    if (clickY >= 100 && clickY < 160) clickedLane = 0;
    else if (clickY >= 160 && clickY < 220) clickedLane = 1;
    else if (clickY >= 220 && clickY < 280) clickedLane = 2;
    else if (clickY >= 280 && clickY < 340) clickedLane = 3;

    if (clickedLane !== -1) {
      const state = runnerStateRef.current;
      state.momo.lane = clickedLane;
      state.momo.targetY = 130 + clickedLane * 60;
    }
  };

  const updateReactStats = () => {
    const state = runnerStateRef.current;
    setRunnerScore(Math.round(state.score));
    setRunnerCoins(state.coinsCollected);
    setRunnerCombo(state.combo);
    setRunnerLives(state.lives);
  };

  const spawnParticles = (x, y, color, count) => {
    const state = runnerStateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speedVal = 40 + Math.random() * 90;
      state.particleEffects.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speedVal,
        vy: Math.sin(angle) * speedVal,
        color: color,
        size: 2 + Math.random() * 4,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8
      });
    }
  };

  const updateRunnerPhysics = (dt) => {
    const state = runnerStateRef.current;

    if (state.momo.invincibleTime > 0) {
      state.momo.invincibleTime -= dt;
    }

    let isSlowed = false;
    if (state.momo.slowTime > 0) {
      state.momo.slowTime -= dt;
      isSlowed = true;
    }

    // Base speed starts at 200 and increases faster with distance, capped at 500
    const baseSpeed = 200 + Math.min(300, state.totalDistanceScrolled * 0.015);

    const isApproachingGate = !!(state.gate && !state.gate.passed && state.gate.x <= 400);

    let speed = baseSpeed;
    if (isApproachingGate) {
      speed = 130; // Slow down before the question so user has time to read and align
    } else {
      if (isSlowed) {
        speed = baseSpeed * 0.65;
      }
    }

    if (state.shakeTime > 0) state.shakeTime -= dt;
    if (state.fogTime > 0) state.fogTime -= dt;
    if (state.notification && state.notification.time > 0) {
      state.notification.time -= dt;
    }

    state.totalDistanceScrolled += speed * dt;
    state.score += speed * dt * 0.05;
    state.nextGateDistance -= speed * dt;

    state.momo.y += (state.momo.targetY - state.momo.y) * 0.18;

    if (state.momo.state === "jumping") {
      state.momo.jumpTime += dt;
      if (state.momo.jumpTime >= 0.6) {
        state.momo.state = "running";
        state.momo.jumpTime = 0;
      }
    }

    if (state.momo.state === "sliding") {
      state.momo.slideTime += dt;
      if (state.momo.slideTime >= 0.6) {
        state.momo.state = "running";
        state.momo.slideTime = 0;
      }
    }

    state.bgOffset1 = (state.bgOffset1 + speed * 0.12 * dt) % 800;
    state.bgOffset2 = (state.bgOffset2 + speed * 0.35 * dt) % 800;
    state.bgOffset3 = (state.bgOffset3 + speed * dt) % 800;

    // Update monster animation time
    state.monster.animTime = (state.monster.animTime || 0) + dt;

    // Monster distance updates and recovery from far distance
    let monsterSpeed = baseSpeed;
    if (isApproachingGate) {
      monsterSpeed = 130; // Keep monster distance constant during slow down
    }
    let speedDiff = speed - monsterSpeed;

    if (speedDiff > 0) {
      // Momo is running faster (due to super) -> monster falls behind
      state.monster.distance = Math.min(250, state.monster.distance + speedDiff * dt);
    } else {
      // Recovery: if monster is further than 135, slowly drift back to default 135
      if (state.monster.distance > 135) {
        state.monster.distance = Math.max(135, state.monster.distance - 20 * dt);
      }
    }

    if (state.monster.distance <= 10) {
      if (state.momo.invincibleTime <= 0) {
        state.lives -= 1;
        if (state.lives <= 0) {
          state.isGameOver = true;
          setRunnerStep("summary");
        } else {
          state.monster.distance = 135;
          state.momo.invincibleTime = 2.5; // Give 2.5 seconds of invincibility
          state.momo.slowTime = 0; // Clear slow penalty
          state.fogTime = 0; // Clear fog penalty
          state.shakeTime = 0.5;
        }
        updateReactStats();
      } else {
        // Reset to default distance if Momo is invincible to prevent vibration/multiple hits
        state.monster.distance = 135;
      }
    }

    state.coins.forEach((item) => {
      if (state.momo.magnetTime > 0) {
        let momoJumpY = 0;
        if (state.momo.state === "jumping") {
          momoJumpY = -Math.sin((state.momo.jumpTime / 0.6) * Math.PI) * 75;
        }
        const momoYVal = state.momo.y + momoJumpY;
        const itemYVal = 130 + item.lane * 60;

        const dx = state.momo.x - item.x;
        const dy = momoYVal - itemYVal;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
          item.x += (dx / dist) * 350 * dt;
          item.lane += (state.momo.lane - item.lane) * 0.15;
        } else {
          item.x -= speed * dt;
        }
      } else {
        item.x -= speed * dt;
      }

      let momoJumpY = 0;
      if (state.momo.state === "jumping") {
        momoJumpY = -Math.sin((state.momo.jumpTime / 0.6) * Math.PI) * 75;
      }
      const momoYVal = state.momo.y + momoJumpY;
      const itemYVal = 130 + Math.round(item.lane) * 60;

      if (Math.abs(item.x - state.momo.x) < 26 && Math.abs(itemYVal - momoYVal) < 26) {
        const multiplier = state.momo.doubleExpTime > 0 ? 2 : 1;
        if (item.type === "mochi") {
          state.coinsCollected += 2 * multiplier;
          state.score += 50;
          spawnParticles(item.x, itemYVal, "#ff6b9e", 8);
        } else {
          state.coinsCollected += 1 * multiplier;
          state.score += 20;
          spawnParticles(item.x, itemYVal, "#ffd43b", 5);
        }
        item.x = -100;
        updateReactStats();
      }
    });
    state.coins = state.coins.filter((c) => c.x > -20);

    state.obstacles.forEach((obs) => {
      obs.x -= speed * dt;

      let momoJumpY = 0;
      if (state.momo.state === "jumping") {
        momoJumpY = -Math.sin((state.momo.jumpTime / 0.6) * Math.PI) * 75;
      }
      const momoYVal = state.momo.y + momoJumpY;
      const obsYVal = 130 + obs.lane * 60;

      if (Math.abs(obs.x - state.momo.x) < 28 && Math.abs(obsYVal - momoYVal) < 24) {
        let dodged = false;
        if (obs.type === "rock" && state.momo.state === "jumping" && momoJumpY < -24) {
          dodged = true;
        } else if ((obs.type === "fence" || obs.type === "bird") && state.momo.state === "sliding") {
          dodged = true;
        }

        if (!dodged) {
          if (state.momo.invincibleTime <= 0 && state.momo.superTime <= 0) {
            if (state.momo.shieldTime > 0) {
              state.momo.shieldTime = 0;
              state.momo.invincibleTime = 1.2;
              spawnParticles(obs.x, obsYVal, "#00bfff", 15);
            } else {
              state.monster.distance = Math.max(0, state.monster.distance - 45);
              state.momo.invincibleTime = 1.8;
              state.shakeTime = 0.5;
              spawnParticles(obs.x, obsYVal, "#8e8e93", 10);

              if (state.monster.distance <= 10) {
                state.lives -= 1;
                if (state.lives <= 0) {
                  state.isGameOver = true;
                  setRunnerStep("summary");
                } else {
                  state.monster.distance = 135;
                  state.momo.invincibleTime = 2.5;
                  state.momo.slowTime = 0;
                  state.fogTime = 0;
                }
              }
            }
            obs.x = -100;
            updateReactStats();
          }
        }
      }
    });
    state.obstacles = state.obstacles.filter((o) => o.x > -20);

    state.obstacleSpawnTimer -= dt;
    if (state.obstacleSpawnTimer <= 0) {
      // Create a safe zone of 450 units around gate spawns
      if (!state.gate && state.nextGateDistance >= 450) {
        const speedProgress = Math.min(1, (baseSpeed - 200) / 300);

        // Shuffle lanes to select distinct lanes for multiple obstacles
        const lanes = [0, 1, 2, 3];
        for (let i = lanes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
        }

        // As speed/difficulty increases, there is a higher chance to spawn 2 obstacles in different lanes
        const spawnCount = (Math.random() < speedProgress * 0.75) ? 2 : 1;

        for (let i = 0; i < spawnCount; i++) {
          const types = ["rock", "fence", "bird"];
          const randomType = types[Math.floor(Math.random() * types.length)];
          state.obstacles.push({
            id: Math.random() + i,
            x: 850,
            lane: lanes[i],
            type: randomType
          });
        }

        // Spawn interval gets shorter and denser as baseSpeed increases (progressing difficulty)
        const baseTimer = 1.6 - speedProgress * 1.25; // goes from 1.6s down to 0.35s
        state.obstacleSpawnTimer = baseTimer + Math.random() * 0.4;
      } else {
        state.obstacleSpawnTimer = 0.3; // check soon
      }
    }

    // Coins and mochi spawning has been completely removed to clean up tracks

    if (state.nextGateDistance <= 0 && !state.gate) {
      if (state.runnerQuestions.length > 0) {
        if (state.currentQuestionIndex < state.runnerQuestions.length) {
          const questionObj = state.runnerQuestions[state.currentQuestionIndex];
          state.currentQuestionIndex++;

          const card = activeCards.find((c) => c.id === questionObj.cardId);
          const correctTerm = card ? card.term : "";

          state.gate = {
            x: 850,
            questionObj: questionObj,
            options: questionObj.options,
            correctAnswer: correctTerm,
            passed: false
          };
          // Let the existing obstacles scroll off screen naturally; new ones are already blocked by the safe zone.
        }
      }
    }

    if (state.gate) {
      state.gate.x -= speed * dt;

      if (state.gate.x <= state.momo.x + 10 && !state.gate.passed) {
        state.gate.passed = true;

        const momoLane = state.momo.lane;
        const selectedOption = state.gate.options[momoLane];
        const isCorrect = (selectedOption === state.gate.correctAnswer);

        if (isCorrect) {
          state.score += 500;
          // Pushing the monster back by 45 units as a correct answer reward!
          state.monster.distance = Math.min(135, state.monster.distance + 45);
          spawnParticles(state.momo.x + 20, state.momo.y, "#ff6b9e", 25);
          spawnParticles(state.momo.x + 20, state.momo.y, "#ffb7ce", 15);
        } else {
          state.shakeTime = 0.8;
          spawnParticles(state.momo.x, state.momo.y, "#9e2a2b", 20);

          // Always move the monster closer by 45 units on wrong answer
          state.monster.distance = Math.max(0, state.monster.distance - 45);

          if (state.monster.distance <= 10) {
            state.lives -= 1;
            if (state.lives <= 0) {
              state.isGameOver = true;
              setRunnerStep("summary");
            } else {
              state.monster.distance = 135;
              state.momo.invincibleTime = 2.5;
              state.momo.slowTime = 0;
              state.fogTime = 0;
            }
          } else {
            // Apply a secondary penalty (slow or fog) if the monster hasn't caught Momo
            const penaltiesList = ["slow", "fog"];
            const penalty = penaltiesList[Math.floor(Math.random() * penaltiesList.length)];
            if (penalty === "slow") {
              state.momo.slowTime = 5.0;
              state.momo.superTime = 0;
            } else if (penalty === "fog") {
              state.fogTime = 6.0;
            }
          }
        }
        updateReactStats();
      }

      if (state.gate.x < -150) {
        state.gate = null;
        if (state.currentQuestionIndex >= state.runnerQuestions.length) {
          state.isGameOver = true;
          setRunnerStep("summary");
        } else {
          state.nextGateDistance = 1200 + Math.random() * 600;
        }
      }
    }

    state.particleEffects.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    });
    state.particleEffects = state.particleEffects.filter((p) => p.life > 0);
  };

  const drawRunnerGame = (ctx, canvas, timestamp) => {
    const state = runnerStateRef.current;

    ctx.save();

    if (state.shakeTime > 0) {
      const dx = (Math.random() - 0.5) * 8;
      const dy = (Math.random() - 0.5) * 8;
      ctx.translate(dx, dy);
    }

    const skyGrad = ctx.createLinearGradient(0, 0, 0, 400);
    skyGrad.addColorStop(0, "#ffe3ec");
    skyGrad.addColorStop(1, "#fff0f5");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 800, 400);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    for (let i = 0; i < 3; i++) {
      const cx = (800 - state.bgOffset1 + i * 350) % 1000 - 100;
      const cy = 40 + i * 20;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.arc(cx + 25, cy - 5, 25, 0, Math.PI * 2);
      ctx.arc(cx + 45, cy + 5, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#ffdae5";
    for (let i = 0; i < 3; i++) {
      const hx = (800 - state.bgOffset2 + i * 400) % 1200 - 200;
      ctx.beginPath();
      ctx.moveTo(hx, 400);
      ctx.quadraticCurveTo(hx + 200, 200, hx + 400, 400);
      ctx.fill();
    }

    ctx.fillStyle = "#ffb7ce";
    for (let i = 0; i < 4; i++) {
      const tx = (800 - state.bgOffset2 + i * 300) % 1000 - 50;
      ctx.fillRect(tx, 300, 8, 100);
      ctx.beginPath();
      ctx.arc(tx + 4, 280, 25, 0, Math.PI * 2);
      ctx.arc(tx - 15, 290, 20, 0, Math.PI * 2);
      ctx.arc(tx + 23, 290, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#fce8ed";
    ctx.fillRect(0, 100, 800, 300);

    ctx.strokeStyle = "#ffe0ea";
    ctx.lineWidth = 4;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 130 + i * 60);
      ctx.lineTo(800, 130 + i * 60);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255, 137, 169, 0.25)";
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 25]);
    ctx.lineDashOffset = state.bgOffset3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 160 + i * 60);
      ctx.lineTo(800, 160 + i * 60);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    if (state.gate) {
      const gateX = state.gate.x;
      for (let laneIdx = 0; laneIdx < 4; laneIdx++) {
        const laneY = 130 + laneIdx * 60;
        const optionText = state.gate.options[laneIdx] || "";

        ctx.fillStyle = "rgba(255, 107, 158, 0.08)";
        ctx.strokeStyle = "#ff6b9e";
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.roundRect(gateX - 50, laneY - 24, 100, 48, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ff89a9";
        ctx.beginPath();
        ctx.arc(gateX - 50, laneY, 6, 0, Math.PI * 2);
        ctx.arc(gateX + 50, laneY, 6, 0, Math.PI * 2);
        ctx.fill();

        let fontSize = 13;
        if (optionText.length > 15) fontSize = 10;
        if (optionText.length > 25) fontSize = 8;

        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.roundRect(gateX - 45, laneY - 14, 90, 28, 8);
        ctx.fill();
        ctx.strokeStyle = "#ffe0ea";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#5a4b5e";
        ctx.fillText(optionText, gateX, laneY);
      }
    }

    state.coins.forEach((item) => {
      const itemY = 130 + item.lane * 60;
      if (item.type === "mochi") {
        ctx.fillStyle = "#ffb7ce";
        ctx.beginPath();
        ctx.arc(item.x - 8, itemY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(item.x, itemY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#b8e994";
        ctx.beginPath();
        ctx.arc(item.x + 8, itemY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#d2b48c";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(item.x - 16, itemY);
        ctx.lineTo(item.x + 16, itemY);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#ffd43b";
        ctx.beginPath();
        ctx.arc(item.x, itemY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f59f00";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("★", item.x, itemY + 0.5);
      }
    });

    state.obstacles.forEach((obs) => {
      const obsY = 130 + obs.lane * 60;
      if (obs.type === "rock") {
        ctx.fillStyle = "#8e8e93";
        ctx.beginPath();
        ctx.moveTo(obs.x - 18, obsY + 18);
        ctx.lineTo(obs.x - 12, obsY - 12);
        ctx.lineTo(obs.x + 4, obsY - 16);
        ctx.lineTo(obs.x + 16, obsY - 4);
        ctx.lineTo(obs.x + 18, obsY + 18);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#636366";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (obs.type === "fence") {
        ctx.fillStyle = "#a1887f";
        ctx.fillRect(obs.x - 4, obsY - 26, 8, 52);
        ctx.fillRect(obs.x - 18, obsY - 16, 36, 6);
        ctx.fillRect(obs.x - 18, obsY + 4, 36, 6);
        ctx.strokeStyle = "#5d4037";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(obs.x - 18, obsY - 16, 36, 6);
      } else if (obs.type === "bird") {
        ctx.fillStyle = "#2c2c2e";
        ctx.beginPath();
        ctx.arc(obs.x, obsY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(obs.x - 4, obsY);
        ctx.lineTo(obs.x - 14, obsY - 12);
        ctx.lineTo(obs.x, obsY - 4);
        ctx.moveTo(obs.x + 4, obsY);
        ctx.lineTo(obs.x + 14, obsY - 12);
        ctx.lineTo(obs.x, obsY - 4);
        ctx.fill();
        ctx.fillStyle = "#ffd43b";
        ctx.beginPath();
        ctx.moveTo(obs.x - 6, obsY - 2);
        ctx.lineTo(obs.x - 14, obsY);
        ctx.lineTo(obs.x - 6, obsY + 2);
        ctx.fill();
      }
    });

    state.particleEffects.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    let momoJumpY = 0;
    if (state.momo.state === "jumping") {
      momoJumpY = -Math.sin((state.momo.jumpTime / 0.6) * Math.PI) * 75;
    }
    const momoX = state.momo.x;
    const momoY = state.momo.y + momoJumpY;

    let skipMomoDraw = false;
    if (state.momo.invincibleTime > 0) {
      if (Math.floor(state.momo.invincibleTime * 15) % 2 === 0) {
        skipMomoDraw = true;
      }
    }

    if (!skipMomoDraw) {
      ctx.save();
      ctx.translate(momoX, momoY);

      if (state.momo.superTime > 0) {
        ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
        ctx.beginPath();
        ctx.arc(-20, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 215, 0, 0.15)";
        ctx.beginPath();
        ctx.arc(-35, 3, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      let w = state.momo.width;
      let h = state.momo.height;
      if (state.momo.state === "sliding") {
        w = 54;
        h = 24;
      }

      const momoGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, w / 2);
      momoGrad.addColorStop(0, "#ffb7ce");
      momoGrad.addColorStop(0.7, "#ff6b9e");
      momoGrad.addColorStop(1, "#e64980");
      ctx.fillStyle = momoGrad;

      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ff6b9e";
      ctx.beginPath();
      ctx.moveTo(-w / 4, -h / 2.5);
      ctx.quadraticCurveTo(-w / 3, -h / 1.1, -w / 6, -h / 2);
      ctx.moveTo(w / 6, -h / 2);
      ctx.quadraticCurveTo(w / 3, -h / 1.1, w / 4, -h / 2.5);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(w / 8, -h / 8, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w / 3, -h / 8, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(w / 8 + 0.8, -h / 8 - 0.8, 1, 0, Math.PI * 2);
      ctx.arc(w / 3 + 0.8, -h / 8 - 0.8, 1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 107, 158, 0.6)";
      ctx.beginPath();
      ctx.arc(w / 12, h / 16, 4, 0, Math.PI * 2);
      ctx.arc(w / 2.6, h / 16, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(w / 4, 0, 3, 0, Math.PI);
      ctx.stroke();

      ctx.restore();

      if (state.momo.shieldTime > 0) {
        ctx.strokeStyle = "rgba(0, 191, 255, 0.8)";
        ctx.fillStyle = "rgba(0, 191, 255, 0.15)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(momoX, momoY, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (state.momo.superTime > 0) {
        ctx.strokeStyle = "rgba(255, 215, 0, 0.8)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(momoX, momoY, 28 + Math.sin(timestamp * 0.02) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const monsterX = momoX - state.monster.distance;
    const monsterY = state.momo.y;

    ctx.save();
    ctx.translate(monsterX, monsterY);

    const monsterGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 45);
    monsterGrad.addColorStop(0, "rgba(90, 30, 120, 0.95)");
    monsterGrad.addColorStop(0.7, "rgba(50, 10, 80, 0.85)");
    monsterGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = monsterGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(50, 10, 80, 0.7)";
    const tentacleCount = 5;
    for (let i = 0; i < tentacleCount; i++) {
      const angle = ((state.monster.animTime || 0) * 5 + i * (Math.PI * 2 / tentacleCount));
      const tx = Math.cos(angle) * 30;
      const ty = Math.sin(angle) * 30;
      ctx.beginPath();
      ctx.arc(tx, ty, 15, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.ellipse(8, -8, 6, 8, Math.PI / 6, 0, Math.PI * 2);
    ctx.ellipse(22, -8, 6, 8, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffd43b";
    ctx.fillRect(11, -10, 1.5, 5);
    ctx.fillRect(21, -10, 1.5, 5);



    ctx.restore();

    if (state.fogTime > 0) {
      const fogGrad = ctx.createRadialGradient(momoX, momoY, 120, momoX, momoY, 350);
      fogGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      fogGrad.addColorStop(0.6, "rgba(40, 35, 50, 0.45)");
      fogGrad.addColorStop(1, "rgba(20, 15, 25, 0.95)");
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, 0, 800, 400);

      ctx.font = "italic bold 12px sans-serif";
      ctx.fillStyle = "#ff4d79";
      ctx.textAlign = "center";
    }

    if (state.gate) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.strokeStyle = "#ff6b9e";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(100, 14, 600, 72, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ff6b9e";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("CÂU HỎI", 124, 34);

      ctx.fillStyle = "#5a4b5e";
      let qText = state.gate.questionObj.question || "";
      let qFontSize = 16;
      if (qText.length > 50) qFontSize = 13;
      if (qText.length > 80) qFontSize = 11;
      ctx.font = `bold ${qFontSize}px sans-serif`;
      ctx.fillText(qText, 124, 58);

      ctx.restore();
    }



    if (!window.lastRunnerLogTime) window.lastRunnerLogTime = 0;
    if (timestamp - window.lastRunnerLogTime > 2000) {
      window.lastRunnerLogTime = timestamp;
      console.log("[Momo Runner Debug]", {
        momo: { x: momoX, y: momoY, state: state.momo.state, width: state.momo.width, height: state.momo.height },
        monster: { x: monsterX, y: monsterY, distance: state.monster.distance },
        score: state.score,
        lives: state.lives
      });
    }

    ctx.restore();
  };

  const runnerTick = (timestamp) => {
    const canvas = runnerCanvasRef.current;
    if (!canvas) {
      requestRef.current = requestAnimationFrame(runnerTick);
      return;
    }
    const ctx = canvas.getContext("2d");
    const state = runnerStateRef.current;

    if (state.lastTime === 0) {
      state.lastTime = timestamp;
    }
    let dt = (timestamp - state.lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    state.lastTime = timestamp;

    if (!state.isGameOver) {
      updateRunnerPhysics(dt);
    }

    drawRunnerGame(ctx, canvas, timestamp);

    if (!state.isGameOver) {
      requestRef.current = requestAnimationFrame(runnerTick);
    }
  };

  // Keyboard controls effect
  useEffect(() => {
    if (!isPlayingGame || gameMode !== "runner" || runnerStep !== "playing") return;

    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "Space", "KeyW", "KeyS", "ShiftLeft", "ShiftRight", "ArrowRight"].includes(e.code) || ["ArrowUp", "ArrowDown", "Space", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      if (e.code === "ArrowUp" || e.code === "KeyW") {
        triggerLaneChange(-1);
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        triggerLaneChange(1);
      } else if (e.code === "Space") {
        triggerJump();
      } else if (e.code === "ShiftLeft" || e.code === "ShiftRight" || e.code === "KeyD" || e.code === "ArrowRight") {
        triggerSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlayingGame, gameMode, runnerStep]);

  // Animation Loop Effect
  useEffect(() => {
    if (isPlayingGame && gameMode === "runner" && runnerStep === "playing" && runnerQuestions.length > 0) {
      const state = runnerStateRef.current;
      state.isGameOver = false;
      state.lastTime = 0;
      state.score = 0;
      state.coinsCollected = 0;
      state.combo = 0;
      state.lives = 3;
      state.monster.distance = 135;
      state.bgOffset1 = 0;
      state.bgOffset2 = 0;
      state.bgOffset3 = 0;
      state.obstacles = [];
      state.coins = [];
      state.gate = null;
      state.nextGateDistance = 500;
      state.currentQuestionIndex = 0;
      state.momo.x = 150;
      state.momo.lane = 1;
      state.momo.y = 190;
      state.momo.targetY = 190;
      state.momo.state = "running";
      state.momo.invincibleTime = 0;
      state.totalDistanceScrolled = 0;
      state.obstacleSpawnTimer = 2.0;
      state.monster.animTime = 0;
      state.momo.shieldTime = 0;
      state.momo.magnetTime = 0;
      state.momo.superTime = 0;
      state.momo.doubleExpTime = 0;
      state.momo.slowTime = 0;
      state.shakeTime = 0;
      state.fogTime = 0;
      state.particleEffects = [];
      state.notification = null;
      state.runnerQuestions = runnerQuestions;

      updateReactStats();

      requestRef.current = requestAnimationFrame(runnerTick);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isPlayingGame, gameMode, runnerStep, runnerQuestions]);

  const renderRunnerGame = () => {
    return (
      <div className="study-game-layout game-layout runner-game-layout">
        {/* Game Navbar */}
        <div className="study-game-navbar game-navbar runner-navbar" style={{ position: "relative" }}>
          <button className="btn-back" onClick={() => {
            showExitConfirm("Cậu có chắc chắn muốn dừng chơi và thoát ra ngoài không?", () => {
              setIsPlayingGame(false);
            });
          }}>
            ← Thoát
          </button>
          <div className="study-game-nav-title" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            <span>{moduleData?.name}</span>
          </div>
          <div className="runner-stats-header" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div className="gravity-lives" style={{ display: "flex", gap: "2px" }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className="heart-icon">
                  {i < runnerLives ? "❤️" : "💔"}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* PLAYING STEP */}
        {runnerStep === "playing" && (
          <div className="runner-viewport">
            <canvas
              ref={runnerCanvasRef}
              width={800}
              height={400}
              onClick={handleCanvasClick}
              className="runner-canvas"
            />
          </div>
        )}

        {/* SUMMARY STEP */}
        {runnerStep === "summary" && (
          <div className="study-summary-container">
            <div className="study-summary-card game-summary-card">
              {runnerLives <= 0 ? (
                <>
                  <h2>Game Over!</h2>
                  <p className="study-summary-subtitle">Momo đã bị quái vật đuổi kịp. Hãy thử lại nhé!</p>
                </>
              ) : (
                <>
                  <h2>Chiến Thắng!</h2>
                  <p className="study-summary-subtitle">Momo đã xuất sắc vượt qua toàn bộ câu hỏi chặng đua!</p>
                </>
              )}



              <div className="study-summary-actions game-summary-actions">
                <button className="btn-summary-restart" onClick={handleStartRunnerGame} disabled={loadingGame}>
                  {loadingGame ? "Đang tải... " : " Chơi lại"}
                </button>
                <button className="btn-summary-back" onClick={() => setIsPlayingGame(false)}>
                  Quay về
                </button>
              </div>
            </div>
          </div>
        )}
        {renderExitConfirmModal()}
      </div>
    );
  };

  const handleStartGame = async () => {
    if (gameMode === "gravity") {
      handleStartGravityGame();
      return;
    }
    if (gameMode === "runner") {
      handleStartRunnerGame();
      return;
    }

    const currentTotalCount = gameStarredOnly ? starredCards.length : activeCards.length;
    if (gameStarredOnly && starredCards.length === 0) {
      return toast.warning("Học phần này chưa có thẻ nào được gắn sao!");
    }
    if (!gameStarredOnly && activeCards.length === 0) {
      return toast.warning("Học phần này chưa có thẻ nào!");
    }

    setLoadingGame(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/study/match/${id}?level=${gameLevel}&isStarred=${gameStarredOnly}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setGameElements(response.data.data);
        setGameSelected(null);
        setGameMatchedCardIds([]);
        setGameWrongElements([]);
        setGameTime(0);
        setGameStep("playing");
        setIsPlayingGame(true);
        setIsGameConfigOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi khởi tạo trò chơi!");
    } finally {
      setLoadingGame(false);
    }
  };

  const handleRestartGameLevel = async () => {
    setLoadingGame(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/study/match/${id}?level=${gameLevel}&isStarred=${gameStarredOnly}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setGameElements(response.data.data);
        setGameSelected(null);
        setGameMatchedCardIds([]);
        setGameWrongElements([]);
        setGameTime(0);
        setGameStep("playing");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi khởi động lại màn chơi!");
    } finally {
      setLoadingGame(false);
    }
  };

  const hasNextLevel = () => {
    const total = gameStarredOnly ? starredCards.length : activeCards.length;
    const INITIAL_PAIRS = 4;
    const PAIRS_STEP = 2;
    const MAX_PAIRS = 10;
    const levelReachMax = Math.floor((MAX_PAIRS - INITIAL_PAIRS) / PAIRS_STEP) + 1;

    let currentOffset = 0;
    if (gameLevel <= levelReachMax) {
      currentOffset = (gameLevel - 1) * (gameLevel + 2);
    } else {
      const offsetAtMax = (levelReachMax - 1) * (levelReachMax + 2);
      currentOffset = offsetAtMax + (gameLevel - levelReachMax) * MAX_PAIRS;
    }

    const cardsProcessed = currentOffset + (gameElements.length / 2);
    return cardsProcessed < total;
  };

  const handleNextGameLevel = async () => {
    const nextLevel = gameLevel + 1;
    setLoadingGame(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/study/match/${id}?level=${nextLevel}&isStarred=${gameStarredOnly}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setGameLevel(nextLevel);
        setGameElements(response.data.data);
        setGameSelected(null);
        setGameMatchedCardIds([]);
        setGameWrongElements([]);
        setGameTime(0);
        setGameStep("playing");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Cậu đã hoàn thành tất cả các màn chơi! 🎉");
    } finally {
      setLoadingGame(false);
    }
  };

  const handleExitGame = () => {
    setIsPlayingGame(false);
    setGameLevel(1);
    setGameElements([]);
    setGameSelected(null);
    setGameMatchedCardIds([]);
    setGameWrongElements([]);
    setGameTime(0);
    setGameStep("playing");
  };

  const handleSelectPiece = async (el) => {
    if (gameChecking || loadingGame) return;

    // Nếu thẻ này đã ghép cặp xong, bỏ qua
    if (gameMatchedCardIds.includes(el.cardId)) return;

    // Nếu chưa chọn thẻ nào, chọn thẻ hiện tại
    if (!gameSelected) {
      setGameSelected(el);
      return;
    }

    // Nếu bấm lại chính thẻ đang chọn, bỏ chọn
    if (gameSelected.cardId === el.cardId && gameSelected.cardType === el.cardType) {
      setGameSelected(null);
      return;
    }

    // Gửi API kiểm tra xem 2 thẻ có ghép cặp đúng không
    setGameChecking(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/api/study/match/check",
        {
          firstCardId: gameSelected.cardId,
          firstCardType: gameSelected.cardType,
          secondCardId: el.cardId,
          secondCardType: el.cardType
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const result = response.data.data;
        const isCorrect = result.isCorrect !== undefined ? result.isCorrect : result.correct;

        if (isCorrect) {
          // Thêm cardId vào danh sách đã ghép đúng
          const updatedMatched = [...gameMatchedCardIds, el.cardId];
          setGameMatchedCardIds(updatedMatched);
          setGameSelected(null);

          // Kiểm tra xem đã ghép hết chưa
          const totalPairs = gameElements.length / 2;
          if (updatedMatched.length === totalPairs) {
            setGameStep("summary");
          }
        } else {
          // Lưu cặp ghép sai để hiển thị màu đỏ
          setGameWrongElements([gameSelected, el]);
          setTimeout(() => {
            setGameWrongElements([]);
            setGameSelected(null);
          }, 800);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi kiểm tra cặp thẻ!");
      setGameSelected(null);
    } finally {
      setGameChecking(false);
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

      toast.success("Thêm thẻ thành công!");
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

  const handleImportCards = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) {
      return toast.warning("Nội dung nhập vào không được để trống!");
    }

    setIsImporting(true);
    try {
      const token = localStorage.getItem("token");

      let finalCardSep = cardSeparator;
      if (cardSeparator === "\\n") finalCardSep = "\n";
      else if (cardSeparator === "\\r\\n") finalCardSep = "\r\n";

      let finalTermSep = termSeparator;
      if (termSeparator === "\\t") finalTermSep = "\t";

      const response = await axios.post(
        `http://localhost:8080/api/modules/${id}/cards/import`,
        {
          rawText,
          cardSeparator: finalCardSep,
          termSeparator: finalTermSep,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Nhập thẻ hàng loạt thành công! 🎉");
        setRawText("");
        setIsImportModalOpen(false);
        fetchModule();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi nhập thẻ hàng loạt.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenEditModal = (card) => {
    setEditingCardId(card.id);
    setEditTerm(card.term);
    setEditDefinition(card.definition);
    setEditImageUrl(card.imageUrl || "");
    setIsEditCardModalOpen(true);
  };

  const handleUpdateCard = async (e) => {
    e.preventDefault();
    if (!editTerm.trim() || !editDefinition.trim()) {
      return toast.warning("Thuật ngữ và định nghĩa không được để trống!");
    }

    setIsUpdatingCard(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8080/api/cards/${editingCardId}`,
        { term: editTerm, definition: editDefinition, imageUrl: editImageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Cập nhật thẻ thành công!");
        setIsEditCardModalOpen(false);
        fetchModule();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật thẻ.");
    } finally {
      setIsUpdatingCard(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("Cậu có chắc muốn xóa thẻ này không?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:8080/api/cards/${cardId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Xóa thẻ thành công!");
        fetchModule();
        if (currentIndex >= activeCards.length - 1) {
          setCurrentIndex(Math.max(0, activeCards.length - 2));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa thẻ.");
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8080/api/cards/${cardId}/star`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        fetchModule();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi chuyển đổi trạng thái gắn sao.");
    }
  };

  // --- CHẾ ĐỘ SỬA CHUNG & KÉO THẢ SẮP XẾP THẺ (BULK EDIT & DRAG-AND-DROP REORDER) ---
  const draggedIndexRef = useRef(null);
  const [dragEnabledIndex, setDragEnabledIndex] = useState(null);

  const handleStartBulkEdit = () => {
    setBulkCards(activeCards.map(card => ({
      ...card,
      isModified: false,
      tempKey: card.id || `init-${Date.now()}-${Math.random()}`
    })));
    setBulkDeletedIds([]);
    setIsBulkEditMode(true);
  };

  const handleCancelBulkEdit = () => {
    showExitConfirm("Cậu có chắc muốn hủy các thay đổi vừa chỉnh sửa không?", () => {
      setIsBulkEditMode(false);
      setBulkCards([]);
      setBulkDeletedIds([]);
    });
  };

  const handleBulkCardChange = (index, field, value) => {
    setBulkCards(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
        isModified: true
      };
      return updated;
    });
  };

  const handleBulkAddCard = () => {
    setBulkCards(prev => [
      ...prev,
      {
        term: "",
        definition: "",
        imageUrl: "",
        isModified: true,
        tempKey: `new-${Date.now()}-${Math.random()}`
      }
    ]);
  };

  const handleBulkDeleteCard = (index) => {
    const cardToDelete = bulkCards[index];
    if (cardToDelete.id) {
      setBulkDeletedIds(prev => [...prev, cardToDelete.id]);
    }
    setBulkCards(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and Drop Event Handlers (Smoother swap-on-hover)
  const handleDragStart = (e, index) => {
    draggedIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget);
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
    draggedIndexRef.current = null;
    setDragEnabledIndex(null);
  };

  const handleDragOver = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = draggedIndexRef.current;
    if (sourceIndex === null || sourceIndex === undefined || sourceIndex === targetIndex) return;

    setBulkCards(prev => {
      const updated = [...prev];
      const [draggedCard] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, draggedCard);
      return updated;
    });

    draggedIndexRef.current = targetIndex;
  };

  const handleSaveBulkChanges = async () => {
    // Validation
    for (let i = 0; i < bulkCards.length; i++) {
      if (!bulkCards[i].term.trim() || !bulkCards[i].definition.trim()) {
        return toast.warning(`Thẻ thứ ${i + 1} không được để trống Thuật ngữ hoặc Định nghĩa!`);
      }
    }

    setIsBulkSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Delete cards on server
      for (const cardId of bulkDeletedIds) {
        await axios.delete(`http://localhost:8080/api/cards/${cardId}`, { headers });
      }

      // 2. Create new cards & Update modified ones
      const finalOrderedIds = [];

      for (const card of bulkCards) {
        if (!card.id) {
          // Create new card
          const response = await axios.post(
            `http://localhost:8080/api/modules/${id}/cards`,
            { term: card.term, definition: card.definition, imageUrl: card.imageUrl || "" },
            { headers }
          );
          if (response.data.success) {
            const newCardObj = response.data.data;
            if (newCardObj && newCardObj.id) {
              finalOrderedIds.push(newCardObj.id);
            }
          }
        } else {
          // Update existing card if modified
          if (card.isModified) {
            await axios.put(
              `http://localhost:8080/api/cards/${card.id}`,
              { term: card.term, definition: card.definition, imageUrl: card.imageUrl || "" },
              { headers }
            );
          }
          finalOrderedIds.push(card.id);
        }
      }

      // 3. Save order index on server
      if (finalOrderedIds.length > 0) {
        await axios.post(
          `http://localhost:8080/api/modules/${id}/cards/reorder`,
          finalOrderedIds,
          { headers }
        );
      }

      toast.success("Cập nhật học phần thành công!");
      setIsBulkEditMode(false);
      setBulkDeletedIds([]);
      setBulkCards([]);
      fetchModule();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi lưu thay đổi.");
    } finally {
      setIsBulkSaving(false);
    }
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleRestartFlashcards = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    if (isShuffled) {
      setShuffledCards(shuffleArray(baseStudyCards));
    }
    setIsSettingsOpen(false);
    toast.info("Đã khởi động lại thẻ ghi nhớ!");
  };

  const handleToggleShuffle = (checked) => {
    setIsShuffled(checked);
    if (checked) {
      setShuffledCards(shuffleArray(baseStudyCards));
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleToggleStarredOnly = (checked) => {
    setStudyOnlyStarred(checked);
    if (isShuffled) {
      const newBase = checked ? activeCards.filter(card => card.isStarred || card.starred) : activeCards;
      setShuffledCards(shuffleArray(newBase));
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const showExitConfirm = (message, onConfirmAction) => {
    setExitConfirm({
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirmAction();
        setExitConfirm({ isOpen: false, message: "", onConfirm: null });
      }
    });
  };

  const renderExitConfirmModal = () => {
    if (!exitConfirm.isOpen) return null;
    return (
      <div className="custom-confirm-overlay" onClick={() => setExitConfirm({ isOpen: false, message: "", onConfirm: null })}>
        <div className="custom-confirm-modal" onClick={(e) => e.stopPropagation()}>
          <p className="custom-confirm-message">{exitConfirm.message}</p>
          <div className="custom-confirm-actions">
            <button className="btn-confirm-yes" onClick={exitConfirm.onConfirm}>
              Đồng ý
            </button>
            <button className="btn-confirm-no" onClick={() => setExitConfirm({ isOpen: false, message: "", onConfirm: null })}>
              Hủy bỏ
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isPasswordModalOpen) {
    return (
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={handlePasswordCancel}
        onSubmit={handlePasswordSubmit}
      />
    );
  }

  if (loading)
    return <div className="loading-text">Đang tải học phần... ⏳</div>;
  if (!moduleData) return null;

  if (isStudying) {
    const currentQuestion = studyQuestions[studyCurrentIndex];
    const progressPercent = studyQuestions.length > 0 ? ((studyCurrentIndex) / studyQuestions.length) * 100 : 0;

    return (
      <div className="study-game-layout">
        {/* Study Mode Navigation */}
        <div className="study-game-navbar">
          <button className="btn-back" onClick={() => {
            showExitConfirm("Cậu có chắc chắn muốn dừng học và thoát ra ngoài không?", () => {
              handleBackToModule();
            });
          }}>
            ← Thoát
          </button>
          <div className="study-game-nav-title">
            <span>{moduleData?.name}</span>
            <span className="study-game-nav-badge">
              {studyMode === "choice" ? "Trắc nghiệm" : "Tự luận"}
            </span>
          </div>
          <div style={{ width: "80px" }}></div>
        </div>

        {/* 1. PLAYING STEP */}
        {studyStep === "playing" && currentQuestion && (
          <div className="study-game-container">
            {/* Progress bar */}
            <div className="study-progress-section">
              <div className="study-progress-info">
                <span>Câu hỏi {studyCurrentIndex + 1} / {studyQuestions.length}</span>
                <span className="study-score-mini">Đúng: {studyStats.correct} | Sai: {studyStats.incorrect}</span>
              </div>
              <div className="study-progress-bar-bg">
                <div className="study-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            <div className="question-play-card">
              {/* Question Text */}
              <div className="question-display-header">
                <span className="q-label">ĐỊNH NGHĨA</span>
                <h1 className="question-text">{currentQuestion.question}</h1>
              </div>

              <hr className="question-divider" />

              {/* Answer Controls */}
              <div className="answer-section">
                {/* CHẾ ĐỘ TRẮC NGHIỆM */}
                {studyMode === "choice" && (
                  <div className="choice-answers-grid">
                    {currentQuestion.options?.map((option, idx) => {
                      let btnClass = "";
                      if (studyChecked) {
                        if (option === studyCorrectAnswer) {
                          btnClass = "correct";
                        } else if (option === studySelectedOption) {
                          btnClass = "incorrect";
                        } else {
                          btnClass = "disabled";
                        }
                      }
                      return (
                        <button
                          key={idx}
                          className={`btn-choice-option ${btnClass}`}
                          onClick={(e) => handleCheckStudyAnswer(e, option)}
                          disabled={studyChecked}
                        >
                          <span className="option-number">{idx + 1}</span>
                          <span className="option-text">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* CHẾ ĐỘ TỰ LUẬN */}
                {studyMode === "write" && (
                  <form onSubmit={(e) => handleCheckStudyAnswer(e)} className="write-answer-form">
                    {!studyChecked ? (
                      <>
                        <input
                          type="text"
                          className="write-input-field"
                          placeholder="Nhập thuật ngữ chính xác..."
                          value={studyUserAnswer}
                          onChange={(e) => setStudyUserAnswer(e.target.value)}
                          autoFocus
                          disabled={studyChecking}
                        />
                        <button type="submit" className="btn-submit-answer" disabled={studyChecking}>
                          {studyChecking ? "Đang kiểm tra..." : "Kiểm tra"}
                        </button>
                      </>
                    ) : (
                      <div className="write-feedback-box">
                        {studyIsCorrect ? (
                          <div className="feedback-result correct">
                            <div className="feedback-content">
                              <h4>Chính xác! Xuất sắc quá!</h4>
                              <p>Đáp án: <strong>{studyCorrectAnswer}</strong></p>
                            </div>
                          </div>
                        ) : (
                          <div className="feedback-result incorrect">
                            <div className="feedback-content">
                              <h4>Chưa chính xác rồi, hãy cố gắng ở lần sau nhé!</h4>
                              <p>Đáp án đúng: <strong className="highlight-correct">{studyCorrectAnswer}</strong></p>
                              <p>Cậu đã nhập: <span className="highlight-wrong">{studyUserAnswer}</span></p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* Next control */}
              {studyChecked && (
                <div className="next-action-wrapper">
                  <button className="btn-next-question" onClick={handleNextStudyQuestion} autoFocus>
                    {studyCurrentIndex === studyQuestions.length - 1 ? "Xem kết quả" : "Tiếp tục"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. SUMMARY STEP */}
        {studyStep === "summary" && (
          <div className="study-summary-container">
            <div className="study-summary-card">
              <h2>Hoàn Thành Bài Học!</h2>
              <p className="study-summary-subtitle">Chúc mừng cậu đã hoàn thành mục tiêu học tập hôm nay!</p>

              <div className="study-stats-cards-row">
                <div className="study-stat-card correct">
                  <span className="study-stat-num">{studyStats.correct}</span>
                  <span className="study-stat-lbl">Trả lời đúng</span>
                </div>
                <div className="study-stat-card incorrect">
                  <span className="study-stat-num">{studyStats.incorrect}</span>
                  <span className="study-stat-lbl">Cần ôn lại</span>
                </div>
                <div className="study-stat-card percent">
                  <span className="study-stat-num">
                    {studyQuestions.length > 0 ? Math.round((studyStats.correct / studyQuestions.length) * 100) : 0}%
                  </span>
                  <span className="study-stat-lbl">Tỉ lệ chính xác</span>
                </div>
              </div>

              {/* Câu hỏi sai cần ôn tập */}
              {studyStats.wrongQuestions.length > 0 && (
                <div className="study-wrong-questions-section">
                  <h3>Các câu hỏi cần ôn tập lại:</h3>
                  <div className="study-wrong-questions-list">
                    {studyStats.wrongQuestions.map((q, idx) => (
                      <div key={idx} className="study-wrong-question-item">
                        <div className="study-wq-definition">{q.question}</div>
                        <div className="study-wq-answers">
                          <div className="study-wq-correct">Đúng: <strong>{q.correctAnswer}</strong></div>
                          <div className="study-wq-wrong">Cậu gõ: <span>{q.userAnswer || "(Để trống)"}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="study-summary-actions">
                <button
                  className="btn-summary-restart"
                  onClick={handleRestartStudy}
                  disabled={loadingQuestions}
                >
                  {loadingQuestions ? "Đang tải câu hỏi..." : "Học lại"}
                </button>
                <button
                  className="btn-summary-back"
                  onClick={handleBackToModule}
                  disabled={loadingQuestions}
                >
                  Quay về
                </button>
              </div>
            </div>
          </div>
        )}
        {renderExitConfirmModal()}
      </div>
    );
  }

  if (isPlayingGame) {
    if (gameMode === "match") {
      return (
        <div className="study-game-layout game-layout">
          {/* Game Navbar */}
          <div className="study-game-navbar game-navbar" style={{ position: "relative" }}>
            <button className="btn-back" onClick={() => {
              showExitConfirm("Cậu có chắc chắn muốn dừng chơi và thoát ra ngoài không?", () => {
                handleExitGame();
              });
            }}>
              ← Thoát
            </button>
            <div className="study-game-nav-title" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
              <span>{moduleData?.name}</span>
            </div>
          </div>

          {/* PLAYING STEP */}
          {gameStep === "playing" && (
            <div className="game-board-container">
              <div className="game-board-grid">
                {gameElements.map((el, idx) => {
                  const isMatched = gameMatchedCardIds.includes(el.cardId);
                  const isSelected = gameSelected && gameSelected.cardId === el.cardId && gameSelected.cardType === el.cardType;
                  const isWrong = gameWrongElements.some(w => w.cardId === el.cardId && w.cardType === el.cardType);

                  return (
                    <button
                      key={idx}
                      className={`btn-game-piece ${isSelected ? "selected" : ""} ${isWrong ? "incorrect" : ""} ${isMatched ? "matched" : ""}`}
                      onClick={() => handleSelectPiece(el)}
                      disabled={isMatched || gameWrongElements.length > 0 || gameChecking}
                    >
                      <span className="piece-content">{el.content}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUMMARY STEP */}
          {gameStep === "summary" && (
            <div className="study-summary-container">
              <div className="study-summary-card game-summary-card">
                <h2>Màn {gameLevel} Hoàn Thành!</h2>
                <p className="study-summary-subtitle">Chúc mừng cậu đã ghép xong tất cả các cặp thẻ!</p>



                <div className="study-summary-actions game-summary-actions">
                  <button className="btn-summary-restart" onClick={handleRestartGameLevel} disabled={loadingGame}>
                    {loadingGame ? "Đang tải... " : " Chơi lại màn này"}
                  </button>
                  {hasNextLevel() ? (
                    <button className="btn-summary-back btn-game-next" onClick={handleNextGameLevel} disabled={loadingGame}>
                      {loadingGame ? "Đang tải... " : "Màn tiếp theo"}
                    </button>
                  ) : (
                    <button className="btn-summary-back btn-game-exit" onClick={handleExitGame} disabled={loadingGame}>
                      Quay về học phần
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {renderExitConfirmModal()}
        </div>
      );
    } else if (gameMode === "gravity") {
      return (
        <div className="study-game-layout gravity-game-layout">
          {/* Gravity Header */}
          <div className="study-game-navbar gravity-navbar" style={{ position: "relative" }}>
            <button className="btn-back" onClick={() => {
              showExitConfirm("Cậu có chắc chắn muốn dừng chơi và thoát ra ngoài không?", () => {
                setIsPlayingGame(false);
              });
            }}>
              ← Thoát
            </button>
            <div className="study-game-nav-title" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
              <span>{moduleData?.name}</span>
            </div>
            <div className="gravity-lives">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className="heart-icon">
                  {i < gravityLives ? "❤️" : "💔"}
                </span>
              ))}
            </div>
          </div>

          {/* PLAYING STEP */}
          {gravityStep === "playing" && (
            <div className={`gravity-board ${gravityFlashRed ? "flash-red" : ""}`}>
              {gravityWords.map((word) => {
                const isDanger = word.y >= (boardHeight * 0.7);
                return (
                  <div
                    key={word.id}
                    className={`falling-word-bubble ${isDanger ? "danger-glow" : ""} ${word.isFading ? "fade-explode" : ""}`}
                    style={{
                      left: `${word.x}%`,
                      top: `${word.y}px`
                    }}
                  >
                    {word.text}
                  </div>
                );
              })}

              {/* Bottom input bar */}
              <form onSubmit={handleGravitySubmit} className="gravity-input-form">
                <input
                  type="text"
                  className={`gravity-input-field ${gravityInputWrong ? "input-shake" : ""}`}
                  placeholder="Gõ và nhấn Enter..."
                  value={gravityInput}
                  onChange={(e) => setGravityInput(e.target.value)}
                  autoFocus
                  disabled={gravityLives <= 0}
                />
              </form>
            </div>
          )}

          {/* SUMMARY STEP */}
          {gravityStep === "summary" && (
            <div className="study-summary-container">
              <div className="study-summary-card gravity-summary-card">
                {gravityLives > 0 ? (
                  <>
                    <h2>Chúc mừng!</h2>
                    <p className="study-summary-subtitle">Cậu đã hoàn thành xuất sắc tất cả các từ!</p>
                  </>
                ) : (
                  <>
                    <h2>Trò chơi Kết Thúc!</h2>
                    <p className="study-summary-subtitle">Cậu đã chiến đấu rất anh dũng!</p>
                  </>
                )}

                <div className="study-summary-actions game-summary-actions">
                  <button className="btn-summary-restart" onClick={handleStartGravityGame} disabled={loadingGame}>
                    {loadingGame ? "Đang tải... " : "Chơi lại"}
                  </button>
                  <button className="btn-summary-back" onClick={() => setIsPlayingGame(false)}>
                    Quay về học phần
                  </button>
                </div>
              </div>
            </div>
          )}
          {renderExitConfirmModal()}
        </div>
      );
    }
  }

  const currentCard =
    studyCards.length > 0
      ? studyCards[currentIndex]
      : null;


  if (isFullScreen && studyCards.length > 0) {
    return (
      <div className="flashcard-fullscreen-overlay">
        {/* Top Navbar */}
        <div className="fullscreen-navbar">
          <button className="btn-fullscreen-exit" onClick={toggleFullScreen}>
            Thoát toàn màn hình
          </button>
          <div className="fullscreen-nav-title">
            <span>{moduleData?.name}</span>
          </div>
          <div className="fullscreen-progress-info">
            Thẻ {currentIndex + 1} / {studyCards.length}
          </div>
        </div>

        {/* Main Content (Flashcard) */}
        <div className="fullscreen-card-area">
          <button
            className="fullscreen-nav-arrow left"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            ‹
          </button>

          <div className="flashcard-wrapper fullscreen-wrapper">
            <div
              className={`flashcard-container fullscreen-container ${slideState !== "none" ? slideState : ""}`}
              onClick={handleFlip}
            >
              <div className={`flashcard ${isFlipped ? "flipped" : ""} ${slideState !== "none" ? "no-transition" : ""}`}>
                {/* FRONT FACE */}
                <div className="flashcard-face flashcard-front">
                  <button
                    className={`btn-flashcard-star ${(currentCard?.isStarred || currentCard?.starred) ? "starred" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStar(currentCard.id);
                    }}
                    title={(currentCard?.isStarred || currentCard?.starred) ? "Bỏ gắn sao" : "Gắn sao"}
                  >
                    ★
                  </button>
                  <div className="card-text">
                    {showFirst === "term" ? currentCard?.term : currentCard?.definition}
                  </div>
                </div>

                {/* BACK FACE */}
                <div className="flashcard-face flashcard-back">
                  <button
                    className={`btn-flashcard-star ${(currentCard?.isStarred || currentCard?.starred) ? "starred" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStar(currentCard.id);
                    }}
                    title={(currentCard?.isStarred || currentCard?.starred) ? "Bỏ gắn sao" : "Gắn sao"}
                  >
                    ★
                  </button>
                  <div className="card-text">
                    {showFirst === "term" ? currentCard?.definition : currentCard?.term}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            className="fullscreen-nav-arrow right"
            onClick={handleNext}
            disabled={currentIndex === studyCards.length - 1}
          >
            ›
          </button>
        </div>

        {/* Bottom controls */}
        <div className="fullscreen-controls">
          <div className="fullscreen-controls-center">
            <button
              className="btn-control"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              ⬅ Trước
            </button>
            <div className="card-counter">
              {currentIndex + 1} / {studyCards.length}
            </div>
            <button
              className="btn-control"
              onClick={handleNext}
              disabled={currentIndex === studyCards.length - 1}
            >
              Sau ➡
            </button>
          </div>

          <div className="fullscreen-controls-right">
            <button
              className="btn-flashcard-action-inline"
              onClick={() => setIsSettingsOpen(true)}
              title="Cài đặt thẻ ghi nhớ"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        {/* MODAL CÀI ĐẶT THẺ GHI NHỚ TRONG FULLSCREEN */}
        {isSettingsOpen && (
          <div
            className="module-modal-overlay"
            onClick={() => setIsSettingsOpen(false)}
          >
            <div
              className="settings-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="settings-modal-header">
                <h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: "spin 8s linear infinite" }}
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Tùy chọn
                </h3>
                <button
                  className="btn-settings-close"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  &times;
                </button>
              </div>

              <div className="settings-options-list">
                {/* Tùy chọn 1: Chỉ học thẻ gắn sao */}
                <div className="settings-option-item">
                  <div className="settings-option-info">
                    <span className="settings-option-label">Chỉ học thuật ngữ có gắn sao</span>
                    <span className="settings-option-desc">
                      Học riêng nhóm thẻ bạn đã đánh dấu sao (có {activeCards.filter(c => c.isStarred || c.starred).length} thẻ)
                    </span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={studyOnlyStarred}
                      onChange={(e) => handleToggleStarredOnly(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {/* Tùy chọn 2: Xáo trộn thẻ */}
                <div className="settings-option-item">
                  <div className="settings-option-info">
                    <span className="settings-option-label">Xáo trộn thẻ</span>
                    <span className="settings-option-desc">
                      Thay đổi thứ tự xuất hiện ngẫu nhiên của các thẻ
                    </span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={isShuffled}
                      onChange={(e) => handleToggleShuffle(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {/* Tùy chọn 3: Chọn mặt hiển thị trước */}
                <div className="settings-option-item" style={{ flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
                  <div className="settings-option-info">
                    <span className="settings-option-label">Chọn mặt hiển thị trước</span>
                    <span className="settings-option-desc">
                      Chọn xem bạn muốn hiện Thuật ngữ hay Định nghĩa trước
                    </span>
                  </div>
                  <div className="segment-control">
                    <button
                      type="button"
                      className={`segment-btn ${showFirst === "term" ? "active" : ""}`}
                      onClick={() => {
                        setShowFirst("term");
                        setIsFlipped(false);
                      }}
                    >
                      Thuật ngữ
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${showFirst === "definition" ? "active" : ""}`}
                      onClick={() => {
                        setShowFirst("definition");
                        setIsFlipped(false);
                      }}
                    >
                      Định nghĩa
                    </button>
                  </div>
                </div>

                {/* Tùy chọn 4: Khởi động lại */}
                <div className="settings-option-item" style={{ borderTop: "2px solid #fff0f5", paddingTop: "20px", marginTop: "10px" }}>
                  <button
                    type="button"
                    className="btn-reset-flashcards"
                    onClick={handleRestartFlashcards}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M3 21v-5h5" />
                    </svg>
                    Khởi động lại Thẻ ghi nhớ
                  </button>
                </div>
              </div>

              <button
                className="btn-settings-done"
                onClick={() => setIsSettingsOpen(false)}
              >
                Hoàn tất
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="module-detail-container">
      {/* NÚT QUAY LẠI */}
      <div className="module-back-wrapper">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
      </div>

      {/* HEADER GỌN */}
      <div className="module-header-container">
        <div className="module-header-info">
          <h2 className="module-title">{moduleData.name}</h2>
          <p className="module-desc">{moduleData.description}</p>
          <div className="module-mode-selector">
            <button className="btn-mode active">Thẻ ghi nhớ</button>
            <button className="btn-mode" onClick={() => setIsStudyConfigOpen(true)}>
              Chế độ học
            </button>
            <button className="btn-mode" onClick={() => setIsGameConfigOpen(true)}>
              Trò chơi
            </button>
          </div>
        </div>
      </div>

      {/* LỰA CHỌN HỌC ĐÃ ĐƯỢC CHUYỂN VÀO NÚT CÀI ĐẶT */}

      {/* FLASHCARD */}
      {activeCards.length > 0 ? (
        studyCards.length > 0 ? (
          <>
            <div className="flashcard-wrapper">
              <div className={`flashcard-container ${slideState !== "none" ? slideState : ""}`} onClick={handleFlip}>
                <div className={`flashcard ${isFlipped ? "flipped" : ""} ${slideState !== "none" ? "no-transition" : ""}`}>
                  <div className="flashcard-face flashcard-front">
                    <button
                      className={`btn-flashcard-star ${(currentCard?.isStarred || currentCard?.starred) ? "starred" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(currentCard.id);
                      }}
                      title={(currentCard?.isStarred || currentCard?.starred) ? "Bỏ gắn sao" : "Gắn sao"}
                    >
                      ★
                    </button>
                    <div className="card-text">
                      {showFirst === "term" ? currentCard?.term : currentCard?.definition}
                    </div>
                  </div>
                  <div className="flashcard-face flashcard-back">
                    <button
                      className={`btn-flashcard-star ${(currentCard?.isStarred || currentCard?.starred) ? "starred" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(currentCard.id);
                      }}
                      title={(currentCard?.isStarred || currentCard?.starred) ? "Bỏ gắn sao" : "Gắn sao"}
                    >
                      ★
                    </button>
                    <div className="card-text">
                      {showFirst === "term" ? currentCard?.definition : currentCard?.term}
                    </div>
                  </div>
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
                {currentIndex + 1} / {studyCards.length}
              </div>
              <button
                className="btn-control"
                onClick={handleNext}
                disabled={currentIndex === studyCards.length - 1}
              >
                Sau ➡
              </button>

              <div className="flashcard-action-buttons">
                <button
                  className="btn-flashcard-action btn-flashcard-fullscreen"
                  onClick={toggleFullScreen}
                  title="Mở toàn màn hình"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </button>
                <button
                  className="btn-flashcard-action btn-flashcard-share"
                  onClick={handleShareModule}
                  title="Chia sẻ học phần"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </button>
                <button
                  className="btn-flashcard-action btn-flashcard-settings"
                  onClick={() => setIsSettingsOpen(true)}
                  title="Cài đặt thẻ ghi nhớ"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-cards-placeholder">
            Cậu chưa gắn sao cho thẻ nào cả. Hãy nhấn nút gắn sao trên các thẻ ở danh sách phía dưới để học riêng nhé!
          </div>
        )
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
          <h3>Các thẻ trong học phần ({isBulkEditMode ? bulkCards.length : activeCards.length})</h3>
          <div className="header-actions">
            {isOwner && (
              isBulkEditMode ? (
                <>
                  <button
                    className="btn-save-bulk"
                    onClick={handleSaveBulkChanges}
                    disabled={isBulkSaving}
                  >
                    {isBulkSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button
                    className="btn-cancel-bulk"
                    onClick={handleCancelBulkEdit}
                    disabled={isBulkSaving}
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-bulk-edit-toggle"
                    onClick={handleStartBulkEdit}
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    className="btn-import-cards"
                    onClick={() => setIsImportModalOpen(true)}
                  >
                    Nhập thẻ
                  </button>
                  <button
                    className="btn-add-card"
                    onClick={() => setIsCreateCardModalOpen(true)}
                  >
                    Thêm thẻ
                  </button>
                </>
              )
            )}
          </div>
        </div>

        {isBulkEditMode ? (
          <div className="cards-list bulk-edit-list">
            {bulkCards.map((card, index) => (
              <div
                key={card.tempKey || card.id}
                className="card-list-item bulk-edit-item"
                draggable={dragEnabledIndex === index}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => e.preventDefault()}
              >
                <div className="card-list-index">{index + 1}</div>
                <div className="card-list-content bulk-edit-content">
                  <div className="bulk-edit-field">
                    <input
                      type="text"
                      className="bulk-edit-input"
                      value={card.term}
                      onChange={(e) => handleBulkCardChange(index, "term", e.target.value)}
                      placeholder="Nhập thuật ngữ..."
                    />
                    <span className="bulk-edit-label">THUẬT NGỮ</span>
                  </div>
                  <div className="card-list-divider"></div>
                  <div className="bulk-edit-field">
                    <input
                      type="text"
                      className="bulk-edit-input"
                      value={card.definition}
                      onChange={(e) => handleBulkCardChange(index, "definition", e.target.value)}
                      placeholder="Nhập định nghĩa..."
                    />
                    <span className="bulk-edit-label">ĐỊNH NGHĨA</span>
                  </div>
                </div>
                <div className="card-list-actions bulk-edit-actions">
                  <div
                    className="drag-handle"
                    title="Kéo thả để sắp xếp"
                    onMouseEnter={() => setDragEnabledIndex(index)}
                    onMouseLeave={() => setDragEnabledIndex(null)}
                  >
                    ☰
                  </div>
                  <button
                    className="btn-card-action btn-card-delete"
                    onClick={() => handleBulkDeleteCard(index)}
                    title="Xóa thẻ"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" x2="10" y1="11" y2="17" />
                      <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            <button
              className="btn-bulk-add-card"
              onClick={handleBulkAddCard}
            >
              + Thêm thẻ
            </button>
          </div>
        ) : (
          <div className="cards-list">
            {activeCards.map((card, index) => (
              <div key={card.id} className="card-list-item">
                <div className="card-list-index">{index + 1}</div>
                <div className="card-list-content">
                  <div className="card-list-term">{card.term}</div>
                  <div className="card-list-divider"></div>
                  <div className="card-list-def">{card.definition}</div>
                </div>
                <div className="card-list-actions">
                  <button
                    className={`btn-card-action btn-card-star ${(card.isStarred || card.starred) ? "starred" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStar(card.id);
                    }}
                    title={(card.isStarred || card.starred) ? "Bỏ gắn sao" : "Gắn sao"}
                  >
                    ★
                  </button>
                  {isOwner && (
                    <>
                      <button
                        className="btn-card-action btn-card-edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(card);
                        }}
                        title="Chỉnh sửa thẻ"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </button>
                      <button
                        className="btn-card-action btn-card-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(card.id);
                        }}
                        title="Xóa thẻ"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CẤU HÌNH HỌC TẬP */}
      {isStudyConfigOpen && (
        <div
          className="module-modal-overlay"
          onClick={() => setIsStudyConfigOpen(false)}
        >
          <div
            className="module-modal-content study-config-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="module-modal-title">Chọn Chế Độ Học</h3>
            <p className="study-config-subtitle">Hãy chọn phương pháp học tập phù hợp với mục tiêu của cậu nhé!</p>

            <div className="study-mode-options">
              <div
                className={`study-mode-card ${studyMode === "choice" ? "active" : ""} ${(studyStarredOnly ? starredCards.length : activeCards.length) < 4 ? "disabled" : ""}`}
                onClick={() => {
                  const currentTotalCount = studyStarredOnly ? starredCards.length : activeCards.length;
                  if (currentTotalCount >= 4) setStudyMode("choice");
                }}
              >
                <div className="study-mode-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff6b9e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 5.5L5 7.5L9 3.5" />
                    <path d="M13 6h7" />
                    <path d="M3 12.5L5 14.5L9 10.5" />
                    <path d="M13 13h7" />
                    <path d="M3 19.5L5 21.5L9 17.5" />
                    <path d="M13 20h7" />
                  </svg>
                </div>
                <div className="study-mode-text-wrapper">
                  <h4>Trắc nghiệm</h4>
                  {(studyStarredOnly ? starredCards.length : activeCards.length) < 4 && (
                    <span className="study-mode-warn">Cần tối thiểu 4 thẻ (Hiện có {studyStarredOnly ? starredCards.length : activeCards.length})</span>
                  )}
                </div>
              </div>

              <div
                className={`study-mode-card ${studyMode === "write" ? "active" : ""}`}
                onClick={() => setStudyMode("write")}
              >
                <div className="study-mode-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff6b9e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </div>
                <div className="study-mode-text-wrapper">
                  <h4>Tự luận</h4>
                </div>
              </div>
            </div>

            <div className="study-config-settings">
              <div className="study-config-option">
                <div className="study-config-info">
                  <span className="study-config-label">Chỉ học thuật ngữ đã gắn sao</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={studyStarredOnly}
                    disabled={starredCards.length === 0}
                    onChange={(e) => setStudyStarredOnly(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="module-modal-actions" style={{ marginTop: "25px" }}>
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsStudyConfigOpen(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-modal-submit"
                onClick={handleStartStudy}
                disabled={loadingQuestions || (studyStarredOnly && starredCards.length === 0) || (!studyStarredOnly && activeCards.length === 0)}
              >
                {loadingQuestions ? "Đang tạo câu hỏi..." : "Bắt đầu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CẤU HÌNH TRÒ CHƠI */}
      {isGameConfigOpen && (
        <div
          className="module-modal-overlay"
          onClick={() => setIsGameConfigOpen(false)}
        >
          <div
            className="module-modal-content study-config-modal game-config-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="module-modal-title">Chọn Trò Chơi</h3>
            <p className="study-config-subtitle">Hãy thử thách bản thân với các trò chơi ôn tập thú vị nhé!</p>

            <div className="study-mode-options">
              <div
                className={`study-mode-card ${gameMode === "match" ? "active" : ""}`}
                onClick={() => setGameMode("match")}
              >
                <div className="study-mode-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff6b9e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11.5 5.5A1.5 1.5 0 0 1 13 4v0a1.5 1.5 0 0 1 1.5 1.5H18a2 2 0 0 1 2 2v3.5a1.5 1.5 0 0 1-1.5 1.5v0A1.5 1.5 0 0 1 17 13v3.5a2 2 0 0 1-2 2h-3.5a1.5 1.5 0 0 1-1.5-1.5v0A1.5 1.5 0 0 0 8.5 17H5a2 2 0 0 1-2-2v-3.5A1.5 1.5 0 0 1 4.5 10v0A1.5 1.5 0 0 0 6 8.5V5a2 2 0 0 1 2-2h3.5" />
                  </svg>
                </div>
                <div className="study-mode-text-wrapper">
                  <h4>Ghép từ</h4>
                </div>
              </div>

              <div
                className={`study-mode-card ${gameMode === "gravity" ? "active" : ""}`}
                onClick={() => setGameMode("gravity")}
              >
                <div className="study-mode-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff6b9e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 6-6 6" />
                    <path d="M13 5l-2 2" />
                    <path d="M19 11l-2 2" />
                    <circle cx="8" cy="16" r="3" />
                  </svg>
                </div>
                <div className="study-mode-text-wrapper">
                  <h4>Trọng lực</h4>
                </div>
              </div>
            </div>

            <div className="study-config-settings">
              <div className="study-config-option">
                <div className="study-config-info">
                  <span className="study-config-label">Chỉ chơi với thẻ đã gắn sao</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={gameStarredOnly}
                    disabled={starredCards.length === 0}
                    onChange={(e) => setGameStarredOnly(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {gameMode === "gravity" && (
                <div className="study-config-option" style={{ flexDirection: "column", alignItems: "stretch", gap: "10px", borderTop: "1px solid #fff0f5", paddingTop: "15px", marginTop: "20px" }}>
                  <div className="study-config-info">
                    <span className="study-config-label">Hiển thị câu hỏi bằng</span>
                  </div>
                  <div className="segment-control" style={{ marginTop: "5px" }}>
                    <button
                      type="button"
                      className={`segment-btn ${gravityShowType === "definition" ? "active" : ""}`}
                      onClick={() => setGravityShowType("definition")}
                    >
                      Định nghĩa
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${gravityShowType === "term" ? "active" : ""}`}
                      onClick={() => setGravityShowType("term")}
                    >
                      Thuật ngữ
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="module-modal-actions" style={{ marginTop: "25px" }}>
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsGameConfigOpen(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-modal-submit"
                onClick={handleStartGame}
                disabled={loadingGame || (gameStarredOnly && starredCards.length === 0) || (!gameStarredOnly && activeCards.length === 0)}
              >
                {loadingGame ? "Đang tạo trò chơi..." : "Bắt đầu"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <h3 className="module-modal-title">Thêm Thẻ</h3>
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

      {/* MODAL NHẬP THẺ HÀNG LOẠT */}
      {isImportModalOpen && (
        <div
          className="module-modal-overlay"
          onClick={() => setIsImportModalOpen(false)}
        >
          <div
            className="module-modal-content import-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="module-modal-title">Nhập thẻ từ văn bản</h3>

            <form onSubmit={handleImportCards}>
              <div className="module-form-group">
                <label className="module-form-label">Văn bản (*)</label>
                <textarea
                  className="module-form-textarea import-textarea"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={"Thuật ngữ 1 - Định nghĩa 1\nThuật ngữ 2 - Định nghĩa 2"}
                  rows={8}
                  autoFocus
                />
              </div>

              <div className="import-settings">
                <div className="module-form-group">
                  <label className="module-form-label">Phân tách các thẻ bằng</label>
                  <select
                    className="module-form-select"
                    value={cardSeparator}
                    onChange={(e) => setCardSeparator(e.target.value)}
                  >
                    <option value="\n">Dòng mới</option>
                    <option value=";">Dấu chấm phẩy</option>
                    <option value=",">Dấu phẩy</option>
                  </select>
                </div>

                <div className="module-form-group">
                  <label className="module-form-label">Phân tách thuật ngữ/định nghĩa bằng</label>
                  <select
                    className="module-form-select"
                    value={termSeparator}
                    onChange={(e) => setTermSeparator(e.target.value)}
                  >
                    <option value="-">Dấu gạch ngang</option>
                    <option value="\t">Dấu Tab</option>
                    <option value=":">Dấu hai chấm</option>
                    <option value=",">Dấu phẩy</option>
                  </select>
                </div>
              </div>

              <div className="module-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsImportModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isImporting}
                >
                  {isImporting ? "Đang nhập..." : "Xác nhận"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA THẺ */}
      {isEditCardModalOpen && (
        <div
          className="module-modal-overlay"
          onClick={() => setIsEditCardModalOpen(false)}
        >
          <div
            className="module-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="module-modal-title">Chỉnh sửa thẻ</h3>
            <form onSubmit={handleUpdateCard}>
              <div className="module-form-group">
                <label className="module-form-label">Thuật ngữ (*)</label>
                <input
                  className="module-form-input"
                  value={editTerm}
                  onChange={(e) => setEditTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="module-form-group">
                <label className="module-form-label">Định nghĩa (*)</label>
                <textarea
                  className="module-form-textarea"
                  value={editDefinition}
                  onChange={(e) => setEditDefinition(e.target.value)}
                />
              </div>
              <div className="module-form-group">
                <label className="module-form-label">Ảnh (URL)</label>
                <input
                  className="module-form-input"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                />
              </div>
              <div className="module-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsEditCardModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isUpdatingCard}
                >
                  {isUpdatingCard ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CÀI ĐẶT THẺ GHI NHỚ */}
      {isSettingsOpen && (
        <div
          className="module-modal-overlay"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="settings-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-modal-header">
              <h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: "spin 8s linear infinite" }}
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Tùy chọn
              </h3>
              <button
                className="btn-settings-close"
                onClick={() => setIsSettingsOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="settings-options-list">
              {/* Tùy chọn 1: Chỉ học thẻ gắn sao */}
              <div className="settings-option-item">
                <div className="settings-option-info">
                  <span className="settings-option-label">Chỉ học thuật ngữ có gắn sao</span>
                  <span className="settings-option-desc">
                    Học riêng nhóm thẻ bạn đã đánh dấu sao (có {activeCards.filter(c => c.isStarred || c.starred).length} thẻ)
                  </span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={studyOnlyStarred}
                    onChange={(e) => handleToggleStarredOnly(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Tùy chọn 2: Xáo trộn thẻ */}
              <div className="settings-option-item">
                <div className="settings-option-info">
                  <span className="settings-option-label">Xáo trộn thẻ</span>
                  <span className="settings-option-desc">
                    Thay đổi thứ tự xuất hiện ngẫu nhiên của các thẻ
                  </span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isShuffled}
                    onChange={(e) => handleToggleShuffle(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Tùy chọn 3: Chọn mặt hiển thị trước */}
              <div className="settings-option-item" style={{ flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
                <div className="settings-option-info">
                  <span className="settings-option-label">Chọn mặt hiển thị trước</span>
                  <span className="settings-option-desc">
                    Chọn xem bạn muốn hiện Thuật ngữ hay Định nghĩa trước
                  </span>
                </div>
                <div className="segment-control">
                  <button
                    type="button"
                    className={`segment-btn ${showFirst === "term" ? "active" : ""}`}
                    onClick={() => {
                      setShowFirst("term");
                      setIsFlipped(false);
                    }}
                  >
                    Thuật ngữ
                  </button>
                  <button
                    type="button"
                    className={`segment-btn ${showFirst === "definition" ? "active" : ""}`}
                    onClick={() => {
                      setShowFirst("definition");
                      setIsFlipped(false);
                    }}
                  >
                    Định nghĩa
                  </button>
                </div>
              </div>

              {/* Tùy chọn 4: Khởi động lại */}
              <div className="settings-option-item" style={{ borderTop: "2px solid #fff0f5", paddingTop: "20px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn-reset-flashcards"
                  onClick={handleRestartFlashcards}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                  Khởi động lại
                </button>
              </div>
            </div>

            <button
              className="btn-settings-done"
              onClick={() => setIsSettingsOpen(false)}
            >
              Xong
            </button>
          </div>
        </div>
      )}
      {renderExitConfirmModal()}
    </div>
  );
};

export default Module;
