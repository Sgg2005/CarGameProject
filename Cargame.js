// --- Player movement ---
const playerCar = document.getElementById('playerCar');
const roadWidth = 400;
const carWidth = 100;
let carLeft = (roadWidth - carWidth) / 2;
const carStep = 25;
const overlap = 10;

const minLeft = -overlap;
const maxLeft = roadWidth - carWidth + overlap;

playerCar.style.left = carLeft + "px";

// Game state
let gameActive = true;
let score = 0;
let scoreInterval = null;

// --- DIFFICULTY LOGIC UPDATED AS PER REQUIREMENTS ---
const difficulty = localStorage.getItem('carGameLevel');
let gameSpeed, speedIncrement;
if (difficulty === 'easy') {
  gameSpeed = 10;
  speedIncrement = 8;
} else if (difficulty === 'medium') {
  gameSpeed = 11;
  speedIncrement = 8;
} else if (difficulty === 'hard') {
  gameSpeed = 12;
  speedIncrement = 8;
} else {
  gameSpeed = 5;
  speedIncrement = 8;
}
// Track last score milestone
let lastSpeedIncreaseScore = 0;

// --- Road lines animation ---
const roadLines = document.querySelectorAll('.road-line');
const minSpacing = 300;
const gameArea = document.getElementById('gameArea');
const roadHeight = gameArea.offsetHeight;
const lineCount = roadLines.length;
const lineSpacing = roadHeight / lineCount;
let lineOffsets = [];

function resetLineOffsets() {
  lineOffsets = [];
  for (let i = 0; i < lineCount; i++) {
    lineOffsets[i] = i * lineSpacing;
    roadLines[i].style.top = lineOffsets[i] + 'px';
  }
}

function animateRoadLines() {
  if (!gameActive) return;
  for (let i = 0; i < roadLines.length; i++) {
    lineOffsets[i] += gameSpeed; // use variable speed
    if (lineOffsets[i] > roadHeight) {
      lineOffsets[i] = lineOffsets[i] - roadHeight - 80;
    }
    roadLines[i].style.top = lineOffsets[i] + 'px';
  }
  requestAnimationFrame(animateRoadLines);
}

// --- Enemy cars movement ---
const lanePositions = [
  0,
  roadWidth - carWidth
];

// Dynamically create enemy cars if not present
const ENEMY_CAR_COUNT = 3;
let enemyCars = Array.from(document.querySelectorAll('.enemyCar'));
const enemyCarImages = [
  "CarImage2.png",
  "CarImage3.png",
  "CarImage4.png"
];

const CAR_HEIGHT = 350;
const SAFE_GAP = CAR_HEIGHT + 100;

if (enemyCars.length === 0) {
  for (let i = 0; i < ENEMY_CAR_COUNT; i++) {
    const car = document.createElement('img');
    car.className = 'enemyCar';
    car.style.position = 'absolute';
    car.style.width = carWidth + 'px';
    car.style.height = CAR_HEIGHT + 'px';
    car.src = enemyCarImages[Math.floor(Math.random() * enemyCarImages.length)];
    gameArea.appendChild(car);
  }
  enemyCars = Array.from(document.querySelectorAll('.enemyCar'));
}

const laneTracker = {
  [lanePositions[0]]: [],
  [lanePositions[1]]: []
};

const gameOverScreen = document.getElementById('gameOverScreen');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const exitGameBtn = document.getElementById('exitGameBtn');

//initialises enemy cars with proper spacing
enemyCars.forEach((car, idx) => {
  const laneIndex = Math.floor(Math.random() * lanePositions.length);
  const lane = lanePositions[laneIndex];
  car.style.left = lane + 'px';

  let newTop;
  if (laneTracker[lane].length === 0) {
    newTop = -CAR_HEIGHT - Math.floor(Math.random() * 200);
  } else {
    const lastCarTop = Math.min(...laneTracker[lane].map(c => parseInt(c.style.top)));
    newTop = lastCarTop - SAFE_GAP - Math.floor(Math.random() * 100);
  }

  car.style.top = newTop + 'px';
  laneTracker[lane].push(car);

  if (idx > 0) {
    car.src = enemyCarImages[Math.floor(Math.random() * enemyCarImages.length)];
  }
});

