// Vaisseau : sélection du steering ; dessin et locomotion hérités de Vehicle.
class Ship extends Vehicle {
  steering(mode, targets) {
    if (mode === 'seek') return this.seek(targets[0].pos);
    return FleeBehavior.calculateCombined(this, targets);
  }
}
