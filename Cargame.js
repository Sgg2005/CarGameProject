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

// Fix all car images immediately
function fixCarImages() {
  document.querySelectorAll('.enemyCar, #playerCar').forEach(car => {
    car.style.width = carWidth + 'px'; 
    car.style.removeProperty('height'); // IMPORTANT: Remove height styling completely
  });
}

fixCarImages(); // Run immediately

//ensures the car stays within the road boundaries
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
    lineOffsets[i] += 5; //road speed
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
const CAR_HEIGHT = 150;  // CHANGED: More reasonable height for calculations (but not for styling!)
const SAFE_GAP = CAR_HEIGHT + 50;  // Adjusted for new height

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
  
  // FIXED: Remove height styling
  car.style.removeProperty('height');
  
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
      currentTop += 5; // Speed of enemy cars
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
      
      // FIXED: Ensure no height styling
      car.style.removeProperty('height');
      
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
  
  // Get positions using getBoundingClientRect for accurate dimensions
  const playerRect = playerCar.getBoundingClientRect();
  const enemyRect = enemyCar.getBoundingClientRect();
  
  // Add a small buffer to make collision less strict (30px smaller on each side)
  const buffer = 30;
  
  // Check collision - if rectangles overlap
  if (playerRect.left + buffer < enemyRect.right - buffer &&
      playerRect.right - buffer > enemyRect.left + buffer &&
      playerRect.top + buffer < enemyRect.bottom - buffer &&
      playerRect.bottom - buffer > enemyRect.top + buffer) {
    
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
    
    // FIXED: Ensure no height styling
    car.style.removeProperty('height');
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

// Updated Exit game function to properly close window
function exitGame() {
  // Try multiple approaches to close the window
  try {
    // Primary method
    window.close();
    
    // If that didn't work, try alternative methods
    setTimeout(() => {
      // If we're still here, window.close() didn't work
      
      // Try to close if opened by another window
      if (window.opener) {
        window.close();
      }
      
      // If still here, try more aggressive approach
      if (window.top !== window.self) {
        // If in iframe
        window.parent.postMessage('closeGame', '*');
      }
      
      // Last resort - full screen overlay
      const exitOverlay = document.createElement('div');
      exitOverlay.style.position = 'fixed';
      exitOverlay.style.top = '0';
      exitOverlay.style.left = '0';
      exitOverlay.style.width = '100%';
      exitOverlay.style.height = '100%';
      exitOverlay.style.backgroundColor = 'black';
      exitOverlay.style.color = 'white';
      exitOverlay.style.fontSize = '24px';
      exitOverlay.style.textAlign = 'center';
      exitOverlay.style.paddingTop = '40vh';
      exitOverlay.style.zIndex = '99999';
      exitOverlay.innerHTML = 'Game Exited.<br><br>Please close this browser tab.';
      document.body.appendChild(exitOverlay);
      
      // Hide all other content
      document.querySelectorAll('body > *:not(:last-child)').forEach(el => {
        el.style.display = 'none';
      });
      
      // Also try to redirect to about:blank as another option
      setTimeout(() => {
        window.location.href = 'about:blank';
      }, 1000);
      
    }, 100);
  } catch (e) {
    console.error("Error while trying to exit:", e);
    alert("Please close this window manually.");
  }
}

// Add event listeners to buttons
tryAgainBtn.addEventListener('click', restartGame);
exitGameBtn.addEventListener('click', exitGame);

// Start the game
moveEnemies();

// --- Random car spawning - FIXED VERSION ---
function spawnNewCar() {
  if (!gameActive) return;
  
  // Choose a lane
  const laneIndex = Math.floor(Math.random() * lanePositions.length);
  const lane = lanePositions[laneIndex];
  
  // Create a new car element
  const newCar = document.createElement('img');
  newCar.className = 'enemyCar';
  newCar.src = enemyCarImages[Math.floor(Math.random() * enemyCarImages.length)];
  newCar.style.position = 'absolute';
  newCar.style.width = carWidth + 'px';
  // FIXED: Do NOT set height - let it maintain aspect ratio naturally
  newCar.style.left = lane + 'px';
  
  // Position at top with proper spacing
  let newTop = -CAR_HEIGHT;
  
  // Check if there are cars in this lane
  if (laneTracker[lane].length > 0) {
    const highestCarTop = Math.min(...laneTracker[lane].map(c => parseInt(c.style.top)));
    if (highestCarTop < SAFE_GAP) {
      newTop = highestCarTop - SAFE_GAP - Math.floor(Math.random() * 100);
    }
  }
  
  newCar.style.top = newTop + 'px';
  
  // Add to the DOM and to our tracked cars
  gameArea.appendChild(newCar);
  enemyCars.push(newCar);
  
  console.log("New car spawned in lane:", lane);
}

// Spawn cars at intervals
setInterval(() => {
  if (gameActive && enemyCars.length < 8) { // Limit total cars
    spawnNewCar();
  }
}, 3000 + Math.floor(Math.random() * 2000)); // Every 3-5 seconds

// Add this to your CSS file or add a style tag to your HTML:
const styleTag = document.createElement('style');
styleTag.textContent = `
  .enemyCar, #playerCar {
    width: 100px;
    height: auto !important;
  }
`;
document.head.appendChild(styleTag);

// Run the fix again after a short delay to make sure it sticks
setTimeout(fixCarImages, 500);

