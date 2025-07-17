import { createShip, moveShip, fireBullet, moveBullet, bulletExists, addLives,addTime,initTimeAndScore } from "./ship.js";
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

export const keys = []

window.addEventListener('resize', () => {
  boxBCR = document.querySelector(".box").getBoundingClientRect();
  checkScreen();
});


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

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") {
    if (!keys.includes('l')) keys.unshift("l")
  }
  if (e.code === "ArrowRight") {
    if (!keys.includes('r')) keys.unshift("r")
  }


  if ((e.code === "Space" || e.key === " ") && !gameKeys["Space"]){
    if (gameRunning && !gamePaused && !bulletExists){
      gameKeys["Space"] = true; 
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
      pauseScreen.show();
      gamePaused = true;
    } else if (gamePaused) {
      pauseScreen.close();
      gamePaused = false;
      startGame();
      moveBullet();
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") keys.splice(keys.indexOf("l"), 1)
  if (e.code === "ArrowRight") keys.splice(keys.indexOf("r"), 1)
  if (e.code === "Space" || e.key === " ") {
    gameKeys["Space"] = false;
  }
  
});

console.log(boxBCR);
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
  levelSettings.winTheGame = 1;
  // addScore();
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