import { Observable, Screen } from '@nativescript/core';
import { Fruit } from './fruit';

export class GameViewModel extends Observable {
  private fruits: Fruit[] = [];
  private score: number = 0;
  private gameLoop: any;
  private readonly FRUITS = ['🍎', '🍐', '🍊', '🍌', '🍉', '🍇'];

  constructor() {
    super();
    this.startGame();
  }

  startGame() {
    this.gameLoop = setInterval(() => {
      this.spawnFruit();
      this.updateFruits();
    }, 1000);
  }

  spawnFruit() {
    const randomFruit = this.FRUITS[Math.floor(Math.random() * this.FRUITS.length)];
    const randomX = Math.random() * Screen.mainScreen.widthDIPs;
    const fruit = new Fruit(randomFruit, randomX, Screen.mainScreen.heightDIPs);
    this.fruits.push(fruit);
  }

  updateFruits() {
    this.fruits.forEach(fruit => {
      if (!fruit.sliced) {
        fruit.y -= 5; // Move fruit upward
      }
    });

    // Remove fruits that are off screen
    this.fruits = this.fruits.filter(fruit => fruit.y > -50);
  }

  handleSwipe(x: number, y: number) {
    this.fruits.forEach(fruit => {
      if (!fruit.sliced) {
        const distance = Math.sqrt(
          Math.pow(fruit.x - x, 2) + 
          Math.pow(fruit.y - y, 2)
        );
        
        if (distance < 50) {
          fruit.slice();
          this.score += 10;
          this.notifyPropertyChange('score', this.score);
        }
      }
    });
  }

  get currentScore(): number {
    return this.score;
  }

  get visibleFruits(): Fruit[] {
    return this.fruits;
  }
}