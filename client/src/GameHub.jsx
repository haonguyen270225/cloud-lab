import { useState, useEffect, useCallback, useRef } from "react";
import "./GameHub.css";
import PandaGame from "./PandaGame";


const GAME_MELODIES = {
  panda: [523.25, 659.25, 783.99, 659.25, 587.33, 698.46],
  tetris: [261.63, 329.63, 392.0, 523.25, 392.0, 329.63],
  egg: [659.25, 783.99, 987.77, 783.99, 880.0, 698.46],
};

function useGameMusic(game, paused) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (paused) return;

    let audio;
    let timer;
    let noteIndex = 0;
    let cancelled = false;

    const startMusic = async () => {
      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass || cancelled) return;

        audio = new AudioContextClass();
        audioRef.current = audio;

        await audio.resume();
        if (cancelled) {
          await audio.close();
          return;
        }

        const melody = GAME_MELODIES[game];

        const playNote = () => {
          if (!audio || audio.state !== "running") return;

          const oscillator = audio.createOscillator();
          const gain = audio.createGain();

          oscillator.type = game === "tetris" ? "square" : "sine";
          oscillator.frequency.value = melody[noteIndex % melody.length];

          const now = audio.currentTime;
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.035, now + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

          oscillator.connect(gain);
          gain.connect(audio.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.25);

          noteIndex++;
        };

        playNote();
        timer = window.setInterval(playNote, game === "egg" ? 260 : 300);
      } catch (error) {
        console.warn("Không thể phát nhạc trò chơi:", error);
      }
    };

    startMusic();

    return () => {
      cancelled = true;
      window.clearInterval(timer);

      if (audioRef.current === audio) {
        audioRef.current = null;
      }

      if (audio && audio.state !== "closed") {
        audio.close().catch(() => {});
      }
    };
  }, [game, paused]);
}

const WIDTH = 10;
const HEIGHT = 20;

const SHAPES = [
  { color: "#65e6c0", shape: [[1, 1, 1, 1]] },
  { color: "#b6a2ff", shape: [[1, 1], [1, 1]] },
  { color: "#ffb86b", shape: [[0, 1, 0], [1, 1, 1]] },
  { color: "#72b7ff", shape: [[1, 0, 0], [1, 1, 1]] },
  { color: "#ff86b7", shape: [[0, 1, 1], [1, 1, 0]] },
  { color: "#ffe27a", shape: [[1, 1, 0], [0, 1, 1]] },
  { color: "#ff8f82", shape: [[1, 0], [1, 0], [1, 1]] },
];

const emptyBoard = () =>
  Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(null));

const randomPiece = () => {
  const item = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return {
    shape: item.shape.map((row) => [...row]),
    color: item.color,
    x: 3,
    y: 0,
  };
};

function TetrisGame({ paused }) {
  const [board, setBoard] = useState(emptyBoard);
  const [piece, setPiece] = useState(randomPiece);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);

  const collides = useCallback((p, b) => {
    return p.shape.some((row, dy) =>
      row.some((cell, dx) => {
        if (!cell) return false;
        const x = p.x + dx;
        const y = p.y + dy;
        return (
          x < 0 ||
          x >= WIDTH ||
          y >= HEIGHT ||
          (y >= 0 && b[y][x] !== null)
        );
      })
    );
  }, []);

  const reset = useCallback(() => {
    setBoard(emptyBoard());
    setPiece(randomPiece());
    setScore(0);
    setOver(false);
    setRunning(true);
  }, []);

  const moveDown = useCallback(() => {
    if (!running || over) return;

    const next = { ...piece, y: piece.y + 1 };

    if (!collides(next, board)) {
      setPiece(next);
      return;
    }

    const merged = board.map((row) => [...row]);

    piece.shape.forEach((row, dy) =>
      row.forEach((cell, dx) => {
        const x = piece.x + dx;
        const y = piece.y + dy;
        if (cell && y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH) {
          merged[y][x] = piece.color;
        }
      })
    );

    const remaining = merged.filter(
      (row) => !row.every((cell) => cell !== null)
    );
    const cleared = HEIGHT - remaining.length;

    while (remaining.length < HEIGHT) {
      remaining.unshift(Array(WIDTH).fill(null));
    }

    setBoard(remaining);
    if (cleared) setScore((s) => s + cleared * 100);

    const nextPiece = randomPiece();

    if (collides(nextPiece, remaining)) {
      setOver(true);
      setRunning(false);
    } else {
      setPiece(nextPiece);
    }
  }, [running, over, piece, board, collides]);

