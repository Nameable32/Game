// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Constants and State
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const FPS = 60;

// Images
const pirateImg = new Image();
pirateImg.src = './assets/pirate.png';

const limeImg = new Image();
limeImg.src = './assets/lime.png';

const sharkImg = new Image();
sharkImg.src = './assets/shark.png';

const boostImg = new Image();
boostImg.src = './assets/boost.png';

const bgImg = new Image();
bgImg.src = './assets/background.png';

// Game State
let pirate = { x: WIDTH / 2, y: HEIGHT / 2, size: 100, speed: 5 };
let limes = [];
let sharks = [];
let boost = null;
let keys = { up: false, down: false, left: false, right: false };
let level = 1;
let timer = 30;
let boostActive = false;
let boostStartTime = 0;

// Utility Functions
function collides(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.size &&
    obj1.x + obj1.size > obj2.x &&
    obj1.y < obj2.y + obj2.size &&
    obj1.y + obj1.size > obj2.y
  );
}

// Input Handling
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') keys.up = true;
  if (e.key === 'ArrowDown') keys.down = true;
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp') keys.up = false;
  if (e.key === 'ArrowDown') keys.down = false;
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
});

function move(direction) {
  keys[direction] = true;
  setTimeout(() => {
    keys[direction] = false;
  }, 100);
}

// Create Entities
function createLimes(count) {
  limes = Array.from({ length: count }, () => ({
    x: Math.random() * (WIDTH - 50),
    y: Math.random() * (HEIGHT - 50),
    size: 50,
    collected: false
  }));
}

function createSharks(count) {
  sharks = Array.from({ length: count }, () => ({
    x: Math.random() * (WIDTH - 50),
    y: Math.random() * (HEIGHT - 50),
    size: 80,
    dx: Math.random() < 0.5 ? -2 : 2,
    dy: Math.random() < 0.5 ? -2 : 2
  }));
}

function createBoost() {
  boost = {
    x: Math.random() * (WIDTH - 50),
    y: Math.random() * (HEIGHT - 50),
    size: 50,
    collected: false
  };
}

// Update and Render Functions
function updatePirate() {
  if (keys.up) pirate.y -= pirate.speed;
  if (keys.down) pirate.y += pirate.speed;
  if (keys.left) pirate.x -= pirate.speed;
  if (keys.right) pirate.x += pirate.speed;

  // Clamp to screen
  pirate.x = Math.max(0, Math.min(WIDTH - pirate.size, pirate.x));
  pirate.y = Math.max(0, Math.min(HEIGHT - pirate.size, pirate.y));
}

function updateSharks() {
  sharks.forEach((shark) => {
    shark.x += shark.dx;
    shark.y += shark.dy;

    if (shark.x <= 0 || shark.x >= WIDTH - shark.size) shark.dx *= -1;
    if (shark.y <= 0 || shark.y >= HEIGHT - shark.size) shark.dy *= -1;
  });
}

function drawBackground() {
  ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
}

function drawPirate() {
  ctx.drawImage(pirateImg, pirate.x, pirate.y, pirate.size, pirate.size);
}

function drawLimes() {
  limes.forEach((lime) => {
    if (!lime.collected) {
      ctx.drawImage(limeImg, lime.x, lime.y, lime.size, lime.size);
    }
  });
}

function drawSharks() {
  sharks.forEach((shark) => {
    ctx.drawImage(sharkImg, shark.x, shark.y, shark.size, shark.size);
  });
}

function drawBoost() {
  if (!boost.collected) {
    ctx.drawImage(boostImg, boost.x, boost.y, boost.size, boost.size);
  }
}

// Main Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  drawBackground();
  updatePirate();
  updateSharks();
  drawPirate();
  drawLimes();
  drawSharks();
  drawBoost();

  // Collisions
  limes.forEach((lime) => {
    if (!lime.collected && collides(pirate, lime)) lime.collected = true;
  });

  if (boost && !boost.collected && collides(pirate, boost)) {
    boost.collected = true;
    boostActive = true;
    boostStartTime = performance.now();
    pirate.speed *= 2;
  }

  sharks.forEach((shark) => {
    if (collides(pirate, shark)) {
      alert('Game Over!');
      resetGame();
    }
  });

  if (limes.every((lime) => lime.collected)) {
    level++;
    nextLevel();
  }

  if (boostActive && performance.now() - boostStartTime > 10000) {
    boostActive = false;
    pirate.speed = 5;
  }

  timer -= 1 / FPS;
  if (timer <= 0) {
    alert('Time\'s up!');
    resetGame();
  }

  requestAnimationFrame(gameLoop);
}

function resetGame() {
  level = 1;
  timer = 30;
  pirate.speed = 5;
  nextLevel();
}

function nextLevel() {
  createLimes(level + 4);
  createSharks(level + 1);
  createBoost();
  timer = 30;
}

bgImg.onload = () => {
  resetGame();
  gameLoop();
};