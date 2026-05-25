export function initParticles() {
  const layer = document.querySelector("#particles-layer");
  if (!layer) return;

  layer.setAttribute("aria-hidden", "true");
  layer.replaceChildren();

  const particleCount = window.matchMedia("(max-width: 640px)").matches ? 14 : 26;

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle-node";
    particle.style.setProperty("--x", `${Math.random() * 100}%`);
    particle.style.setProperty("--y", `${Math.random() * 100}%`);
    particle.style.setProperty("--size", `${Math.random() * 3 + 2}px`);
    particle.style.setProperty("--delay", `${Math.random() * -12}s`);
    particle.style.setProperty("--duration", `${Math.random() * 8 + 12}s`);
    layer.append(particle);
  }
}
