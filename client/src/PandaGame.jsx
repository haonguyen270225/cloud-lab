
import { useCallback, useEffect, useRef, useState } from "react";
import "./PandaGame.css";

const GAME_WIDTH = 560;
const GAME_HEIGHT = 250;
const GROUND = 207;
const PANDA_X = 66;
const PANDA_SIZE = 38;

const makeObstacle = (x = GAME_WIDTH + 20) => ({
  x,
  width: 24,
  height: 29,
});

function PandaGame({ paused = false }) {
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem("panda-best-score")) || 0;
    } catch {
      return 0;
    }
  });

  const [pandaY, setPandaY] = useState(0);
  const [obstacles, setObstacles] = useState([]);

  const engine = useRef({
    y: 0,
    velocity: 0,
    obstacles: [],
    score: 0,
    ticks: 0,
    speed: 4,
    jumping: false,
    alive: false,
  });

  // Điều khiển gấu trúc nhảy
  const jump = useCallback(() => {
    const game = engine.current;

    if (paused || !game.alive) return;

    if (!game.jumping) {
      game.velocity = -10.5;
      game.jumping = true;
    }
  }, [paused]);

  // Bắt đầu hoặc chơi lại
  const startGame = useCallback(() => {
    engine.current = {
      y: 0,
      velocity: 0,
      obstacles: [makeObstacle(GAME_WIDTH + 30)],
      score: 0,
      ticks: 0,
      speed: 4,
      jumping: false,
      alive: true,
    };

    setScore(0);
    setPandaY(0);
    setObstacles(
      engine.current.obstacles.map((item) => ({ ...item }))
    );
    setGameOver(false);
    setStarted(true);
  }, [paused]);

  // Nhấn Space hoặc phím mũi tên lên để nhảy
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (["ArrowUp", "Space"].includes(event.code)) {
        if (paused) return;
        event.preventDefault();

        if (!engine.current.alive) {
          startGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [jump, startGame, paused]);

  // Vòng lặp xử lý trò chơi
  useEffect(() => {
    if (!started || gameOver || paused) return;

    const timer = window.setInterval(() => {
      const game = engine.current;

      if (!game.alive) return;

      // Vật lý khi nhảy
      game.velocity += 0.48;
      game.y += game.velocity;

      if (game.y >= 0) {
        game.y = 0;
        game.velocity = 0;
        game.jumping = false;
      }

      game.ticks += 1;
      game.speed = Math.min(7, 4 + game.score / 180);

      // Di chuyển chướng ngại vật
      game.obstacles = game.obstacles
        .map((item) => ({
          ...item,
          x: item.x - game.speed,
        }))
        .filter((item) => item.x > -item.width);

      const last = game.obstacles[game.obstacles.length - 1];

      if (!last || last.x < GAME_WIDTH - 175) {
        game.obstacles.push(makeObstacle());
      }

      // Kiểm tra va chạm
      const pandaTop = GROUND - PANDA_SIZE + game.y;
      const pandaBottom = GROUND + game.y;

      const collided = game.obstacles.some((item) => {
        const overlapsX =
          PANDA_X + PANDA_SIZE - 5 > item.x &&
          PANDA_X + 5 < item.x + item.width;

        const obstacleTop = GROUND - item.height;
        const overlapsY =
          pandaBottom > obstacleTop && pandaTop < GROUND;

        return overlapsX && overlapsY;
      });

      // Kết thúc trò chơi
      if (collided) {
        game.alive = false;
        setGameOver(true);

        const finalScore = game.score;

        setBest((previous) => {
          const next = Math.max(previous, finalScore);

          try {
            localStorage.setItem(
              "panda-best-score",
              String(next)
            );
          } catch {
            // Trò chơi vẫn hoạt động nếu không lưu được dữ liệu.
          }

          return next;
        });

        return;
      }

      // Cập nhật điểm và giao diện
      game.score += 1;

      setScore(game.score);
      setPandaY(game.y);
      setObstacles(
        game.obstacles.map((item) => ({ ...item }))
      );
    }, 35);

    return () => window.clearInterval(timer);
  }, [started, gameOver , paused]);

  return (
    <section className="panda-section">
      <div className="panda-heading">
        <div>
          <span className="panda-kicker">MINI GAME / 03</span>
          <h2>Panda Tree Climber</h2>
          <p>
            Nhảy qua chướng ngại vật, leo cao và lập kỷ lục mới!
          </p>
        </div>

        <span className="panda-heading-icon">🐼</span>
      </div>

      <div className="panda-layout">
        <div className="panda-game-card">
          <div className="panda-game-top">
            <span className="game-live-dot" />

            <span>
              {gameOver
                ? "GAME OVER"
                : started
                  ? "GAME IN PROGRESS"
                  : "READY TO PLAY"}
            </span>

            <span className="game-level">
              LEVEL {Math.floor(score / 100) + 1}
            </span>
          </div>

          <div
            className="panda-world"
            style={{ "--game-width": `${GAME_WIDTH}px` }}
            onPointerDown={() => {
              if (!started || gameOver) {
                startGame();
              } else {
                jump();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Nhấn để bắt đầu trò chơi hoặc nhảy"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                if (!started || gameOver) {
                  startGame();
                } else {
                  jump();
                }
              }
            }}
          >
            <div className="panda-sun" />

            <div className="bamboo bamboo-back bamboo-back-one">
              🌿
            </div>

            <div className="bamboo bamboo-back bamboo-back-two">
              🎋
            </div>

            <div className="panda-cloud cloud-one" />
            <div className="panda-cloud cloud-two" />

            <div className="panda-score-float">
              +{Math.floor(score / 10)}
            </div>

            <div
              className={`panda-runner ${
                started && !gameOver ? "is-running" : ""
              }`}
              style={{
                bottom: `${
                  GAME_HEIGHT - GROUND - PANDA_SIZE - pandaY
                }px`,
              }}
            >
              <span className="panda-character">🐼</span>
              <span className="panda-shadow" />
            </div>

            {obstacles.map((item, index) => (
              <div
                className="panda-obstacle"
                key={`${index}-${item.x}`}
                style={{
                  left: `${(item.x / GAME_WIDTH) * 100}%`,
                  height: `${item.height}px`,
                }}
              >
                🎋
              </div>
            ))}

            <div className="panda-ground">
              <span>🌱</span>
              <span>🌿</span>
              <span>🍃</span>
              <span>🌱</span>
              <span>🌿</span>
            </div>

            {(!started || gameOver) && (
              <div className="panda-overlay">
                <span className="panda-overlay-emoji">
                  {gameOver ? "😵‍💫" : "🐼"}
                </span>

                <strong>
                  {gameOver
                    ? "Ối! Gấu trúc vấp tre rồi!"
                    : "Sẵn sàng leo cây?"}
                </strong>

                <p>
                  {gameOver
                    ? `Bạn đã đạt ${score} điểm. Thử lại để phá kỷ lục nhé!`
                    : "Nhấn nút bên dưới hoặc chạm vào khu vực trò chơi."}
                </p>

                <button
                  type="button"
                  className="panda-start-button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    startGame();
                  }}
                >
                  {gameOver ? "↻ Chơi lại" : "▶ Bắt đầu chơi"}
                </button>
              </div>
            )}
          </div>

          <div className="panda-game-hint">
            <span>
              ⌨️ <b>SPACE</b> / <b>↑</b> để nhảy
            </span>

            <span>📱 Chạm vào màn hình để nhảy</span>
          </div>
        </div>

        <aside className="panda-stats">
          <div className="panda-stat-card current-score">
            <span>ĐIỂM VÁN NÀY</span>
            <strong>{score}</strong>
            <small>Điểm tích lũy</small>
            <div className="stat-decoration">✦</div>
          </div>

          <div className="panda-stat-card best-score">
            <span>🏆 KỶ LỤC CỦA BẠN</span>
            <strong>{best}</strong>

            <small>
              {score > 0 && score >= best
                ? "Bạn đang tiến gần kỷ lục!"
                : "Cố gắng vượt qua chính mình"}
            </small>
          </div>

          <div className="panda-tip-card">
            <span>💡 MẸO NHỎ</span>
            <p>
              Canh thời gian nhảy khi bụi tre đến gần.
              Càng chơi lâu, tốc độ càng tăng!
            </p>
          </div>

          <button
            className="panda-reset-button"
            type="button"
            onClick={startGame}
          >
            ↻ {started && !gameOver ? "Chơi ván mới" : "Bắt đầu chơi"}
          </button>
        </aside>
      </div>
    </section>
  );
}

export default PandaGame;

