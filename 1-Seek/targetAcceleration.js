// Accélération autonome dans la direction courante ; locomotion laissée à Vehicle.
const TargetAcceleration = (() => {
  function calculate(target) {
    const desired = createVector(target.vel.x, target.vel.y);
    if (desired.mag() === 0) desired.set(1, 0);
    desired.setMag(target.maxSpeed);
    return p5.Vector.sub(desired, target.vel).limit(target.maxForce);
  }
  return { calculate };
})();
