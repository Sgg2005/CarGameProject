// --- Player movement ---
const playerCar = document.getElementById('playerCar');
const roadWidth = 400;
const carWidth = 100;
let carLeft = (roadWidth - carWidth) / 2;
const carStep = 25;
const overlap = 10; // How much the player can go past the edge

const minLeft = -overlap;
const maxLeft = roadWidth - carWidth + overlap;

playerCar.style.left = carLeft + "px";

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    carLeft = Math.max(minLeft, carLeft - carStep);
  } else if (e.key === 'ArrowRight') {
    carLeft = Math.min(maxLeft, carLeft + carStep);
  }
  playerCar.style.left = carLeft + 'px';
});

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
  for (let i = 0; i < roadLines.length; i++) {
    lineOffsets[i] += 3; // Road speed (adjust for faster/slower)
    if (lineOffsets[i] > roadHeight) {
      lineOffsets[i] = lineOffsets[i] - roadHeight - 80; // 80 = road line height
    }
    roadLines[i].style.top = lineOffsets[i] + 'px';
  }
  requestAnimationFrame(animateRoadLines);
}

resetLineOffsets();
animateRoadLines();

// --- Enemy cars movement ---
// Only two lanes: left and right (NO center)
const lanePositions = [
  0,                    // Left lane
  roadWidth - carWidth  // Right lane
];

const enemyCars = document.querySelectorAll('.enemyCar');
const enemyCarImages = [
  "CarImage2.png",
  "CarImage3.png",
  "CarImage4.png"
];

enemyCars.forEach((car, idx) => {
  const laneIndex = Math.floor(Math.random() * lanePositions.length);
  car.style.left = lanePositions[laneIndex] + 'px';
  // Stagger start: each car higher up, with some randomness
  const baseSpacing = 180; // (must be > car height)
  car.style.top = (-120 - idx * baseSpacing - Math.floor(Math.random() * 100)) + 'px';
  if (idx > 0) {
    car.src = enemyCarImages[Math.floor(Math.random() * enemyCarImages.length)];
  }
});

function moveEnemies() {
  const minGap = 350;      // For same-lane spacing
  const minAlignGap = 150;  // For all-lane horizontal offset

  enemyCars.forEach((car, idx, arr) => {
    let currentTop = parseInt(car.style.top) || 0;
    currentTop += 3; // enemy speed
    car.style.top = currentTop + 'px';

    if (currentTop > roadHeight) {
      let tries = 0;
      let laneIndex, newTop, tooClose;
      do {
        laneIndex = Math.floor(Math.random() * lanePositions.length);
        newTop = -120 - Math.floor(Math.random() * 200);
        tooClose = false;
        for (let j = 0; j < arr.length; j++) {
          if (j === idx) continue;
          const otherCar = arr[j];
          const otherLane = parseInt(otherCar.style.left) || 0;
          const otherTop = parseInt(otherCar.style.top) || 0;
          // Prevent overlap in same lane
          if (
            otherLane === lanePositions[laneIndex] &&
            Math.abs(otherTop - newTop) < minGap
          ) {
            tooClose = true;
            break;
          }
          // Prevent alignment in any lane
          if (
            Math.abs(otherTop - newTop) < minAlignGap
          ) {
            tooClose = true;
            break;
          }
        }
        tries++;
      } while (tooClose && tries < 20);

      car.style.top = newTop + 'px';
      car.style.left = lanePositions[laneIndex] + 'px';
      car.src = enemyCarImages[Math.floor(Math.random() * enemyCarImages.length)];
    }
  });

  requestAnimationFrame(moveEnemies);
}
moveEnemies();

