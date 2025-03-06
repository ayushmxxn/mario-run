// MARIO RUN: A polished Mario-style endless runner in p5.js

// Mobile device detection
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Game States
const START_SCREEN = 0;
const PLAYING = 1;
const GAME_OVER = 2;
let gameState = START_SCREEN;

// Player Properties
let playerX = 100;
let playerY = 300;
let playerWidth = 20;
let playerHeight = 40;
let playerSpeedY = 0;
let gravity = 0.6;
let isJumping = false;

// Obstacles (Goombas)
let obstacles = [];
let obstacleFrequency = 80;
let obstacleTimer = 0;

// Coins
let coins = [];
let coinFrequency = 100;
let coinTimer = 0;

// Timer
let startTime;

// Style and Coins Collected
let styleMeter = 0;
let coinsCollected = 0;
let speedBoost = 1;

// Score tracking
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

// Mario-Style Colors
let skyBlue = [135, 206, 235];
let grassGreen = [34, 139, 34];
let marioRed = [255, 0, 0];
let marioBlue = [0, 0, 255];
let goombaBrown = [139, 69, 19];
let coinYellow = [255, 215, 0];

// Background Elements
let hills = [];
let clouds = [];

// Add new game constants
const POWERUP_TYPES = {
  STAR: 'star',
  MUSHROOM: 'mushroom',
  FLOWER: 'flower',
  COIN_MAGNET: 'coin_magnet',
  SHIELD: 'shield'
};

// Add new game variables
let powerups = [];
let powerupActive = null;
let powerupTimer = 0;
let level = 1;
let particles = [];
let gameSpeed = 1;
let backgroundMusic;
let combo = 0;
let comboMultiplier = 1;
let comboTimer = 0;
let specialMoves = [];
let isInvincible = false;
let invincibilityTimer = 0;
let coinMagnetActive = false;
let shieldActive = false;
let backgroundParallax = 0;

// Add new visual constants
const SHADOW_COLOR = [0, 0, 0, 50];
const HIGHLIGHT_COLOR = [255, 255, 255, 100];
const GRADIENT_COLORS = {
  SKY: [
    [135, 206, 235],  // Light blue
    [100, 181, 246],  // Medium blue
    [66, 165, 245]    // Deep blue
  ],
  GRASS: [
    [34, 139, 34],    // Light green
    [27, 94, 32],     // Medium green
    [21, 71, 52]      // Dark green
  ]
};

// Add frame rate control at the top
let targetFrameRate = 60;

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent('game-container');
  frameRate(targetFrameRate); // Set consistent frame rate
  
  // Initialize hills
  for (let i = 0; i < 10; i++) {
    hills.push({
      x: i * 150,
      h: random(50, 150),
      w: random(100, 200)
    });
  }
  // Initialize clouds
  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: random(0, width),
      y: random(50, 150),
      size: random(30, 60)
    });
  }
  
  // Initialize sound
  soundFormats('mp3', 'ogg');
  backgroundMusic = loadSound('assets/theme.mp3');
}

function draw() {
  if (isMobile) {
    // Clear background
    background(0);
    
    // Display mobile message
    push();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    textStyle(BOLD);
    
    // Main message
    text('This game is not available for mobile', width/2, height/2 - 30);
    
    // Sub message
    textSize(18);
    textStyle(NORMAL);
    text('We suggest using a desktop version to play it', width/2, height/2 + 10);
    
    // Additional styling
    noFill();
    stroke(255, 255, 255, 100);
    strokeWeight(2);
    rect(width/2 - 200, height/2 - 60, 400, 100, 10);
    pop();
    
    return; // Stop further drawing
  }
  
  background(skyBlue);
  
  if (gameState === START_SCREEN) {
    drawStartScreen();
  } else if (gameState === PLAYING) {
    drawPlaying();
  } else if (gameState === GAME_OVER) {
    drawGameOver();
  }
}

