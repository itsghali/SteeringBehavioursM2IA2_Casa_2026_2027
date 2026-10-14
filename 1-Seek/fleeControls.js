// Effectif et perception des cibles ; les cibles conservées gardent leur mouvement.
const FleeControls = (() => {
  const MAX_TARGETS = 20;
  const MIN_RADIUS = 0;
  const MAX_RADIUS = 300;

  function bind(slider, output, synchronize) {
    const update = () => { output.value = synchronize(Number(slider.value)); };
    slider.addEventListener('input', update);
    update();
  }

  function resizeTargets(targets, count, createTarget, detectionRadius) {
    VehicleSettings.validate(count, 1, MAX_TARGETS, 'Le nombre de cibles');
    if (!Number.isInteger(count)) throw new RangeError('Le nombre de cibles doit être entier.');
    VehicleSettings.validate(detectionRadius, MIN_RADIUS, MAX_RADIUS, 'Le rayon');
    if (count < targets.length) targets.length = count;
    while (targets.length < count) targets.push(createTarget());
    for (const target of targets) target.detectionRadius = detectionRadius;
    return `${targets.length} / ${MAX_TARGETS}`;
  }

  function applyRadius(targets, radius) {
    VehicleSettings.validate(radius, MIN_RADIUS, MAX_RADIUS, 'Le rayon');
    for (const target of targets) target.detectionRadius = radius;
    return `${radius} px`;
  }

  return { MAX_TARGETS, MIN_RADIUS, MAX_RADIUS, bind, resizeTargets, applyRadius };
})();
