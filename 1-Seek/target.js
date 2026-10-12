// Cible circulaire autonome : Vehicle fournit et applique la locomotion.
class Target extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.r = 50;
    this.color = 'red';
    this.maxSpeed = 6;
    this.vel = p5.Vector.random2D().setMag(random(1, this.maxSpeed));
  }

  update() {
    super.update();
  }

  show() {
    fill(this.color);
    noStroke();
    circle(this.pos.x, this.pos.y, this.r * 2);
  }
}
