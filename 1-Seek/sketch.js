let target;
let targets = [];
const vehicles = [];
let sceneCanvas;
let vehicleCountSlider;
let maxSpeedSlider;
let maxForceSlider;
let behaviorMode;
let targetCountSlider;
let detectionRadiusSlider;

function sceneHeight() {
  return Math.max(1, windowHeight - document.getElementById('controls').offsetHeight);
}

function setup() {
  sceneCanvas = createCanvas(windowWidth, sceneHeight());
  sceneCanvas.parent('scene');
  targets = [new Target(width / 2, height / 2)];
  target = targets[0];

  vehicleCountSlider = document.getElementById('vehicle-count');
  vehicleCountSlider.value = SeekPopulation.INITIAL_COUNT;
  SeekPopulation.bindSlider(vehicleCountSlider, document.getElementById('vehicle-count-value'),
    vehicles, target.pos, () => ({ width, height }), (x, y) => {
      const vehicle = new Ship(x, y);
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
  targetCountSlider = document.getElementById('target-count');
  detectionRadiusSlider = document.getElementById('detection-radius');
  FleeControls.bind(targetCountSlider, document.getElementById('target-count-value'), count =>
    FleeControls.resizeTargets(targets, count,
      () => new Target(random(0, width), random(0, height)), Number(detectionRadiusSlider.value)));
  FleeControls.bind(detectionRadiusSlider, document.getElementById('detection-radius-value'), radius =>
    FleeControls.applyRadius(targets, radius));
  updateBehaviorHint();
  bindVehicleSetting(maxSpeedSlider, document.getElementById('max-speed-value'), 'maxSpeed');
  bindVehicleSetting(maxForceSlider, document.getElementById('max-force-value'), 'maxForce');
  VehicleSettings.apply(vehicles, maxSpeedSlider.value, maxForceSlider.value);
  updateScenario();
}

function draw() {
  drawAnimatedRadialGradient(millis(), width, height);
  const mode = behaviorMode.value;
  const fleeing = mode !== 'seek';
  const activeTargets = fleeing ? targets : [target];
  for (const currentTarget of activeTargets) {
    currentTarget.update();
    currentTarget.edges();
  }
  if (fleeing) drawFleeRadius(activeTargets);
  const steering = (vehicle) => vehicle.steering(mode, activeTargets);
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
      ? 'Les vaisseaux fuient les cibles rouges. Sécurité : 300 px.'
      : 'Les vaisseaux fuient les cibles autonomes rouges. Sécurité : 300 px.';
}

function updateScenario() {
  const fleeing = behaviorMode.value !== 'seek';
  targetCountSlider.disabled = !fleeing;
  detectionRadiusSlider.disabled = !fleeing;
  if (fleeing) FleeBehavior.ensureMotion(vehicles);
}

function drawFleeRadius(currentTargets) {
  push();
  noFill();
  stroke(255, 190);
  strokeWeight(1);
  for (const currentTarget of currentTargets) {
    circle(currentTarget.pos.x, currentTarget.pos.y, currentTarget.detectionRadius * 2);
  }
  stroke(255, 160, 80, 160);
  for (const currentTarget of currentTargets) {
    circle(currentTarget.pos.x, currentTarget.pos.y, FleeBehavior.SAFETY_DISTANCE * 2);
  }
  pop();
}