// Start Screen
function drawStartScreen() {
  drawBackground();
  
  // Title container
  let titleY = height * 0.25;
  
  // Animated title with shadow
  push();
  translate(width/2, titleY);
  rotate(sin(frameCount * 0.02) * 0.05);
  
  // Title shadow
  fill(0, 0, 0, 50);
  textSize(70);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text('MARIO RUN', 4, 4);
  
  // Main title
  fill(marioRed);
  textSize(70);
  text('MARIO RUN', 0, 0);
  
  // Add shine effect
  fill(255, 255, 255, 100 + sin(frameCount * 0.1) * 50);
  text('MARIO RUN', 2, 2);
  pop();

  // Menu container
  let menuStartY = height * 0.45;
  let menuSpacing = 45;
  
  // Animated prompt
  fill(marioBlue);
  textSize(36);
  textAlign(CENTER, CENTER);
  text('Press SPACE to Start', width/2, menuStartY + sin(frameCount * 0.1) * 5);
  
  // Controls section with styled container
  fill(0, 0, 0, 100);
  rect(width/2 - 150, menuStartY + menuSpacing, 300, 80, 10);
  
  fill(255);
  textSize(24);
  text('🎮 Controls', width/2, menuStartY + menuSpacing + 25);
  textSize(20);
  text('SPACE - Jump 🦘', width/2, menuStartY + menuSpacing + 55);
  
  // High score with styled container
  fill(0, 0, 0, 100);
  rect(width/2 - 150, menuStartY + menuSpacing * 3, 300, 50, 10);
  
  fill(coinYellow);
  textSize(24);
  text(`High Score: ${highScore}`, width/2, menuStartY + menuSpacing * 3 + 25);
}

// Main Game Loop
function drawPlaying() {
  // Clean up off-screen objects
  cleanupOffscreenObjects();
  
  updateBackground();
  drawBackground();
  updatePlayer();
  drawPlayer();
  updateObstacles();
  drawObstacles();
  updateCoins();
  drawCoins();
  drawHUD();
  drawTimer();
  drawCombo();
  drawSpecialMoves();
  
  updateParticles();
  drawParticles();
  updatePowerups();
  drawPowerups();
  
  // Update score based on survival time and distance
  score = Math.floor((millis() - startTime) / 100) + (coinsCollected * 10);
  
  if (playerY > height) {
    gameState = GAME_OVER;
    playSound(200, 0.5, 0.3); // Fall sound
  }
  
  // Progressive difficulty with limits
  if (frameCount % 1000 === 0) {
    level = min(level + 1, 10); // Cap level at 10
    gameSpeed = min(gameSpeed + 0.1, 2); // Cap speed boost at 2x
    obstacleFrequency = max(30, obstacleFrequency - 5);
    coinFrequency = max(60, coinFrequency - 3);
  }
  
  // Update combo system with cleanup
  if (combo > 0) {
    comboTimer--;
    if (comboTimer <= 0) {
      combo = 0;
      comboMultiplier = 1;
    }
  }
  
  // Limit special moves
  while (specialMoves.length > 5) {
    specialMoves.shift(); // Remove oldest moves if too many
  }
  
  // Update special moves with cleanup
  for (let i = specialMoves.length - 1; i >= 0; i--) {
    let move = specialMoves[i];
    move.x += move.speed;
    if (move.x > width) {
      specialMoves.splice(i, 1);
    }
  }
}

// Game Over Screen
function drawGameOver() {
  drawBackground();
  
  // Semi-transparent overlay
  fill(0, 0, 0, 100);
  rect(0, 0, width, height);
  
  let centerY = height * 0.4;
  let spacing = 50;
  
  // Game Over text with shadow
  fill(0, 0, 0, 100);
  textSize(60);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text('GAME OVER', width/2 + 4, centerY + 4);
  
  fill(marioRed);
  text('GAME OVER', width/2, centerY);
  
  // Score container
  fill(0, 0, 0, 150);
  rect(width/2 - 200, centerY + spacing - 20, 400, 100, 10);
  
  // Final score
  fill(255);
  textSize(24);
  text('Final Score', width/2, centerY + spacing + 10);
  
  fill(255, 215, 0);
  textSize(36);
  text(score, width/2, centerY + spacing + 50);
  
  // Restart prompt
  fill(255);
  textSize(20);
  text('Press R to Restart', width/2, centerY + spacing * 3);
  
}

