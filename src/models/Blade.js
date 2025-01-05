export class Blade {
  constructor(color = '#FFFFFF', gemCost = 0) {
    this.color = color;
    this.gemCost = gemCost;
    this.unlocked = gemCost === 0;
  }

  unlock() {
    this.unlocked = true;
  }
}

export const BLADES = {
  default: new Blade('#FFFFFF', 0),
  blue: new Blade('#4299E1', 100),
  pink: new Blade('#ED64A6', 200),
  gold: new Blade('#ECC94B', 500)
};