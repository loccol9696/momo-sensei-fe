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



  const activeCards = moduleData?.cards?.filter(card => !card.deleted && !card.isDeleted) || [];
  const starredCards = activeCards.filter(card => card.isStarred || card.starred) || [];
  const baseStudyCards = studyOnlyStarred ? activeCards.filter(card => card.isStarred || card.starred) : activeCards;
  const studyCards = isShuffled ? shuffledCards : baseStudyCards;

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

  // Main game tick loop at 60fps
  const gravityTick = (time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000; // in seconds

      setGravityWords((prevWords) => {
        let lifeLost = false;
        const updated = prevWords
          .map((w) => {
            if (w.isFading) return w;
            // Gradually speed up based on current score
            const currentSpeed = w.speed * (1 + gravityScoreRef.current * 0.02);
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

        return updated;
      });
    }

    previousTimeRef.current = time;
    if (gravityLivesRef.current > 0 && isPlayingGame && gameMode === "gravity" && gravityStep === "playing") {
      requestRef.current = requestAnimationFrame(gravityTick);
    }
  };

  // Trigger animation loop
  useEffect(() => {
    if (isPlayingGame && gameMode === "gravity" && gravityStep === "playing" && gravityLives > 0) {
      previousTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(gravityTick);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isPlayingGame, gameMode, gravityStep, gravityLives]);

  // Spawning timer loop based on score difficulty
  useEffect(() => {
    let spawnIntervalId = null;
    if (isPlayingGame && gameMode === "gravity" && gravityStep === "playing" && gravityLives > 0) {
      const spawnInterval = Math.max(1200, 3000 - gravityScore * 100);
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
      speed: 40 + Math.random() * 20, // pixels per second
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
          speed: 50,
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

  const handleStartGame = async () => {
    if (gameMode === "gravity") {
      handleStartGravityGame();
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
        toast.success("Cập nhật thẻ thành công! 🌸");
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
    if (!window.confirm("Cậu có chắc muốn xóa thẻ này không? 🌸")) return;

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
            if (window.confirm("Cậu có chắc chắn muốn dừng học và thoát ra ngoài không?")) {
              handleBackToModule();
            }
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
      </div>
    );
  }

  if (isPlayingGame) {
    if (gameMode === "match") {
      return (
        <div className="study-game-layout game-layout">
          {/* Game Navbar */}
          <div className="study-game-navbar game-navbar">
            <button className="btn-back" onClick={() => {
              if (window.confirm("Cậu có chắc chắn muốn dừng chơi và thoát ra ngoài không? 🌸")) {
                handleExitGame();
              }
            }}>
              ← Thoát
            </button>
            <div className="study-game-nav-title">
              <span>{moduleData?.name}</span>
              <span className="study-game-nav-badge">
                Màn chơi {gameLevel}
              </span>
            </div>
            <div className="game-timer">
              {gameTime.toFixed(1)}s
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

                <div className="game-summary-time-box">
                  <span className="game-summary-time-lbl">Thời gian hoàn thành:</span>
                  <span className="game-summary-time-val">{gameTime.toFixed(1)} giây</span>
                </div>

                <div className="study-summary-actions game-summary-actions">
                  <button className="btn-summary-restart" onClick={handleRestartGameLevel} disabled={loadingGame}>
                    {loadingGame ? "Đang tải... " : " Chơi lại màn này"}
                  </button>
                  <button className="btn-summary-back btn-game-next" onClick={handleNextGameLevel} disabled={loadingGame}>
                    {loadingGame ? "Đang tải... " : "Màn tiếp theo"}
                  </button>
                </div>
                <button className="btn-game-exit-text" onClick={handleExitGame} style={{ marginTop: "15px", background: "none", border: "none", color: "#8c7a91", fontWeight: "bold", cursor: "pointer" }}>
                  Quay về học phần
                </button>
              </div>
            </div>
          )}
        </div>
      );
    } else if (gameMode === "gravity") {
      return (
        <div className="study-game-layout gravity-game-layout">
          {/* Gravity Header */}
          <div className="study-game-navbar gravity-navbar">
            <button className="btn-back" onClick={() => {
              if (window.confirm("Cậu có chắc chắn muốn dừng chơi và thoát ra ngoài không? 🌸")) {
                setIsPlayingGame(false);
              }
            }}>
              ← Thoát
            </button>
            <div className="study-game-nav-title">
              <span>🌠 Trò chơi Trọng lực</span>
              <span className="study-game-nav-badge">
                Điểm: {gravityScore}
              </span>
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
                <h2>Trò chơi Kết Thúc!</h2>
                <p className="study-summary-subtitle">Cậu đã chiến đấu rất anh dũng!</p>

                <div className="game-summary-time-box">
                  <span className="game-summary-time-lbl">Điểm số đạt được:</span>
                  <span className="game-summary-time-val">{gravityScore} điểm</span>
                </div>

                <div className="study-summary-actions game-summary-actions">
                  <button className="btn-summary-restart" onClick={handleStartGravityGame} disabled={loadingGame}>
                    {loadingGame ? "Đang tải... " : " Chơi lại"}
                  </button>
                  <button className="btn-summary-back" onClick={() => setIsPlayingGame(false)}>
                    Quay về
                  </button>
                </div>
              </div>
            </div>
          )}
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
          <h3>Các thẻ trong học phần</h3>
          <div className="header-actions">
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
          </div>
        </div>
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
                <button
                  className="btn-card-action btn-card-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditModal(card);
                  }}
                  title="Chỉnh sửa thẻ"
                >
                  ✏️
                </button>
                <button
                  className="btn-card-action btn-card-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(card.id);
                  }}
                  title="Xóa thẻ"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
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
                <div className="study-mode-icon">📝</div>
                <div className="study-mode-text-wrapper">
                  <h4>Trắc nghiệm</h4>
                  <p>Chọn từ 4 phương án. Nhanh chóng và thú vị!</p>
                  {(studyStarredOnly ? starredCards.length : activeCards.length) < 4 && (
                    <span className="study-mode-warn">Cần tối thiểu 4 thẻ (Hiện có {studyStarredOnly ? starredCards.length : activeCards.length})</span>
                  )}
                </div>
              </div>

              <div
                className={`study-mode-card ${studyMode === "write" ? "active" : ""}`}
                onClick={() => setStudyMode("write")}
              >
                <div className="study-mode-icon">✍️</div>
                <div className="study-mode-text-wrapper">
                  <h4>Tự luận</h4>
                  <p>Tự gõ câu trả lời chính xác. Giúp nhớ sâu, nhớ lâu!</p>
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
                <div className="study-mode-icon">🧩</div>
                <div className="study-mode-text-wrapper">
                  <h4>Ghép từ</h4>
                  <p>Ghép cặp Thuật ngữ và Định nghĩa chính xác nhanh nhất có thể!</p>
                </div>
              </div>

              <div
                className={`study-mode-card ${gameMode === "gravity" ? "active" : ""}`}
                onClick={() => setGameMode("gravity")}
              >
                <div className="study-mode-icon">🌠</div>
                <div className="study-mode-text-wrapper">
                  <h4>Trọng lực</h4>
                  <p>Nhập đáp án đúng trước khi các thuật ngữ rơi xuống đất!</p>
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
            <h3 className="module-modal-title">Chỉnh sửa thẻ ✏️</h3>
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
                Tùy chọn Thẻ ghi nhớ
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
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Module;