// Background Logic
function updateBackground() {
  for (let h of hills) {
    h.x -= 1;
    if (h.x < -h.w) h.x = width + random(0, 50);
  }
  for (let c of clouds) {
    c.x -= 0.5;
    if (c.x < -c.size) c.x = width + random(0, 50);
  }
}

function drawBackground() {
  // Draw sky gradient
  for (let i = 0; i < GRADIENT_COLORS.SKY.length; i++) {
    let y = map(i, 0, GRADIENT_COLORS.SKY.length - 1, 0, 350);
    fill(GRADIENT_COLORS.SKY[i]);
    rect(0, y, width, height / GRADIENT_COLORS.SKY.length);
  }

  // Draw clouds with improved design
  for (let c of clouds) {
    // Cloud shadow
    fill(SHADOW_COLOR);
    ellipse(c.x + 2, c.y + 2, c.size, c.size * 0.6);
    
    // Main cloud body
    fill(255);
    ellipse(c.x, c.y, c.size, c.size * 0.6);
    ellipse(c.x - c.size / 2, c.y, c.size * 0.7, c.size * 0.4);
    ellipse(c.x + c.size / 2, c.y, c.size * 0.7, c.size * 0.4);
    
    // Cloud highlights
    fill(HIGHLIGHT_COLOR);
    ellipse(c.x - c.size / 4, c.y - c.size / 4, c.size * 0.3, c.size * 0.2);
  }

  // Draw hills with gradient and improved design
  for (let h of hills) {
    // Hill shadow
    fill(SHADOW_COLOR);
    ellipse(h.x + h.w / 2 + 2, 352, h.w, h.h);
    
    // Main hill body with gradient
    for (let i = 0; i < GRADIENT_COLORS.GRASS.length; i++) {
      let y = map(i, 0, GRADIENT_COLORS.GRASS.length - 1, 350, 350 + h.h);
      fill(GRADIENT_COLORS.GRASS[i]);
      ellipse(h.x + h.w / 2, y, h.w, h.h);
    }
  }

  // Draw ground with improved design
  fill(GRADIENT_COLORS.GRASS[2]);
  rect(0, 350, width, 50);
  
  // Ground detail
  for (let i = 0; i < width; i += 20) {
    fill(GRADIENT_COLORS.GRASS[1]);
    rect(i, 350, 10, 5);
  }
}

// Player (Mario) Logic
function updatePlayer() {
  playerSpeedY += gravity;
  playerY += playerSpeedY;
  if (playerY > 300) {
    playerY = 300;
    playerSpeedY = 0;
    isJumping = false;
  }
  playerHeight = isJumping ? 20 : 40;
}

function drawPlayer() {
  // Character shadow
  fill(SHADOW_COLOR);
  ellipse(playerX + playerWidth / 2, playerY + playerHeight + 5, playerWidth * 0.8, 5);
  
  // Hat with improved design
  fill(marioRed);
  rect(playerX, playerY - 10, playerWidth, 10);
  // Hat brim
  fill(marioRed);
  rect(playerX - 2, playerY - 8, playerWidth + 4, 4);
  
  // Face with improved design
  fill(255, 224, 189);
  ellipse(playerX + playerWidth / 2, playerY + 5, 15, 15);
  
  // Eyes with more detail
  fill(0);
  ellipse(playerX + playerWidth / 2 - 3, playerY + 3, 3, 3);
  ellipse(playerX + playerWidth / 2 + 3, playerY + 3, 3, 3);
  
  // Eye highlights
  fill(255);
  ellipse(playerX + playerWidth / 2 - 4, playerY + 2, 1.5, 1.5);
  ellipse(playerX + playerWidth / 2 + 2, playerY + 2, 1.5, 1.5);
  
  // Mustache
  fill(0);
  rect(playerX + playerWidth / 2 - 4, playerY + 6, 8, 2);
  
  // Body with improved design
  fill(marioBlue);
  rect(playerX, playerY + 10, playerWidth, playerHeight - 10);
  
  // Overall straps
  fill(marioRed);
  rect(playerX - 2, playerY + 15, playerWidth + 4, 4);
  rect(playerX - 2, playerY + 25, playerWidth + 4, 4);
  
  // Legs with improved animation
  let legPhase = sin(frameCount * 0.2);
  if (!isJumping) {
    fill(marioBlue);
    // Left leg
    rect(playerX + 2 + legPhase * 2, playerY + playerHeight, 5, 10);
    // Right leg
    rect(playerX + playerWidth - 7 - legPhase * 2, playerY + playerHeight, 5, 10);
    
    // Shoes
    fill(0);
    rect(playerX + 1 + legPhase * 2, playerY + playerHeight + 8, 7, 2);
    rect(playerX + playerWidth - 8 - legPhase * 2, playerY + playerHeight + 8, 7, 2);
  } else {
    // Jumping pose
    fill(marioBlue);
    rect(playerX + 2, playerY + playerHeight, 5, 10);
    rect(playerX + playerWidth - 7, playerY + playerHeight, 5, 10);
    
    // Shoes
    fill(0);
    rect(playerX + 1, playerY + playerHeight + 8, 7, 2);
    rect(playerX + playerWidth - 8, playerY + playerHeight + 8, 7, 2);
  }
}

