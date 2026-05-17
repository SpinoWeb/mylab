<template>
  <div class="ifc-builder">
    <!-- ─── Header ─────────────────────────────────────────────────────── -->
    <header class="ifc-header">
      <div class="header-brand">
        <span class="brand-icon">⬡</span>
        <div>
          <h1>IFC Model Builder</h1>
          <p class="subtitle">Open BIM · IFC 2x3 / IFC 4 · Three.js Viewer</p>
        </div>
      </div>
      <div class="header-controls">
        <div class="viewer-tools" v-if="model">
          <button
            class="tool-btn"
            :class="{ active: viewMode === 'perspective' }"
            @click="setCamera('perspective')"
          >
            ⬛ 3D
          </button>
          <button
            class="tool-btn"
            :class="{ active: viewMode === 'top' }"
            @click="setCamera('top')"
          >
            ⬛ Top
          </button>
          <button
            class="tool-btn"
            :class="{ active: viewMode === 'front' }"
            @click="setCamera('front')"
          >
            ⬛ Front
          </button>
          <button
            class="tool-btn"
            :class="{ active: viewMode === 'side' }"
            @click="setCamera('side')"
          >
            ⬛ Side
          </button>
          <div class="tool-sep"></div>
          <button class="tool-btn" @click="fitAll">⊡ Fit</button>
          <button
            class="tool-btn"
            :class="{ active: snapEnabled }"
            @click="snapEnabled = !snapEnabled"
          >
            ⊞ Snap {{ snapEnabled ? "ON" : "OFF" }}
          </button>
          <button
            class="tool-btn"
            :class="{ active: placingMode }"
            @click="togglePlacing"
            :disabled="!model"
          >
            {{ placingMode ? "✕ Annulla" : "+ Posiziona" }}
          </button>
        </div>
        <div class="header-meta">
          <span class="status-dot" :class="{ active: model !== null }"></span>
          <span class="status-label">{{
            model ? "Modello attivo" : "Nessun modello"
          }}</span>
        </div>
      </div>
    </header>

    <div class="workspace">
      <!-- ─── Sidebar ──────────────────────────────────────────────────── -->
      <aside class="sidebar">
        <!-- 01 Crea Modello -->
        <section class="panel">
          <h2 class="panel-title">
            <span class="panel-icon">01</span> Crea Modello
          </h2>
          <div class="field">
            <label>Nome progetto</label>
            <input
              v-model="projectName"
              type="text"
              placeholder="Edificio Residenziale A"
            />
          </div>
          <div class="field">
            <label>Schema IFC</label>
            <select v-model="ifcSchema">
              <option value="IFC2X3">IFC 2x3</option>
              <option value="IFC4">IFC 4</option>
            </select>
          </div>
          <div class="field">
            <label>Organizzazione</label>
            <input
              v-model="organization"
              type="text"
              placeholder="Studio Tecnico XYZ"
            />
          </div>
          <button
            class="btn btn-primary"
            @click="createModel"
            :disabled="model !== null"
          >
            <span v-if="!model">Inizializza Modello</span>
            <span v-else>✓ Modello creato</span>
          </button>
        </section>

        <!-- 02 Aggiungi Elemento -->
        <section class="panel" :class="{ disabled: !model }">
          <h2 class="panel-title">
            <span class="panel-icon">02</span> Elemento BIM
          </h2>
          <div class="field">
            <label>Tipo IFC</label>
            <select v-model="newElement.type">
              <option v-for="t in elementTypes" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>Nome</label>
            <input
              v-model="newElement.name"
              type="text"
              :placeholder="newElement.type + '_001'"
            />
          </div>
          <div class="field">
            <label>Materiale</label>
            <input
              v-model="newElement.material"
              type="text"
              placeholder="C25/30 - Cls Armato"
            />
          </div>
          <div class="field-group-label">Posizione (m)</div>
          <div class="coords-grid">
            <div class="field">
              <label>X</label
              ><input v-model.number="newElement.x" type="number" step="0.5" />
            </div>
            <div class="field">
              <label>Y</label
              ><input v-model.number="newElement.y" type="number" step="0.5" />
            </div>
            <div class="field">
              <label>Z alt</label
              ><input v-model.number="newElement.z" type="number" step="0.5" />
            </div>
          </div>
          <div class="field-group-label">Dimensioni (m)</div>
          <div class="coords-grid">
            <div class="field">
              <label>L</label
              ><input
                v-model.number="newElement.length"
                type="number"
                step="0.1"
                min="0.1"
              />
            </div>
            <div class="field">
              <label>W</label
              ><input
                v-model.number="newElement.width"
                type="number"
                step="0.1"
                min="0.1"
              />
            </div>
            <div class="field">
              <label>H</label
              ><input
                v-model.number="newElement.height"
                type="number"
                step="0.1"
                min="0.1"
              />
            </div>
          </div>
          <div class="field">
            <label>Rotazione Y (°)</label>
            <input v-model.number="newElement.rotY" type="number" step="15" />
          </div>
          <button
            class="btn btn-accent"
            @click="addBimElement(null)"
            :disabled="!model"
          >
            + Aggiungi
          </button>
          <button
            class="btn btn-ghost"
            @click="togglePlacing"
            :disabled="!model"
            v-if="!placingMode"
          >
            ⊕ Posiziona nel viewer
          </button>
          <button
            class="btn btn-placing"
            @click="togglePlacing"
            v-if="placingMode"
          >
            ✕ Annulla posizionamento
          </button>
        </section>

        <!-- 03 Modifica selezionato -->
        <section
          class="panel"
          v-if="selectedIdx !== null && elements[selectedIdx]"
        >
          <h2 class="panel-title">
            <span class="panel-icon">03</span> Modifica
          </h2>
          <div class="selected-el-header">
            <div
              class="el-type-badge sm"
              :style="{ background: typeColor(elements[selectedIdx].type) }"
            >
              {{ elements[selectedIdx].type.replace("IFC", "") }}
            </div>
            <span class="sel-name">{{ elements[selectedIdx].name }}</span>
          </div>
          <div class="field-group-label">Posizione (m)</div>
          <div class="coords-grid">
            <div class="field">
              <label>X</label>
              <input
                type="number"
                step="0.5"
                :value="elements[selectedIdx].x"
                @change="
                  updateProp(selectedIdx, 'x', $event.target.valueAsNumber)
                "
              />
            </div>
            <div class="field">
              <label>Y</label>
              <input
                type="number"
                step="0.5"
                :value="elements[selectedIdx].y"
                @change="
                  updateProp(selectedIdx, 'y', $event.target.valueAsNumber)
                "
              />
            </div>
            <div class="field">
              <label>Z alt</label>
              <input
                type="number"
                step="0.5"
                :value="elements[selectedIdx].z"
                @change="
                  updateProp(selectedIdx, 'z', $event.target.valueAsNumber)
                "
              />
            </div>
          </div>
          <div class="field-group-label">Dimensioni (m)</div>
          <div class="coords-grid">
            <div class="field">
              <label>L</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                :value="elements[selectedIdx].length"
                @change="
                  updateProp(selectedIdx, 'length', $event.target.valueAsNumber)
                "
              />
            </div>
            <div class="field">
              <label>W</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                :value="elements[selectedIdx].width"
                @change="
                  updateProp(selectedIdx, 'width', $event.target.valueAsNumber)
                "
              />
            </div>
            <div class="field">
              <label>H</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                :value="elements[selectedIdx].height"
                @change="
                  updateProp(selectedIdx, 'height', $event.target.valueAsNumber)
                "
              />
            </div>
          </div>
          <div class="field">
            <label>Rotazione Y (°)</label>
            <input
              type="number"
              step="15"
              :value="elements[selectedIdx].rotY || 0"
              @change="
                updateProp(selectedIdx, 'rotY', $event.target.valueAsNumber)
              "
            />
          </div>
          <button class="btn btn-danger" @click="removeElement(selectedIdx)">
            ✕ Rimuovi
          </button>
        </section>

        <!-- 04 Esporta -->
        <section
          class="panel"
          :class="{ disabled: !model || elements.length === 0 }"
        >
          <h2 class="panel-title">
            <span class="panel-icon">04</span> Esporta
          </h2>
          <button
            class="btn btn-export"
            @click="exportIfc"
            :disabled="!model || elements.length === 0"
          >
            ↓ Scarica .ifc
          </button>
          <button
            class="btn btn-secondary"
            @click="copyToClipboard"
            :disabled="!model || elements.length === 0"
          >
            ⎘ Copia STEP
          </button>
        </section>
      </aside>

      <!-- ─── Main ──────────────────────────────────────────────────────── -->
      <main class="main-area">
        <!-- Welcome -->
        <div class="welcome-state" v-if="!model">
          <div class="welcome-graphic">
            <div class="cube c1"></div>
            <div class="cube c2"></div>
            <div class="cube c3"></div>
          </div>
          <h2>Costruisci il tuo modello IFC</h2>
          <p>
            Crea un modello nel pannello a sinistra, aggiungi elementi BIM e
            posizionali nel viewer 3D interattivo con drag orbit, pan e snap
            alla griglia.
          </p>
        </div>

        <!-- 3D Viewer -->
        <div class="viewer-wrap" v-show="model">
          <div class="viewer-overlay-info placing-banner" v-if="placingMode">
            <span class="blink">●</span>
            Clicca sulla griglia per posizionare
            <strong>{{ newElement.type }}</strong> — <kbd>ESC</kbd> per
            annullare
          </div>
          <div class="viewer-hud" v-if="hoverCoord">
            X {{ hoverCoord.x.toFixed(1) }} · Y {{ hoverCoord.y.toFixed(1) }} ·
            Z {{ hoverCoord.z.toFixed(1) }}
          </div>
          <div class="viewer-legend">
            <span>🖱 Drag sin = orbit</span>
            <span>🖱 Drag dx = pan</span>
            <span>🖱 Scroll = zoom</span>
            <span>Click = seleziona</span>
          </div>
          <canvas ref="canvasRef" class="three-canvas"></canvas>
        </div>

        <!-- Stats bar -->
        <div class="stats-bar" v-if="model">
          <div class="stat">
            <span class="stat-value">{{ elements.length }}</span
            ><span class="stat-label">Elementi</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ ifcSchema }}</span
            ><span class="stat-label">Schema</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ uniqueTypes }}</span
            ><span class="stat-label">Tipi IFC</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ lastEntityId }}</span
            ><span class="stat-label">Entità</span>
          </div>
        </div>

        <!-- Element list -->
        <div class="elements-section" v-if="model">
          <div class="elements-header">
            <h3>Elementi nel modello</h3>
            <span class="badge">{{ elements.length }}</span>
          </div>
          <div class="empty-state" v-if="elements.length === 0">
            <div class="empty-icon">◫</div>
            <p>
              Nessun elemento. Aggiungine uno oppure clicca "Posiziona nel
              viewer".
            </p>
          </div>
          <div class="element-list" v-else>
            <div
              v-for="(el, idx) in elements"
              :key="el.guid"
              class="element-card"
              :class="{ selected: selectedIdx === idx }"
              @click="selectElement(idx)"
            >
              <div
                class="el-type-badge"
                :style="{ background: typeColor(el.type) }"
              >
                {{ el.type.replace("IFC", "") }}
              </div>
              <div class="el-info">
                <div class="el-name">{{ el.name }}</div>
                <div class="el-meta">
                  {{ el.material }} · ({{ el.x }}, {{ el.y }}, {{ el.z }}) m ·
                  {{ el.length }}×{{ el.width }}×{{ el.height }}
                </div>
              </div>
              <button class="el-remove" @click.stop="removeElement(idx)">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- IFC STEP preview -->
        <div class="ifc-preview" v-if="model && elements.length > 0">
          <div class="preview-header">
            <span>Anteprima STEP / IFC</span>
            <span class="preview-lines">{{ ifcLines }} righe</span>
          </div>
          <pre class="ifc-code">{{ ifcPreview }}</pre>
        </div>

        <!-- Log -->
        <div class="log-panel" v-if="logs.length > 0">
          <div class="log-header">Log operazioni</div>
          <div class="log-entries">
            <div
              v-for="(log, i) in logs"
              :key="i"
              class="log-entry"
              :class="log.type"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-msg">{{ log.msg }}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, nextTick } from "vue";

