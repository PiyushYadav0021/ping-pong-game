// --- Game Settings ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 18;
const PADDLE_HEIGHT = 90;
const GOAL_HEIGHT = 110;
const PADDLE_MARGIN = 22;
const BALL_SIZE = 22;
const WIN_SCORE = 10;

// Difficulty configs
const DIFFICULTY_SETTINGS = {
  easy:   { aiSpeed: 3, ballSpeed: 5, aiReact: 0.75 },
  medium: { aiSpeed: 5, ballSpeed: 7, aiReact: 0.85 },
  hard:   { aiSpeed: 8, ballSpeed: 10, aiReact: 1.0 }
};

let gameMode = 'cpu'; // cpu or friend
let difficulty = 'medium';

let canvas, ctx;
let leftPaddle, rightPaddle, ball;
let scoreLeft = 0, scoreRight = 0;
let isPlaying = false, isGameOver = false;
let mouseY = CANVAS_HEIGHT / 2;
let moveUp = false, moveDown = false, moveUp2 = false, moveDown2 = false;
let animFrame;
let aiConfig = DIFFICULTY_SETTINGS[difficulty];

function setDifficulty(diff) {
  difficulty = diff;
  aiConfig = DIFFICULTY_SETTINGS[diff];
  document.querySelectorAll('.diff-btn').forEach(btn =>
    btn.classList.toggle('selected', btn.dataset.diff === diff)
  );
}
function showMenu() {
  document.getElementById('main-menu').classList.remove('hidden');
  document.getElementById('pong-container').classList.add('hidden');
  document.getElementById('game-result').classList.add('hidden');
}
function hideMenu() {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('pong-container').classList.remove('hidden');
}
function resetGame() {
  scoreLeft = 0;
  scoreRight = 0;
  isGameOver = false;
  document.getElementById('score-left').textContent = scoreLeft;
  document.getElementById('score-right').textContent = scoreRight;
  document.getElementById('game-result').classList.add('hidden');
  initObjects();
}
function startGame() {
  resetGame();
  hideMenu();
  isPlaying = true;
  animFrame = requestAnimationFrame(gameLoop);
}
function endGame(winner) {
  isPlaying = false;
  isGameOver = true;
  document.getElementById('game-result').textContent =
    winner === 'left'
      ? (gameMode === 'cpu' ? 'You Win! 🏆' : 'Player 1 Wins! 🏆')
      : (gameMode === 'cpu' ? 'Computer Wins! 🤖' : 'Player 2 Wins! 🏆');
  document.getElementById('game-result').classList.remove('hidden');
}
function initObjects() {
  leftPaddle = {
    x: PADDLE_MARGIN,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 9
  };
  rightPaddle = {
    x: CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: aiConfig.aiSpeed
  };
  ball = {
    x: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
    y: CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
    size: BALL_SIZE,
    speed: aiConfig.ballSpeed,
    dx: Math.random() < 0.5 ? -1 : 1,
    dy: (Math.random() * 2 - 1)
  };
  normalizeBallDirection();
}

function normalizeBallDirection() {
  // Normalize ball direction
  let len = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
  ball.dx = (ball.dx / len) * ball.speed;
  ball.dy = (ball.dy / len) * ball.speed;
}

function drawTableDecor() {
  // Draw ice hockey style table
  // Blue lines
  ctx.save();
  ctx.strokeStyle = "#1976d2";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 0);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 70, 0, 2 * Math.PI);
  ctx.stroke();

  // Goal areas (vertical rectangles)
  ctx.fillStyle = "#e3f2fd";
  ctx.strokeStyle = "#1976d2";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.rect(0, CANVAS_HEIGHT / 2 - GOAL_HEIGHT / 2, 10, GOAL_HEIGHT);
  ctx.rect(CANVAS_WIDTH - 10, CANVAS_HEIGHT / 2 - GOAL_HEIGHT / 2, 10, GOAL_HEIGHT);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}
function drawPaddle(paddle, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = "#1976d2";
  ctx.shadowBlur = 8;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.restore();
}
function drawBall() {
  ctx.save();
  ctx.fillStyle = "#263238";
  ctx.shadowColor = "#90caf9";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}
