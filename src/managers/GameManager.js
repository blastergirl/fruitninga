import * as THREE from 'three';
import { Fruit3D } from '../models/Fruit3D.js';
import { Player } from '../models/Player.js';
import { ShopManager } from './ShopManager.js';
import { InputManager } from './InputManager.js';

export class GameManager {
  constructor() {
    // First, set up the scene and renderer
    this.setupThreeJS();
    
    // Initialize game state
    this.player = new Player();
    this.fruits = [];
    this.FRUITS = ['🍎', '🍐', '🍊', '🍌', '🍉', '🍇'];
    this.gameStarted = false;
    this.gamePaused = false;
    this.gameTime = 120; // 2 minutes in seconds
    
    // Initialize managers first
    this.shopManager = new ShopManager(this.player, () => this.updateUI());
    
    // Set up UI after managers are initialized
    this.setupUI();
    
    // Initialize input manager after UI is ready
    this.inputManager = new InputManager(this);
    
    // Show start screen instead of starting game loop
    this.showStartScreen();
  }

  setupThreeJS() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Get the game area and create a container for Three.js
    const gameArea = document.getElementById('game-area');
    const threeContainer = document.createElement('div');
    threeContainer.style.position = 'absolute';
    threeContainer.style.top = '0';
    threeContainer.style.left = '0';
    threeContainer.style.zIndex = '0';
    
    // Add the Three.js canvas to the container
    threeContainer.appendChild(this.renderer.domElement);
    
