import { boxBCR, gameDiv, gameOver, gameState, keys } from "./index.js";
import { gameRunning, gameLost } from "./index.js";
import { enemyDestroyed, scoreMultiplier, windowFocused } from "./enemy.js";

export const scoreDiv = document.querySelector(".score")
const ship = document.createElement("img");
export let shipX, shipY;

// Changed: Remove single bullet tracking, use array for multiple bullets
export let bullets = [];
let lastShotTime = 0;
const SHOT_COOLDOWN = 100; // 100ms cooldown

let score;
let lives;

export function createShip() {
    shipX = boxBCR.width / 2 - 25;
    shipY = boxBCR.height - 75;
    ship.src = "../images/ship.png";
    ship.setAttribute("class", "ship");
    ship.width = 50;
    ship.style.transform = `translate(${shipX}px,${shipY}px)`;
    gameDiv.appendChild(ship);
}

export function moveShip() {
    if (gameRunning) {
        if (keys[0]) {
            if (keys[0] == 'r' && shipX < boxBCR.width - 52) shipX += 5;
            else if (shipX >= 2) shipX -= 5;
        }
    }
    ship.style.transform = `translate(${shipX}px,${shipY}px)`;
}

// Modified: Allow shooting every 100ms
export function fireBullet() {
    const currentTime = Date.now();
    
    // Check if enough time has passed since last shot
    if (currentTime - lastShotTime < SHOT_COOLDOWN) {
        return; // Can't shoot yet
    }
    
    lastShotTime = currentTime;
    
    // Create new bullet
    const bullet = document.createElement('div');
    bullet.setAttribute('class', 'bullet');
    
    const bulletData = {
        element: bullet,
        x: shipX + 24,
        y: shipY
    };
    
    bullet.style.transform = `translate(${bulletData.x}px, ${bulletData.y}px)`;
    gameDiv.appendChild(bullet);
    
    bullets.push(bulletData);
    moveBullet(bulletData);
}

// Modified: Handle individual bullet movement
export function moveBullet(bulletData) {
    if (gameOver) {
        bulletData.element.remove();
        removeBulletFromArray(bulletData);
        return;
    }
    
    if (gameRunning) {
        const bulletBCR = bulletData.element.getBoundingClientRect();
        
        // Check if bullet hit top or enemy
        if (bulletBCR.top < boxBCR.top || enemyDestroyed(bulletBCR)) {
            bulletData.element.remove();
            removeBulletFromArray(bulletData);
            return;
        }
        
        // Move bullet up
        bulletData.y -= 5;
        bulletData.element.style.transform = `translate(${bulletData.x}px, ${bulletData.y}px)`;
        
        // Continue moving this bullet
        requestAnimationFrame(() => moveBullet(bulletData));
    }
}

// Helper function to remove bullet from array
function removeBulletFromArray(bulletData) {
    const index = bullets.indexOf(bulletData);
    if (index > -1) {
        bullets.splice(index, 1);
    }
}

// Modified: Check collision for all bullets
export function checkBulletCollisions() {
    bullets.forEach(bulletData => {
        const bulletBCR = bulletData.element.getBoundingClientRect();
        if (enemyDestroyed(bulletBCR)) {
            bulletData.element.remove();
            removeBulletFromArray(bulletData);
        }
    });
}

// Clean up all bullets when game ends
export function cleanupBullets() {
    bullets.forEach(bulletData => {
        bulletData.element.remove();
    });
    bullets = [];
}

export function addLives() {
    const liveSpan = document.querySelector(".lives");
    liveSpan.innerHTML = "";
    let left = 0;
    lives = 3
    for (let i = 0; i < lives; i++) {
        const divLive = document.createElement("img");
        divLive.src = "../images/life.png";
        divLive.style.transform = `translate(${left}px, 0)`
        divLive.setAttribute("id", `life-${i}`);
        left += 30
        divLive.onload = () => {
            liveSpan.appendChild(divLive);
        }
    }
}

export function isBulletHitPlayer(bulletBCR) {
    const playerBCR = document.querySelector(".ship").getBoundingClientRect();
    if (bulletBCR.right > playerBCR.left && bulletBCR.left < playerBCR.right &&
        bulletBCR.bottom > playerBCR.top && bulletBCR.top < playerBCR.bottom) {
        lives--;
        lives > 0 ? document.getElementById(`life-${lives}`).remove() : (document.getElementById(`life-${lives}`).remove(), gameLost());
        return true;
    }
    return false;
}

export function addScore(id) {
    if (id < 8) {
        score += 30 * scoreMultiplier;
    } else if (id < 16 && id >= 8) {
        score += 20 * scoreMultiplier;
    } else {
        score += 10 * scoreMultiplier;
    }
    scoreDiv.textContent = `Score: ${score}`;
}

export function initTimeAndScore() {
    score = 0;
    scoreDiv.innerHTML = `Score:${score}`;
    sec = 0;
    min = 0;
    timeDiv.innerHTML = `Time:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
}

const timeDiv = document.querySelector(".time");
export let sec;
let min;
export function addTime() {
    if (gameRunning && !gameState.paused && windowFocused) {
        sec++;
        if (sec % 60 === 0) {
            sec = 0;
            min++;
        }
        timeDiv.innerHTML = `Time:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    }
}