// Obstacles (Goombas)
function updateObstacles() {
  obstacleTimer++;
  if (obstacleTimer > obstacleFrequency && obstacles.length < 10) { // Limit number of obstacles
    let obstacleType = random();
    let obstacle;
    
    if (obstacleType < 0.6) {
      // Regular goomba
      obstacle = {
        x: width,
        y: 340,
        width: 30,
        height: 30,
        type: 'goomba'
      };
    } else if (obstacleType < 0.8) {
      // Flying obstacle
      obstacle = {
        x: width,
        y: random(200, 300),
        width: 30,
        height: 30,
        type: 'flying'
      };
    } else {
      // Moving obstacle
      obstacle = {
        x: width,
        y: 340,
        width: 30,
        height: 30,
        type: 'moving',
        moveY: 0,
        moveSpeed: random(-2, 2)
      };
    }
    
    obstacles.push(obstacle);
    obstacleTimer = 0;
  }
  
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    if (!obs) {
      obstacles.splice(i, 1);
      continue;
    }

    // Calculate movement with constant speed
    let moveSpeed = 4;
    obs.x -= moveSpeed;
    
    // Handle different obstacle types
    if (obs.type === 'moving') {
      obs.y += obs.moveSpeed;
      if (obs.y < 200 || obs.y > 340) obs.moveSpeed *= -1;
    }
    
    if (obs.x < -obs.width) {
      obstacles.splice(i, 1);
      styleMeter += 10 * comboMultiplier;
    } else {
      // Improved collision detection with speed compensation
      let playerRight = playerX + playerWidth;
      let playerLeft = playerX;
      let playerTop = playerY;
      let playerBottom = playerY + playerHeight;
      
      let obsRight = obs.x + obs.width;
      let obsLeft = obs.x;
      let obsTop = obs.y - obs.height;
      let obsBottom = obs.y;
      
      // Add a small buffer zone for collision detection
      let buffer = 5;
      
      // Check for collision with buffer zone and speed compensation
      let collision = !isInvincible && 
        playerRight + buffer > obsLeft && 
        playerLeft - buffer < obsRight && 
        playerBottom + buffer > obsTop && 
        playerTop - buffer < obsBottom;
      
      if (collision) {
        if (shieldActive) {
          shieldActive = false;
          obstacles.splice(i, 1);
          for (let j = 0; j < 10; j++) {
            createParticle(obs.x, obs.y, [255, 255, 255]);
          }
        } else {
          gameState = GAME_OVER;
          playSound(200, 0.5, 0.3);
        }
      } else if (dist(playerX, playerY, obs.x, obs.y) < 50) {
        styleMeter += 5 * comboMultiplier;
      }
    }
  }
}

