/* AETHER Habitat Comfort â€” interactive behaviors */

document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  initParallax();
  initDiagram();
  initDashboard();
  initExploreButton();
  initNavHighlight();
  initSceneReveal();
});

function initSceneReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".scene").forEach(s => s.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".scene").forEach(s => observer.observe(s));
}

/* ---------- Ambient particle canvas ---------- */
function initParticles() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.getElementById("ambient-particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(60, Math.floor((w * h) / 22000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.2 + 0.6,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.4 + 0.15,
        warm: Math.random() > 0.4
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.warm
        ? `hsla(40, 100%, 65%, ${p.alpha})`
        : `hsla(195, 100%, 70%, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });
}

/* ---------- Parallax on scroll ---------- */
function initParallax() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const earth = document.querySelector(".earth");
  const craft = document.querySelector(".spacecraft-orbit");
  if (!earth) return;

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    earth.style.transform = `translateY(${y * 0.12}px)`;
    if (craft && y < window.innerHeight) {
      craft.style.opacity = Math.max(0, 1 - y / (window.innerHeight * 0.6));
    }
  }, { passive: true });
}

/* ---------- Interactive heat diagram ---------- */
const diagramData = {
  sources: {
    title: "Heat Sources",
    text: "Crew metabolic heat (~100 W per person at rest), electronics, lights, pumps, and experiment racks all produce waste heat. Solar energy is also absorbed by external surfaces when the habitat faces the Sun."
  },
  water: {
    title: "Internal Water Loop (IATCS)",
    text: "Purified water circulates inside the pressurized modules through cold plates and air-to-water heat exchangers. It collects heat from equipment and cabin air. Water is used inside because it is safer if a small leak occurs."
  },
  ammonia: {
    title: "External Ammonia Loop (EATCS)",
    text: "Heat is transferred from the internal water to anhydrous ammonia through Interface Heat Exchangers. The ammonia stays entirely outside the living volume and carries the heat along the truss to the radiators."
  },
  radiators: {
    title: "Radiators",
    text: "Large rotating radiator wings reject heat as infrared radiation into space. The ISS External Active Thermal Control System can reject up to about 70 kW. The radiators are pointed away from the Sun for best performance."
  },
  cabin: {
    title: "Cabin Air & Comfort",
    text: "Fans circulate air so temperature and humidity stay even. The system keeps the cabin in a comfortable range of roughly 18â€“27 Â°C so the crew can work and rest safely."
  }
};

function initDiagram() {
  const nodes = document.querySelectorAll(".node");
  const panel = document.getElementById("diagram-info");
  if (!nodes.length || !panel) return;

  nodes.forEach(node => {
    node.addEventListener("click", () => {
      nodes.forEach(n => n.classList.remove("active"));
      node.classList.add("active");
      const key = node.dataset.info;
      const data = diagramData[key];
      if (data) {
        panel.innerHTML = `<h3>${data.title}</h3><p>${data.text}</p>`;
      }
    });

    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        node.click();
      }
    });
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "button");
  });
}

/* ---------- Dashboard subtle live variation ---------- */
function initDashboard() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const gauges = document.querySelectorAll(".gauge");
  gauges.forEach(g => {
    const base = parseFloat(g.dataset.value);
    const valueEl = g.querySelector(".gauge-value");
    if (!valueEl) return;

    setInterval(() => {
      const variation = (Math.random() - 0.5) * (base * 0.03);
      let next = base + variation;
      if (g.classList.contains("airflow")) next = Math.max(0.08, Math.min(0.18, next));
      else if (g.classList.contains("cooling")) next = Math.max(75, Math.min(95, next));
      else next = Math.max(base * 0.96, Math.min(base * 1.04, next));

      const display = next >= 10 ? next.toFixed(1) : next.toFixed(2);
      valueEl.childNodes[0].textContent = display;
    }, 3200 + Math.random() * 1800);
  });
}

/* ---------- Explore button ---------- */
function initExploreButton() {
  const btn = document.getElementById("explore-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    document.getElementById("heat-sources").scrollIntoView({ behavior: "smooth" });
  });
}

/* ---------- Active nav link ---------- */
function initNavHighlight() {
  const sections = document.querySelectorAll("main section[id]");
  const links = document.querySelectorAll(".main-nav a");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove("active"));
        const active = document.querySelector(`.main-nav a[href="#${entry.target.id}"]`);
        if (active) active.classList.add("active");
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
}
