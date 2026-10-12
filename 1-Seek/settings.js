// Paramètres communs aux véhicules contrôlés par les curseurs de l'exemple.
const VehicleSettings = (() => {
  const MIN_SPEED = 0;
  const MAX_SPEED = 20;
  const MIN_FORCE = 0;
  const MAX_FORCE = 10;

  function validate(value, min, max, label) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < min || number > max) {
      throw new RangeError(`${label} doit être compris entre ${min} et ${max}.`);
    }
    return number;
  }

  function apply(vehicles, maxSpeed, maxForce) {
    const speed = validate(maxSpeed, MIN_SPEED, MAX_SPEED, 'La vitesse maximale');
    const force = validate(maxForce, MIN_FORCE, MAX_FORCE, 'La force maximale');
    for (const vehicle of vehicles) {
      vehicle.maxSpeed = speed;
      vehicle.maxForce = force;
    }
  }

  return { MIN_SPEED, MAX_SPEED, MIN_FORCE, MAX_FORCE, validate, apply };
})();
