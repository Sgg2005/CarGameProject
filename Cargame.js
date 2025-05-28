// --- Player movement ---
const playerCar = document.getElementById('playerCar');
const roadWidth = 400;
const carWidth = 100;
let carLeft = (roadWidth - carWidth) / 2;
const carStep = 25;
const overlap = 10; //how much the player can go past the edge

const minLeft = -overlap;
const maxLeft = roadWidth - carWidth + overlap;

playerCar.style.left = carLeft + "px";

// UPDATED: Check game state before allowing car movement
document.addEventListener('keydown', (e) => {
  // Only allow movement if game is active
  if (!gameActive) return;
  
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
    lineOffsets[i] += 8; //road speed
    if (lineOffsets[i] > roadHeight) {
      lineOffsets[i] = lineOffsets[i] - roadHeight - 80; //80 = road line height
    }
    roadLines[i].style.top = lineOffsets[i] + 'px';
  }
  requestAnimationFrame(animateRoadLines);
}

resetLineOffsets();
animateRoadLines();

// --- Enemy cars movement ---
//only two lanes: left and right (NO center)
const lanePositions = [
  0,                    // Left lane
  roadWidth - carWidth  // Right lane
];

// Changed to let for mutability
let enemyCars = Array.from(document.querySelectorAll('.enemyCar'));
const enemyCarImages = [
  "CarImage2.png",
  "CarImage3.png",
  "CarImage4.png"
];

//changed the car height-based spacing to account for actual image size
const CAR_HEIGHT = 350;  // Your car height (you said 350)
const SAFE_GAP = CAR_HEIGHT + 100;  // Increased for extra safety

//tracks cars by lane for better collision detection
const laneTracker = {
  [lanePositions[0]]: [],
  [lanePositions[1]]: []
};

// Game state
let gameActive = true;
const gameOverScreen = document.getElementById('gameOverScreen');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const exitGameBtn = document.getElementById('exitGameBtn');

//initialses enemy cars with proper spacing
enemyCars.forEach((car, idx) => {
  const laneIndex = Math.floor(Math.random() * lanePositions.length);
  const lane = lanePositions[laneIndex];
  car.style.left = lane + 'px';
  
  //start positioning - ensure each car is spaced properly
  let newTop;
  if (laneTracker[lane].length === 0) {
    //first car in this lane
    newTop = -CAR_HEIGHT - Math.floor(Math.random() * 200);
  } else {
    //finds the last car in this lane and position below it with gap
    const lastCarTop = Math.min(...laneTracker[lane].map(c => parseInt(c.style.top)));
    newTop = lastCarTop - SAFE_GAP - Math.floor(Math.random() * 100);
  }
  
  car.style.top = newTop + 'px';
  laneTracker[lane].push(car);
  
  if (idx > 0) {
    car.src = enemyCarImages[Math.floor(Math.random() * enemyCarImages.length)];
  }
});

function moveEnemies() {
  // Modified to check game state
  if (!gameActive) return;
  
  //resets the lane tracker each frame for accurate current positions
  laneTracker[lanePositions[0]] = [];
  laneTracker[lanePositions[1]] = [];
  
  //sorts the cars by vertical position for better collision detection
  const sortedCars = Array.from(enemyCars).sort((a, b) => {
    return parseInt(a.style.top) - parseInt(b.style.top);
  });
  
  //populates lane tracker with current car positions
  sortedCars.forEach(car => {
    const lane = parseInt(car.style.left);
    laneTracker[lane].push(car);
  });
  
  //processes each car
  sortedCars.forEach(car => {
    let currentTop = parseInt(car.style.top) || 0;
    let currentLane = parseInt(car.style.left) || 0;
    
    //finds cars in the same lane
    const carsInSameLane = laneTracker[currentLane].filter(c => c !== car);
    
    //finds the nearest car below this one in the same lane
    const carsBelowInLane = carsInSameLane.filter(c => parseInt(c.style.top) > currentTop);
    let canMove = true;
    
    if (carsBelowInLane.length > 0) {
      //finds the closest car below
      const closestCarBelow = carsBelowInLane.reduce((closest, c) => {
        return parseInt(c.style.top) < parseInt(closest.style.top) ? c : closest;
      }, carsBelowInLane[0]);
      
      //checks if moving would cause overlap
      const distanceToCarBelow = parseInt(closestCarBelow.style.top) - currentTop;
      if (distanceToCarBelow < SAFE_GAP) {
        canMove = false;
      }
    }
    
    //move car if safe
    if (canMove) {
      currentTop += 10; // Speed of enemy cars
      car.style.top = currentTop + 'px';
    }
    
    //respawn logic
    if (currentTop > roadHeight) {
      const laneIndex = Math.floor(Math.random() * lanePositions.length);
      const newLane = lanePositions[laneIndex];
      
      //find safe position in the chosen lane
      let newTop = -CAR_HEIGHT;
      
      //find the highest car in the target lane
      if (laneTracker[newLane].length > 0) {
        const highestCarTop = Math.min(...laneTracker[newLane]
          .map(c => parseInt(c.style.top)));
        
        //if highest car is too close to the top, position this car higher
        if (highestCarTop < SAFE_GAP) {
          newTop = highestCarTop - SAFE_GAP - Math.floor(Math.random() * 100);
        }
      }
      
      //updates position and image
      car.style.top = newTop + 'px';
      car.style.left = newLane + 'px';
      car.src = enemyCarImages[Math.floor(Math.random() * enemyCarImages.length)];
      
      //updates lane tracker
      const oldLaneIndex = laneTracker[currentLane].indexOf(car);
      if (oldLaneIndex !== -1) {
        laneTracker[currentLane].splice(oldLaneIndex, 1);
      }
      laneTracker[newLane].push(car);
    }
    
    // IMPROVED: Check collision with player car directly in moveEnemies
    checkCarCollision(car);
  });

  // Modified to check game state
  if (gameActive) {
    requestAnimationFrame(moveEnemies);
  }
}

