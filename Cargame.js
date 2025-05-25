const playerCar = document.getElementById('player-car');
let leftPosition = 175;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && leftPosition > 0) {
    leftPosition -= 15; // move left
  } else if (e.key === 'ArrowRight' && leftPosition < 350) {
    leftPosition += 15; // move right
  }
  playerCar.style.left = leftPosition + 'px';
});