// --- Game Loop: move enemies ---
function moveEnemies() {
  if (!gameActive) return;

  //resets lane tracker for each frame
  laneTracker[lanePositions[0]] = [];
  laneTracker[lanePositions[1]] = [];

  //sorts enemy cars by their top position
  const sortedCars = Array.from(enemyCars).sort((a, b) => {
    return parseInt(a.style.top) - parseInt(b.style.top);
  });

  sortedCars.forEach(car => {
    const lane = parseInt(car.style.left);
    laneTracker[lane].push(car);
  });

  sortedCars.forEach(car => {
    let currentTop = parseInt(car.style.top) || 0;
    let currentLane = parseInt(car.style.left) || 0;

    const carsInSameLane = laneTracker[currentLane].filter(c => c !== car);
    const carsBelowInLane = carsInSameLane.filter(c => parseInt(c.style.top) > currentTop);
    let canMove = true;

    if (carsBelowInLane.length > 0) {
      const closestCarBelow = carsBelowInLane.reduce((closest, c) => {
        return parseInt(c.style.top) < parseInt(closest.style.top) ? c : closest;
      }, carsBelowInLane[0]);
      const distanceToCarBelow = parseInt(closestCarBelow.style.top) - currentTop;
      if (distanceToCarBelow < SAFE_GAP) {
        canMove = false;
      }
    }

    if (canMove) {
      currentTop += gameSpeed; // use variable speed
      car.style.top = currentTop + 'px';
    }

    if (currentTop > roadHeight) {
      const laneIndex = Math.floor(Math.random() * lanePositions.length);
      const newLane = lanePositions[laneIndex];

      let newTop = -CAR_HEIGHT;
      if (laneTracker[newLane].length > 0) {
        const highestCarTop = Math.min(...laneTracker[newLane]
          .map(c => parseInt(c.style.top)));
        if (highestCarTop < SAFE_GAP) {
          newTop = highestCarTop - SAFE_GAP - Math.floor(Math.random() * 100);
        }
      }

      car.style.top = newTop + 'px';
      car.style.left = newLane + 'px';
      car.src = enemyCarImages[Math.floor(Math.random() * enemyCarImages.length)];

      const oldLaneIndex = laneTracker[currentLane].indexOf(car);
      if (oldLaneIndex !== -1) {
        laneTracker[currentLane].splice(oldLaneIndex, 1);
      }
      laneTracker[newLane].push(car);
    }

    // Check collision with player car directly in moveEnemies
    checkCarCollision(car);
  });

  if (gameActive) {
    requestAnimationFrame(moveEnemies);
  }
}

// --- Player movement (keyboard) ---
document.addEventListener('keydown', (e) => {
  if (!gameActive) return;

  if (e.key === 'ArrowLeft') {
    carLeft = Math.max(minLeft, carLeft - carStep);
  } else if (e.key === 'ArrowRight') {
    carLeft = Math.min(maxLeft, carLeft + carStep);
  }
  playerCar.style.left = carLeft + 'px';
});

// --- Collision detection and game over handling ---
function checkCarCollision(enemyCar) {
  if (!gameActive) return;

  const playerTop = playerCar.offsetTop;
  const playerBottom = playerTop + playerCar.offsetHeight;
  const playerLeft = parseInt(playerCar.style.left);
  const playerRight = playerLeft + playerCar.offsetWidth;

  const enemyTop = parseInt(enemyCar.style.top);
  const enemyBottom = enemyTop + enemyCar.offsetHeight;
  const enemyLeft = parseInt(enemyCar.style.left);
  const enemyRight = enemyLeft + enemyCar.offsetWidth;

  if (playerLeft < enemyRight &&
      playerRight > enemyLeft &&
      playerTop < enemyBottom &&
      playerBottom > enemyTop) {
    gameOver();
  }
}

// --- Score display ---
function updateScoreDisplay() {
  document.getElementById('scoreDisplay').textContent = "Score: " + score;
}

// --- Game Over ---
function gameOver() {
  gameActive = false;
  clearInterval(scoreInterval);
  playerCar.style.filter = "brightness(150%) saturate(200%)";
  gameOverScreen.style.display = 'block';
  document.getElementById('finalScore').textContent = score;
}

// --- Start Game / Restart Game ---
function startGame() {
  gameActive = true;
  score = 0;

  // --- DIFFICULTY LOGIC UPDATED AS PER REQUIREMENTS ---
  if (difficulty === 'easy') {
    gameSpeed = 5;
    speedIncrement = 4;
  } else if (difficulty === 'medium') {
    gameSpeed = 6;
    speedIncrement = 4;
  } else if (difficulty === 'hard') {
    gameSpeed = 7;
    speedIncrement = 4;
  } else {
    gameSpeed = 5;
    speedIncrement = 4;
  }
  lastSpeedIncreaseScore = 0;

  updateScoreDisplay();

  playerCar.style.filter = "none";
  carLeft = (roadWidth - carWidth) / 2;
  playerCar.style.left = carLeft + 'px';

  gameOverScreen.style.display = 'none';

  enemyCars.forEach((car, idx) => {
    const laneIndex = Math.floor(Math.random() * lanePositions.length);
    const lane = lanePositions[laneIndex];
    car.style.left = lane + 'px';
    car.style.top = (-CAR_HEIGHT - idx * SAFE_GAP) + 'px';
    car.src = enemyCarImages[Math.floor(Math.random() * enemyCarImages.length)];
  });

  laneTracker[lanePositions[0]] = [];
  laneTracker[lanePositions[1]] = [];
  enemyCars.forEach(car => {
    const lane = parseInt(car.style.left);
    laneTracker[lane].push(car);
  });

  resetLineOffsets();

  animateRoadLines();
  moveEnemies();

  clearInterval(scoreInterval);
  scoreInterval = setInterval(function() {
    score++;
    updateScoreDisplay();
    // --- DIFFICULTY LOGIC: Increase speed every 50 points, only once per milestone ---
    if (score > 0 && score % 50 === 0 && score !== lastSpeedIncreaseScore) {
      gameSpeed += speedIncrement;
      lastSpeedIncreaseScore = score;
    }
  }, 100);
}

function restartGame() {
  startGame();
}

function exitGame() {
  window.close();
  setTimeout(function() {
    if (!window.closed) {
      alert("Please close this tab to exit the game!");
    }
  }, 500);
}

tryAgainBtn.addEventListener('click', restartGame);
exitGameBtn.addEventListener('click', exitGame);

window.onload = function() {
  startGame();
};
