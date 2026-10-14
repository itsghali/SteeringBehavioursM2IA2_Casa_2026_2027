import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Adaptateur vectoriel minimal pour exercer le vrai vehicle.js sans DOM.
class Vector {
  constructor(x = 0, y = 0) { this.set(x, y); }
  set(x, y) { this.x = x; this.y = y; return this; }
  add(v) { this.x += v.x; this.y += v.y; return this; }
  mult(n) { this.x *= n; this.y *= n; return this; }
  mag() { return Math.hypot(this.x, this.y); }
  setMag(n) { const m = this.mag(); return m ? this.mult(n / m) : this; }
  limit(n) { return this.mag() > n ? this.setMag(n) : this; }
  static sub(a, b) { return new Vector(a.x - b.x, a.y - b.y); }
  static random2D() { return new Vector(1, 0); }
}
function scene(w = 800, h = 600, globals = {}) {
  const context = vm.createContext({ createVector: (x, y) => new Vector(x, y),
    p5: { Vector }, random: (min, max) => min, width: w, height: h, ...globals });
  for (const file of ['vehicle.js', 'population.js', 'mouseTarget.js', 'settings.js', 'flee.js', 'ship.js', 'fleeControls.js', 'targetAcceleration.js', 'target.js']) {
    vm.runInContext(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), context);
  }
  const api = vm.runInContext('({ Vehicle, Ship, Target, MouseTarget, population: SeekPopulation, settings: VehicleSettings, flee: FleeBehavior, controls: FleeControls, acceleration: TargetAcceleration })', context);
  return { ...api, context };
}
const rng = () => 0.1;
const target = new Vector(400, 300);

test('Ship hérite de Vehicle et choisit Seek/Flee sans dupliquer la locomotion', () => {
  const { Ship, Vehicle, Target, population } = scene();
  const ship = new Ship(200, 300); const threat = new Target(100, 300);
  assert.ok(ship instanceof Vehicle);
  assert.equal(Ship.prototype.update, Vehicle.prototype.update);
  assert.equal(Ship.prototype.show, Vehicle.prototype.show);
  assert.ok(ship.steering('seek', [threat]).x < 0);
  assert.ok(ship.steering('flee', [threat]).x > 0);
  assert.ok(ship.steering('flee-many', [threat]).x > 0);
  population.step(ship, threat.pos, 800, 600, rng,
    agent => agent.steering('flee', [threat]), false);
  assert.ok(ship.pos.x > 200); assert.equal(ship.acc.mag(), 0);
  threat.detectionRadius = 50; assert.equal(ship.steering('flee', [threat]).mag(), 0);
});

test('Flee réel : réglages HTML permettent de distancer une cible mobile à 6 px/image', () => {
  const { Ship, Target, population, settings, flee } = scene(10000, 10000);
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const defaultValue = id => Number(html.match(new RegExp(`<input[^>]*id="${id}"[^>]*value="([^"]+)"`))[1]);
  const threat = new Target(0, 500); threat.vel.set(threat.maxSpeed, 0);
  const ship = new Ship(150, 500);
  settings.apply([ship], defaultValue('max-speed'), defaultValue('max-force'));
  flee.ensureMotion([ship], () => new Vector(1, 0));
  assert.ok(flee.desiredSpeed(ship, 300) >= threat.maxSpeed);
  for (let frame = 0; frame < 120; frame++) {
    threat.update();
    population.step(ship, threat.pos, 10000, 10000, rng,
      agent => agent.steering('flee', [threat]), false);
    assert.ok(ship.pos.x - threat.pos.x >= 150, 'La cible rattrape le vaisseau');
    assert.ok(ship.vel.mag() <= ship.maxSpeed + 1e-12);
  }
  assert.ok(ship.pos.x - threat.pos.x >= 300);
});

