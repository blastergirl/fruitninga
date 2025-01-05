export class Fruit {
  constructor(type, x) {
    this.type = type;
    this.x = x;
    this.y = window.innerHeight;
    this.sliced = false;
    this.element = this.createElement();
  }

  createElement() {
    const element = document.createElement('div');
    element.className = 'fruit';
    element.textContent = this.type;
    element.style.left = `${this.x}px`;
    element.style.top = `${this.y}px`;
    return element;
  }

  update() {
    if (!this.sliced) {
      this.y -= 5;
      this.element.style.top = `${this.y}px`;
    }
  }

  slice() {
    if (!this.sliced) {
      this.sliced = true;
      this.element.classList.add('sliced');
      return true;
    }
    return false;
  }

  isOffScreen() {
    return this.y < -50;
  }
}