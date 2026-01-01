// ============================================================================
// SVG BOAT
// ============================================================================


/* Comment: Put SVG files here (exported from Figma). */
const SVG_SOURCES = {
  desktop: "assets/svg/Main.svg",
  tablet: "assets/svg/Main-2.svg",
  mobile: "assets/svg/Main-1.svg",
};

/* Comment: Map SVG element IDs to content here when you’re ready. */
const HOTSPOTS = {
  // "thruster_left": { title: "Left thruster", text: "Vectoring + propulsion control..." },
};

// Modal targets for specific SVG IDs
const MODAL_TARGETS = {
  "canabas-maximus": {
    label: "Canabas Maximus",
  },
  "canabas-mini-1": {
    label: "Canabas Mini 1",
  },
  "canabas-mini-2": {
    label: "Canabas Mini 2",
  },
  "antenna-2-text-part": {
    label: "Antenna 2",
  },
};

const modalOverlay = document.getElementById("svgModalOverlay");
let modalListenersBound = false;
const svgStage = document.getElementById("svgStage");
const tooltip = document.getElementById("tooltip");
const panelTitle = document.getElementById("panelTitle");
const panelBody = document.getElementById("panelBody");
const panelClose = document.getElementById("panelClose");

// Performance: Cache bounding rect to avoid repeated DOM queries
let cachedContainerRect = null;

// Performance: Throttle function to limit execution rate
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Bind modals to any inline SVG already present before async loading kicks in.
const initialInlineSvg = svgStage.querySelector("svg");
if (initialInlineSvg) {
  setupSvgModals(initialInlineSvg);
}

function pickSvgSource() {
  // Comment: Choose the best SVG based on viewport width.
  const w = window.innerWidth;
  if (w <= 560) return SVG_SOURCES.mobile;
  if (w <= 980) return SVG_SOURCES.tablet;
  return SVG_SOURCES.desktop;
}

async function loadInlineSvg(url) {
  // Comment: Fetch SVG and inject as inline markup so we can bind events to inner nodes.
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load SVG: ${url}`);
  const svgText = await res.text();

  svgStage.innerHTML = svgText;

  const svg = svgStage.querySelector("svg");
  if (!svg) return;

  // Comment: Make SVG responsive inside the stage.
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  bindSvgInteractions(svg);
}

function bindSvgInteractions(svg) {
  // Comment: Minimal generic interaction. Real hotspots should be driven by IDs in HOTSPOTS.
  const candidates = svg.querySelectorAll("[id]");

  candidates.forEach((el) => {
    const id = el.getAttribute("id");
    if (!HOTSPOTS[id]) return;

    // Comment: Make element feel interactive.
    el.style.cursor = "pointer";

    el.addEventListener("mouseenter", () => {
      if (!tooltip) return;
      tooltip.textContent = HOTSPOTS[id].title;
      tooltip.hidden = false;
    });

    el.addEventListener("mouseleave", () => {
      if (!tooltip) return;
      tooltip.hidden = true;
    });

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (panelTitle && panelBody) {
        panelTitle.textContent = HOTSPOTS[id].title;
        panelBody.textContent = HOTSPOTS[id].text;
      }
    });
  });

  // Comment: Bind modal behavior to specific SVG groups.
  setupSvgModals(svg);

  svg.addEventListener("click", () => {
    // Comment: Click empty space to hide tooltip.
    if (tooltip) tooltip.hidden = true;
  });
}

function openModal(targetId) {
  if (!modalOverlay) return;
  const targetModal = modalOverlay.querySelector(`[data-modal-id="${targetId}"]`);
  if (!targetModal) return;

  modalOverlay.querySelectorAll(".svg-modal.is-visible").forEach((el) => {
    el.classList.remove("is-visible");
  });

  targetModal.classList.add("is-visible");
  modalOverlay.classList.add("is-visible");
  modalOverlay.setAttribute("aria-hidden", "false");
}

function hideModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove("is-visible");
  modalOverlay.setAttribute("aria-hidden", "true");
  modalOverlay.querySelectorAll(".svg-modal.is-visible").forEach((el) => {
    el.classList.remove("is-visible");
  });
}

function setupSvgModals(svg) {
  const targets = Object.keys(MODAL_TARGETS);

  targets.forEach((id) => {
    const el = svg.querySelector(`[id="${id}"]`);
    if (!el) return;

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(id);
    });
  });

  // Delegate in case child nodes within the target are clicked.
  svg.addEventListener("click", (e) => {
    const match = e.target.closest(
      "#canabas-maximus, #canabas-mini-1, #canabas-mini-2, #antenna-2-text-part"
    );
    if (!match || !svg.contains(match)) return;
    e.stopPropagation();
    openModal(match.id);
  });

  // One-time listeners for overlay controls.
  if (modalOverlay && !modalListenersBound) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) hideModal();
    });
    modalOverlay.querySelectorAll(".svg-modal-close").forEach((btn) => {
      btn.addEventListener("click", hideModal);
    });
    modalOverlay.querySelectorAll(".svg-modal-link").forEach((link) => {
      link.addEventListener("click", hideModal);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideModal();
    });
    modalListenersBound = true;
  }
}

function moveTooltipWithPointer(e) {
  // Comment: Keep tooltip near pointer, but inside the visual container.
  // Performance: Cache bounding rect to avoid expensive DOM queries
  if (!cachedContainerRect) {
    cachedContainerRect = svgStage.getBoundingClientRect();
  }
  const container = cachedContainerRect;
  const x = Math.min(container.width - 18, Math.max(12, e.clientX - container.left + 12));
  const y = Math.min(container.height - 18, Math.max(12, e.clientY - container.top + 12));

  // Performance: Use transform instead of left/top for GPU acceleration
  tooltip.style.transform = `translate(${x}px, ${y}px)`;
}

function setupNav() {
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (e) => {
    if (e.target.matches("a")) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function setupPanel() {
  if (!panelClose || !panelTitle || !panelBody) return;
  panelClose.addEventListener("click", () => {
    panelTitle.textContent = "System";
    panelBody.textContent = "Click a highlighted part to see details here.";
  });
}

let lastUrl = null;
async function render() {
  const url = pickSvgSource();
  if (url === lastUrl) return;
  lastUrl = url;

  try {
    await loadInlineSvg(url);
  } catch (err) {
    svgStage.innerHTML = `<div class="card">SVG failed to load. Check file paths in <code>SVG_SOURCES</code>.</div>`;
    console.error(err);
  }
}

// Performance: Throttle tooltip movement to ~60fps instead of 120-240fps
const throttledTooltipMove = throttle((e) => {
  if (tooltip && !tooltip.hidden) moveTooltipWithPointer(e);
}, 16);  // ~60fps max

document.addEventListener("pointermove", throttledTooltipMove);

// Performance: Invalidate cached container rect on window resize
window.addEventListener("resize", () => {
  cachedContainerRect = null;
});

setupNav();
setupPanel();
// render(); // Disabled: Using inline SVG from HTML instead of loading from assets/svg/