test('cible : accélération automatique bornée, direction et locomotion conservées', () => {
  const { Target, acceleration } = scene();
  const t = new Target(100, 100); t.vel.set(0, 1);
  const position = [t.pos.x, t.pos.y];
  const force = acceleration.calculate(t);
  assert.equal(force.x, 0); assert.ok(force.y > 0);
  assert.ok(force.mag() <= t.maxForce + 1e-12);
  assert.deepEqual([t.pos.x, t.pos.y, t.vel.x, t.vel.y], [...position, 0, 1]);
  t.update();
  assert.equal(t.vel.x, 0); assert.ok(Math.abs(t.vel.y - 1.1) < 1e-12);
  assert.equal(t.pos.x, 100); assert.ok(Math.abs(t.pos.y - 101.1) < 1e-12);
  assert.equal(t.acc.mag(), 0);
  let previousSpeed = t.vel.mag();
  for (let frame = 0; frame < 100; frame++) {
    t.update();
    assert.ok(t.vel.mag() >= previousSpeed - 1e-12);
    assert.ok(t.vel.mag() <= t.maxSpeed + 1e-12);
    previousSpeed = t.vel.mag();
  }
  assert.equal(t.vel.mag(), 6); assert.equal(acceleration.calculate(t).mag(), 0);
  t.vel.set(0, 0); t.update(); assert.ok(t.vel.x > 0); assert.equal(t.vel.y, 0);
  t.vel.set(0, 0); t.maxForce = 0; t.update(); assert.equal(t.vel.mag(), 0);
  t.maxForce = 0.1; t.maxSpeed = 0; t.update(); assert.equal(t.vel.mag(), 0);
});

test('détection : 0 désactive la fuite même en superposition ; bornes HTML 0–300', () => {
  const { Vehicle, flee } = scene();
  const v = new Vehicle(0, 0);
  for (const pos of [new Vector(0, 0), new Vector(1, 0)]) {
    assert.equal(flee.calculate(v, pos, 0).mag(), 0);
    assert.equal(flee.calculateCombined(v, [{ pos, detectionRadius: 0 }]).mag(), 0);
  }
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const input = html.match(/<input[^>]*id="detection-radius"[^>]*>/)[0];
  assert.match(input, /min="0"/); assert.match(input, /max="300"/);
});

test('flee : sécurité 300 px, accélération progressive, superposition et plafonds', () => {
  const { Vehicle, flee, population } = scene();
  const v = new Vehicle(150, 0); v.maxSpeed = 8; v.maxForce = 10;
  assert.equal(flee.SAFETY_DISTANCE, 300);
  assert.deepEqual([600, 300, 150, 0].map(d => flee.desiredSpeed(v, d)), [4, 4, 6, 8]);
  v.vel.set(4, 0);
  assert.equal(flee.calculate(v, new Vector(0, 0)).x, 2);
  population.step(v, new Vector(0, 0), 800, 600, rng,
    (agent, goal) => flee.calculate(agent, goal), false);
  assert.equal(v.vel.mag(), 6); assert.equal(v.pos.x, 156); assert.equal(v.acc.mag(), 0);
  v.pos.set(0, 0); v.vel.set(0, 0);
  assert.equal(flee.calculate(v, new Vector(0, 0)).x, 8);
  v.maxForce = 0.1;
  assert.ok(flee.calculate(v, new Vector(0.001, 0)).mag() <= 0.1 + 1e-12);
  v.maxForce = 0; assert.equal(flee.calculate(v, new Vector(0, 0)).mag(), 0);
  v.maxSpeed = 0; v.maxForce = 1;
  assert.equal(flee.calculate(v, new Vector(0, 0)).mag(), 0);
});

test('flee : rayon inclusif et propre aux cibles, composition symétrique', () => {
  const { Vehicle, flee } = scene();
  const v = new Vehicle(0, 0); v.maxForce = 10;
  assert.ok(flee.calculate(v, new Vector(300, 0)).x < 0);
  assert.equal(flee.calculate(v, new Vector(300.001, 0)).mag(), 0);
  const t = { pos: new Vector(200, 0), detectionRadius: 100 };
  assert.equal(flee.calculateCombined(v, [t]).mag(), 0);
  t.detectionRadius = 200;
  assert.equal(flee.calculateCombined(v, [t]).x, -flee.desiredSpeed(v, 200));
  assert.equal(flee.calculateCombined(v, [new Vector(-100, 0), new Vector(100, 0)]).mag(), 0);
  assert.equal(flee.calculateCombined(v, []).mag(), 0);
  v.maxForce = 0.1;
  assert.ok(flee.calculateCombined(v, [t, { pos: new Vector(0, 100), detectionRadius: 300 }]).mag() <= 0.1 + 1e-12);
});

