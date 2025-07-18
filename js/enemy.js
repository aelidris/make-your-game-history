import { boxBCR, gameLost, gamePaused, gameOver, gameRunning } from "./index.js";
import { isBulletHitPlayer, addScore } from "./ship.js";

let enemyBulletFrequency = 3000; // Time in milliseconds between enemy shots
let enemyBulletSpeed = 2; // Initial speed, consider using gameSettings.makeEnemiesShootFaster instead
export let scoreMultiplier = 1;

const enemyDiv = document.querySelector(".enemies");
const activeBulletAnimations = new Map();

let enemyDirection = 1, enemyX = 30, enemyY = 50;
export let windowFocused = true;
// export let bulletExists = false; // This variable is not used in the provided code, can be removed if not used elsewhere

window.addEventListener('focus', () => {
    windowFocused = true;
});

window.addEventListener('blur', () => {
    windowFocused = false;
});

export function clearEnemies() {
    const enemies = document.querySelectorAll('.enemy');
    enemies.forEach(enemy => enemy.remove());
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

        enemy.onload = () => {
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

// Re-using a single bullet div is problematic if multiple bullets can be on screen simultaneously.
// We need to create a new div for each bullet.
// const enemyFire = document.createElement("div") // This line should be removed or commented out.

function createEnemyBullet(enemyFireX, enemyFireY) {
    const bullet = document.createElement("div"); // Create a new div for each bullet
    bullet.setAttribute('class', 'enemyFire'); // Assign the class
    bullet.style.left = `${enemyFireX}px`;
    bullet.style.top = `${enemyFireY}px`; // Initial position is enemy's bottom
    document.body.appendChild(bullet);
    return bullet;
}

function enemyShoot() {
    const enemies = document.querySelectorAll('.enemy');
    if (enemies.length > 0) {
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        const enemyBCR = randomEnemy.getBoundingClientRect();
        const bullet = createEnemyBullet(enemyBCR.left + enemyBCR.width / 2 - 2, enemyBCR.top + enemyBCR.height); // Adjust -2 for centering
        moveEnemyBullet(bullet);
    }
}

export const gameSettings = {
    makeEnemiesShootFaster: 5 // Speed of enemy bullets
};

function moveEnemyBullet(bullet) {
    let lastTime = performance.now();
    let accumulatedPauseTime = 0;
    let pauseStartTime = 0;

    function move(currentTime) {
        if (gamePaused) {
            if (pauseStartTime === 0) {
                pauseStartTime = currentTime;
            }
            activeBulletAnimations.set(bullet, requestAnimationFrame(move));
            return;
        }

        // Handle resume from pause
        if (pauseStartTime > 0) {
            accumulatedPauseTime += currentTime - pauseStartTime;
            pauseStartTime = 0;
        }

        const adjustedTime = currentTime - accumulatedPauseTime;
        const deltaTime = adjustedTime - lastTime;
        lastTime = adjustedTime;

        const bulletBCR = bullet.getBoundingClientRect();
        const movement = gameSettings.makeEnemiesShootFaster * (deltaTime / 16);
        const newTop = bulletBCR.top + movement;

        bullet.style.top = `${newTop}px`;

        if (newTop < boxBCR.bottom && !isBulletHitPlayer(bullet.getBoundingClientRect())) {
            activeBulletAnimations.set(bullet, requestAnimationFrame(move));
        } else {
            bullet.remove();
            activeBulletAnimations.delete(bullet);
        }
    }

    activeBulletAnimations.set(bullet, requestAnimationFrame(move));
}
// --- NEW/MODIFIED: startEnemyShooting function ---
let enemyShootingLoopId; // To hold the ID of the requestAnimationFrame loop
let lastEnemyShotTime = 0; // Tracks when the last bullet was fired

/**
 * Initiates the continuous enemy shooting loop.
 * This function should be called once to start enemies firing.
 */
export function startEnemyShooting() {
    if (levelSettings.winTheGame >= 4) return;

    const time = Date.now();
    if (gameRunning && !gamePaused && !gameOver && time - lastEnemyShotTime > enemyBulletFrequency) {
        enemyShoot();
        lastEnemyShotTime = time;
    }
}

/**
 * Stops the continuous enemy shooting loop.
 * Call this when the game ends or enemy shooting should cease.
 */
export function stopEnemyShooting() {
    if (enemyShootingLoopId) {
        cancelAnimationFrame(enemyShootingLoopId);
        enemyShootingLoopId = null;
        console.log("Enemy shooting loop stopped.");
    }
}
// --- END NEW/MODIFIED ---

export const levelSettings = {
    winTheGame: 1
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
            if (document.querySelectorAll('.enemy').length === 0) {
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
                box.style.flexDirection = "column";
                box.style.justifyContent = "center";
                box.style.alignItems = "center";
                box.style.padding = "20px";
                box.style.textAlign = "center";

                // Create the content container
                const content = document.createElement("div");

                // Show different historical facts based on the level
                let historyContent;
                switch (levelSettings.winTheGame) {
                    case 1:
                        historyContent = `
                            <div class="level-message">
                                <h2>ALIEN FRONTLINE BREACHED</h2>
                                <p>At this stage, you've already broken through the enemy's front lines.</p>
                                <p>The war is about to intensify against the <span class="highlight">alien forces</span> trying to take over planet Earth.</p>
                                <p class="highlight">Don't let your guard down — stay strong!</p>
                                <p>A greater battle is coming soon...</p>
                            </div>
                        `;
                        levelsWinMessageTime = 20000;
                        break;
                    case 2:
                        historyContent = `
                            <div class="level-message">
                                <h2>ENEMY REINFORCEMENTS DETECTED</h2>
                                <p>You've noticed the war intensity has increased.</p>
                                <p>The enemies have grown <span class="highlight">stronger</span>, but you've defended our planet well.</p>
                                <p>Our surveillance has detected <span class="highlight">another enemy army</span> approaching.</p>
                                <p class="highlight">Stay focused and stand your ground!</p>
                            </div>
                        `;
                        levelsWinMessageTime = 20000;
                        break;
                    case 3:
                        historyContent = `
                            <div class="level-message">
                                <h2>VICTORY ACHIEVED</h2>
                                <p>It was a <span class="highlight">fierce war</span>, and you emerged victorious!</p>
                                <p>The people of Earth are proud of your efforts.</p>
                                <p>Enemies deployed <span class="highlight">powerful launchers</span>, but you destroyed their entire fleet!</p>
                                <p class="highlight">No enemy movements detected...</p>
                                <p>This might have been their final wave.</p>
                            </div>
                        `;
                        levelsWinMessageTime = 20000;
                        break;
                    case 4:
                        historyContent = `
                            <div class="level-message">
                                <h2>FINAL BATTLE WON</h2>
                                <p class="highlight">ALERT: Hidden enemy wave detected!</p>
                                <p>We hadn't anticipated this <span class="highlight">trump card</span> from distant galaxies.</p>
                                <p>This could have been a <span class="highlight">fatal strike</span> to our planet.</p>
                                <p>Thank you for <span class="highlight">saving Earth</span> from destruction!</p>
                                <p>Surveillance systems upgraded. Planet secured.</p>
                                <p class="highlight" style="font-size: 24px;">MISSION ACCOMPLISHED</p>
                            </div>
                        `;
                        levelsWinMessageTime = 20000;
                        stopEnemyShooting();
                        break;
                }

                content.innerHTML = historyContent;
                box.appendChild(content);

                // Append the box to the document body
                document.body.appendChild(box);

                // Remove the div after the specified time
                setTimeout(() => {
                    if (levelSettings.winTheGame === 4) {
                        location.reload();
                    } else {
                        box.remove();
                        gameSettings.makeEnemiesShootFaster += 5;
                        createEnemies(32);
                    }
                }, levelsWinMessageTime);
            }
        }
    })
    return hit;
}