/* ═══════════════════════════════════════════════════════
   BLOG PERSONAL — app.js
   Vanilla JS: router, clock, noise, counters, skills, posts
   ═══════════════════════════════════════════════════════ */

'use strict';

// ══════════════════════════════════
// BLOG POSTS DATA
// Para agregar un post: copia un objeto del array y edítalo.
// ══════════════════════════════════
const POSTS = {
  post1: {
    category: 'DevOps',
    title: 'Cómo monté mi servidor en casa con Proxmox',
    date: '14 Feb 2025',
    content: `
      <h1>Cómo monté mi servidor en casa con Proxmox</h1>
      <p><em>14 de Febrero 2025 — DevOps / Homelab</em></p>

      <p>Llevaba tiempo queriendo tener un homelab decente. Compré un mini PC con un i5-12400, 32GB de RAM y 
      un SSD NVMe de 1TB. El objetivo: virtualización, NAS y media server todo en una sola máquina.</p>

      <h2>¿Por qué Proxmox?</h2>
      <p>La alternativa era VMware ESXi (muerto comercialmente) o simplemente usar el host con Docker. 
      Elegí Proxmox porque es open source, tiene una UI web decente, soporta tanto VMs (KVM) como 
      contenedores (LXC), y la comunidad es enorme.</p>

      <h2>Instalación base</h2>
      <p>El proceso es straightforward: descargás el ISO de <code>proxmox.com</code>, lo flasheás en un USB con 
      Ventoy o Balena Etcher, bootear y seguir el wizard. La única decisión importante es la partición — 
      elegí ZFS en espejo con dos discos para redundancia básica.</p>

      <pre><code># Verificar la instalación post-boot
pvesm status
pvesh get /nodes/proxmox/status</code></pre>

      <h2>Las VMs que corro</h2>
      <ul>
        <li><strong>pfSense</strong> — router/firewall. 1 core, 512MB RAM. El cuello de botella es el hardware, no la VM.</li>
        <li><strong>TrueNAS Scale</strong> — NAS con ZFS, Plex, y backups automáticos a Backblaze B2.</li>
        <li><strong>Ubuntu Server</strong> — para servicios varios: Vaultwarden, Nextcloud, Gitea.</li>
        <li><strong>Jellyfin LXC</strong> — media server, usa hardware transcoding con Intel QuickSync.</li>
      </ul>

      <h2>Networking</h2>
      <p>La parte más complicada fue el networking. Proxmox crea un bridge virtual (<code>vmbr0</code>) al que 
      conectás las VMs. Para separar el tráfico del NAS del tráfico general usé VLANs a nivel de switch 
      (tengo un TP-Link TL-SG108E de $30 que soporta VLANs 802.1Q).</p>

      <h2>Conclusión</h2>
      <p>Tres meses después el setup corre sin problemas. El uptime está en 99.7% (sí, lo monitoreo con 
      Uptime Kuma). El consumo eléctrico ronda los 45W en idle — unos $6 USD al mes acá. 
      Totalmente vale la pena.</p>
    `
  },
  post2: {
    category: 'Python',
    title: 'Async Python: lo que nadie te explica bien',
    date: '02 Ene 2025',
    content: `
      <h1>Async Python: lo que nadie te explica bien</h1>
      <p><em>02 de Enero 2025 — Python / Backend</em></p>

      <p>Después de ver a varios devs luchar con asyncio — incluyéndome a mí por bastante tiempo — 
      decidí escribir la explicación que me hubiera gustado encontrar al principio.</p>

      <h2>El concepto core: concurrencia ≠ paralelismo</h2>
      <p>Python async es <strong>concurrente, no paralelo</strong>. Sigue siendo single-threaded. Lo que hace 
      el event loop es cambiar entre tareas cuando una está esperando I/O — no ejecutar dos cosas al mismo tiempo.</p>

      <pre><code>import asyncio

async def tarea_lenta():
    print("empezando tarea...")
    await asyncio.sleep(2)  # simula I/O
    print("tarea terminada")
    return 42

# Esto es correcto — esperamos el resultado
resultado = asyncio.run(tarea_lenta())</code></pre>

      <h2>El error más común</h2>
      <p>El código que "es async" pero en realidad bloquea el event loop:</p>

      <pre><code>import asyncio
import time

async def mal_ejemplo():
    time.sleep(2)  # BLOQUEA TODO. El event loop no puede hacer nada.
    return "resultado"

async def buen_ejemplo():
    await asyncio.sleep(2)  # cede control al event loop
    return "resultado"</code></pre>

      <p>Si usás <code>time.sleep</code>, <code>requests</code> o cualquier operación de I/O síncrona dentro de 
      una coroutine, literalmente estás bloqueando todo el programa. Usá <code>asyncio.sleep</code>, 
      <code>httpx</code> o <code>aiohttp</code> en su lugar.</p>

      <h2>¿Cuándo usar async?</h2>
      <p>Async brilla en workloads <strong>I/O-bound</strong>: APIs externas, base de datos, lectura de archivos. 
      Para workloads <strong>CPU-bound</strong> (procesamiento de imágenes, cálculos pesados), necesitás 
      multiprocessing — asyncio no te va a ayudar ahí.</p>

      <h2>La regla de oro</h2>
      <p>Si una función es <code>async def</code>, tenés que hacer <code>await</code> cuando la llamás. 
      Si no podés hacer await (porque estás en código síncrono), usá <code>asyncio.run()</code> como entry point. 
      Mezclar código sync y async es la fuente del 90% de los bugs raros.</p>
    `
  },
  post3: {
    category: 'JavaScript',
    title: 'Construí este blog sin frameworks y sobreviví',
    date: '10 Nov 2024',
    content: `
      <h1>Construí este blog sin frameworks y sobreviví</h1>
      <p><em>10 de Noviembre 2024 — JavaScript / Web</em></p>

      <p>La pregunta obligatoria cuando empecé este proyecto fue: ¿React, Next.js, Astro, Hugo? 
      Después de pensar un rato decidí: ninguno. HTML, CSS, y JS vanilla. Esta es la historia.</p>

      <h2>La justificación</h2>
      <p>Un blog personal no necesita un framework. Los requerimientos son simples:</p>
      <ul>
        <li>Mostrar texto e imágenes</li>
        <li>Navegar entre secciones</li>
        <li>Verse bien</li>
      </ul>
      <p>Para eso no necesito 300MB de <code>node_modules</code>, un proceso de build, ni hidratación del lado del cliente.</p>

      <h2>El router</h2>
      <p>La "app" usa hash routing — <code>window.location.hash</code> para saber qué sección mostrar. 
      No hay server-side rendering, no hay spa framework. Un event listener en <code>hashchange</code> 
      y <code>display: none/block</code> en los sections. Simple y funcional.</p>

      <pre><code>window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1) || 'about';
  showSection(hash);
});

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}</code></pre>

      <h2>Los posts como datos</h2>
      <p>Los posts son un objeto JS en <code>app.js</code>. Para agregar un nuevo post: edito el archivo, 
      hago commit. No hay CMS, no hay base de datos, no hay API. El contenido vive en el código. 
      Para un blog personal con actualizaciones esporádicas, es perfecto.</p>

      <h2>Lo que aprendí</h2>
      <p>El DOM vanilla es más potente de lo que recordaba. <code>querySelector</code>, <code>dataset</code>, 
      <code>classList</code>, <code>insertAdjacentHTML</code> — con estas cuatro cosas podés hacer casi todo. 
      No extraño React para este caso de uso.</p>
    `
  }
};