// ──────────────────────────────────────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────────────────────────────────────
const projectName = ref("Progetto BIM");
const organization = ref("Studio Tecnico");
const ifcSchema = ref("IFC4");
const model = ref(null);
const elements = ref([]);
const logs = ref([]);
const selectedIdx = ref(null);
const placingMode = ref(false);
const snapEnabled = ref(true);
const viewMode = ref("perspective");
const hoverCoord = ref(null);
const canvasRef = ref(null);

const newElement = ref({
  type: "IFCBEAM",
  name: "",
  material: "Calcestruzzo C25/30",
  x: 0,
  y: 0,
  z: 0,
  length: 5,
  width: 0.3,
  height: 0.5,
  rotY: 0,
});

const elementTypes = [
  { value: "IFCBEAM", label: "IfcBeam — Trave" },
  { value: "IFCCOLUMN", label: "IfcColumn — Pilastro" },
  { value: "IFCSLAB", label: "IfcSlab — Solaio" },
  { value: "IFCWALL", label: "IfcWall — Parete" },
  { value: "IFCWALLSTANDARDCASE", label: "IfcWallStandardCase" },
  { value: "IFCDOOR", label: "IfcDoor — Porta" },
  { value: "IFCWINDOW", label: "IfcWindow — Finestra" },
  { value: "IFCROOF", label: "IfcRoof — Copertura" },
  { value: "IFCSTAIR", label: "IfcStair — Scala" },
  { value: "IFCFURNISHINGELEMENT", label: "IfcFurnishingElement" },
  { value: "IFCFOOTING", label: "IfcFooting — Fondazione" },
  { value: "IFCPILE", label: "IfcPile — Palo" },
];

