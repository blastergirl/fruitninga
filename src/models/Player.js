export class Player {
  constructor() {
    this.gems = 0;
    this.score = 0;
    this.currentBlade = 'default';
    this.unlockedBlades = new Set(['default']);
    this.onBladeChange = null;
  }

  set currentBlade(value) {
    this._currentBlade = value;
    if (this.onBladeChange) {
      this.onBladeChange(value);
    }
  }

  get currentBlade() {
    return this._currentBlade;
  }

  unlockBlade(bladeId) {
    this.unlockedBlades.add(bladeId);
  }

  // ... rest of the Player code stays the same
}