function drawObstacles() {
  for (let obs of obstacles) {
    // Goomba shadow
    fill(SHADOW_COLOR);
    ellipse(obs.x + obs.width / 2 + 2, obs.y - obs.height / 2 + 2, obs.width, obs.height);
    
    // Goomba body with gradient
    for (let i = 0; i < 3; i++) {
      let y = map(i, 0, 2, obs.y - obs.height / 2, obs.y - obs.height / 2 + obs.height);
      fill(lerpColor(color(goombaBrown), color(139, 69, 19), i / 2));
      ellipse(obs.x + obs.width / 2, y, obs.width, obs.height / 3);
    }
    
    // Eyes with improved design
    fill(255);
    ellipse(obs.x + 5, obs.y - obs.height / 2, 10, 10);
    ellipse(obs.x + obs.width - 5, obs.y - obs.height / 2, 10, 10);
    
    // Eye highlights
    fill(200);
    ellipse(obs.x + 3, obs.y - obs.height / 2 - 2, 4, 4);
    ellipse(obs.x + obs.width - 7, obs.y - obs.height / 2 - 2, 4, 4);
    
    // Pupils
    fill(0);
    ellipse(obs.x + 5, obs.y - obs.height / 2, 5, 5);
    ellipse(obs.x + obs.width - 5, obs.y - obs.height / 2, 5, 5);
    
    // Frown with improved design
    noFill();
    stroke(0, 0, 0, 150);
    strokeWeight(2);
    arc(obs.x + obs.width / 2, obs.y - obs.height / 2 + 5, 10, 5, PI, 0);
    noStroke();
    
    // Feet with improved design
    fill(goombaBrown);
    rect(obs.x + 5, obs.y - 5, 5, 5);
    rect(obs.x + obs.width - 10, obs.y - 5, 5, 5);
    
    // Foot shadows
    fill(SHADOW_COLOR);
    rect(obs.x + 5, obs.y - 3, 5, 2);
    rect(obs.x + obs.width - 10, obs.y - 3, 5, 2);
  }
}

// Coins
function updateCoins() {
  coinTimer++;
  if (coinTimer > coinFrequency) {
    coins.push({
      x: width,
      y: random(200, 300),
      width: 20,
      height: 20,
      value: 1
    });
    coinTimer = 0;
  }
  
  // Create a new array to store valid coins
  let validCoins = [];
  
  for (let i = 0; i < coins.length; i++) {
    let coin = coins[i];
    
    // Skip invalid coins
    if (!coin || typeof coin !== 'object') {
      continue;
    }
    
    // Update coin position with constant speed
    coin.x -= 4;
    
    // Skip coins that are off screen
    if (coin.x < -coin.width) {
      continue;
    }
    
    // Handle coin magnet effect
    if (coinMagnetActive && dist(playerX, playerY, coin.x, coin.y) < 200) {
      coin.x -= 8;
    }
    
    // Check for collision with player
    let playerRight = playerX + playerWidth;
    let playerLeft = playerX;
    let playerTop = playerY;
    let playerBottom = playerY + playerHeight;
    
    let coinRight = coin.x + coin.width;
    let coinLeft = coin.x;
    let coinTop = coin.y;
    let coinBottom = coin.y + coin.height;
    
    // Add a small buffer zone for collision detection
    let buffer = 5;
    
    let collision = 
      playerRight + buffer > coinLeft && 
      playerLeft - buffer < coinRight && 
      playerBottom + buffer > coinTop && 
      playerTop - buffer < coinBottom;
    
    if (collision) {
      // Handle coin collection
      coinsCollected += 1; // Always add 1 coin, regardless of value
      styleMeter += 20 * comboMultiplier;
      combo++;
      comboTimer = 60;
      comboMultiplier = min(5, floor(combo / 10) + 1);
      playSound(600, 0.3, 0.2);
      
      // Create coin collection particles
      for (let j = 0; j < 10; j++) {
        createParticle(coin.x, coin.y, coinYellow);
      }
      
      // Skip adding this coin to valid coins (it's collected)
      continue;
    }
    
    // Add valid coin to the new array
    validCoins.push(coin);
  }
  
  // Update the coins array with only valid coins
  coins = validCoins;
}