// ──────────────────────────────────────────────────────────────────────────────
// COMPUTED
// ──────────────────────────────────────────────────────────────────────────────
const uniqueTypes = computed(
  () => new Set(elements.value.map((e) => e.type)).size,
);
const lastEntityId = computed(() => (model.value ? model.value.nextId - 1 : 0));
const ifcContent = computed(() => (model.value ? generateIfcFile() : ""));
const ifcPreview = computed(() => {
  const lines = ifcContent.value.split("\n");
  return lines.slice(0, 80).join("\n") + (lines.length > 80 ? "\n..." : "");
});
const ifcLines = computed(() => ifcContent.value.split("\n").length);

// ──────────────────────────────────────────────────────────────────────────────
// THREE.JS STATE (module-level, not reactive)
// ──────────────────────────────────────────────────────────────────────────────
let T = null; // THREE namespace
let renderer = null;
let scene = null;
let camera = null;
let raycaster, pointerVec;
let groundMesh;
let animId;

// Camera orbit state
let sph = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 30 };
let panTarget = null; // THREE.Vector3 — init after T loads
let orbitDown = false;
let panDown = false;
let lastMouse = { x: 0, y: 0 };
let clickMoved = false; // track if mouse moved during button press

// Map guid → mesh
const meshMap = new Map();

// Type colors (hex numbers)
const TYPE_HEX = {
  IFCBEAM: 0x2563eb,
  IFCCOLUMN: 0x16a34a,
  IFCSLAB: 0xca8a04,
  IFCWALL: 0xdc2626,
  IFCWALLSTANDARDCASE: 0xdc2626,
  IFCDOOR: 0x9333ea,
  IFCWINDOW: 0x0891b2,
  IFCROOF: 0xea580c,
  IFCSTAIR: 0xdb2777,
  IFCFURNISHINGELEMENT: 0x65a30d,
  IFCFOOTING: 0x57534e,
  IFCPILE: 0x78716c,
};

// ──────────────────────────────────────────────────────────────────────────────
// THREE.JS INIT
// ──────────────────────────────────────────────────────────────────────────────

async function initThree() {
  if (!canvasRef.value) return;

  // Load Three.js from CDN if not available
  if (typeof window.THREE !== "undefined") {
    T = window.THREE;
  } else {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
    T = window.THREE;
  }

  panTarget = new T.Vector3(0, 0, 0);
  pointerVec = new T.Vector2();

  const canvas = canvasRef.value;
  const W = canvas.clientWidth || 800;
  const H = canvas.clientHeight || 420;

  // Renderer
  renderer = new T.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;

  // Scene
  scene = new T.Scene();
  scene.background = new T.Color(0x080a0f);
  scene.fog = new T.FogExp2(0x080a0f, 0.008);

  // Camera
  camera = new T.PerspectiveCamera(45, W / H, 0.1, 500);
  _applyCameraFromSph();

  // Lights
  scene.add(new T.AmbientLight(0x334466, 0.8));
  const sun = new T.DirectionalLight(0xffffff, 1.4);
  sun.position.set(25, 50, 25);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, {
    left: -60,
    right: 60,
    top: 60,
    bottom: -60,
    near: 0.5,
    far: 200,
  });
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);
  const fill = new T.DirectionalLight(0x6688ff, 0.4);
  fill.position.set(-15, 15, -15);
  scene.add(fill);

  // Grid
  const grid = new T.GridHelper(100, 100, 0x00d4ff, 0x1a1e2a);
  grid.material.opacity = 0.5;
  grid.material.transparent = true;
  scene.add(grid);

  // Axes
  scene.add(new T.AxesHelper(4));

  // Invisible ground plane for raycasting
  groundMesh = new T.Mesh(
    new T.PlaneGeometry(300, 300),
    new T.MeshBasicMaterial({ visible: false, side: T.DoubleSide }),
  );
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.name = "__ground__";
  scene.add(groundMesh);

  raycaster = new T.Raycaster();

  // Rebuild meshes for any pre-existing elements
  for (const el of elements.value) addMeshForElement(el);

  // Events
  canvas.addEventListener("mousedown", _onMouseDown);
  canvas.addEventListener("mousemove", _onMouseMove);
  canvas.addEventListener("mouseup", _onMouseUp);
  canvas.addEventListener("wheel", _onWheel, { passive: false });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  window.addEventListener("keydown", _onKeyDown);
  window.addEventListener("resize", _onResize);

  _renderLoop();
}