test('cibles : effectifs, rayon, états conservés, entrées invalides sans mutation', () => {
  const { Target, controls } = scene();
  const targets = [];
  const resize = (count, radius = 300) => controls.resizeTargets(targets, count, () => new Target(10, 20), radius);
  assert.equal(resize(1), '1 / 20');
  const first = targets[0]; first.vel.set(2, 3);
  resize(20, 300); assert.equal(targets.length, 20);
  assert.equal(targets[0], first); assert.equal(first.vel.y, 3);
  assert.ok(targets.every(t => t.detectionRadius === 300));
  assert.equal(controls.applyRadius(targets, 150), '150 px');
  assert.ok(targets.every(t => t.detectionRadius === 150));
  assert.equal(controls.applyRadius(targets, 0), '0 px');
  assert.ok(targets.every(t => t.detectionRadius === 0));
  resize(1); assert.equal(targets[0], first);
  for (const n of [0, 21, 1.5, NaN]) assert.throws(() => resize(n), { name: 'RangeError' });
  for (const radius of [-1, 301, NaN]) {
    assert.throws(() => resize(2, radius), { name: 'RangeError' });
    assert.throws(() => controls.applyRadius(targets, radius), { name: 'RangeError' });
    assert.equal(targets.length, 1); assert.equal(first.detectionRadius, 300);
  }
});

test('scène : curseurs Flee, nouvelles entités, modes et cercles cohérents', () => {
  const elements = {};
  const values = { 'vehicle-count': '20', 'target-count': '1', 'detection-radius': '300',
    'max-speed': '8', 'max-force': '0.5', 'behavior-mode': 'flee' };
  for (const [id, value] of Object.entries(values)) {
    elements[id] = { value, events: {}, addEventListener(name, fn) {
      (this.events[name] ??= []).push(fn);
    }, emit(name) { for (const fn of this.events[name] ?? []) fn(); } };
    elements[`${id}-value`] = {};
  }
  elements.controls = { offsetHeight: 100 }; elements['behavior-hint'] = {};
  const circles = [];
  const { context, Ship, Vehicle } = scene(800, 600, {
    document: { getElementById: id => elements[id] }, windowWidth: 800, windowHeight: 700,
    createCanvas: () => ({ parent() {} }), push() {}, pop() {}, noFill() {}, stroke() {},
    strokeWeight() {}, circle: (...args) => circles.push(args),
    drawAnimatedRadialGradient() {}, millis: () => 0,
  });
  vm.runInContext(readFileSync(new URL('../sketch.js', import.meta.url), 'utf8'), context);
  vm.runInContext('setup()', context);
  const state = () => vm.runInContext('({ vehicles, targets })', context);
  assert.equal(elements['target-count'].disabled, false);
  assert.ok(state().vehicles.every(v => v.vel.mag() > 0));
  assert.ok(state().vehicles.every(v => v instanceof Ship && v instanceof Vehicle));
  const originalVehicle = state().vehicles[0]; const originalTarget = state().targets[0];
  elements['detection-radius'].value = '150'; elements['detection-radius'].emit('input');
  elements['target-count'].value = '5'; elements['target-count'].emit('input');
  assert.equal(state().targets.length, 5); assert.equal(state().targets[0], originalTarget);
  assert.ok(state().targets.every(t => t.detectionRadius === 150));
  assert.equal(elements['detection-radius-value'].value, '150 px');
  elements['vehicle-count'].value = '30'; elements['vehicle-count'].emit('input');
  assert.equal(state().vehicles.length, 30); assert.equal(state().vehicles[0], originalVehicle);
  assert.ok(state().vehicles.every(v => v.maxSpeed === 8 && v.maxForce === 0.5 && v.vel.mag() > 0));
  vm.runInContext('drawFleeRadius(targets)', context);
  assert.deepEqual(circles.map(c => c[2]), [300, 300, 300, 300, 300, 600, 600, 600, 600, 600]);
  for (const mode of ['seek', 'flee-many', 'flee']) {
    elements['behavior-mode'].value = mode; elements['behavior-mode'].emit('change');
    assert.equal(state().vehicles.length, 30); assert.equal(state().targets.length, 5);
    assert.notEqual(elements['vehicle-count'].disabled, true);
    assert.equal(elements['target-count'].disabled, mode === 'seek');
    assert.equal(elements['detection-radius'].disabled, mode === 'seek');
  }
  elements['detection-radius'].value = '0'; elements['detection-radius'].emit('input');
  assert.ok(state().targets.every(t => t.detectionRadius === 0));
  assert.equal(elements['detection-radius-value'].value, '0 px');
  elements['target-count'].value = '1'; elements['target-count'].emit('input');
  assert.equal(state().targets.length, 1); assert.equal(state().targets[0], originalTarget);
  elements['detection-radius'].value = '300'; elements['detection-radius'].emit('input');
  for (const v of state().vehicles) v.show = () => {};
  for (const t of state().targets) t.show = () => {};
  originalVehicle.pos.set(originalTarget.pos.x + 150, originalTarget.pos.y);
  originalVehicle.vel.set(0, 0);
  const before = originalVehicle.pos.x;
  vm.runInContext('draw()', context);
  assert.ok(originalVehicle.pos.x > before, 'La boucle réelle draw doit appliquer Flee');
});