function drawCoins() {
  for (let c of coins) {
    let coinWidth = 20 + 10 * sin(frameCount * 0.1);
    
    // Coin shadow
    fill(SHADOW_COLOR);
    ellipse(c.x + c.width / 2 + 2, c.y + c.height / 2 + 2, coinWidth, c.height);
    
    // Main coin body
    fill(coinYellow);
    ellipse(c.x + c.width / 2, c.y + c.height / 2, coinWidth, c.height);
    
    // Coin details
    fill(255, 215, 0, 150);
    ellipse(c.x + c.width / 2, c.y + c.height / 2, coinWidth * 0.8, c.height * 0.8);
    
    // Shine effect
    fill(255, 255, 255, 200);
    ellipse(c.x + c.width / 2 - 5, c.y + c.height / 2 - 5, 5, 5);
    
    // Dollar sign
    fill(0, 0, 0, 100);
    textSize(12);
    textAlign(CENTER, CENTER);
    text('$', c.x + c.width / 2, c.y + c.height / 2 + 2);
  }
}

// HUD
function drawHUD() {
  // Score panel
  let panelWidth = 250;
  let panelHeight = 120;
  let panelX = 20;
  let panelY = 20;
  let textPadding = 30;
  
  // Background panel with rounded corners
  fill(0, 0, 0, 150);
  rect(panelX, panelY, panelWidth, panelHeight, 10);
  
  // Panel border
  noFill();
  stroke(255, 255, 255, 50);
  strokeWeight(2);
  rect(panelX + 2, panelY + 2, panelWidth - 4, panelHeight - 4, 8);
  noStroke();
  
  // Score information
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(24);
  
  // Score with icon
  text('🏆 Score:', panelX + textPadding, panelY + 30);
  fill(255, 215, 0);
  textAlign(RIGHT);
  text(score, panelX + panelWidth - textPadding, panelY + 30);
  
  // High score
  fill(255);
  textAlign(LEFT);
  text('👑 Best:', panelX + textPadding, panelY + 60);
  fill(255, 215, 0);
  textAlign(RIGHT);
  text(highScore, panelX + panelWidth - textPadding, panelY + 60);
  
  // Coins
  fill(255);
  textAlign(LEFT);
  text('🪙 Coins:', panelX + textPadding, panelY + 90);
  fill(255, 215, 0);
  textAlign(RIGHT);
  text(coinsCollected, panelX + panelWidth - textPadding, panelY + 90);
  
  // Power-up indicator
  if (powerupActive) {
    // Power-up container
    fill(0, 0, 0, 150);
    rect(width/2 - 100, 20, 200, 70, 10);
    
    // Power-up text
    fill(255, 255, 0);
    textAlign(CENTER, CENTER);
    textSize(20);
    text(`${powerupActive.toUpperCase()} ACTIVE!`, width/2, 40);
    
    // Power-up timer bar container
    fill(0, 0, 0, 100);
    rect(width/2 - 80, 55, 160, 15, 5);
    
    // Power-up timer bar
    let timeLeft = (powerupTimer - frameCount) / 300;
    fill(255, 255, 0, 200);
    rect(width/2 - 78, 57, 156 * timeLeft, 11, 4);
  }
}

// Timer
function drawTimer() {
  let elapsedTime = floor((millis() - startTime) / 1000);
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(`Time: ${elapsedTime}s`, width / 2, 30);
}

// Input Handling
function keyPressed() {
  if (gameState === START_SCREEN && key === ' ') {
    startTime = millis();
    gameState = PLAYING;
  } else if (gameState === PLAYING) {
    if (key === ' ' && !isJumping) {
      playerSpeedY = -12;
      isJumping = true;
      playSound(400, 0.3, 0.2);
    } else if (key === 'x' && powerupActive === POWERUP_TYPES.FLOWER) {
      // Shoot fireball
      specialMoves.push({
        x: playerX + playerWidth,
        y: playerY + playerHeight/2,
        speed: 8,
        type: 'fireball'
      });
      playSound(800, 0.2, 0.1);
    }
  } else if (gameState === GAME_OVER && key === 'r') {
    resetGame();
  }
}

function keyReleased() {
  // No need to handle key release for this game
}

// Utilities
function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function playSound(freq, amp, duration) {
  try {
    let osc = new p5.Oscillator('sine');
    osc.start();
    osc.freq(freq);
    osc.amp(amp, 0.1);
    osc.amp(0, duration);
    setTimeout(() => {
      try {
        osc.stop();
      } catch (e) {
        console.log('Error stopping sound:', e);
      }
    }, duration * 1000);
  } catch (e) {
    console.log('Error playing sound:', e);
  }
}