useEffect(() => {
  if (!running || over || paused) return;
  const timer = window.setInterval(moveDown, 550);
  return () => window.clearInterval(timer);
}, [running, over, paused, moveDown]);
useEffect(() => {
  const handleKey = (event) => {
    if (!running || over || paused) return;
    if (
      ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space"].includes(
        event.code,
      )
    ) {
      event.preventDefault();
    } else {
      return;
    }
    if (event.code === "ArrowDown" || event.code === "Space") {
      moveDown();
      return;
    }
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      const dx = event.code === "ArrowLeft" ? -1 : 1;
      const next = { ...piece, x: piece.x + dx };
      if (!collides(next, board)) {
        setPiece(next);
      }
      return;
    }
    if (event.code === "ArrowUp") {
      const rotated = piece.shape[0].map((_, i) =>
        piece.shape.map((row) => row[i]).reverse(),
      );
      const next = { ...piece, shape: rotated };
      if (!collides(next, board)) {
        setPiece(next);
      }
    }
  };
  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [running, over, paused, piece, board, collides, moveDown]);

  const display = board.map((row) => [...row]);

  if (!over) {
    piece.shape.forEach((row, dy) =>
      row.forEach((cell, dx) => {
        const x = piece.x + dx;
        const y = piece.y + dy;
        if (cell && y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH) {
          display[y][x] = piece.color;
        }
      })
    );
  }

  return (
    <div className="mini-game-panel">
      <div className="mini-game-toolbar">
        <div>
          <span className="game-eyebrow">BLOCK PUZZLE</span>
          <h3>Xếp hình Tetris</h3>
          <p>Hoàn thành hàng ngang để ghi điểm.</p>
        </div>
        <div className="game-score">
          <small>ĐIỂM</small>
          <strong>{score}</strong>
        </div>
      </div>

      <div className="tetris-board" aria-label="Bảng xếp hình">
        {display.flatMap((row, y) =>
          row.map((color, x) => (
            <div
              className="tetris-cell"
              key={`${y}-${x}`}
              style={{
                background: color || "rgba(255,255,255,0.035)",
                boxShadow: color
                  ? "inset 0 0 0 2px rgba(255,255,255,.15)"
                  : "none",
              }}
            />
          ))
        )}
      </div>

      <div className="game-help">
        ← → di chuyển · ↑ xoay · ↓ rơi nhanh · Space thả xuống
      </div>

      {(!running || over) && (
        <div className="game-message">
          <strong>{over ? "Game Over!" : "Sẵn sàng xếp hình?"}</strong>
          <p>
            {over
              ? `Bạn đạt ${score} điểm. Hãy thử lại nhé!`
              : "Sắp xếp các khối để xóa hàng."}
          </p>
          <button className="game-primary-button" onClick={reset}>
            {over ? "↻ Chơi lại" : "▶ Bắt đầu"}
          </button>
        </div>
      )}
    </div>
  );
}
const EGG_COLORS = [
  "#ff829d",
  "#72c8ff",
  "#ffd166",
  "#9c91ff",
  "#73e0b0",
];

const EGG_ROWS = 8;
const EGG_COLS = 9;
const INITIAL_EGG_ROWS = 5;

const randomEgg = () =>
  EGG_COLORS[Math.floor(Math.random() * EGG_COLORS.length)];

// Chỉ tạo trứng ở 5 hàng phía trên, để trống 3 hàng bên dưới.
const makeEggBoard = () =>
  Array.from({ length: EGG_ROWS }, (_, y) =>
    Array.from({ length: EGG_COLS }, () =>
      y < INITIAL_EGG_ROWS ? randomEgg() : null
    )
  );

