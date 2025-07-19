import { createShip, moveShip, fireBullet, moveBullet, bulletExists, addLives, addTime, initTimeAndScore } from "./ship.js";
import { moveEnemies, createEnemies, startEnemyShooting, clearEnemies, gameSettings, levelSettings } from "./enemy.js";

export const gameDiv = document.querySelector(".game");
export let boxBCR = document.querySelector(".box").getBoundingClientRect();
const titleDiv = document.querySelector(".title");
const gameOverScreen = document.getElementById("gameOverScreen");
export let gameRunning = false;
export let gameOver = false;
export let gamePaused = false;
let gamePausedByChecker = false;
const isSmallScreen = document.querySelector(".isSmallScreen")
const tryAgainBtn = document.getElementById("tryAgain")
const resumeBtn = document.getElementById("resume");
const restartBtn = document.getElementById("restart");
const pauseScreen = document.getElementById("pauseScreen");
export const gameKeys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
};

let pausedBullets = [];

export const keys = []

window.addEventListener('resize', () => {
  boxBCR = document.querySelector(".box").getBoundingClientRect();
  checkScreen();
});

function storeBulletPositions() {
  pausedBullets = [];
  document.querySelectorAll('.enemyFire').forEach(bullet => {
    const rect = bullet.getBoundingClientRect();
    pausedBullets.push({
      element: bullet,
      top: rect.top,
      left: rect.left
    });
  });
}

function restoreBulletPositions() {
  pausedBullets.forEach(bulletData => {
    if (bulletData.element.isConnected) {
      bulletData.element.style.top = `${bulletData.top}px`;
      bulletData.element.style.left = `${bulletData.left}px`;
    }
  });
  pausedBullets = [];
}

function checkScreen() {
  if (tooSmallScreen() && gameRunning && !gamePaused && !gameOver) {
    gamePausedByChecker = true;
    gamePaused = true;
    isSmallScreen.show();
  } else if (!tooSmallScreen() && gameRunning && gamePaused && gamePausedByChecker) {
    gamePaused = false;
    isSmallScreen.close();
    startGame();
    moveBullet();
    gamePausedByChecker = false;
  }
  return;
}

function tooSmallScreen() {
  return window.innerWidth <= boxBCR.width || window.innerHeight <= boxBCR.height;
}




resumeBtn.addEventListener("click", () => {
  restoreBulletPositions(); // Restore positions when resuming
  pauseScreen.close();
  gamePaused = false;
  startGame();
  moveBullet();
});



restartBtn.addEventListener("click", () => {
  pauseScreen.close();
  gamePaused = false;
  resetGame();
  startGame();
  moveBullet();
});

tryAgainBtn.addEventListener('click', () => {
  gameOverScreen.close();
  gameRunning = true;
  gameOver = false;

  resetGame();
  startGame();
  moveBullet();

})

window.addEventListener("load", () => {
  createShip();
  createEnemies(32);
  addLives();
  startEnemyShooting();


  const startGameBtn = document.querySelector(".start-game");

  setInterval(() => {
    startGameBtn.classList.toggle("hidden");
  }, 700);
});

const storyScreen = document.createElement('div');
storyScreen.className = 'story-screen';
storyScreen.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  font-family: 'Courier New', monospace;
  color: #00ff00;
  text-align: center;
`;

const storyContent = document.createElement('div');
storyContent.className = 'story-content';
storyContent.style.cssText = `
  max-width: 80%;
  padding: 30px;
  border: 2px solid #00ff00;
  border-radius: 10px;
  background-color: rgba(0, 20, 0, 0.7);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
  animation: pulse 2s infinite alternate;
`;

storyContent.innerHTML = `
  <h2 style="color: #ff5555; font-size: 2.5rem; margin-bottom: 20px; text-shadow: 0 0 10px rgba(255, 0, 0, 0.7);">EARTH'S LAST DEFENSE</h2>
  <p style="font-size: 1.2rem; margin: 15px 0; line-height: 1.6;">The year is 2147. Alien forces have launched a full-scale invasion.</p>
  <p style="font-size: 1.2rem; margin: 15px 0; line-height: 1.6;">As Earth's most advanced defense system, you're our last hope.</p>
  <p style="font-size: 1.2rem; margin: 15px 0; line-height: 1.6;">The enemy comes in waves - each more dangerous than the last.</p>
  <p class="highlight" style="color: #ffff00; font-weight: bold; font-size: 1.3rem; margin-top: 30px;">Press SPACE to activate defense systems...</p>
`;

storyScreen.appendChild(storyContent);
document.body.appendChild(storyScreen);

// Add the pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { opacity: 0.9; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(style);

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") {
    if (!keys.includes('l')) keys.unshift("l")
  }
  if (e.code === "ArrowRight") {
    if (!keys.includes('r')) keys.unshift("r")
  }


  if ((e.code === "Space" || e.key === " ") && !gameKeys["Space"]) {
    if (gameRunning && !gamePaused && !bulletExists) {
      gameKeys["Space"] = true;
    }

    if (storyScreen.style.display !== 'none') {
        storyScreen.style.display = 'none';
      }

    if (!gameRunning && !gamePaused && !gameOver) {
      titleDiv.remove();
      gameDiv.removeAttribute("hidden");
      gameRunning = true;
      checkScreen();
    }
  }
  if (e.code === 'Enter') {
    if (gameOver) {
      gameRunning = true;
      gameOver = false;
    }
  }
  if (e.code === "Escape") {
    if (gameRunning && !gamePaused) {
      storeBulletPositions(); // Store positions when pausing
      pauseScreen.show();
      gamePaused = true;
    } else if (gamePaused) {
      restoreBulletPositions(); // Restore positions when resuming
      pauseScreen.close();
      gamePaused = false;
      startGame();
      moveBullet();
    }
  }
});

[resumeBtn, restartBtn, tryAgainBtn].forEach(btn => {
  btn.addEventListener('click', () => {
    if (storyScreen.style.display !== 'none') {
      storyScreen.style.display = 'none';
    }
  });
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") keys.splice(keys.indexOf("l"), 1)
  if (e.code === "ArrowRight") keys.splice(keys.indexOf("r"), 1)
  if (e.code === "Space" || e.key === " ") {
    gameKeys["Space"] = false;
  }

});

function startGame() {
  if (!gamePaused && !gameOver) {
    moveShip();
    moveEnemies();
    if (gameKeys["Space"] && !bulletExists /*&& time -lastShotTime > 3000*/) {
      fireBullet()
    }
    startEnemyShooting();

    requestAnimationFrame(startGame)
  }
}

export function gameLost() {
  gameRunning = false;
  gameOver = true;
  gameOverScreen.show();
}

function resetGame() {

  gameRunning = true;
  gameOver = false;
  gamePaused = false;
  gameSettings.makeEnemiesShootFaster = 5;
  levelSettings.winTheGame = 0;
  createShip();
  clearEnemies();
  createEnemies(32);
  initTimeAndScore();
  addLives();
  addTime();
}

//setInterval is used to update the time every second
setInterval(addTime, 1000)

//initTimeAndScore is called on load and restart
initTimeAndScore();

requestAnimationFrame(startGame);