function _renderLoop() {
  animId = requestAnimationFrame(_renderLoop);
  renderer.render(scene, camera);
}

function _onResize() {
  if (!canvasRef.value || !renderer) return;
  const W = canvasRef.value.clientWidth;
  const H = canvasRef.value.clientHeight;
  renderer.setSize(W, H);
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
}

// ──────────────────────────────────────────────────────────────────────────────
// MOUSE / INPUT
// ──────────────────────────────────────────────────────────────────────────────

function _onMouseDown(e) {
  clickMoved = false;
  lastMouse = { x: e.clientX, y: e.clientY };
  if (e.button === 0) orbitDown = true;
  if (e.button === 2 || e.button === 1) {
    panDown = true;
    e.preventDefault();
  }
}

function _onMouseMove(e) {
  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;
  if (Math.abs(dx) + Math.abs(dy) > 3) clickMoved = true;

  if (orbitDown && !placingMode.value) {
    sph.theta -= dx * 0.008;
    sph.phi = Math.max(
      0.05,
      Math.min(Math.PI / 2 - 0.04, sph.phi - dy * 0.008),
    );
    _applyCameraFromSph();
  }
  if (panDown) {
    const right = new T.Vector3();
    right
      .crossVectors(camera.getWorldDirection(new T.Vector3()), camera.up)
      .normalize();
    panTarget.addScaledVector(right, -dx * 0.04);
    panTarget.addScaledVector(camera.up, dy * 0.04);
    _applyCameraFromSph();
  }

  lastMouse = { x: e.clientX, y: e.clientY };

  // Update pointer for hover coords / raycasting
  if (!canvasRef.value) return;
  const rect = canvasRef.value.getBoundingClientRect();
  pointerVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointerVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  _updateHoverCoord();
}

function _onMouseUp(e) {
  if (e.button === 0) {
    if (!clickMoved) {
      // Real click
      if (placingMode.value) _handlePlaceClick();
      else _handleSelectClick();
    }
    orbitDown = false;
  }
  if (e.button === 2 || e.button === 1) panDown = false;
}

function _onWheel(e) {
  e.preventDefault();
  sph.radius = Math.max(2, Math.min(150, sph.radius + e.deltaY * 0.05));
  _applyCameraFromSph();
}

function _onKeyDown(e) {
  if (e.key === "Escape") placingMode.value = false;
  if (
    (e.key === "Delete" || e.key === "Backspace") &&
    selectedIdx.value !== null
  ) {
    removeElement(selectedIdx.value);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// CAMERA
// ──────────────────────────────────────────────────────────────────────────────

function _applyCameraFromSph() {
  if (!camera || !T) return;
  const { theta, phi, radius } = sph;
  camera.position.set(
    panTarget.x + radius * Math.sin(phi) * Math.sin(theta),
    panTarget.y + radius * Math.cos(phi),
    panTarget.z + radius * Math.sin(phi) * Math.cos(theta),
  );
  camera.lookAt(panTarget);
}

function setCamera(mode) {
  viewMode.value = mode;
  if (mode === "perspective")
    sph = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 30 };
  if (mode === "top") sph = { theta: 0, phi: 0.01, radius: 40 };
  if (mode === "front")
    sph = { theta: Math.PI, phi: Math.PI / 2 - 0.01, radius: 30 };
  if (mode === "side")
    sph = { theta: Math.PI / 2, phi: Math.PI / 2 - 0.01, radius: 30 };
  _applyCameraFromSph();
}

function fitAll() {
  if (elements.value.length === 0) {
    setCamera("perspective");
    return;
  }
  let minX = Infinity,
    maxX = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;
  for (const el of elements.value) {
    minX = Math.min(minX, el.x);
    maxX = Math.max(maxX, el.x + el.length);
    minZ = Math.min(minZ, el.y);
    maxZ = Math.max(maxZ, el.y + el.width);
  }
  if (T) panTarget.set((minX + maxX) / 2, 0, (minZ + maxZ) / 2);
  sph.radius = Math.max(maxX - minX, maxZ - minZ, 5) * 2;
  _applyCameraFromSph();
}

// ──────────────────────────────────────────────────────────────────────────────
// RAYCAST HELPERS
// ──────────────────────────────────────────────────────────────────────────────

function _getGroundHit() {
  if (!raycaster || !camera || !groundMesh) return null;
  raycaster.setFromCamera(pointerVec, camera);
  const hits = raycaster.intersectObject(groundMesh);
  return hits.length > 0 ? hits[0].point : null;
}

function _snap(v) {
  return snapEnabled.value ? Math.round(v * 2) / 2 : v;
}

function _updateHoverCoord() {
  if (!model.value) {
    hoverCoord.value = null;
    return;
  }
  const p = _getGroundHit();
  if (p) {
    hoverCoord.value = {
      x: parseFloat(_snap(p.x).toFixed(2)),
      y: newElement.value.z,
      z: parseFloat(_snap(p.z).toFixed(2)),
    };
  } else {
    hoverCoord.value = null;
  }
}

function _handlePlaceClick() {
  const p = _getGroundHit();
  if (!p) return;
  addBimElement({
    ...newElement.value,
    x: parseFloat(_snap(p.x).toFixed(2)),
    y: parseFloat(_snap(p.z).toFixed(2)),
  });
}

function _handleSelectClick() {
  if (!raycaster || !camera) return;
  raycaster.setFromCamera(pointerVec, camera);
  const meshes = Array.from(meshMap.values());
  const hits = raycaster.intersectObjects(meshes, true);
  if (hits.length > 0) {
    // walk up to find a mesh with guid
    let obj = hits[0].object;
    while (obj && !obj.userData.guid) obj = obj.parent;
    if (obj && obj.userData.guid) {
      const idx = elements.value.findIndex((e) => e.guid === obj.userData.guid);
      selectElement(idx);
      return;
    }
  }
  selectElement(null);
}

// ──────────────────────────────────────────────────────────────────────────────
// MESH MANAGEMENT
// ──────────────────────────────────────────────────────────────────────────────

function addMeshForElement(el) {
  if (!T || !scene) return;

  // BoxGeometry: length(X) × height(Y) × width(Z) in THREE space
  const geo = new T.BoxGeometry(el.length, el.height, el.width);
  const col = TYPE_HEX[el.type] || 0x4b5563;
  const mat = new T.MeshPhongMaterial({
    color: col,
    transparent: true,
    opacity: 0.82,
    shininess: 80,
  });
  const mesh = new T.Mesh(geo, mat);

  // IFC coords: X=X, Y=depth(Y), Z=altitude(Z)
  // THREE coords: X=X, Y=altitude, Z=depth
  mesh.position.set(
    el.x + el.length / 2,
    el.z + el.height / 2,
    el.y + el.width / 2,
  );
  mesh.rotation.y = T.MathUtils.degToRad(el.rotY || 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.guid = el.guid;

  // Wireframe edge overlay
  const edges = new T.EdgesGeometry(geo);
  const lineMat = new T.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
  });
  mesh.add(new T.LineSegments(edges, lineMat));

  scene.add(mesh);
  meshMap.set(el.guid, mesh);
}

