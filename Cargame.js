const playerCar = document.getElementById('playerCar');
const roadLines = document.querySelectorAll('.road-line');

const roadWidth = 400;    // px
const carWidth = 200;     // px, must match CSS!
let carLeft = (roadWidth - carWidth) / 2; // Start centered
const carStep = 25;       // px per key press

const minLeft = 0;                          // Left edge of road
const maxLeft = roadWidth - carWidth;       // Right edge of road

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    carLeft = Math.max(minLeft, carLeft - carStep);
  } else if (e.key === 'ArrowRight') {
    carLeft = Math.min(maxLeft, carLeft + carStep);
  }
  playerCar.style.left = carLeft + 'px';
});

// Animate road lines to simulate road movement (unchanged)
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
    lineOffsets[i] += 5;
    if (lineOffsets[i] > vh) {
      lineOffsets[i] = lineOffsets[i] - vh - 60;
    }
    roadLines[i].style.top = lineOffsets[i] + 'px';
  }
  requestAnimationFrame(animateRoadLines);
}

resetLineOffsets();
animateRoadLines();