function resetGame() {
  // Update high score if current score is higher
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
  
  startTime = millis();
  playerY = 300;
  playerSpeedY = 0;
  isJumping = false;
  obstacles = [];
  coins = [];
  obstacleTimer = 0;
  coinTimer = 0;
  styleMeter = 0;
  coinsCollected = 0;
  gameState = PLAYING;
  score = 0;
  level = 1;
  gameSpeed = 1;
  particles = [];
  powerups = [];
  powerupActive = null;
  combo = 0;
  comboMultiplier = 1;
  comboTimer = 0;
  specialMoves = [];
  isInvincible = false;
  invincibilityTimer = 0;
  coinMagnetActive = false;
  shieldActive = false;
  backgroundParallax = 0;
}

// Add particle effects
function createParticle(x, y, color) {
  particles.push({
    x, y,
    vx: random(-2, 2),
    vy: random(-5, -2),
    life: 255,
    color
  });
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life -= 5;
    
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  for (let p of particles) {
    fill(p.color[0], p.color[1], p.color[2], p.life);
    circle(p.x, p.y, 5);
  }
}

// Add power-up system
function updatePowerups() {
  if (random(1) < 0.002 && powerups.length < 3) { // Limit number of powerups
    let type = random(Object.values(POWERUP_TYPES));
    powerups.push({
      x: width,
      y: random(150, 300),
      type,
      width: 30,
      height: 30
    });
  }
  
  for (let i = powerups.length - 1; i >= 0; i--) {
    let p = powerups[i];
    p.x -= 4; // Constant speed
    
    if (checkCollision(playerX, playerY, playerWidth, playerHeight, p.x, p.y, p.width, p.height)) {
      activatePowerup(p.type);
      powerups.splice(i, 1);
      for (let j = 0; j < 10; j++) { // Reduced particle count
          createParticle(p.x, p.y, coinYellow);
      }
    }
  }
  
  if (powerupActive && frameCount > powerupTimer) {
    powerupActive = null;
  }
}

function activatePowerup(type) {
  powerupActive = type;
  powerupTimer = frameCount + 300;
  
  switch (type) {
    case POWERUP_TYPES.STAR:
      isInvincible = true;
      invincibilityTimer = frameCount + 300;
      break;
    case POWERUP_TYPES.MUSHROOM:
      playerHeight *= 1.5;
      break;
    case POWERUP_TYPES.FLOWER:
      // Enable fireball ability
      break;
    case POWERUP_TYPES.COIN_MAGNET:
      coinMagnetActive = true;
      break;
    case POWERUP_TYPES.SHIELD:
      shieldActive = true;
      break;
  }
  
  // Add visual feedback
  for (let i = 0; i < 20; i++) {
    createParticle(playerX, playerY, [255, 255, 0]);
  }
}

function drawPowerups() {
  for (let p of powerups) {
    // Placeholder for drawing power-ups
  }
}

// Add combo system
function drawCombo() {
  if (combo > 0) {
    push();
    fill(255, 215, 0);
    textSize(30);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text(`COMBO x${comboMultiplier}!`, width/2, 100);
    pop();
  }
}

// Add special moves
function drawSpecialMoves() {
  for (let move of specialMoves) {
    // Draw fireball
    if (move.type === 'fireball') {
      fill(255, 165, 0);
      ellipse(move.x, move.y, 20, 20);
      // Add particle trail
      createParticle(move.x, move.y, [255, 165, 0]);
    }
  }
}

// Add new cleanup function
function cleanupOffscreenObjects() {
  // Clean up obstacles
  obstacles = obstacles.filter(obs => obs.x > -obs.width);
  
  // Clean up coins
  coins = coins.filter(coin => coin.x > -coin.width);
  
  // Clean up particles
  particles = particles.filter(p => p.life > 0);
  
  // Clean up powerups
  powerups = powerups.filter(p => p.x > -p.width);
  
  // Limit total number of objects
  if (obstacles.length > 10) obstacles.length = 10;
  if (coins.length > 15) coins.length = 15;
  if (particles.length > 50) particles.length = 50;
  if (powerups.length > 3) powerups.length = 3;
}