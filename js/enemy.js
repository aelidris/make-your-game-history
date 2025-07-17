import { boxBCR, gameLost ,gamePaused, gameOver} from "./index.js";
import { gameRunning } from "./index.js";
import {isBulletHitPlayer,addScore} from "./ship.js"
let enemyBulletFrequency = 3000;
let enemyBulletSpeed = 2; 
export let scoreMultiplier = 1;

const enemyDiv = document.querySelector(".enemies");

let enemyDirection = 1, enemyX =30 , enemyY = 50;
export let windowFocused = true;
export let bulletExists = false;

window.addEventListener('focus', () => {
    windowFocused = true;
});

window.addEventListener('blur', () => {
    windowFocused = false;
});



export function clearEnemies() {
    const enemies = document.querySelectorAll('.enemy'); // Select all enemies
    enemies.forEach(enemy => enemy.remove()); // Remove each enemy
}

export function createEnemies(enemyCount) {
    const enemiesPerRow = 8; 
    const enemyWidth = 50; 
    const enemyHeight = 40; 
    const gapX = 10;  
    const gapY = 10; 
    enemyX = boxBCR.width / 2 - 200;
    enemyY = 100;
    
    enemyDiv.style.transform = `translate(${enemyX}px, ${enemyY}px)`;
    for (let i = 0; i < enemyCount; i++) {
        const row = Math.floor(i / enemiesPerRow);
        const col = i % enemiesPerRow;
        const x = col * (enemyWidth + gapX);
        const y = row * (enemyHeight + gapY);
        const enemy = document.createElement('img');
        enemy.setAttribute("id", i);
        enemy.setAttribute('class', 'enemy');
        enemy.width = enemyWidth;
        enemy.style.position = 'absolute';
        enemy.style.left = `${x}px`;
        enemy.style.top = `${y}px`; 

        enemy.onload = ()=> {
            enemyDiv.appendChild(enemy);
        }
        enemy.src = `../images/enemy${Math.floor(Math.random() * 6)}.png`;
    }
}

export function moveEnemies() {
     
    if (gameRunning && !gamePaused && windowFocused) {
        if (enemyTouching()) {
            enemyDirection *= -1;
            enemyY += 40;
        }
        enemyX += enemyDirection;
    }
    enemyDiv.style.transform = `translate(${enemyX}px, ${enemyY}px)`
}

function enemyTouching() {

    const enemies = document.querySelectorAll('.enemy');
    let touching = false;
    enemies.forEach((enemy) => {
        const enemyBCR = enemy.getBoundingClientRect();
        
        if (enemyBCR.bottom > boxBCR.bottom - 80) gameLost();
        if (enemyBCR.right >= boxBCR.right || enemyBCR.left <= boxBCR.left) touching = true;
    })
    return touching;
}

const enemyFire = document.createElement("div")

enemyFire.setAttribute('class', 'enemyFire');

function createEnemyBullet(enemyFireX,enemyFireY){
    enemyFire.style.left = `${enemyFireX}px`;
    enemyFire.style.top= `${enemyFireY + enemyBulletSpeed}px`;
    document.body.appendChild(enemyFire);
    return enemyFire;
    
}

function enemyShoot() {
    if (!windowFocused || gamePaused || !gameRunning || gameOver) return;

    const enemies = document.querySelectorAll('.enemy');
    if (enemies.length > 0) {
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    const enemyBCR = randomEnemy.getBoundingClientRect();
    // Create a bullet from the enemy's position
    const bullet = createEnemyBullet(enemyBCR.left + enemyBCR.width / 2, enemyBCR.top + enemyBCR.height);
    // Move the bullet downward
    moveEnemyBullet(bullet);
    }
}

export const gameSettings = {
    makeEnemiesShootFaster: 5
};

function moveEnemyBullet(bullet) {
    function move() {
        if (gamePaused) {
            bullet.remove();
            return;
        }
        const bulletBCR = bullet.getBoundingClientRect();
        
        bullet.style.top = `${bulletBCR.top + gameSettings.makeEnemiesShootFaster}px`;

        if (bulletBCR.bottom < boxBCR.bottom && !isBulletHitPlayer(bulletBCR)) {
            requestAnimationFrame(move);
        } else {
            bullet.remove();
        }
    }

    requestAnimationFrame(move);
    
}

let lastEnemyShotTime = 0;
export function startEnemyShooting() {
    let time = Date.now(); 

    // Stop shooting when the game is won
    if (levelSettings.winTheGame >= 4) {
        return; // Exit the function, stopping enemy shooting
    }
    if (gameRunning && !gamePaused && !gameOver && time - lastEnemyShotTime > enemyBulletFrequency) {
        enemyShoot();
        lastEnemyShotTime = time; // Update the last shot time
    } 
}

export const levelSettings = {
    winTheGame : 1
}
let levelsWinMessageTime = 500;
export function enemyDestroyed(bBCR) {
    const enemies = document.querySelectorAll('.enemy');
    let hit = false;
    enemies.forEach((enemy) => {
        const eBCR = enemy.getBoundingClientRect();
        if (eBCR.top <= bBCR.top && eBCR.bottom >= bBCR.top && eBCR.left <= bBCR.left && eBCR.right >= bBCR.right) {
                enemy.remove();
                hit = true;
                addScore(enemy.id);
                if (enemies.length <= 1) {
                    levelSettings.winTheGame++;
                    // Create the main box div
                    const box = document.createElement("div");
                    box.classList.add("box");

                    // Apply styles
                    box.style.zIndex = "0";
                    box.style.backgroundColor = "black";
                    box.style.width = "900px";
                    box.style.height = "600px";
                    box.style.border = "1px solid white";
                    box.style.position = "absolute";
                    box.style.left = "50%";
                    box.style.top = "50%";
                    box.style.transform = "translate(-50%, -50%)";
                    box.style.display = "flex";
                    box.style.justifyContent = "center";
                    box.style.alignItems = "center";

                    // Create the text element
                    const levelText = document.createElement("div");
                    if (levelSettings.winTheGame == 4){
                       levelText.textContent = "🎖️ You did it! A legendary win!";
                        // Reload the page after 5 seconds
                       levelsWinMessageTime = 5000;
                    } else {
                        levelText.textContent = "LEVEL "+levelSettings.winTheGame;
                    }

                    // Style the text
                    levelText.style.color = "white";
                    levelText.style.fontSize = "100px"; 
                    levelText.style.fontWeight = "bold";
                    levelText.style.fontFamily = "Arial, sans-serif";
                    levelText.style.textTransform = "uppercase";
                                
                    // Append the text to the box
                    box.appendChild(levelText);
                                
                    // Append the box to the document body
                    document.body.appendChild(box);
                                
                    // Remove the div after 1 second
                    setTimeout(() => {
                       if (levelsWinMessageTime == 5000) {
                           location.reload();
                       } else {
                           box.remove(); // This removes the div from the DOM
                           gameSettings.makeEnemiesShootFaster+=5;
                           createEnemies(32);
                       }
                    }, levelsWinMessageTime);       
            }
        }
    })
    return hit;
}