// ══════════════════════════════════
// DOM READY
// ══════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initNoise();
  initClock();
  initRouter();
  initPostReader();
  initCounters();
  initSkillBars();
});

// ══════════════════════════════════
// ROUTER — hash-based SPA
// ══════════════════════════════════
function initRouter() {
  const tabs  = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.section');

  function showSection(id) {
    const validIds = ['about','blog','projects','resume','now'];
    const targetId = validIds.includes(id) ? id : 'about';

    sections.forEach(s => s.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));

    const targetSection = document.getElementById(targetId);
    const targetTab = document.querySelector(`[data-section="${targetId}"]`);

    if (targetSection) targetSection.classList.add('active');
    if (targetTab)    targetTab.classList.add('active');

    // Trigger animations on enter
    if (targetId === 'resume')  setTimeout(animateSkillBars, 100);
    if (targetId === 'about')   setTimeout(animateCounters, 100);
    if (targetId !== 'blog')    closeReader();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Click handler
  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      const section = tab.dataset.section;
      history.pushState(null, '', `#${section}`);
      showSection(section);
    });
  });

  // Hash change (back/forward)
  window.addEventListener('popstate', () => {
    const hash = location.hash.replace('#', '') || 'about';
    showSection(hash);
  });

  // Initial load
  const initHash = location.hash.replace('#', '') || 'about';
  showSection(initHash);
}