test('population : bornes, conservation des instances et valeurs invalides', () => {
  const { Vehicle, population: p } = scene();
  const vehicles = [];
  const resize = n => p.resize(vehicles, n, target, 800, 600, (x, y) => new Vehicle(x, y), rng);
  resize(20);
  const first = vehicles[0]; first.vel.set(2, 1);
  resize(35); assert.equal(vehicles.length, 35); assert.equal(vehicles[0], first);
  resize(8); assert.equal(vehicles.length, 8); assert.equal(first.vel.x, 2);
  resize(8); assert.equal(vehicles[0], first);
  resize(200); assert.equal(vehicles.length, 200);
  resize(1); assert.equal(vehicles.length, 1);
  for (const n of [0, 201, 1.5, NaN, '20']) assert.throws(() => resize(n), { name: 'RangeError' });
});

test('slider : input met à jour population et compteur sans change', () => {
  const { Vehicle, population: p } = scene();
  const events = {}; const slider = { value: '20', addEventListener: (name, fn) => events[name] = fn };
  const output = {}; const vehicles = [];
  p.bindSlider(slider, output, vehicles, target, () => ({ width: 800, height: 600 }),
    (x, y) => new Vehicle(x, y), rng);
  for (const count of [1, 57, 200, 8]) {
    slider.value = String(count); events.input();
    assert.equal(vehicles.length, count); assert.equal(output.value, `${count} / 200`);
  }
  assert.equal(events.change, undefined);
});

test('edges fourni : quatre seuils stricts, angles et vitesse conservée', () => {
  const { Vehicle } = scene();
  for (const [x, y, expectedX, expectedY] of [
    [817, 100, -16, 100], [-17, 100, 816, 100],
    [100, 617, 100, -16], [100, -17, 100, 616],
    [817, -17, -16, 616], [816, 616, 816, 616], [-16, -16, -16, -16],
  ]) {
    const v = new Vehicle(x, y); v.vel.set(2, -3); v.edges();
    assert.deepEqual([v.pos.x, v.pos.y], [expectedX, expectedY]);
    assert.deepEqual([v.vel.x, v.vel.y], [2, -3]);
  }
});

test('seek fourni : forces proches/lointaines limitées et cible intacte', () => {
  const { Vehicle } = scene();
  for (const position of [new Vector(0.001, 0), new Vector(800, 600), new Vector(0, 0)]) {
    const v = new Vehicle(0, 0); const original = [position.x, position.y];
    const force = v.seek(position);
    assert.ok(force.mag() <= v.maxForce + 1e-12);
    if (position.mag()) assert.ok(force.x > 0);
    assert.deepEqual([position.x, position.y], original);
    v.vel.set(100, 100); v.applyBehaviors(position); v.update();
    assert.ok(v.vel.mag() <= v.maxSpeed + 1e-12);
    assert.equal(v.acc.mag(), 0);
  }
});

