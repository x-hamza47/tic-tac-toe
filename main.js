const select_bx = document.querySelector(".select-bx"),
  O_btn = select_bx.querySelector(".playerO"),
  X_btn = select_bx.querySelector(".playerX"),
  levelBtns = select_bx.querySelectorAll(".difficulty button"),
  allBox = document.querySelectorAll("section span"),
  players = document.querySelector(".players"),
  result_bx = document.querySelector(".result-bx"),
  won_txt = result_bx.querySelector(".result-txt"),
  replay_btn = result_bx.querySelector(".btn button"),
  playBoard = document.querySelector(".play-board");

const x_icon = "fa fa-times";
const o_icon = "far fa-circle";
const sadEmojies = ["😑", "🙄", "😫", "😕", "😤"];
const emojies = ["😎", "😉", "😁", "🤑"];
const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Bot "thinking" delay range (ms) per difficulty, short so it never feels slow
const DELAYS = {
  easy: [250, 600],
  medium: [300, 700],
  hard: [350, 800],
};

let difficulty = "medium";
let humanSign = "X";
let botSign = "O";
let current = "X"; // X always starts
let board = Array(9).fill("");
let gameOver = false;

const randomItem = (list) => list[Math.floor(Math.random() * list.length)];
const randomBetween = (min, max) => min + Math.random() * (max - min);

// "active" class = highlight on O's turn
function setTurn(sign) {
  current = sign;
  players.classList.toggle("active", sign === "O");
}

function place(index, sign) {
  board[index] = sign;
  allBox[index].innerHTML = `<i class="${sign === "X" ? x_icon : o_icon}"></i>`;
  allBox[index].style.pointerEvents = "none";
}

// Works on any board array (needed by the AI)
function getResult(b = board) {
  for (const [x, y, z] of lines) {
    if (b[x] && b[x] === b[y] && b[x] === b[z]) return b[x];
  }
  return b.every(Boolean) ? "draw" : null;
}

function getWinLine(b = board) {
  return (
    lines.find(([x, y, z]) => b[x] && b[x] === b[y] && b[x] === b[z]) || null
  );
}
function finishIfDone() {
  const result = getResult();
  if (!result) return false;

  gameOver = true;

  if (result === "draw") {
    won_txt.textContent = `Match has been drawn! ${randomItem(sadEmojies)}`;
    allBox.forEach((box) => box.classList.add("draw"));
  } else {
    const emoji = randomItem(result === humanSign ? emojies : sadEmojies);
    won_txt.innerHTML = `Player <strong>${result} ${emoji}</strong> won the game!`;
    getWinLine().forEach((i) => allBox[i].classList.add("win"));
  }

  // Wait a bit longer so the animation can be seen before the result box shows
  setTimeout(() => {
    playBoard.classList.remove("show");
    result_bx.classList.add("show");
  }, 1400);
  return true;
}

/* ---------------- AI ---------------- */

const emptyCells = (b) =>
  b.map((v, i) => (v ? null : i)).filter((i) => i !== null);

// Find a cell where `sign` would complete a line right now
function findWinningCell(sign) {
  for (const i of emptyCells(board)) {
    board[i] = sign;
    const won = getResult(board) === sign;
    board[i] = "";
    if (won) return i;
  }
  return null;
}

function randomMove() {
  return randomItem(emptyCells(board));
}

// Medium: win if possible, block if needed, else center, else random
function smartMove() {
  const win = findWinningCell(botSign);
  if (win !== null) return win;

  const block = findWinningCell(humanSign);
  if (block !== null) return block;

  if (!board[4]) return 4;
  return randomMove();
}

// Hard: minimax (unbeatable). Score is from the bot's point of view.
function minimax(b, isBotTurn, depth) {
  const result = getResult(b);
  if (result === botSign) return 10 - depth;
  if (result === humanSign) return depth - 10;
  if (result === "draw") return 0;

  let best = isBotTurn ? -Infinity : Infinity;
  for (const i of emptyCells(b)) {
    b[i] = isBotTurn ? botSign : humanSign;
    const score = minimax(b, !isBotTurn, depth + 1);
    b[i] = "";
    best = isBotTurn ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

function perfectMove() {
  // Empty board: any corner or the center is optimal, so skip the search
  if (emptyCells(board).length === 9) return randomItem([0, 2, 4, 6, 8]);

  let bestScore = -Infinity;
  let bestMoves = [];
  for (const i of emptyCells(board)) {
    board[i] = botSign;
    const score = minimax(board, false, 1);
    board[i] = "";
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [i];
    } else if (score === bestScore) {
      bestMoves.push(i);
    }
  }
  return randomItem(bestMoves); // random among equally good moves = variety
}

function chooseBotMove() {
  if (difficulty === "easy") return randomMove();
  if (difficulty === "medium") {
    // 70% smart, 30% random, so it can be beaten
    return Math.random() < 0.7 ? smartMove() : randomMove();
  }
  return perfectMove();
}

/* ---------------- Game flow ---------------- */

function humanMove(index) {
  if (gameOver || board[index] || current !== humanSign) return;

  place(index, humanSign);
  if (finishIfDone()) return;

  setTurn(botSign);
  playBoard.style.pointerEvents = "none"; // lock while bot "thinks"
  const [min, max] = DELAYS[difficulty];
  setTimeout(botMove, randomBetween(min, max));
}

function botMove() {
  if (gameOver) return;
  if (emptyCells(board).length === 0) return;

  place(chooseBotMove(), botSign);
  if (finishIfDone()) return;

  setTurn(humanSign);
  playBoard.style.pointerEvents = "auto";
}

function startGame(sign) {
  humanSign = sign;
  botSign = sign === "X" ? "O" : "X";

  select_bx.classList.add("hide");
  playBoard.classList.add("show");
  setTurn("X");

  // If the player chose O, the bot (X) plays first
  if (humanSign === "O") {
    playBoard.style.pointerEvents = "none";
    setTimeout(botMove, 400);
  }
}

window.onload = () => {
  allBox.forEach((box, i) => {
    box.onclick = () => humanMove(i);
  });

  levelBtns.forEach((btn) => {
    btn.onclick = () => {
      levelBtns.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      difficulty = btn.dataset.level;
    };
  });

  X_btn.onclick = () => startGame("X");
  O_btn.onclick = () => startGame("O");
};

replay_btn.onclick = () => window.location.reload();
