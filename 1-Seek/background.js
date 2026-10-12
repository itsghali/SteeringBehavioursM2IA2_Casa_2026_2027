// Fond radial arc-en-ciel animé, indépendant du calcul de steering.
function drawAnimatedRadialGradient(time, w, h) {
  push();
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  const x = w / 2 + Math.sin(time * 0.00035) * w * 0.12;
  const y = h / 2 + Math.cos(time * 0.00027) * h * 0.12;
  const radius = Math.hypot(w, h);
  for (let i = 48; i >= 0; i--) {
    const amount = i / 48;
    const hue = (time * 0.035 + amount * 300) % 360;
    fill(hue, 82, 18 + (1 - amount) * 82, 100);
    circle(x, y, radius * amount * 2);
  }
  pop();
}