// --- Collision detection and game over handling ---
function checkCarCollision(enemyCar) {
  if (!gameActive) return;
  
  // Get positions
  const playerTop = playerCar.offsetTop;
  const playerBottom = playerTop + playerCar.offsetHeight;
  const playerLeft = parseInt(playerCar.style.left);
  const playerRight = playerLeft + playerCar.offsetWidth;
  
  const enemyTop = parseInt(enemyCar.style.top);
  const enemyBottom = enemyTop + enemyCar.offsetHeight;
  const enemyLeft = parseInt(enemyCar.style.left);
  const enemyRight = enemyLeft + enemyCar.offsetWidth;
  
  // Add a small buffer to make collision less strict (10px smaller on each side)
  const buffer = 30;
  
  // Check collision - if rectangles overlap
  if (playerLeft + buffer < enemyRight - buffer &&
      playerRight - buffer > enemyLeft + buffer &&
      playerTop + buffer < enemyBottom - buffer &&
      playerBottom - buffer > enemyTop + buffer) {
    
    console.log("COLLISION DETECTED!");
    gameOver();
  }
}

// Game over function
function gameOver() {
  gameActive = false;
  
  // Make it obvious that there was a collision
  playerCar.style.filter = "brightness(150%) saturate(200%)";
  
  // Show game over screen
  gameOverScreen.style.display = 'block';
  
  console.log('Game Over! Screen should be visible now.');
}

// Restart game function
function restartGame() {
  // Hide game over screen
  gameOverScreen.style.display = 'none';
  
  // Reset player car
  playerCar.style.filter = "none";
  carLeft = (roadWidth - carWidth) / 2;
  playerCar.style.left = carLeft + 'px';
  
  // Reset enemy cars
  enemyCars.forEach(car => {
    // Reset positions
    const laneIndex = Math.floor(Math.random() * lanePositions.length);
    const lane = lanePositions[laneIndex];
    car.style.left = lane + 'px';
    
    // Stagger vertical positions
    const index = Array.from(enemyCars).indexOf(car);
    car.style.top = (-CAR_HEIGHT - index * SAFE_GAP) + 'px';
    
    // Update image
    car.src = enemyCarImages[Math.floor(Math.random() * enemyCarImages.length)];
  });
  
  // Reset lane trackers
  laneTracker[lanePositions[0]] = [];
  laneTracker[lanePositions[1]] = [];
  
  // Re-initialize enemy cars
  enemyCars.forEach(car => {
    const lane = parseInt(car.style.left);
    laneTracker[lane].push(car);
  });
  
  // Restart game
  gameActive = true;
  moveEnemies(); // Restart the game loop
}

// Most direct exit function possible - focus only on closing
function exitGame() {
  // Try every possible method to close the tab immediately
  try {
    // Method 1: Direct window.close()
    window.close();
    
    // Method 2: If in a popup window
    if (window.opener) {
      window.close();
    }
    
    // Method 3: If in an iframe
    if (window !== window.top) {
      window.parent.close();
    }
    
    // Method 4: Force navigation to close protocol (works in some environments)
    location.href = "about:blank";
  } catch(e) {
    // Last attempt if all others fail
    window.open('', '_self').close();
  }
}

//event listeners in buttons
tryAgainBtn.addEventListener('click', restartGame);
exitGameBtn.addEventListener('click', exitGame);

//start the game
moveEnemies();

// Enemy car spawning system with state tracking
let carState = { leftLane: [], rightLane: [] };

function spawnNewCar() {
  if (!gameActive) return;

  // Analyze current lane states
  const leftLaneEmpty = laneTracker[lanePositions[0]].length === 0;
  const rightLaneEmpty = laneTracker[lanePositions[1]].length === 0;

  // Choose lane based on current state
  let chosenLane;
  if (leftLaneEmpty && rightLaneEmpty) {
    chosenLane = Math.random() < 0.5 ? lanePositions[0] : lanePositions[1];
  } else if (leftLaneEmpty) {
    chosenLane = lanePositions[0];
  } else if (rightLaneEmpty) {
    chosenLane = lanePositions[1];
  } else {
    // If both lanes have cars, choose random
    chosenLane = Math.random() < 0.5 ? lanePositions[0] : lanePositions[1];
  }

  // Create and setup new car
  const newCar = document.createElement('img');
  newCar.className = 'enemyCar';
  newCar.src = enemyCarImages[Math.floor(Math.random() * enemyCarImages.length)];
  newCar.style.position = 'absolute';
  newCar.style.left = chosenLane + 'px';
  newCar.style.top = (-CAR_HEIGHT) + 'px';
  newCar.style.width = carWidth + 'px';
  newCar.style.height = CAR_HEIGHT + 'px';

  // Add to game area
  gameArea.appendChild(newCar);
  enemyCars.push(newCar);
  laneTracker[chosenLane].push(newCar);
}

// Spawn cars periodically
setInterval(() => {
  if (gameActive && enemyCars.length < 6) { // Limit total cars
    spawnNewCar();
  }
}, 3000); // Adjust timing as needed

// Update enemy cleanup in moveEnemies
function removeEnemy(car) {
  const lane = parseInt(car.style.left);
  const index = laneTracker[lane].indexOf(car);
  if (index !== -1) {
    laneTracker[lane].splice(index, 1);
  }
  car.remove();
  enemyCars = enemyCars.filter(c => c !== car);
}