function removeMeshForElement(guid) {
  const m = meshMap.get(guid);
  if (!m) return;
  scene.remove(m);
  m.geometry.dispose();
  m.material.dispose();
  meshMap.delete(guid);
}

function updateMeshForElement(el) {
  removeMeshForElement(el.guid);
  addMeshForElement(el);
}

function _highlightMesh(guid, on) {
  const m = meshMap.get(guid);
  if (!m || !T) return;
  m.material.emissive = new T.Color(on ? 0x00d4ff : 0x000000);
  m.material.emissiveIntensity = on ? 0.45 : 0;
  m.material.opacity = on ? 1 : 0.82;
}

// ──────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ──────────────────────────────────────────────────────────────────────────────

function createModel() {
  model.value = {
    name: projectName.value || "Progetto BIM",
    organization: organization.value || "Organizzazione",
    schema: ifcSchema.value,
    createdAt: new Date().toISOString(),
    nextId: 1,
  };
  elements.value = [];
  selectedIdx.value = null;
  addLog(
    `Modello "${model.value.name}" creato (${ifcSchema.value})`,
    "success",
  );
  nextTick(() => {
    if (!renderer) initThree();
  });
}

/**
 * Aggiunge un elemento BIM al modello e al viewer 3D.
 * @param {Object|null} opts - se null usa il form; altrimenti è un oggetto con le proprietà dell'elemento
 */
function addBimElement(opts) {
  if (!model.value) {
    addLog("Nessun modello attivo", "error");
    return;
  }
  const src = opts || newElement.value;
  const el = {
    guid: generateGuid(),
    type: src.type,
    name:
      src.name ||
      `${src.type}_${String(elements.value.length + 1).padStart(3, "0")}`,
    material: src.material || "Non specificato",
    x: src.x ?? 0,
    y: src.y ?? 0,
    z: src.z ?? 0,
    length: Math.max(0.01, src.length ?? 5),
    width: Math.max(0.01, src.width ?? 0.3),
    height: Math.max(0.01, src.height ?? 0.5),
    rotY: src.rotY ?? 0,
  };
  elements.value.push(el);
  addMeshForElement(el);
  selectElement(elements.value.length - 1);
  addLog(
    `Aggiunto ${el.type}: "${el.name}" @ (${el.x}, ${el.y}, ${el.z})`,
    "success",
  );
  if (!opts) newElement.value.name = "";
}

function removeElement(idx) {
  if (idx === null || idx < 0 || idx >= elements.value.length) return;
  const el = elements.value[idx];
  removeMeshForElement(el.guid);
  elements.value.splice(idx, 1);
  if (selectedIdx.value === idx) selectedIdx.value = null;
  else if (selectedIdx.value > idx) selectedIdx.value--;
  addLog(`Rimosso "${el.name}"`, "warn");
}

function selectElement(idx) {
  if (selectedIdx.value !== null && elements.value[selectedIdx.value])
    _highlightMesh(elements.value[selectedIdx.value].guid, false);
  selectedIdx.value = idx;
  if (idx !== null && elements.value[idx])
    _highlightMesh(elements.value[idx].guid, true);
}

function updateProp(idx, prop, value) {
  if (idx === null || !elements.value[idx] || isNaN(value)) return;
  elements.value[idx][prop] = value;
  updateMeshForElement(elements.value[idx]);
  _highlightMesh(elements.value[idx].guid, true);
}

function togglePlacing() {
  placingMode.value = !placingMode.value;
}

// ──────────────────────────────────────────────────────────────────────────────
// EXPORT
// ──────────────────────────────────────────────────────────────────────────────

