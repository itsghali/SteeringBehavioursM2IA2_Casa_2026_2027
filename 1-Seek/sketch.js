let target;
const vehicles = [];
let sceneCanvas;
let maxSpeedSlider;
let maxForceSlider;
let behaviorMode;

function sceneHeight() {
  return Math.max(1, windowHeight - document.getElementById('controls').offsetHeight);
}

function setup() {
  sceneCanvas = createCanvas(windowWidth, sceneHeight());
  sceneCanvas.parent('scene');
  target = new Target(width / 2, height / 2);

  const slider = document.getElementById('vehicle-count');
  slider.value = SeekPopulation.INITIAL_COUNT;
  SeekPopulation.bindSlider(slider, document.getElementById('vehicle-count-value'),
    vehicles, target.pos, () => ({ width, height }), (x, y) => {
      const vehicle = new Vehicle(x, y);
      vehicle.maxSpeed = Number(document.getElementById('max-speed').value);
      vehicle.maxForce = Number(document.getElementById('max-force').value);
      return vehicle;
    });

  maxSpeedSlider = document.getElementById('max-speed');
  maxForceSlider = document.getElementById('max-force');
  behaviorMode = document.getElementById('behavior-mode');
  behaviorMode.addEventListener('change', updateBehaviorHint);
  updateBehaviorHint();
  bindVehicleSetting(maxSpeedSlider, document.getElementById('max-speed-value'), 'maxSpeed');
  bindVehicleSetting(maxForceSlider, document.getElementById('max-force-value'), 'maxForce');
  VehicleSettings.apply(vehicles, maxSpeedSlider.value, maxForceSlider.value);
}

function draw() {
  drawAnimatedRadialGradient(millis(), width, height);
  target.update();
  target.edges();
  const fleeing = behaviorMode.value === 'flee';
  if (fleeing) drawFleeRadius();
  const steering = fleeing
    ? (vehicle, goal) => FleeBehavior.calculate(vehicle, goal)
    : (vehicle, goal) => vehicle.seek(goal);
  for (const vehicle of vehicles) {
    SeekPopulation.step(vehicle, target.pos, width, height, Math.random, steering, !fleeing);
    vehicle.show();
  }
  target.show();
}

function windowResized() {
  resizeCanvas(windowWidth, sceneHeight());
  target.pos.set(constrain(target.pos.x, 0, width), constrain(target.pos.y, 0, height));
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
  hint.textContent = behaviorMode.value === 'flee'
    ? 'Les véhicules fuient la cible autonome rouge.'
    : 'Les véhicules suivent la cible autonome rouge.';
}

function drawFleeRadius() {
  push();
  noFill();
  stroke(255, 190);
  strokeWeight(1);
  circle(target.pos.x, target.pos.y, FleeBehavior.DETECTION_RADIUS * 2);
  pop();
}