test('arrivée : seuil inclusif, même instance et paramètres préservés', () => {
  const { Vehicle, population: p } = scene();
  const v = new Vehicle(416.01, 300);
  assert.equal(p.hasArrived(v, target), false);
  v.pos.x = 416; assert.equal(p.hasArrived(v, target), true);
  v.vel.set(3, 1); v.acc.set(1, 2);
  const parameters = [v.r, v.maxSpeed, v.maxForce];
  p.step(v, target, 800, 600, rng);
  assert.equal(v.vel.mag(), 0); assert.equal(v.acc.mag(), 0);
  assert.ok(Math.hypot(v.pos.x - target.x, v.pos.y - target.y) > 20);
  assert.deepEqual([v.r, v.maxSpeed, v.maxForce], parameters);
});

test('arrivée avant/après déplacement, après wrap, et une seule réapparition', () => {
  const { Vehicle, population: p } = scene();
  const before = new Vehicle(400, 300);
  before.update = () => assert.fail('Pas de locomotion après une arrivée avant déplacement');
  let calls = 0;
  p.step(before, target, 800, 600, () => { calls++; return 0.1; });
  assert.equal(calls, 2);
  const after = new Vehicle(418, 300); after.vel.set(-4, 0);
  p.step(after, target, 800, 600, rng); assert.equal(after.vel.mag(), 0);
  const wrap = new Vehicle(815, 100); wrap.vel.set(4, 0);
  p.step(wrap, new Vector(0, 100), 800, 600, rng);
  assert.equal(wrap.vel.mag(), 0); assert.ok(wrap.pos.x >= 0);
});

test('tirage : marges, repli déterministe borné, petite géométrie impossible', () => {
  const { Vehicle, population: p } = scene();
  const point = p.spawnPosition(target, 800, 600, 16, rng);
  assert.ok(point.x >= 16 && point.x <= 784 && point.y >= 16 && point.y <= 584);
  let calls = 0;
  const fallback = p.spawnPosition(target, 800, 600, 16, () => { calls++; return 0.5; });
  assert.equal(calls, 64); assert.equal(fallback.x, 16); assert.equal(fallback.y, 16);
  assert.ok(p.spawnPosition(new Vector(20, 20), 40, 40, 16, () => 0.5));
  const smallTarget = new Vector(5, 5);
  assert.equal(p.spawnPosition(smallTarget, 10, 10, 16, rng), null);
  const v = new Vehicle(5, 5); v.vel.set(1, 2);
  assert.equal(p.respawn(v, smallTarget, 10, 10, rng), false);
  assert.deepEqual([v.pos.x, v.pos.y, v.vel.x, v.vel.y], [5, 5, 1, 2]);
  const vehicles = [];
  p.resize(vehicles, 200, smallTarget, 10, 10, (x, y) => new Vehicle(x, y), rng);
  assert.equal(vehicles.length, 200);
});

test('population : arrivées simultanées et véhicules supprimés non mis à jour', () => {
  const { Vehicle, population: p } = scene();
  const vehicles = [new Vehicle(400, 300), new Vehicle(400, 300)];
  for (const v of vehicles) p.step(v, target, 800, 600, rng);
  assert.equal(vehicles.length, 2);
  assert.ok(vehicles.every(v => !p.hasArrived(v, target)));
  const removed = vehicles[1]; removed.update = () => assert.fail('Véhicule supprimé');
  p.resize(vehicles, 1, target, 800, 600, () => assert.fail('Création inutile'));
  for (const v of vehicles) p.step(v, target, 800, 600, rng);
});

test('MouseTarget hérite de Vehicle et garde le rayon visuel attendu', () => {
  const { Vehicle, MouseTarget } = scene(); const t = new MouseTarget(50, 60);
  assert.ok(t instanceof Vehicle); assert.equal(t.r, 16); assert.equal(t.vel.mag(), 0);
});

test('Target circulaire : direction initiale, locomotion Vehicle et traversée du canvas', () => {
  const { Vehicle, Target } = scene();
  const target = new Target(850, 200);
  assert.ok(target instanceof Vehicle);
  assert.equal(target.r, 50);
  assert.equal(target.vel.x, 1);
  assert.equal(target.vel.y, 0);
  target.update();
  target.edges();
  assert.equal(target.pos.x, -target.r);
  target.pos.set(400, 650);
  target.vel.set(0, 6);
  target.update();
  target.edges();
  assert.equal(target.pos.y, -target.r);
});