function exportIfc() {
  if (!model.value || elements.value.length === 0) return;
  const blob = new Blob([ifcContent.value], { type: "application/x-step" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${model.value.name.replace(/\s+/g, "_")}.ifc`;
  a.click();
  URL.revokeObjectURL(url);
  addLog(`File IFC esportato (${elements.value.length} elementi)`, "success");
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(ifcContent.value);
    addLog("STEP copiato", "success");
  } catch {
    addLog("Impossibile copiare", "error");
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// IFC GENERATION
// ──────────────────────────────────────────────────────────────────────────────

function generateGuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16).toUpperCase();
  });
}

function guidToIfc(g) {
  const hex = g.replace(/-/g, "");
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$";
  let r = "";
  for (let i = 0; i < 32; i += 6) {
    const c = parseInt(hex.substr(i, 6), 16);
    r +=
      chars[(c >> 30) & 63] +
      chars[(c >> 24) & 63] +
      chars[(c >> 18) & 63] +
      chars[(c >> 12) & 63] +
      chars[(c >> 6) & 63] +
      chars[c & 63];
  }
  return r.substring(0, 22);
}

function generateIfcFile() {
  const m = model.value;
  const ts = new Date().toISOString().split(".")[0];
  const e = [];
  let id = 1;
  const n = () => id++;

  const [idApp, idOrg, idPer, idPerOrg, idOH] = [n(), n(), n(), n(), n()];
  const [idU1, idU2, idU3, idU4, idUA] = [n(), n(), n(), n(), n()];
  const [idCO, idCD, idCA, idGC] = [n(), n(), n(), n()];
  const idPrj = n();
  const [idSO, idSA, idSP, idSite] = [n(), n(), n(), n()];
  const [idBO, idBA, idBP, idBldg] = [n(), n(), n(), n()];
  const [idStO, idStA, idStP, idStor] = [n(), n(), n(), n()];
  const [idAg1, idAg2, idAg3] = [n(), n(), n()];

  const push = (...lines) => e.push(...lines);

  push(
    `#${idApp}=IFCAPPLICATION(#${idOrg},'1.0','IFC Model Builder Vue3','IfcMBV3');`,
    `#${idOrg}=IFCORGANIZATION($,'${m.organization}',$,$,$);`,
    `#${idPer}=IFCPERSON($,'BIM','Author',$,$,$,$,$);`,
    `#${idPerOrg}=IFCPERSONANDORGANIZATION(#${idPer},#${idOrg},$);`,
    `#${idOH}=IFCOWNERHISTORY(#${idPerOrg},#${idApp},$,.ADDED.,$,$,$,${Math.floor(Date.now() / 1000)});`,
    `#${idU1}=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);`,
    `#${idU2}=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);`,
    `#${idU3}=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);`,
    `#${idU4}=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);`,
    `#${idUA}=IFCUNITASSIGNMENT((#${idU1},#${idU2},#${idU3},#${idU4}));`,
    `#${idCO}=IFCCARTESIANPOINT((0.,0.,0.));`,
    `#${idCD}=IFCDIRECTION((0.,1.,0.));`,
    `#${idCA}=IFCAXIS2PLACEMENT3D(#${idCO},$,$);`,
    `#${idGC}=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-05,#${idCA},#${idCD});`,
    `#${idPrj}=IFCPROJECT('${guidToIfc(generateGuid())}',#${idOH},'${m.name}',$,$,$,$,(#${idGC}),#${idUA});`,
    `#${idSO}=IFCCARTESIANPOINT((0.,0.,0.));`,
    `#${idSA}=IFCAXIS2PLACEMENT3D(#${idSO},$,$);`,
    `#${idSP}=IFCLOCALPLACEMENT($,#${idSA});`,
    `#${idSite}=IFCSITE('${guidToIfc(generateGuid())}',#${idOH},'Sito',$,$,#${idSP},$,$,.ELEMENT.,$,$,$,$,$);`,
    `#${idBO}=IFCCARTESIANPOINT((0.,0.,0.));`,
    `#${idBA}=IFCAXIS2PLACEMENT3D(#${idBO},$,$);`,
    `#${idBP}=IFCLOCALPLACEMENT(#${idSP},#${idBA});`,
    `#${idBldg}=IFCBUILDING('${guidToIfc(generateGuid())}',#${idOH},'${m.name}',$,$,#${idBP},$,$,.ELEMENT.,$,$,$);`,
    `#${idStO}=IFCCARTESIANPOINT((0.,0.,0.));`,
    `#${idStA}=IFCAXIS2PLACEMENT3D(#${idStO},$,$);`,
    `#${idStP}=IFCLOCALPLACEMENT(#${idBP},#${idStA});`,
    `#${idStor}=IFCBUILDINGSTOREY('${guidToIfc(generateGuid())}',#${idOH},'Piano Terra',$,$,#${idStP},$,$,.ELEMENT.,0.);`,
    `#${idAg1}=IFCRELAGGREGATES('${guidToIfc(generateGuid())}',#${idOH},$,$,#${idPrj},(#${idSite}));`,
    `#${idAg2}=IFCRELAGGREGATES('${guidToIfc(generateGuid())}',#${idOH},$,$,#${idSite},(#${idBldg}));`,
    `#${idAg3}=IFCRELAGGREGATES('${guidToIfc(generateGuid())}',#${idOH},$,$,#${idBldg},(#${idStor}));`,
  );

  const elIds = [];
  for (const el of elements.value) {
    const L = el.length * 1000,
      W = el.width * 1000,
      H = el.height * 1000;
    const X = el.x * 1000,
      Y = el.y * 1000,
      Z = el.z * 1000;
    const rad = ((el.rotY || 0) * Math.PI) / 180;
    const cR = Math.cos(rad).toFixed(6),
      sR = Math.sin(rad).toFixed(6);

    const [eO, eRD, eAx, eAP, eLP] = [n(), n(), n(), n(), n()];
    const [pO, pAx, pDef] = [n(), n(), n()];
    const [exDir, sO, sAx, solid] = [n(), n(), n(), n()];
    const [shRep, pds, mat, elId, ma] = [n(), n(), n(), n(), n()];

    push(
      `#${eO}=IFCCARTESIANPOINT((${X}.,${Y}.,${Z}.));`,
      `#${eRD}=IFCDIRECTION((${cR},0.,${sR}));`,
      `#${eAx}=IFCDIRECTION((0.,1.,0.));`,
      `#${eAP}=IFCAXIS2PLACEMENT3D(#${eO},#${eAx},#${eRD});`,
      `#${eLP}=IFCLOCALPLACEMENT(#${idStP},#${eAP});`,
      `#${pO}=IFCCARTESIANPOINT((0.,0.));`,
      `#${pAx}=IFCAXIS2PLACEMENT2D(#${pO},$);`,
      `#${pDef}=IFCRECTANGLEPROFILEDEF(.AREA.,$,#${pAx},${W}.,${H}.);`,
      `#${exDir}=IFCDIRECTION((0.,0.,1.));`,
      `#${sO}=IFCCARTESIANPOINT((0.,0.,0.));`,
      `#${sAx}=IFCAXIS2PLACEMENT3D(#${sO},$,$);`,
      `#${solid}=IFCEXTRUDEDAREASOLID(#${pDef},#${sAx},#${exDir},${L}.);`,
      `#${shRep}=IFCSHAPEREPRESENTATION(#${idGC},'Body','SweptSolid',(#${solid}));`,
      `#${pds}=IFCPRODUCTDEFINITIONSHAPE($,$,(#${shRep}));`,
      `#${mat}=IFCMATERIAL('${el.material}');`,
      `#${elId}=${el.type}('${guidToIfc(el.guid)}',#${idOH},'${el.name}',$,'${el.type}',#${eLP},#${pds},$);`,
      `#${ma}=IFCRELASSOCIATESMATERIAL('${guidToIfc(generateGuid())}',#${idOH},$,$,(#${elId}),#${mat});`,
    );
    elIds.push(elId);
  }

  if (elIds.length > 0) {
    const rc = n();
    push(
      `#${rc}=IFCRELCONTAINEDINSPATIALSTRUCTURE('${guidToIfc(generateGuid())}',#${idOH},'Elementi',$,(${elIds.map((i) => "#" + i).join(",")}),#${idStor});`,
    );
  }

  m.nextId = id;

  return [
    "ISO-10303-21;",
    "HEADER;",
    `FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');`,
    `FILE_NAME('${m.name}.ifc','${ts}',('BIM Author'),('${m.organization}'),'IFC Model Builder Vue3','1.0','');`,
    `FILE_SCHEMA(('${ifcSchema.value}'));`,
    "ENDSEC;",
    "",
    "DATA;",
    ...e,
    "ENDSEC;",
    "",
    "END-ISO-10303-21;",
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────────────────────────────────────

function typeColor(type) {
  const n = TYPE_HEX[type] || 0x4b5563;
  return `#${n.toString(16).padStart(6, "0")}`;
}

function addLog(msg, type = "info") {
  logs.value.unshift({
    msg,
    type,
    time: new Date().toLocaleTimeString("it-IT"),
  });
  if (logs.value.length > 20) logs.value.pop();
}

// ──────────────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ──────────────────────────────────────────────────────────────────────────────

onBeforeUnmount(() => {
  if (animId) cancelAnimationFrame(animId);
  if (renderer) renderer.dispose();
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.removeEventListener("mousedown", _onMouseDown);
    canvas.removeEventListener("mousemove", _onMouseMove);
    canvas.removeEventListener("mouseup", _onMouseUp);
    canvas.removeEventListener("wheel", _onWheel);
  }
  window.removeEventListener("keydown", _onKeyDown);
  window.removeEventListener("resize", _onResize);
});

defineExpose({
  createModel,
  addBimElement,
  removeElement,
  updateProp,
  exportIfc,
  model,
  elements,
  ifcContent,
});
</script>

<style scoped>
/* ─── Design tokens ──────────────────────────────────────────────────── */
.ifc-builder {
  --bg: #080a0f;
  --surface: #13161e;
  --border: #1c2030;
  --accent: #00d4ff;
  --green: #00ff9d;
  --text: #e2e8f0;
  --muted: #5e7191;
  --danger: #ff4d6d;
  --warn: #ffb800;

  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: "JetBrains Mono", "Fira Code", "Courier New", monospace;
  font-size: 13px;
  overflow: hidden;
}

/* ─── Header ──────────────────────────────────────────────────────────── */
.ifc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 18px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  gap: 12px;
}
.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.brand-icon {
  font-size: 24px;
  color: var(--accent);
}
.header-brand h1 {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.subtitle {
  margin: 0;
  font-size: 9px;
  color: var(--muted);
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.viewer-tools {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
}
.tool-btn {
  padding: 3px 9px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--muted);
  cursor: pointer;
  font-family: inherit;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.03em;
  transition: all 0.12s;
  white-space: nowrap;
}
.tool-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}
.tool-btn.active {
  background: #00d4ff18;
  border-color: var(--accent);
  color: var(--accent);
}
.tool-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.tool-sep {
  width: 1px;
  height: 16px;
  background: var(--border);
  margin: 0 3px;
}
.header-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--border);
  border: 1px solid var(--muted);
  transition: all 0.3s;
}
.status-dot.active {
  background: var(--green);
  border-color: var(--green);
  box-shadow: 0 0 8px #00ff9d88;
}
.status-label {
  font-size: 9px;
  color: var(--muted);
}