    // Insert the container before the UI overlay
    const uiOverlay = document.getElementById('ui-overlay');
    gameArea.insertBefore(threeContainer, uiOverlay);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);

    this.camera.position.z = 500;

    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setupUI() {
    if (!document.getElementById('score') || !document.getElementById('gems') || !document.getElementById('shop')) {
      console.error('Required UI elements not found');
      return;
    }

    // Create timer container
    const timerContainer = document.createElement('div');
    timerContainer.id = 'timer-container';
    timerContainer.className = 'timer-display';
    timerContainer.textContent = '2:00';
    document.getElementById('ui-overlay').appendChild(timerContainer);

    // Create game controls container
    const gameControls = document.createElement('div');
    gameControls.id = 'game-controls';
    gameControls.innerHTML = `
      <button id="pause-btn"><span class="key">Space</span></button>
      <button id="play-btn"><span class="key">P</span></button>
      <button id="restart-btn"><span class="key">R</span></button>
      <div id="speed-display">1.0x</div>
      <button id="speed-down">-</button>
      <button id="speed-up">+</button>
    `;
    document.getElementById('ui-overlay').appendChild(gameControls);

    // Add toggle button for game controls
    const controlsToggle = document.createElement('div');
    controlsToggle.id = 'game-controls-toggle';
    controlsToggle.textContent = 'Hide Controls';
    document.getElementById('ui-overlay').appendChild(controlsToggle);

    // Add toggle functionality
    controlsToggle.addEventListener('click', () => {
      const gameControls = document.getElementById('game-controls');
      const permanentControls = document.getElementById('permanent-controls');
      
      if (gameControls.classList.contains('hidden')) {
        gameControls.classList.remove('hidden');
        permanentControls.classList.remove('hidden');
        controlsToggle.textContent = 'Hide Controls';
      } else {
        gameControls.classList.add('hidden');
        permanentControls.classList.add('hidden');
        controlsToggle.textContent = 'Show Controls';
      }
    });

    // Set up button event listeners with smaller speed adjustments
    document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
    document.getElementById('play-btn').addEventListener('click', () => this.resumeGame());
    document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    document.getElementById('speed-up').addEventListener('click', () => this.adjustSpeed(0.1));
    document.getElementById('speed-down').addEventListener('click', () => this.adjustSpeed(-0.1));

    // Set up keyboard controls with smaller speed adjustments
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case ' ':
          this.pauseGame();
          break;
        case 'p':
        case 'P':
          this.resumeGame();
          break;
        case 'r':
        case 'R':
          this.restartGame();
          break;
        case '+':
          this.adjustSpeed(0.1);
          break;
        case '-':
          this.adjustSpeed(-0.1);
          break;
      }
    });

    this.updateUI();
    this.setupShopUI();
  }

  updateUI() {
    const scoreElement = document.getElementById('score');
    const gemsElement = document.getElementById('gems');
    const timerElement = document.getElementById('timer-container');
    
    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.player.score}`;
    }
    if (gemsElement) {
      gemsElement.textContent = `Gems: ${this.player.gems}`;
    }
    if (timerElement && this.gameStarted && !this.gamePaused) {
      const minutes = Math.floor(this.gameTime / 60);
      const seconds = this.gameTime % 60;
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  setupShopUI() {
    const shop = document.getElementById('shop');
    if (!shop || !this.shopManager) {
      console.error('Shop element or ShopManager not found');
      return;
    }

    // Add toggle button for shop
    const toggleButton = document.createElement('div');
    toggleButton.id = 'shop-toggle';
    toggleButton.textContent = 'Hide Blades';
    document.getElementById('ui-overlay').appendChild(toggleButton);

    // Add toggle functionality
    toggleButton.addEventListener('click', () => {
      if (shop.classList.contains('hidden')) {
        shop.classList.remove('hidden');
        toggleButton.textContent = 'Hide Blades';
      } else {
        shop.classList.add('hidden');
        toggleButton.textContent = 'Show Blades';
      }
    });

    // Clear existing buttons
    shop.innerHTML = '';
    
    const blades = this.shopManager.getAvailableBlades();
    
    blades.forEach(blade => {
      const button = document.createElement('button');
      button.className = `blade-button ${blade.unlocked ? 'unlocked' : ''}`;
      button.innerHTML = `
        <div class="blade-color" style="background-color: ${blade.color}"></div>
        <div class="blade-info">
          <span>${blade.id} Blade</span>
          ${!blade.unlocked ? `<span>${blade.gemCost} Gems</span>` : ''}
        </div>
      `;
      
      if (!blade.unlocked) {
        button.onclick = () => {
          if (this.shopManager.purchaseBlade(blade.id)) {
            button.classList.add('unlocked');
            this.player.currentBlade = blade.id;
          }
        };
      } else {
        button.onclick = () => {
          this.player.currentBlade = blade.id;
        };
      }
      
      shop.appendChild(button);
    });
  }

  showFloatingText(text, x, y, color = '#ffffff') {
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-text';
    floatingText.textContent = text;
    floatingText.style.color = color;
    floatingText.style.left = `${x}px`;
    floatingText.style.top = `${y}px`;
    
    document.getElementById('game-area').appendChild(floatingText);
    
    // Animate and remove
    setTimeout(() => {
      floatingText.remove();
    }, 1000);
  }

  spawnFruit() {
    // Get wider spawn range based on window width
    const spawnWidth = window.innerWidth * 0.8; // Use 80% of screen width
    const x = (Math.random() - 0.5) * spawnWidth;
    
    // Randomly select a fruit type
    const fruitTypes = ['🍎', '🍊', '🍐', '🍌', '🍉', '🍇'];
    const type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
    
    // Create and add the fruit
    const fruit = new Fruit3D(type, x, this.scene, this);
    this.fruits.push(fruit);
  }

  updateFruits() {
    this.fruits.forEach(fruit => fruit.update());
    
    this.fruits = this.fruits.filter(fruit => {
      if (fruit.isOffScreen()) {
        fruit.remove();
        return false;
      }
      return true;
    });
  }

  startGameLoop() {
    // Clear any existing interval
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
    }

    // Initialize game speed if not set
    if (!this.gameSpeed) this.gameSpeed = 1.0;

    // Variable spawn rate
    let timeSinceLastSpawn = 0;
    const minSpawnInterval = 800; // Minimum time between spawns (ms)
    const maxSpawnInterval = 2000; // Maximum time between spawns (ms)

    // Use requestAnimationFrame for smoother updates
    const gameLoop = (timestamp) => {
      // Initialize start time
      if (!this.lastFrameTime) {
        this.lastFrameTime = timestamp;
      }

      // Only update game if not paused
      if (!this.gamePaused) {
        // Calculate time delta
        const deltaTime = (timestamp - this.lastFrameTime) * this.gameSpeed;
        timeSinceLastSpawn += deltaTime;

        // Spawn fruit with variable timing
        if (timeSinceLastSpawn >= minSpawnInterval) {
          // Random chance to spawn based on time passed
          const spawnChance = (timeSinceLastSpawn - minSpawnInterval) / (maxSpawnInterval - minSpawnInterval);
          if (Math.random() < spawnChance) {
            this.spawnFruit();
            timeSinceLastSpawn = 0;
          }
        }

        // Update all fruits with speed adjustment
        this.fruits.forEach((fruit, index) => {
          if (fruit.velocity) {
            fruit.velocity.y *= this.gameSpeed;
            fruit.velocity.rotation *= this.gameSpeed;
          }
          fruit.update();
          if (fruit.isOffScreen()) {
            fruit.remove();
            this.fruits.splice(index, 1);
          }
        });
      }

      // Always render the scene
      this.renderer.render(this.scene, this.camera);

      this.lastFrameTime = timestamp;
      if (this.gameStarted) {
        requestAnimationFrame(gameLoop);
      }
    };

    // Start the game loop
    requestAnimationFrame(gameLoop);
  }

  showStartScreen() {
    const startScreen = document.createElement('div');
    startScreen.id = 'start-screen';
    startScreen.innerHTML = `
      <div class="start-content">
        <h1>Fruit Ninja</h1>
        <button id="start-btn">Start Game</button>
      </div>
    `;
    document.getElementById('game-area').appendChild(startScreen);

    document.getElementById('start-btn').addEventListener('click', () => {
      startScreen.remove();
      this.startGame();
    });
  }

  startGame() {
    this.gameStarted = true;
    this.gamePaused = false;
    this.gameTime = 120; // Reset timer to 2 minutes
    this.startGameLoop();

    // Start the timer countdown
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      if (!this.gamePaused && this.gameTime > 0) {
        this.gameTime--;
        this.updateUI();
        
        if (this.gameTime === 0) {
          this.endGame();
        }
      }
    }, 1000);
  }

  endGame() {
    this.gameStarted = false;
    this.gamePaused = true;
    clearInterval(this.timerInterval);
    
    // Show game over screen
    const gameOverScreen = document.createElement('div');
    gameOverScreen.id = 'game-over-screen';
    gameOverScreen.innerHTML = `
      <div class="start-content">
        <h1>Time's Up!</h1>
        <p>Final Score: ${this.player.score}</p>
        <p>Gems Collected: ${this.player.gems}</p>
        <button id="restart-btn-end">Play Again</button>
      </div>
    `;
    document.getElementById('game-area').appendChild(gameOverScreen);

    document.getElementById('restart-btn-end').addEventListener('click', () => {
      gameOverScreen.remove();
      this.restartGame();
    });
  }

  pauseGame() {
    if (this.gameStarted) {
      this.gamePaused = true;
    }
  }

  resumeGame() {
    if (this.gameStarted) {
      this.gamePaused = false;
    }
  }

  restartGame() {
    // Clear timer interval
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    // Reset game state
    this.fruits.forEach(fruit => fruit.remove());
    this.fruits = [];
    this.player.score = 0;
    this.gameTime = 120; // Reset timer to 2 minutes
    this.updateUI();
    
    // Restart game
    this.gameStarted = true;
    this.gamePaused = false;
    this.startGameLoop();
    
    // Start new timer
    this.startGame();
  }

  adjustSpeed(delta) {
    if (!this.gameSpeed) this.gameSpeed = 1.0;
    // Limit speed between 0.7 and 1.3 for more reasonable range
    this.gameSpeed = Math.max(0.7, Math.min(1.3, this.gameSpeed + delta));
    document.getElementById('speed-display').textContent = `${this.gameSpeed.toFixed(1)}x`;
  }
}