function drawGoals() {
  // Draw "goal" areas for visual
  ctx.save();
  ctx.fillStyle = "rgba(100,181,246,0.25)";
  ctx.fillRect(0, CANVAS_HEIGHT / 2 - GOAL_HEIGHT / 2, 14, GOAL_HEIGHT);
  ctx.fillRect(CANVAS_WIDTH - 14, CANVAS_HEIGHT / 2 - GOAL_HEIGHT / 2, 14, GOAL_HEIGHT);
  ctx.restore();
}
function draw() {
  // Table
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawTableDecor();
  drawGoals();
  // Paddles
  drawPaddle(leftPaddle, "#1565c0");
  drawPaddle(rightPaddle, "#fbc02d");
  // Ball
  drawBall();
}
function update() {
  // Left Paddle (Player 1)
  if (gameMode === 'friend') {
    if (moveUp) leftPaddle.y -= leftPaddle.speed;
    if (moveDown) leftPaddle.y += leftPaddle.speed;
    // Clamp paddle
    leftPaddle.y = Math.max(0, Math.min(leftPaddle.y, CANVAS_HEIGHT - PADDLE_HEIGHT));
    // Player 2
    if (moveUp2) rightPaddle.y -= rightPaddle.speed;
    if (moveDown2) rightPaddle.y += rightPaddle.speed;
    rightPaddle.y = Math.max(0, Math.min(rightPaddle.y, CANVAS_HEIGHT - PADDLE_HEIGHT));
  } else {
    // Mouse for left paddle
    let targetY = mouseY - PADDLE_HEIGHT / 2;
    leftPaddle.y += (targetY - leftPaddle.y) * 0.3;
    leftPaddle.y = Math.max(0, Math.min(leftPaddle.y, CANVAS_HEIGHT - PADDLE_HEIGHT));
    // AI for right paddle
    let aiCenter = rightPaddle.y + PADDLE_HEIGHT / 2;
    let ballCenter = ball.y + BALL_SIZE / 2;
    // Only react if ball is on AI's half or randomly based on aiReact
    if ((ball.x > CANVAS_WIDTH / 2 && Math.random() < aiConfig.aiReact) || gameMode === 'friend') {
      if (aiCenter < ballCenter - 8) rightPaddle.y += aiConfig.aiSpeed;
      else if (aiCenter > ballCenter + 8) rightPaddle.y -= aiConfig.aiSpeed;
      // Clamp
      rightPaddle.y = Math.max(0, Math.min(rightPaddle.y, CANVAS_HEIGHT - PADDLE_HEIGHT));
    }
  }

  // Ball movement
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Collision with top/bottom
  if (ball.y < 0) {
    ball.y = 0;
    ball.dy = -ball.dy;
  }
  if (ball.y + BALL_SIZE > CANVAS_HEIGHT) {
    ball.y = CANVAS_HEIGHT - BALL_SIZE;
    ball.dy = -ball.dy;
  }

  // Collision with paddles
  if (
    ball.x < leftPaddle.x + leftPaddle.width &&
    ball.x + BALL_SIZE > leftPaddle.x &&
    ball.y + BALL_SIZE > leftPaddle.y &&
    ball.y < leftPaddle.y + leftPaddle.height
  ) {
    ball.x = leftPaddle.x + leftPaddle.width;
    ball.dx = Math.abs(ball.dx);
    // Add angle based on hit
    let collidePoint = (ball.y + BALL_SIZE / 2) - (leftPaddle.y + PADDLE_HEIGHT / 2);
    let norm = collidePoint / (PADDLE_HEIGHT / 2);
    ball.dy = norm * ball.speed;
    normalizeBallDirection();
  }
  if (
    ball.x + BALL_SIZE > rightPaddle.x &&
    ball.x < rightPaddle.x + rightPaddle.width &&
    ball.y + BALL_SIZE > rightPaddle.y &&
    ball.y < rightPaddle.y + rightPaddle.height
  ) {
    ball.x = rightPaddle.x - BALL_SIZE;
    ball.dx = -Math.abs(ball.dx);
    let collidePoint = (ball.y + BALL_SIZE / 2) - (rightPaddle.y + PADDLE_HEIGHT / 2);
    let norm = collidePoint / (PADDLE_HEIGHT / 2);
    ball.dy = norm * ball.speed;
    normalizeBallDirection();
  }

  // Detect goal
  // Left goal
  if (
    ball.x <= 0 &&
    ball.y + BALL_SIZE / 2 > CANVAS_HEIGHT / 2 - GOAL_HEIGHT / 2 &&
    ball.y + BALL_SIZE / 2 < CANVAS_HEIGHT / 2 + GOAL_HEIGHT / 2
  ) {
    scoreRight++;
    updateScoreboard();
    if (scoreRight === WIN_SCORE) endGame('right');
    else resetAfterGoal('right');
  }
  // Right goal
  if (
    ball.x + BALL_SIZE >= CANVAS_WIDTH &&
    ball.y + BALL_SIZE / 2 > CANVAS_HEIGHT / 2 - GOAL_HEIGHT / 2 &&
    ball.y + BALL_SIZE / 2 < CANVAS_HEIGHT / 2 + GOAL_HEIGHT / 2
  ) {
    scoreLeft++;
    updateScoreboard();
    if (scoreLeft === WIN_SCORE) endGame('left');
    else resetAfterGoal('left');
  }
  // If ball misses the goal area, bounce
  if (ball.x <= 0 || ball.x + BALL_SIZE >= CANVAS_WIDTH) {
    // Bounce only if not in goal area
    if (
      !(
        ball.y + BALL_SIZE / 2 > CANVAS_HEIGHT / 2 - GOAL_HEIGHT / 2 &&
        ball.y + BALL_SIZE / 2 < CANVAS_HEIGHT / 2 + GOAL_HEIGHT / 2
      )
    ) {
      ball.dx = -ball.dx;
      // Position correction
      if (ball.x <= 0) ball.x = 0;
      if (ball.x + BALL_SIZE >= CANVAS_WIDTH) ball.x = CANVAS_WIDTH - BALL_SIZE;
    }
  }
}
function updateScoreboard() {
  document.getElementById('score-left').textContent = scoreLeft;
  document.getElementById('score-right').textContent = scoreRight;
}
function resetAfterGoal(lastScorer) {
  // Position ball at center, next serve to the last scorer
  ball.x = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
  ball.y = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;
  ball.dx = lastScorer === 'left' ? 1 : -1;
  ball.dy = (Math.random() * 2 - 1);
  normalizeBallDirection();
}
function gameLoop() {
  if (!isPlaying) return;
  update();
  draw();
  if (!isGameOver) animFrame = requestAnimationFrame(gameLoop);
}