/* ─── Layout ─────────────────────────────────────────────────────────── */
.workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ─── Sidebar ────────────────────────────────────────────────────────── */
.sidebar {
  width: 258px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  overflow-y: auto;
}
.sidebar::-webkit-scrollbar {
  width: 3px;
}
.sidebar::-webkit-scrollbar-thumb {
  background: var(--border);
}

.panel {
  padding: 14px;
  border-bottom: 1px solid var(--border);
  transition: opacity 0.2s;
}
.panel.disabled {
  opacity: 0.3;
  pointer-events: none;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 12px 0;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #7a90b0;
}
.panel-icon {
  font-size: 8px;
  font-weight: 800;
  color: var(--accent);
  background: #00d4ff18;
  padding: 2px 5px;
  border-radius: 2px;
  letter-spacing: 0;
}

.field {
  margin-bottom: 7px;
}
.field label {
  display: block;
  font-size: 8px;
  color: var(--muted);
  margin-bottom: 3px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.field input,
.field select {
  width: 100%;
  box-sizing: border-box;
  background: #080a0f;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--text);
  padding: 5px 7px;
  font-family: inherit;
  font-size: 11px;
  transition: border 0.15s;
}
.field input:focus,
.field select:focus {
  outline: none;
  border-color: #00d4ff55;
}
.field select option {
  background: #080a0f;
}
.field-group-label {
  font-size: 8px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 9px 0 4px;
}
.coords-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
}

