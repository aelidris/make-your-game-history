import { boxBCR, gameLost, gameState, gameOver, gameRunning, startGame } from "./index.js";
import { isBulletHitPlayer, addScore } from "./ship.js";

let enemyBulletFrequency = 1000;
export let scoreMultiplier = 1;

const enemyDiv = document.querySelector(".enemies");
const activeBulletAnimations = new Map();

let enemyDirection = 1, enemyX = 30, enemyY = 50;
export let windowFocused = true;

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
    if (gameRunning && !gameState.paused && windowFocused) {
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

function createEnemyBullet(enemyFireX, enemyFireY) {
    const bullet = document.createElement("div");
    bullet.setAttribute('class', 'enemyFire');
    bullet.style.left = `${enemyFireX}px`;
    bullet.style.top = `${enemyFireY}px`;
    document.body.appendChild(bullet);
    return bullet;
}

function enemyShoot() {
    const enemies = document.querySelectorAll('.enemy');
    if (enemies.length > 0) {
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        const enemyBCR = randomEnemy.getBoundingClientRect();
        const bullet = createEnemyBullet(enemyBCR.left + enemyBCR.width / 2 - 2, enemyBCR.top + enemyBCR.height);
        moveEnemyBullet(bullet);
    }
}

export const gameSettings = {
    makeEnemiesShootFaster: 5
};

function moveEnemyBullet(bullet) {
    let lastTime = performance.now();
    let accumulatedPauseTime = 0;
    let pauseStartTime = 0;

    function move(currentTime) {
        if (gameState.paused) {
            if (pauseStartTime === 0) {
                pauseStartTime = currentTime;
            }
            activeBulletAnimations.set(bullet, requestAnimationFrame(move));
            return;
        }

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

        if (newTop < boxBCR.bottom-20 && !isBulletHitPlayer(bullet.getBoundingClientRect())) {
            activeBulletAnimations.set(bullet, requestAnimationFrame(move));
        } else {
            bullet.remove();
            activeBulletAnimations.delete(bullet);
        }
    }

    activeBulletAnimations.set(bullet, requestAnimationFrame(move));
}
let enemyShootingLoopId;
let lastEnemyShotTime = 0;


export function startEnemyShooting() {
    if (levelSettings.winTheGame >= 4 || gameState.paused) return;

    const time = Date.now();
    if (gameRunning && !gameState.paused && !gameOver && time - lastEnemyShotTime > enemyBulletFrequency) {
        enemyShoot();
        lastEnemyShotTime = time;
    }
}

export function stopEnemyShooting() {
    if (enemyShootingLoopId) {
        cancelAnimationFrame(enemyShootingLoopId);
        enemyShootingLoopId = null;
        console.log("Enemy shooting loop stopped.");
    }
}

function pauseGameForStory() {
    gameState.paused = true;
    if (!window.storyPauseStartTime) {
        window.storyPauseStartTime = Date.now();
    }
}

function resumeGameAfterStory() {
    gameState.paused = false;
    window.storyPauseStartTime = null;
    startGame();
}

export const levelSettings = {
    winTheGame: 0
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
                document.querySelectorAll('.enemyFire').forEach(bullet => {
                    bullet.remove();
                });
                pauseGameForStory();

                levelSettings.winTheGame++;
                const box = document.createElement("div");
                box.classList.add("storyBox");
                const content = document.createElement("div");
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
                        levelsWinMessageTime = 40000;
                        stopEnemyShooting();
                        break;
                }

                content.innerHTML = historyContent;
                box.appendChild(content);
                document.body.appendChild(box);
                setTimeout(() => {
                    if (levelSettings.winTheGame === 4) {
                        location.reload();
                    } else {
                        box.remove();
                        gameSettings.makeEnemiesShootFaster += 1;
                        createEnemies(32);
                        resumeGameAfterStory();
                    }
                }, levelsWinMessageTime);
            }
        }
    })
    return hit;
}