function EggShooter({ paused }) {
  const directionRef = useRef(1);
  const [board, setBoard] = useState(makeEggBoard);
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(25);
  const [egg, setEgg] = useState(randomEgg);
  const [aimColumn, setAimColumn] = useState(Math.floor(EGG_COLS / 2));
  const [over, setOver] = useState(false);

  useEffect(() => {
    if (paused || over) return;

    const timer = window.setInterval(() => {
      setAimColumn((current) => {
        if (current >= EGG_COLS - 1) {
          directionRef.current = -1;
        } else if (current <= 0) {
          directionRef.current = 1;
        }

        return Math.max(
          0,
          Math.min(EGG_COLS - 1, current + directionRef.current),
        );
      });
    }, 350);

    return () => window.clearInterval(timer);
  }, [paused, over]);

  const reset = () => {
    setBoard(makeEggBoard());
    setScore(0);
    setShots(25);
    setEgg(randomEgg());
    setAimColumn(Math.floor(EGG_COLS / 2));
    setOver(false);
  };

  // Tìm các trứng cùng màu kết nối với nhau theo 4 hướng.
  const findConnectedEggs = (grid, startRow, startCol, color) => {
    const stack = [[startRow, startCol]];
    const visited = new Set();
    const group = [];

    while (stack.length > 0) {
      const [y, x] = stack.pop();
      const key = `${y},${x}`;

      if (
        y < 0 ||
        y >= EGG_ROWS ||
        x < 0 ||
        x >= EGG_COLS ||
        visited.has(key) ||
        grid[y][x] !== color
      ) {
        continue;
      }

      visited.add(key);
      group.push([y, x]);

      stack.push([y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]);
    }

    return group;
  };

  const shootEgg = () => {
    if (paused || over || shots <= 0) return;

    const next = board.map((row) => [...row]);

    // Tìm quả trứng thấp nhất trong cột đang ngắm.
    let lowestOccupiedRow = -1;

    for (let y = 0; y < EGG_ROWS; y++) {
      if (next[y][aimColumn] !== null) {
        lowestOccupiedRow = y;
      }
    }

    // Nếu cột trống hoàn toàn, bắn vào hàng đầu tiên.
    const targetRow = lowestOccupiedRow === -1 ? 0 : lowestOccupiedRow + 1;

    // Cột đã kín, không thể bắn vào cột đó.
    if (targetRow >= EGG_ROWS) {
      return;
    }

    // Gắn trứng vào vị trí vừa tìm được.
    next[targetRow][aimColumn] = egg;

    // Tìm nhóm trứng cùng màu kết nối với trứng vừa bắn.
    const group = findConnectedEggs(next, targetRow, aimColumn, egg);

    let gainedScore = 0;

    // Từ 3 trứng cùng màu trở lên: làm chúng biến mất.
    if (group.length >= 3) {
      group.forEach(([y, x]) => {
        next[y][x] = null;
      });

      gainedScore = group.length * 10;
    }

    const nextShots = shots - 1;

    setBoard(next);
    setScore((current) => current + gainedScore);
    setShots(nextShots);
    setEgg(randomEgg());

    // Kiểm tra xem còn cột nào có thể bắn được hay không.
    const hasAvailableColumn = Array.from(
      { length: EGG_COLS },
      (_, col) => col,
    ).some((col) => {
      let lowest = -1;

      for (let y = 0; y < EGG_ROWS; y++) {
        if (next[y][col] !== null) {
          lowest = y;
        }
      }

      return lowest < EGG_ROWS - 1;
    });

    if (nextShots <= 0 || !hasAvailableColumn) {
      setOver(true);
    }
  };

  // Đường ngắm xoay theo cột người chơi chọn.
  const centerColumn = (EGG_COLS - 1) / 2;
  const aimAngle =
    -90 + (Math.atan2(aimColumn - centerColumn, EGG_ROWS) * 180) / Math.PI;

  return (
    <div className="mini-game-panel egg-panel">
      <div className="mini-game-toolbar">
        <div>
          <span className="game-eyebrow">DINO EGG MATCH</span>
          <h3>Bắn trứng khủng long</h3>
          <p>
            Chọn cột để ngắm, sau đó bắn. Ghép ít nhất 3 trứng cùng màu để ghi
            điểm!
          </p>
        </div>

        <div className="game-score">
          <small>ĐIỂM</small>
          <strong>{score}</strong>
        </div>
      </div>

      <div className="egg-board-wrap">
        <div className="egg-board">
          {board.map((row, y) =>
            row.map((color, x) => (
              <button
                key={`${y}-${x}`}
                type="button"
                className={[
                  "egg-cell",
                  color ? "" : "egg-empty",
                  aimColumn === x ? "egg-aim-column" : "",
                ].join(" ")}
                style={{
                  "--egg-color": color || "transparent",
                }}
                onClick={() => setAimColumn(x)}
                aria-label={`Ngắm vào cột ${x + 1}`}
                disabled={over || paused}
              >
                {color && <span />}
              </button>
            )),
          )}
        </div>

        {/* Đường ngắm hướng lên bàn trứng */}
        {!over && (
          <div
            className="egg-aim-line"
            style={{
              "--aim-angle": `${aimAngle}deg`,
            }}
          >
            ----------&gt;
          </div>
        )}
      </div>

      <div className="egg-launcher">
        <span className="dino-icon">🦖</span>
        <span>Trứng tiếp theo:</span>

        <span className="egg-preview" style={{ "--egg-color": egg }} />

        <span className="shots-left">Lượt bắn: {shots}</span>
      </div>

      <div className="egg-controls">
        <p className="game-help">
          Nhấn vào cột muốn ngắm. Quan sát mũi tên rồi nhấn nút BẮN TRỨNG.
        </p>

        <button
          type="button"
          className="game-primary-button egg-shoot-button"
          onClick={shootEgg}
          disabled={over || paused}
        >
          🥚 BẮN TRỨNG
        </button>
      </div>

      {over && (
        <div className="game-message">
          <strong>Trò chơi kết thúc!</strong>
          <p>Bạn ghi được {score} điểm.</p>

          <button type="button" className="game-primary-button" onClick={reset}>
            ↻ Chơi lại
          </button>
        </div>
      )}
    </div>
  );
}