// --- Event Handling ---
window.onload = () => {
  canvas = document.getElementById('pong');
  ctx = canvas.getContext('2d');

  // Difficulty selection
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.onclick = () => setDifficulty(btn.dataset.diff);
  });
  setDifficulty('medium');

  document.getElementById('play-cpu-btn').onclick = () => {
    gameMode = 'cpu';
    startGame();
  };
  document.getElementById('play-friend-btn').onclick = () => {
    gameMode = 'friend';
    startGame();
  };
  document.getElementById('back-to-menu-btn').onclick = () => {
    isPlaying = false;
    showMenu();
    cancelAnimationFrame(animFrame);
  };

  // Mouse control for left paddle
  canvas.addEventListener('mousemove', e => {
    let rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
  });

  // Keyboard for friend mode
  window.addEventListener('keydown', e => {
    if (gameMode !== 'friend') return;
    if (e.key === 'w' || e.key === 'W') moveUp = true;
    if (e.key === 's' || e.key === 'S') moveDown = true;
    if (e.key === 'ArrowUp') moveUp2 = true;
    if (e.key === 'ArrowDown') moveDown2 = true;
  });
  window.addEventListener('keyup', e => {
    if (gameMode !== 'friend') return;
    if (e.key === 'w' || e.key === 'W') moveUp = false;
    if (e.key === 's' || e.key === 'S') moveDown = false;
    if (e.key === 'ArrowUp') moveUp2 = false;
    if (e.key === 'ArrowDown') moveDown2 = false;
  });

  // Prevent scrolling when using arrow keys
  window.addEventListener('keydown', function(e) {
    if (
      (gameMode === 'friend' && ["ArrowUp", "ArrowDown"].includes(e.key)) ||
      (gameMode === 'friend' && ["w", "W", "s", "S"].includes(e.key))
    ) {
      e.preventDefault();
    }
  }, { passive: false });

  showMenu();
};