const select_bx = document.querySelector(".select-bx"),
  O_btn = select_bx.querySelector(".playerO"),
  X_btn = select_bx.querySelector(".playerX"),
  allBox = document.querySelectorAll("section span"),
  players = document.querySelector(".players"),
  result_bx = document.querySelector(".result-bx"),
  won_txt = result_bx.querySelector(".result-txt"),
  replay_btn = result_bx.querySelector(".btn"),
  playBoard = document.querySelector(".play-board");

window.onload = () => {
  allBox.forEach((box) => {
    box.onclick = () => {
      clickedBox(box);
    };
  });

  X_btn.onclick = () => {
    playBoard.classList.add("show"); //Show Playboard
    select_bx.classList.add("hide"); //Hide Select Box on click
  };
  O_btn.onclick = () => {
    select_bx.classList.add("hide"); //Hide Select Box on click
    playBoard.classList.add("show"); //Show Playboard
    players.setAttribute("class", "players active player");
  };
};

let x_icon = "fa fa-times";
let o_icon = "far fa-circle";
let playerSign = "X";
let runBot = true;

// user function
function clickedBox(ele) {
  if (players.classList.contains("player")) {
    playerSign = "O";
    ele.setAttribute("id", playerSign);
    ele.innerHTML = `<i class="${o_icon}"></i>`;
    players.classList.add("active");
  } else {
    ele.innerHTML = `<i class="${x_icon}"></i>`;
    players.classList.add("active");
    ele.setAttribute("id", playerSign);
  }
  checkWinner();
  playBoard.style.pointerEvents = "none";
  ele.style.pointerEvents = "none";
  let randomDelay = (Math.random() * 1000 + 200).toFixed();
  setTimeout(() => {
    bot(runBot);
  }, randomDelay);
}

// bot Function

function bot(runBot) {
  if (runBot) {
    const move = bestMove();
    if (move === -1) return;

    playerSign = "O";
    const box = allBox[move];
    box.innerHTML = `<i class="${o_icon}"></i>`;
    players.classList.remove("active");
    box.setAttribute("id", playerSign);
    box.style.pointerEvents = "none";

    checkWinner();
    playBoard.style.pointerEvents = "auto";
    playerSign = "X";
  }
}



// winner function

function getId(idname) {
  return document.querySelector(".box" + idname).id;
}

function checkId(val1, val2, val3, sign) {
  if (getId(val1) == sign && getId(val2) == sign && getId(val3) == sign) {
    return true;
  }
}
let sadEmojies = ["😑", "🙄", "😫", "😕", "😤"];
let emojies = ["😎", "😉", "😁", "🤑"];

function getEmoji(emojiType) {
  return emojiType[Math.floor(Math.random() * emojiType.length)];
}
function checkWinner() {
  let emoji;
  if (
    checkId(1, 2, 3, playerSign) ||
    checkId(4, 5, 6, playerSign) ||
    checkId(7, 8, 9, playerSign) ||
    checkId(1, 4, 7, playerSign) ||
    checkId(2, 5, 8, playerSign) ||
    checkId(3, 6, 9, playerSign) ||
    checkId(1, 5, 9, playerSign) ||
    checkId(3, 5, 7, playerSign)
  ) {
    runBot = false;
    bot(runBot);
    setTimeout(() => {
      playBoard.classList.remove("show");
      result_bx.classList.add("show");
    }, 700);
    emoji = getEmoji(emojies);
    won_txt.innerHTML = `Player <strong>${playerSign} ${emoji}</strong> won the game!`;
  } else {
    if (
      getId(1) != "" &&
      getId(2) != "" &&
      getId(3) != "" &&
      getId(4) != "" &&
      getId(5) != "" &&
      getId(6) != "" &&
      getId(7) != "" &&
      getId(8) != "" &&
      getId(9) != ""
    ) {
      runBot = false;
      bot(runBot);
      setTimeout(() => {
        playBoard.classList.remove("show");
        result_bx.classList.add("show");
      }, 700);
      emoji = getEmoji(sadEmojies);
      won_txt.textContent = `Match has been drawn! ${emoji}`;
    }
  }
}

replay_btn.onclick = () => {
  window.location.reload(); // reload page
};


function getBoardArray() {
  return Array.from(allBox).map((box) => box.id || "");
}

function minimax(board, depth, isMaximizing) {
  const winner = evaluateWinner(board);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (!board.includes("")) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function bestMove() {
  let board = getBoardArray();
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function evaluateWinner(board) {
  const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let combo of winCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return null;
}