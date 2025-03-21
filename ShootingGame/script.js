// Lấy canvas và context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');

// Các biến toàn cục
let score = 0;
let gameRunning = true;

// Tải hình ảnh
const spaceshipImage = new Image();
spaceshipImage.src = 'assets/spaceship.png';

const enemyImage = new Image();
enemyImage.src = 'assets/enemy.png';

const bulletImage = new Image();
bulletImage.src = 'assets/bullet.png';

const explosionImage = new Image();
explosionImage.src = 'assets/explosion.png';

// Tải âm thanh
const shootSound = new Audio('assets/shoot.wav');
const explosionSound = new Audio('assets/explosion.wav');
const gameOverSound = new Audio('assets/gameover.wav');

// Nhân vật chính
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    speed: 5
};

// Đạn
const bullets = [];
const bulletSpeed = 7;
const bulletWidth = 5;
const bulletHeight = 10;

// Kẻ thù
const enemies = [];
const enemySpeed = 3;
const enemyWidth = 30;
const enemyHeight = 30;
let enemySpawnRate = 50;
let enemySpawnCounter = 0;

// Hiệu ứng nổ
const explosions = [];
const explosionDuration = 20; // Thời gian hiển thị hiệu ứng nổ (frames)

// Điều khiển phím
let keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
        shootBullet();
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Bắn đạn
function shootBullet() {
    bullets.push({
        x: player.x + player.width / 2 - bulletWidth / 2,
        y: player.y,
        width: bulletWidth,
        height: bulletHeight
    });
    shootSound.play(); // Phát âm thanh bắn
}

// Tạo kẻ thù
function spawnEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - enemyWidth),
        y: -enemyHeight,
        width: enemyWidth,
        height: enemyHeight
    });
}

// Tạo hiệu ứng nổ
function createExplosion(x, y) {
    explosions.push({
        x: x,
        y: y,
        width: 50,
        height: 50,
        frame: 0
    });
}

// Kiểm tra va chạm
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Cập nhật trò chơi
function updateGame() {
    if (!gameRunning) return;

    // Xóa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cập nhật nhân vật
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }

    // Vẽ nhân vật
    if (spaceshipImage.complete) {
        ctx.drawImage(spaceshipImage, player.x, player.y, player.width, player.height);
    }

    // Cập nhật và vẽ đạn
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y -= bulletSpeed;
        if (bulletImage.complete) {
            ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
        }

        // Xóa đạn nếu ra khỏi màn hình
        if (bullet.y < 0) {
            bullets.splice(i, 1);
        }
    }

    // Tạo kẻ thù
    enemySpawnCounter++;
    if (enemySpawnCounter >= enemySpawnRate) {
        spawnEnemy();
        enemySpawnCounter = 0;
    }

    // Cập nhật và vẽ kẻ thù
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemySpeed;
        if (enemyImage.complete) {
            ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
        }

        // Kiểm tra va chạm giữa đạn và kẻ thù
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            if (checkCollision(bullet, enemy)) {
                createExplosion(enemy.x, enemy.y); // Tạo hiệu ứng nổ
                explosionSound.play(); // Phát âm thanh nổ
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                scoreDisplay.textContent = score;
                break;
            }
        }

        // Kiểm tra va chạm giữa kẻ thù và nhân vật
        if (checkCollision(enemy, player)) {
            gameRunning = false;
            gameOverSound.play(); // Phát âm thanh game over
            finalScoreDisplay.textContent = score;
            gameOverScreen.style.display = 'block';
        }

        // Xóa kẻ thù nếu ra khỏi màn hình
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
        }
    }

    // Cập nhật và vẽ hiệu ứng nổ
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.frame++;
        if (explosionImage.complete) {
            ctx.drawImage(explosionImage, explosion.x, explosion.y, explosion.width, explosion.height);
        }
        // Xóa hiệu ứng nổ sau khi hết thời gian
        if (explosion.frame >= explosionDuration) {
            explosions.splice(i, 1);
        }
    }

    // Tiếp tục vòng lặp trò chơi
    requestAnimationFrame(updateGame);
}

// Chơi lại
function restartGame() {
    score = 0;
    scoreDisplay.textContent = score;
    gameRunning = true;
    enemies.length = 0;
    bullets.length = 0;
    explosions.length = 0;
    player.x = canvas.width / 2;
    gameOverScreen.style.display = 'none';
    updateGame();
}

// Đảm bảo hình ảnh được tải trước khi bắt đầu trò chơi
let imagesLoaded = 0;
const totalImages = 4; // Thêm explosion.png

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        updateGame();
    }
}

spaceshipImage.onload = imageLoaded;
enemyImage.onload = imageLoaded;
bulletImage.onload = imageLoaded;
explosionImage.onload = imageLoaded;