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
    lineOffsets[i] += 2; //road speed
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

const enemyCars = document.querySelectorAll('.enemyCar');
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
      currentTop += 2; // Speed of enemy cars
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
  });

  requestAnimationFrame(moveEnemies);
}

moveEnemies();

