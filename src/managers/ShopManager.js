import { BLADES } from '../models/Blade.js';

export class ShopManager {
  constructor(player, updateUI) {
    this.player = player;
    this.updateUI = updateUI;
  }

  purchaseBlade(bladeId) {
    const blade = BLADES[bladeId];
    if (blade && this.player.gems >= blade.gemCost && !this.player.unlockedBlades.has(bladeId)) {
      this.player.gems -= blade.gemCost;
      this.player.unlockBlade(bladeId);
      this.updateUI();
      return true;
    }
    return false;
  }

  getAvailableBlades() {
    return Object.entries(BLADES).map(([id, blade]) => ({
      id,
      ...blade,
      unlocked: this.player.unlockedBlades.has(id)
    }));
  }
}