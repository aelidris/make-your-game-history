import { boxBCR, gameDiv, gameOver, gamePaused, keys } from "./index.js";
import { gameRunning,gameLost } from "./index.js";
import { enemyDestroyed,scoreMultiplier,windowFocused } from "./enemy.js";

export const scoreDiv = document.querySelector(".score")

const ship = document.createElement("img");

export let shipX, shipY;
export let bulletExists = false;
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

const bullet = document.createElement('div');

bullet.setAttribute('class', 'bullet');

let bulletX, bulletY;

export function fireBullet() {
    bulletExists = true;
    bulletX = shipX + 24;
    bulletY = shipY;

    bullet.style.transform = `translate(${bulletX}px, ${bulletY}px)`
    gameDiv.appendChild(bullet);
    
    
    moveBullet();
}

export function moveBullet() {
    if (gameOver) {
        bullet.remove();
        bulletExists = false;
        return;
    }
    if (gameRunning && !gamePaused) {
        const bulletBCR = bullet.getBoundingClientRect();
        if (bulletBCR.top < boxBCR.top || enemyDestroyed(bulletBCR) /*|| mothershipDestroyed(bulletBCR)*/) {
            bullet.remove();

            bulletExists = false;
            return;
        }
        bulletY -= 10;
        bullet.style.transform = `translate(${bulletX}px, ${bulletY}px)`
        requestAnimationFrame(moveBullet)
    }

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
        divLive.setAttribute("id",`life-${i}`);
        left += 30
        divLive.onload =() =>{

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
    timeDiv.innerHTML = `Time:${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`
}


  const timeDiv = document.querySelector(".time");
  export let sec;
  let min;
  export function addTime(){
    
    if (gameRunning && !gamePaused && windowFocused) {
        sec++;
        if (sec % 60 === 0) {
            sec = 0;
            min++;
        }
        timeDiv.innerHTML = `Time:${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
    }
}