.btn {
  width: 100%;
  padding: 7px 10px;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all 0.12s;
  margin-top: 5px;
}
.btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.btn-primary {
  background: #00d4ff15;
  color: var(--accent);
  border: 1px solid #00d4ff44;
}
.btn-primary:hover:not(:disabled) {
  background: #00d4ff25;
}
.btn-accent {
  background: #00ff9d15;
  color: var(--green);
  border: 1px solid #00ff9d44;
}
.btn-accent:hover:not(:disabled) {
  background: #00ff9d25;
}
.btn-ghost {
  background: transparent;
  color: var(--muted);
  border: 1px dashed var(--border);
}
.btn-ghost:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}
.btn-placing {
  background: #ffb80015;
  color: var(--warn);
  border: 1px solid #ffb80044;
}
.btn-export {
  background: #2563eb15;
  color: #60a5fa;
  border: 1px solid #2563eb44;
}
.btn-export:hover:not(:disabled) {
  background: #2563eb25;
}
.btn-secondary {
  background: var(--border);
  color: #7a90b0;
  border: 1px solid #2a3348;
}
.btn-secondary:hover:not(:disabled) {
  background: #2a3348;
}
.btn-danger {
  background: #ff4d6d15;
  color: var(--danger);
  border: 1px solid #ff4d6d44;
}
.btn-danger:hover:not(:disabled) {
  background: #ff4d6d25;
}

.selected-el-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.sel-name {
  font-size: 10px;
  font-weight: 600;
  color: var(--text);
}
.el-type-badge.sm {
  padding: 2px 6px;
  font-size: 8px;
}

/* ─── Main ───────────────────────────────────────────────────────────── */
.main-area {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.main-area::-webkit-scrollbar {
  width: 3px;
}
.main-area::-webkit-scrollbar-thumb {
  background: var(--border);
}

/* ─── Viewer ─────────────────────────────────────────────────────────── */
.viewer-wrap {
  position: relative;
  height: 400px;
  background: #050709;
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}
.three-canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.viewer-overlay-info {
  position: absolute;
  z-index: 10;
  pointer-events: none;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffb80020;
  border: 1px solid #ffb80066;
  color: var(--warn);
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 10px;
  white-space: nowrap;
}
.viewer-hud {
  position: absolute;
  z-index: 10;
  bottom: 10px;
  left: 10px;
  pointer-events: none;
  background: #00000088;
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 3px 10px;
  border-radius: 3px;
  font-size: 9px;
}
.viewer-legend {
  position: absolute;
  z-index: 10;
  bottom: 10px;
  right: 10px;
  pointer-events: none;
  display: flex;
  gap: 8px;
  font-size: 8px;
  color: #3a4a60;
}

kbd {
  background: var(--border);
  border: 1px solid #2a3348;
  padding: 1px 5px;
  border-radius: 2px;
  font-family: inherit;
}
.blink {
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* ─── Stats ──────────────────────────────────────────────────────────── */
.stats-bar {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}
.stat {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 8px 10px;
  border-radius: 3px;
}
.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
  margin-bottom: 2px;
}
.stat-label {
  font-size: 8px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

/* ─── Element list ────────────────────────────────────────────────────── */
.elements-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.elements-header h3 {
  margin: 0;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7a90b0;
}
.badge {
  background: #00d4ff15;
  color: var(--accent);
  border: 1px solid #00d4ff33;
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 9px;
  font-weight: 700;
}
.empty-state {
  text-align: center;
  padding: 24px 16px;
  color: var(--muted);
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: 3px;
  font-size: 11px;
}
.empty-icon {
  font-size: 28px;
  margin-bottom: 8px;
  opacity: 0.4;
}
.element-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.element-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.1s;
}
.element-card:hover {
  border-color: #2a3348;
  background: #181c28;
}
.element-card.selected {
  border-color: #00d4ff55;
  background: #00d4ff08;
}
.el-type-badge {
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: white;
  flex-shrink: 0;
  min-width: 52px;
  text-align: center;
}
.el-info {
  flex: 1;
  min-width: 0;
}
.el-name {
  font-size: 10px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-meta {
  font-size: 8px;
  color: var(--muted);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-remove {
  background: none;
  border: none;
  color: #3a4a60;
  cursor: pointer;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
  transition: all 0.1s;
  flex-shrink: 0;
}
.el-remove:hover {
  background: #ff4d6d22;
  color: var(--danger);
}

/* ─── IFC Preview ────────────────────────────────────────────────────── */
.ifc-preview {
  background: #04060a;
  border: 1px solid var(--border);
  border-radius: 3px;
  overflow: hidden;
}
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--muted);
}
.preview-lines {
  color: var(--accent);
}
.ifc-code {
  padding: 10px;
  margin: 0;
  font-size: 8px;
  line-height: 1.6;
  color: var(--green);
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
  font-family: inherit;
}

/* ─── Welcome ────────────────────────────────────────────────────────── */
.welcome-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 50px 40px;
  color: #3a4a60;
}
.welcome-state h2 {
  color: #7a90b0;
  margin: 18px 0 10px;
  font-size: 17px;
}
.welcome-state p {
  max-width: 380px;
  line-height: 1.8;
  font-size: 11px;
}
.welcome-graphic {
  position: relative;
  width: 90px;
  height: 72px;
  margin: 0 auto;
}
.cube {
  position: absolute;
  width: 26px;
  height: 26px;
  border-radius: 3px;
  animation: float 3s ease-in-out infinite;
}
.c1 {
  top: 9px;
  left: 6px;
  background: #00d4ff18;
  border: 1px solid #00d4ff44;
  animation-delay: 0s;
}
.c2 {
  top: 0;
  left: 34px;
  background: #00ff9d18;
  border: 1px solid #00ff9d44;
  animation-delay: 0.5s;
}
.c3 {
  top: 18px;
  left: 60px;
  background: #2563eb18;
  border: 1px solid #2563eb44;
  animation-delay: 1s;
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-7px);
  }
}

/* ─── Log ────────────────────────────────────────────────────────────── */
.log-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 3px;
  overflow: hidden;
}
.log-header {
  padding: 5px 10px;
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--muted);
  border-bottom: 1px solid var(--border);
}
.log-entries {
  max-height: 100px;
  overflow-y: auto;
}
.log-entry {
  display: flex;
  gap: 8px;
  padding: 4px 10px;
  border-bottom: 1px solid #1c203055;
  font-size: 9px;
}
.log-time {
  color: #3a4a60;
  flex-shrink: 0;
}
.log-entry.success .log-msg {
  color: var(--green);
}
.log-entry.error .log-msg {
  color: var(--danger);
}
.log-entry.warn .log-msg {
  color: var(--warn);
}
.log-entry.info .log-msg {
  color: #7a90b0;
}
</style>
