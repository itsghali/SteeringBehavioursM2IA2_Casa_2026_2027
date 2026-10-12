// Comportement flee indépendant du véhicule fourni.
const FleeBehavior = (() => {
  const DETECTION_RADIUS = 100;

  function calculate(vehicle, target, detectionDistance = DETECTION_RADIUS) {
    const offset = p5.Vector.sub(vehicle.pos, target);
    const distance = offset.mag();
    if (distance > detectionDistance) return createVector(0, 0);

    // À distance nulle, aucune direction de fuite n'est définie. On conserve
    // toutefois une force de freinage valide au lieu de produire des NaN.
    if (distance === 0) offset.set(0, 0);
    else offset.setMag(vehicle.maxSpeed);

    return p5.Vector.sub(offset, vehicle.vel).limit(vehicle.maxForce);
  }

  function calculateCombined(vehicle, targets, detectionDistance = DETECTION_RADIUS) {
    const combined = createVector(0, 0);
    for (const target of targets) {
      const position = target.pos ?? target;
      combined.add(calculate(vehicle, position, detectionDistance));
    }
    return combined.limit(vehicle.maxForce);
  }

  function ensureMotion(vehicles, directionFactory = () => p5.Vector.random2D()) {
    for (const vehicle of vehicles) {
      if (vehicle.vel.mag() > 0 || vehicle.maxSpeed <= 0) continue;
      const direction = directionFactory();
      direction.setMag(Math.min(vehicle.maxSpeed, Math.max(0.5, vehicle.maxSpeed * 0.5)));
      vehicle.vel.set(direction.x, direction.y);
    }
  }

  return { DETECTION_RADIUS, calculate, calculateCombined, ensureMotion };
})();