function GameHub() {
  const [activeGame, setActiveGame] = useState("panda");
  const [paused, setPaused] = useState(true);

  useGameMusic(activeGame, paused);

  const changeGame = (game) => {
    setActiveGame(game);
    setPaused(true);
  };

  return (
    <section className="game-hub">
      <div className="game-hub-heading">
        <div>
          <span className="game-eyebrow">ENTERTAINMENT ZONE</span>
          <h2>Khu vực trò chơi mini</h2>
          <p>Mỗi trò chơi có giai điệu riêng.</p>
        </div>
        <div className="game-hub-mascot">🎮</div>
      </div>

      <div className="game-tabs">
        <button
          type="button"
          className={`game-tab ${activeGame === "panda" ? "active" : ""}`}
          onClick={() => changeGame("panda")}
        >
          <span>🐼</span> Panda Run
        </button>

        <button
          type="button"
          className={`game-tab ${activeGame === "tetris" ? "active" : ""}`}
          onClick={() => changeGame("tetris")}
        >
          <span>🧩</span> Tetris
        </button>

        <button
          type="button"
          className={`game-tab ${activeGame === "egg" ? "active" : ""}`}
          onClick={() => changeGame("egg")}
        >
          <span>🥚</span> Bắn trứng
        </button>
      </div>

      <div className="game-global-controls">
        <button
          type="button"
          className="game-primary-button"
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "▶ Bắt đầu / Tiếp tục" : "⏸ Dừng trò chơi"}
        </button>

        <span className="game-help">
          {paused ? "Đã dừng — nhạc đã tắt" : "Đang chơi — nhạc đang bật"}
        </span>
      </div>

      {activeGame === "panda" && (
        <PandaGame paused={paused} />
      )}

      {activeGame === "tetris" && (
        <TetrisGame paused={paused} />
      )}

      {activeGame === "egg" && (
        <EggShooter paused={paused} />
      )}
    </section>
  );
}

export default GameHub;

