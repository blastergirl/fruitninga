import { Fruit } from './fruit';

export class Game {
  constructor() {
    this.fruits = [];
    this.score = 0;
    this.gameArea = document.getElementById('game-area');
    this.scoreElement = document.getElementById('score');
    this.FRUITS = ['🍎', '🍐', '🍊', '🍌', '🍉', '🍇'];
    
    this.setupEventListeners();
    this.startGameLoop();
  }

  setupEventListeners() {
    let isMouseDown = false;
    let lastX = 0;
    let lastY = 0;

    const handleMove = (x, y) => {
      if (isMouseDown) {
        this.checkSlice(x, y, lastX, lastY);
        lastX = x;
        lastY = y;
      }
    };

    // Mouse events
    this.gameArea.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    
    this.gameArea.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    });
    
    this.gameArea.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    // Touch events
    this.gameArea.addEventListener('touchstart', (e) => {
      isMouseDown = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    });
    
    this.gameArea.addEventListener('touchmove', (e) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    });
    
    this.gameArea.addEventListener('touchend', () => {
      isMouseDown = false;
    });
  }

  startGameLoop() {
    setInterval(() => {
      this.spawnFruit();
      this.updateFruits();
    }, 1000);
  }

  spawnFruit() {
    const randomFruit = this.FRUITS[Math.floor(Math.random() * this.FRUITS.length)];
    const randomX = Math.random() * (window.innerWidth - 50);
    const fruit = new Fruit(randomFruit, randomX);
    this.fruits.push(fruit);
    this.gameArea.appendChild(fruit.element);
  }

  updateFruits() {
    this.fruits.forEach(fruit => fruit.update());
    
    // Remove off-screen fruits
    this.fruits = this.fruits.filter(fruit => {
      if (fruit.isOffScreen()) {
        this.gameArea.removeChild(fruit.element);
        return false;
      }
      return true;
    });
  }

  checkSlice(x, y, lastX, lastY) {
    this.fruits.forEach(fruit => {
      const fruitRect = fruit.element.getBoundingClientRect();
      const fruitX = fruitRect.left + fruitRect.width / 2;
      const fruitY = fruitRect.top + fruitRect.height / 2;
      
      // Check if the slice line intersects with the fruit
      if (this.lineIntersectsPoint(lastX, lastY, x, y, fruitX, fruitY, 50)) {
        if (fruit.slice()) {
          this.score += 10;
          this.scoreElement.textContent = `Score: ${this.score}`;
        }
      }
    });
  }

  lineIntersectsPoint(x1, y1, x2, y2, px, py, threshold) {
    const distance = this.pointToLineDistance(x1, y1, x2, y2, px, py);
    return distance < threshold;
  }

  pointToLineDistance(x1, y1, x2, y2, px, py) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  }
}