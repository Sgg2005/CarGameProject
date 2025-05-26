// Car movement and road animation

const playerCar = document.getElementById('playerCar');
const gameArea = document.getElementById('gameArea');
const roadLines = document.querySelectorAll('.road-line');

const roadWidth = 400;    // px
const carWidth = 100;     // px (matches CSS)
let carLeft = 150;        // Start position, matches CSS
const carStep = 25;       // px to move per key press

// Lane boundaries
const minLeft = 0;
const maxLeft = roadWidth - carWidth;

// Key controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    carLeft = Math.max(minLeft, carLeft - carStep);
  } else if (e.key === 'ArrowRight') {
    carLeft = Math.min(maxLeft, carLeft + carStep);
  }
  playerCar.style.left = carLeft + 'px';
});

// Animate road lines to simulate road movement
const vh = window.innerHeight;
const lineCount = roadLines.length;
const lineSpacing = vh / lineCount;
let lineOffsets = [];

function resetLineOffsets() {
  lineOffsets = [];
  for (let i = 0; i < lineCount; i++) {
    lineOffsets[i] = i * lineSpacing;
  }
}

function animateRoadLines() {
  for (let i = 0; i < roadLines.length; i++) {
    lineOffsets[i] += 7; // road speed
    if (lineOffsets[i] > vh) {
      lineOffsets[i] = lineOffsets[i] - vh - 60; // wrap around
    }
    roadLines[i].style.top = lineOffsets[i] + 'px';
  }
  requestAnimationFrame(animateRoadLines);
}

resetLineOffsets();
animateRoadLines();