// Comportement flee indépendant du véhicule fourni.
const FleeBehavior = (() => {
  const DETECTION_RADIUS = 150;

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

  return { DETECTION_RADIUS, calculate };
})();
