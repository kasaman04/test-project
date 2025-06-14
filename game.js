const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let gameRunning = true;
let score = 0;

const player = {
    x: 50,
    y: 300,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 15,
    onGround: false,
    color: '#FF6B35'
};

const gravity = 0.8;
const friction = 0.8;

const platforms = [
    { x: 0, y: 370, width: 800, height: 30, color: '#8B4513' },
    { x: 200, y: 300, width: 100, height: 20, color: '#32CD32' },
    { x: 350, y: 250, width: 100, height: 20, color: '#32CD32' },
    { x: 500, y: 200, width: 100, height: 20, color: '#32CD32' },
    { x: 650, y: 150, width: 100, height: 20, color: '#32CD32' }
];

const enemies = [
    { x: 250, y: 340, width: 25, height: 25, velocityX: -2, color: '#FF0000', direction: 1 },
    { x: 400, y: 220, width: 25, height: 25, velocityX: -1.5, color: '#FF0000', direction: 1 },
    { x: 550, y: 170, width: 25, height: 25, velocityX: -2, color: '#FF0000', direction: 1 }
];

const coins = [
    { x: 220, y: 270, width: 15, height: 15, collected: false },
    { x: 370, y: 220, width: 15, height: 15, collected: false },
    { x: 520, y: 170, width: 15, height: 15, collected: false },
    { x: 670, y: 120, width: 15, height: 15, collected: false },
    { x: 300, y: 320, width: 15, height: 15, collected: false }
];

const keys = {
    left: false,
    right: false,
    up: false,
    space: false
};

document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'ArrowUp':
        case 'Space':
            keys.space = true;
            e.preventDefault();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'ArrowUp':
        case 'Space':
            keys.space = false;
            break;
    }
});

function updatePlayer() {
    if (keys.left) {
        player.velocityX = -player.speed;
    } else if (keys.right) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= friction;
    }

    if (keys.space && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
    }

    player.velocityY += gravity;

    player.x += player.velocityX;
    player.y += player.velocityY;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    if (player.y > canvas.height) {
        resetPlayer();
    }
}

function checkPlatformCollisions() {
    player.onGround = false;
    
    for (let platform of platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
            
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
        }
    }
}

function updateEnemies() {
    for (let enemy of enemies) {
        enemy.x += enemy.velocityX * enemy.direction;
        
        let onPlatform = false;
        for (let platform of platforms) {
            if (enemy.x + enemy.width > platform.x && 
                enemy.x < platform.x + platform.width &&
                enemy.y + enemy.height >= platform.y &&
                enemy.y + enemy.height <= platform.y + platform.height + 10) {
                onPlatform = true;
                break;
            }
        }
        
        if (!onPlatform || enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.direction *= -1;
        }
        
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            if (player.velocityY > 0 && player.y < enemy.y) {
                enemy.x = -1000;
                score += 100;
                player.velocityY = -8;
            } else {
                resetPlayer();
            }
        }
    }
}

function updateCoins() {
    for (let coin of coins) {
        if (!coin.collected &&
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            
            coin.collected = true;
            score += 50;
        }
    }
}

function resetPlayer() {
    player.x = 50;
    player.y = 300;
    player.velocityX = 0;
    player.velocityY = 0;
    score = Math.max(0, score - 100);
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 8, player.y + 5, 4, 4);
    ctx.fillRect(player.x + 18, player.y + 5, 4, 4);
    
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(player.x + 10, player.y + 15, 10, 3);
}

function drawPlatforms() {
    for (let platform of platforms) {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        ctx.fillStyle = '#654321';
        ctx.fillRect(platform.x, platform.y, platform.width, 3);
    }
}

function drawEnemies() {
    for (let enemy of enemies) {
        if (enemy.x > -100) {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 5, enemy.y + 5, 3, 3);
            ctx.fillRect(enemy.x + 17, enemy.y + 5, 3, 3);
        }
    }
}

function drawCoins() {
    for (let coin of coins) {
        if (!coin.collected) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#87CEEB');
    gradient.addColorStop(0.7, '#228B22');
    gradient.addColorStop(1, '#32CD32');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(100 + i * 150, 50 + Math.sin(Date.now() * 0.001 + i) * 10, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

function gameLoop() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawPlayer();
    
    updatePlayer();
    checkPlatformCollisions();
    updateEnemies();
    updateCoins();
    
    scoreElement.textContent = score;
    
    requestAnimationFrame(gameLoop);
}

gameLoop();