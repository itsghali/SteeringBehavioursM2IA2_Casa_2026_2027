// Comportement flee indépendant du véhicule fourni.
const FleeBehavior = (() => {
  const SAFETY_DISTANCE = 300;
  const DETECTION_RADIUS = SAFETY_DISTANCE;

  // Croisière à mi-vitesse ; accélération progressive dans la zone de sécurité.
  function desiredSpeed(vehicle, distance) {
    const urgency = Math.max(0, 1 - distance / SAFETY_DISTANCE);
    return vehicle.maxSpeed * (0.5 + 0.5 * urgency);
  }

  function calculate(vehicle, target, detectionDistance = DETECTION_RADIUS) {
    if (detectionDistance <= 0) return createVector(0, 0);
    const offset = p5.Vector.sub(vehicle.pos, target);
    const distance = offset.mag();
    if (distance > detectionDistance) return createVector(0, 0);

    // Superposition : continuer dans la direction courante, ou choisir +x au repos.
    if (distance === 0) {
      if (vehicle.vel.mag() > 0) offset.set(vehicle.vel.x, vehicle.vel.y);
      else offset.set(1, 0);
    }
    offset.setMag(desiredSpeed(vehicle, distance));

    return p5.Vector.sub(offset, vehicle.vel).limit(vehicle.maxForce);
  }

  function calculateCombined(vehicle, targets, detectionDistance = DETECTION_RADIUS) {
    const combined = createVector(0, 0);
    for (const target of targets) {
      const position = target.pos ?? target;
      combined.add(calculate(vehicle, position, target.detectionRadius ?? detectionDistance));
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

  return { SAFETY_DISTANCE, DETECTION_RADIUS, desiredSpeed, calculate, calculateCombined, ensureMotion };
})();