test('curseurs : bornes et application immédiate aux véhicules', () => {
  const { Vehicle, settings } = scene();
  const vehicles = [new Vehicle(0, 0), new Vehicle(1, 1)];
  settings.apply(vehicles, 20, 10);
  assert.ok(vehicles.every(v => v.maxSpeed === 20 && v.maxForce === 10));
  settings.apply(vehicles, 0, 0);
  assert.ok(vehicles.every(v => v.maxSpeed === 0 && v.maxForce === 0));
  for (const [speed, force] of [[-0.1, 1], [20.1, 1], [1, -0.1], [1, 10.1], ['bad', 1]]) {
    assert.throws(() => settings.apply(vehicles, speed, force), { name: 'RangeError' });
  }
});

test('les curseurs ne modifient pas la cible ni le calcul de seek', () => {
  const { Vehicle, settings } = scene();
  const vehicle = new Vehicle(0, 0);
  const target = new Vector(100, 0);
  settings.apply([vehicle], 8, 2);
  const force = vehicle.seek(target);
  assert.equal(target.x, 100);
  assert.ok(force.mag() <= 2 + 1e-12);
  assert.equal(vehicle.maxSpeed, 8);
});

test('flee : force opposée, limitée et cible intacte', () => {
  const { Vehicle, flee } = scene();
  const vehicle = new Vehicle(10, 0);
  vehicle.maxSpeed = 8; vehicle.maxForce = 2; vehicle.vel.set(0, 1);
  const target = new Vector(0, 0);
  const force = flee.calculate(vehicle, target);
  assert.ok(force.x > 0);
  assert.ok(force.mag() <= vehicle.maxForce + 1e-12);
  assert.deepEqual([target.x, target.y], [0, 0]);
});

test('flee : cible éloignée, distance nulle et composition locomotrice', () => {
  const { Vehicle, flee } = scene();
  const vehicle = new Vehicle(0, 0); vehicle.vel.set(3, 0);
  assert.equal(flee.DETECTION_RADIUS, 300);
  const far = flee.calculate(vehicle, new Vector(1000, 0));
  assert.equal(far.mag(), 0);
  const near = flee.calculate(vehicle, new Vector(100, 0));
  assert.ok(near.mag() > 0);
  const overlap = flee.calculate(vehicle, new Vector(0, 0));
  assert.ok(Number.isFinite(overlap.x) && Number.isFinite(overlap.y));
  vehicle.applyForce(overlap); vehicle.update();
  assert.ok(vehicle.vel.mag() <= vehicle.maxSpeed + 1e-12);
});

test('flee combiné : plusieurs cibles, force résultante limitée', () => {
  const { Vehicle, flee } = scene();
  const vehicle = new Vehicle(0, 0); vehicle.maxSpeed = 8; vehicle.maxForce = 1;
  const targets = [new Vector(100, 0), new Vector(0, 100)];
  const force = flee.calculateCombined(vehicle, targets);
  assert.ok(force.x < 0 && force.y < 0);
  assert.ok(force.mag() <= vehicle.maxForce + 1e-12);
  assert.deepEqual([targets[0].x, targets[0].y, targets[1].x, targets[1].y], [100, 0, 0, 100]);
});

test('flee : les véhicules au repos reçoivent un mouvement initial hors rayon', () => {
  const { Vehicle, flee } = scene();
  const vehicles = [new Vehicle(0, 0), new Vehicle(10, 10)];
  flee.ensureMotion(vehicles, () => new Vector(1, 0));
  assert.ok(vehicles.every(vehicle => vehicle.vel.mag() > 0));
  assert.ok(vehicles.every(vehicle => vehicle.vel.mag() <= vehicle.maxSpeed));
  const stopped = new Vehicle(0, 0); stopped.maxSpeed = 0;
  flee.ensureMotion([stopped], () => new Vector(1, 0));
  assert.equal(stopped.vel.mag(), 0);
});