// ══════════════════════════════════
// BLOG POST READER
// ══════════════════════════════════
function initPostReader() {
  // Read more buttons
  document.addEventListener('click', e => {
    const btn = e.target.closest('.read-more-btn');
    if (btn) openPost(btn.dataset.post);
  });

  // Close button
  document.getElementById('close-reader')?.addEventListener('click', closeReader);
}

function openPost(postId) {
  const post = POSTS[postId];
  if (!post) return;

  const reader = document.getElementById('post-reader');
  const body   = document.getElementById('reader-body');
  const cat    = document.getElementById('reader-category');

  if (!reader || !body) return;

  cat.textContent = post.category;
  body.innerHTML  = post.content;
  reader.style.display = 'block';

  // Smooth reveal
  reader.style.opacity = '0';
  reader.style.transform = 'translateY(12px)';
  reader.offsetHeight; // force reflow
  reader.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  reader.style.opacity = '1';
  reader.style.transform = 'translateY(0)';

  reader.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeReader() {
  const reader = document.getElementById('post-reader');
  if (reader) reader.style.display = 'none';
}

// ══════════════════════════════════
// CLOCK
// ══════════════════════════════════
function initClock() {
  const el = document.getElementById('clock');
  if (!el) return;

  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }

  tick();
  setInterval(tick, 1000);
}

// ══════════════════════════════════
// COUNTERS (about section stats)
// ══════════════════════════════════
function initCounters() {
  animateCounters();
}

function animateCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    let current = 0;
    const duration = 1200;
    const step = target / (duration / 16);

    el.textContent = '0';

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current);
    }, 16);
  });
}

// ══════════════════════════════════
// SKILL BARS
// ══════════════════════════════════
function initSkillBars() {
  // Set widths to 0 initially
  document.querySelectorAll('.skill-bar').forEach(bar => {
    const fill = bar.querySelector('.skill-fill');
    if (fill) fill.style.width = '0%';
  });
}

function animateSkillBars() {
  document.querySelectorAll('.skill-bar').forEach(bar => {
    const pct  = parseInt(bar.dataset.pct, 10);
    const fill = bar.querySelector('.skill-fill');
    if (fill && pct) {
      fill.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fill.style.width = `${pct}%`;
        });
      });
    }
  });
}

// ══════════════════════════════════
// CRT NOISE (canvas effect)
// ══════════════════════════════════
function initNoise() {
  const canvas = document.getElementById('noise-canvas');
  if (!canvas) return;

  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9998';

  const ctx = canvas.getContext('2d');
  let frame;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawNoise() {
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      data[i]     = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 12; // very subtle
    }

    ctx.putImageData(imageData, 0, 0);
    frame = requestAnimationFrame(drawNoise);
  }

  window.addEventListener('resize', () => {
    resize();
  });

  resize();
  drawNoise();
}

// ══════════════════════════════════
// EASTER EGG — Konami code
// ══════════════════════════════════
(function() {
  const KONAMI = [38,38,40,40,37,39,37,39,66,65];
  let idx = 0;

  document.addEventListener('keydown', e => {
    if (e.keyCode === KONAMI[idx]) {
      idx++;
      if (idx === KONAMI.length) {
        idx = 0;
        activateEasterEgg();
      }
    } else {
      idx = 0;
    }
  });

  function activateEasterEgg() {
    const msg = document.createElement('div');
    msg.innerHTML = `
      <div style="
        position:fixed; inset:0; background:rgba(0,0,0,0.85);
        display:flex; align-items:center; justify-content:center;
        z-index:99999; cursor:pointer;
      " onclick="this.remove()">
        <div style="
          text-align:center; font-family:'VT323',monospace;
          color:#00d4ff; font-size:48px;
          text-shadow: 0 0 30px #00d4ff, 0 0 60px #1a6fff;
          animation: pulse 1s ease-in-out infinite;
        ">
          ↑ ↑ ↓ ↓ ← → ← → B A<br>
          <span style="font-size:28px; color:#a8b8cc;">
            Achievement unlocked: Gamer Dev 🎮<br>
            <span style="font-size:18px;">[click para cerrar]</span>
          </span>
        </div>
      </div>
    `;
    document.body.appendChild(msg);
  }
})();
