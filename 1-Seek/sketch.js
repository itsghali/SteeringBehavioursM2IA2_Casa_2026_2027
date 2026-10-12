let target;
let targets = [];
const vehicles = [];
let sceneCanvas;
let vehicleCountSlider;
let maxSpeedSlider;
let maxForceSlider;
let behaviorMode;
let savedVehicleCount = SeekPopulation.INITIAL_COUNT;

function sceneHeight() {
  return Math.max(1, windowHeight - document.getElementById('controls').offsetHeight);
}

function setup() {
  sceneCanvas = createCanvas(windowWidth, sceneHeight());
  sceneCanvas.parent('scene');
  targets = [
    new Target(width / 2, height / 2),
    new Target(width * 0.25, height * 0.25),
    new Target(width * 0.75, height * 0.25),
    new Target(width * 0.25, height * 0.75),
    new Target(width * 0.75, height * 0.75),
  ];
  target = targets[0];

  vehicleCountSlider = document.getElementById('vehicle-count');
  vehicleCountSlider.value = SeekPopulation.INITIAL_COUNT;
  SeekPopulation.bindSlider(vehicleCountSlider, document.getElementById('vehicle-count-value'),
    vehicles, target.pos, () => ({ width, height }), (x, y) => {
      const vehicle = new Vehicle(x, y);
      vehicle.maxSpeed = Number(document.getElementById('max-speed').value);
      vehicle.maxForce = Number(document.getElementById('max-force').value);
      return vehicle;
    });
  vehicleCountSlider.addEventListener('input', () => {
    if (behaviorMode && behaviorMode.value !== 'seek') FleeBehavior.ensureMotion(vehicles);
  });

  maxSpeedSlider = document.getElementById('max-speed');
  maxForceSlider = document.getElementById('max-force');
  behaviorMode = document.getElementById('behavior-mode');
  behaviorMode.addEventListener('change', updateBehaviorHint);
  behaviorMode.addEventListener('change', updateScenario);
  updateBehaviorHint();
  bindVehicleSetting(maxSpeedSlider, document.getElementById('max-speed-value'), 'maxSpeed');
  bindVehicleSetting(maxForceSlider, document.getElementById('max-force-value'), 'maxForce');
  VehicleSettings.apply(vehicles, maxSpeedSlider.value, maxForceSlider.value);
}

function draw() {
  drawAnimatedRadialGradient(millis(), width, height);
  const mode = behaviorMode.value;
  const fleeing = mode !== 'seek';
  const manyTargets = mode === 'flee-many';
  const activeTargets = manyTargets ? targets : [target];
  for (const currentTarget of activeTargets) {
    currentTarget.update();
    currentTarget.edges();
  }
  if (fleeing) drawFleeRadius(activeTargets);
  const steering = mode === 'flee-many'
    ? (vehicle) => FleeBehavior.calculateCombined(vehicle, targets)
    : mode === 'flee'
      ? (vehicle, goal) => FleeBehavior.calculate(vehicle, goal)
    : (vehicle, goal) => vehicle.seek(goal);
  for (const vehicle of vehicles) {
    SeekPopulation.step(vehicle, target.pos, width, height, Math.random, steering, !fleeing);
    vehicle.show();
  }
  for (const currentTarget of activeTargets) currentTarget.show();
}

function windowResized() {
  resizeCanvas(windowWidth, sceneHeight());
  for (const currentTarget of targets) {
    currentTarget.pos.set(constrain(currentTarget.pos.x, 0, width), constrain(currentTarget.pos.y, 0, height));
  }
  for (const vehicle of vehicles) vehicle.edges();
}

function bindVehicleSetting(slider, output, property) {
  const update = () => {
    const speed = property === 'maxSpeed' ? slider.value : maxSpeedSlider.value;
    const force = property === 'maxForce' ? slider.value : maxForceSlider.value;
    VehicleSettings.apply(vehicles, speed, force);
    output.value = Number(slider.value).toString();
  };
  slider.addEventListener('input', update);
  update();
}

function updateBehaviorHint() {
  const hint = document.getElementById('behavior-hint');
  hint.textContent = behaviorMode.value === 'seek'
    ? 'Les véhicules suivent la cible autonome rouge.'
    : behaviorMode.value === 'flee'
      ? 'Les véhicules fuient la cible autonome rouge.'
      : 'Le vaisseau fuit les cinq cibles autonomes rouges.';
}

function updateScenario() {
  const manyTargets = behaviorMode.value === 'flee-many';
  if (manyTargets) {
    savedVehicleCount = vehicles.length;
    vehicleCountSlider.disabled = true;
    vehicleCountSlider.value = 1;
    vehicleCountSlider.dispatchEvent(new Event('input'));
  } else {
    vehicleCountSlider.disabled = false;
    vehicleCountSlider.value = savedVehicleCount || SeekPopulation.INITIAL_COUNT;
    vehicleCountSlider.dispatchEvent(new Event('input'));
  }
  if (manyTargets || behaviorMode.value === 'flee') FleeBehavior.ensureMotion(vehicles);
}

function drawFleeRadius(currentTargets) {
  push();
  noFill();
  stroke(255, 190);
  strokeWeight(1);
  for (const currentTarget of currentTargets) {
    circle(currentTarget.pos.x, currentTarget.pos.y, FleeBehavior.DETECTION_RADIUS * 2);
  }
  pop();
}
