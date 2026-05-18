<template>
  <div class="ifc-builder">

    <!-- ═══ HEADER ══════════════════════════════════════════════════════════ -->
    <header class="ifc-header">
      <div class="header-brand">
        <span class="brand-icon">⬡</span>
        <div>
          <h1>IFC Model Builder</h1>
          <p class="subtitle">Open BIM · IFC 4 · Node-based placement · Three.js</p>
        </div>
      </div>
      <div class="header-controls">
        <div class="viewer-tools" v-if="model">
          <button class="tool-btn" :class="{ active: viewMode==='perspective' }" @click="setCamera('perspective')">3D</button>
          <button class="tool-btn" :class="{ active: viewMode==='top' }"         @click="setCamera('top')">Top</button>
          <button class="tool-btn" :class="{ active: viewMode==='front' }"       @click="setCamera('front')">Front</button>
          <button class="tool-btn" :class="{ active: viewMode==='side' }"        @click="setCamera('side')">Side</button>
          <div class="tool-sep"></div>
          <button class="tool-btn" @click="fitAll">⊡ Fit</button>
          <button class="tool-btn" :class="{ active: snapEnabled }" @click="snapEnabled=!snapEnabled">
            ⊞ Snap {{ snapEnabled ? 'ON':'OFF' }}
          </button>
          <button class="tool-btn" :class="{ active: showNodes }" @click="showNodes=!showNodes">
            ◉ Nodi {{ showNodes ? 'ON':'OFF' }}
          </button>
          <button class="tool-btn" :class="{ active: placingMode }" @click="togglePlacing" :disabled="!model">
            {{ placingMode ? '✕ Annulla' : '+ Posiziona' }}
          </button>
        </div>
        <div class="header-meta">
          <span class="status-dot" :class="{ active: model !== null }"></span>
          <span class="status-label">{{ model ? 'Modello attivo' : 'Nessun modello' }}</span>
        </div>
      </div>
    </header>

    <div class="workspace">

      <!-- ═══ SIDEBAR ═════════════════════════════════════════════════════════ -->
      <aside class="sidebar">

        <!-- 01 Crea Modello -->
        <section class="panel">
          <h2 class="panel-title"><span class="panel-icon">01</span> Crea Modello</h2>
          <div class="field">
            <label>Nome progetto</label>
            <input v-model="projectName" type="text" placeholder="Edificio Residenziale A" />
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
            <input v-model="organization" type="text" placeholder="Studio Tecnico XYZ" />
          </div>
          <button class="btn btn-primary" @click="createModel" :disabled="model !== null">
            <span v-if="!model">Inizializza Modello</span>
            <span v-else>✓ Modello creato</span>
          </button>
        </section>

        <!-- 02 Nuovo Elemento -->
        <section class="panel" :class="{ disabled: !model }">
          <h2 class="panel-title"><span class="panel-icon">02</span> Nuovo Elemento</h2>

          <div class="field">
            <label>Tipo IFC</label>
            <select v-model="newElement.type" @change="onTypeChange">
              <option v-for="t in elementTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div class="field">
            <label>Nome</label>
            <input v-model="newElement.name" type="text" :placeholder="newElement.type+'_001'" />
          </div>
          <div class="field">
            <label>Materiale</label>
            <input v-model="newElement.material" type="text" placeholder="C25/30 - Cls Armato" />
          </div>

          <!-- ELEMENTI LINEARI (BEAM, COLUMN, PILE, WALL, STAIR…) -->
          <template v-if="isLinear(newElement.type)">
            <div class="node-block">
              <div class="node-block-title">
                <span class="node-dot start"></span> Nodo iniziale <span class="node-label">N1</span>
              </div>
              <div class="coords-grid">
                <div class="field"><label>X (m)</label><input v-model.number="newElement.n1.x" type="number" step="0.5" /></div>
                <div class="field"><label>Y (m)</label><input v-model.number="newElement.n1.y" type="number" step="0.5" /></div>
                <div class="field"><label>Z (m)</label><input v-model.number="newElement.n1.z" type="number" step="0.5" /></div>
              </div>
            </div>
            <div class="node-block">
              <div class="node-block-title">
                <span class="node-dot end"></span> Nodo finale <span class="node-label">N2</span>
              </div>
              <div class="coords-grid">
                <div class="field"><label>X (m)</label><input v-model.number="newElement.n2.x" type="number" step="0.5" /></div>
                <div class="field"><label>Y (m)</label><input v-model.number="newElement.n2.y" type="number" step="0.5" /></div>
                <div class="field"><label>Z (m)</label><input v-model.number="newElement.n2.z" type="number" step="0.5" /></div>
              </div>
            </div>
            <div class="derived-info">
              <div class="derived-row">
                <span class="derived-lbl">Lunghezza</span>
                <span class="derived-val">{{ nodeLength(newElement.n1, newElement.n2).toFixed(3) }} m</span>
              </div>
              <div class="derived-row">
                <span class="derived-lbl">Δ X/Y/Z</span>
                <span class="derived-val">
                  {{ (newElement.n2.x-newElement.n1.x).toFixed(2) }} /
                  {{ (newElement.n2.y-newElement.n1.y).toFixed(2) }} /
                  {{ (newElement.n2.z-newElement.n1.z).toFixed(2) }}
                </span>
              </div>
            </div>
            <div class="field-group-label">Sezione trasversale (m)</div>
            <div class="coords-grid">
              <div class="field"><label>W</label><input v-model.number="newElement.width"  type="number" step="0.05" min="0.01" /></div>
              <div class="field"><label>H</label><input v-model.number="newElement.height" type="number" step="0.05" min="0.01" /></div>
            </div>
          </template>

          <!-- ELEMENTI AREALI / POSIZIONALI (SLAB, DOOR, WINDOW, ROOF…) -->
          <template v-else>
            <div class="field-group-label">Posizione origine (m)</div>
            <div class="coords-grid">
              <div class="field"><label>X</label><input v-model.number="newElement.n1.x" type="number" step="0.5" /></div>
              <div class="field"><label>Y</label><input v-model.number="newElement.n1.y" type="number" step="0.5" /></div>
              <div class="field"><label>Z alt</label><input v-model.number="newElement.n1.z" type="number" step="0.5" /></div>
            </div>
            <div class="field-group-label">Dimensioni (m)</div>
            <div class="coords-grid">
              <div class="field"><label>L</label><input v-model.number="newElement.length" type="number" step="0.1" min="0.1" /></div>
              <div class="field"><label>W</label><input v-model.number="newElement.width"  type="number" step="0.1" min="0.1" /></div>
              <div class="field"><label>H</label><input v-model.number="newElement.height" type="number" step="0.1" min="0.1" /></div>
            </div>
            <div class="field">
              <label>Rotazione Y (°)</label>
              <input v-model.number="newElement.rotY" type="number" step="15" />
            </div>
          </template>

          <button class="btn btn-accent"   @click="addBimElement(null)" :disabled="!model">+ Aggiungi</button>
          <button class="btn btn-ghost"    @click="togglePlacing" :disabled="!model" v-if="!placingMode">⊕ Posiziona nel viewer</button>
          <button class="btn btn-placing"  @click="togglePlacing"                    v-if="placingMode">✕ Annulla posizionamento</button>
        </section>

        <!-- 03 Modifica elemento selezionato -->
        <section class="panel edit-panel" v-if="selectedIdx !== null && elements[selectedIdx]">
          <h2 class="panel-title"><span class="panel-icon">03</span> Modifica</h2>
          <div class="selected-el-header">
            <div class="el-type-badge sm" :style="{ background: typeColor(elements[selectedIdx].type) }">
              {{ elements[selectedIdx].type.replace('IFC','') }}
            </div>
            <span class="sel-name">{{ elements[selectedIdx].name }}</span>
          </div>

          <!-- Nodi per elementi lineari -->
          <template v-if="isLinear(elements[selectedIdx].type)">
            <div class="node-block">
              <div class="node-block-title">
                <span class="node-dot start"></span> Nodo iniziale N1
              </div>
              <div class="coords-grid">
                <div class="field"><label>X (m)</label>
                  <input type="number" step="0.5" :value="elements[selectedIdx].n1.x"
                    @change="updateNode(selectedIdx,'n1','x',$event.target.valueAsNumber)" /></div>
                <div class="field"><label>Y (m)</label>
                  <input type="number" step="0.5" :value="elements[selectedIdx].n1.y"
                    @change="updateNode(selectedIdx,'n1','y',$event.target.valueAsNumber)" /></div>
                <div class="field"><label>Z (m)</label>
                  <input type="number" step="0.5" :value="elements[selectedIdx].n1.z"
                    @change="updateNode(selectedIdx,'n1','z',$event.target.valueAsNumber)" /></div>
              </div>
            </div>
            <div class="node-block">
              <div class="node-block-title">
                <span class="node-dot end"></span> Nodo finale N2
              </div>
              <div class="coords-grid">
                <div class="field"><label>X (m)</label>
                  <input type="number" step="0.5" :value="elements[selectedIdx].n2.x"
                    @change="updateNode(selectedIdx,'n2','x',$event.target.valueAsNumber)" /></div>
                <div class="field"><label>Y (m)</label>
                  <input type="number" step="0.5" :value="elements[selectedIdx].n2.y"
                    @change="updateNode(selectedIdx,'n2','y',$event.target.valueAsNumber)" /></div>
                <div class="field"><label>Z (m)</label>
                  <input type="number" step="0.5" :value="elements[selectedIdx].n2.z"
                    @change="updateNode(selectedIdx,'n2','z',$event.target.valueAsNumber)" /></div>
              </div>
            </div>
            <div class="derived-info">
              <div class="derived-row">
                <span class="derived-lbl">Lunghezza</span>
                <span class="derived-val accent">{{ nodeLength(elements[selectedIdx].n1, elements[selectedIdx].n2).toFixed(3) }} m</span>
              </div>
              <div class="derived-row">
                <span class="derived-lbl">Inclinazione</span>
                <span class="derived-val">{{ nodeSlopeAngle(elements[selectedIdx].n1, elements[selectedIdx].n2).toFixed(1) }}°</span>
              </div>
            </div>
            <div class="field-group-label">Sezione (m)</div>
            <div class="coords-grid">
              <div class="field"><label>W</label>
                <input type="number" step="0.05" min="0.01" :value="elements[selectedIdx].width"
                  @change="updateProp(selectedIdx,'width',$event.target.valueAsNumber)" /></div>
              <div class="field"><label>H</label>
                <input type="number" step="0.05" min="0.01" :value="elements[selectedIdx].height"
                  @change="updateProp(selectedIdx,'height',$event.target.valueAsNumber)" /></div>
            </div>
          </template>

          <!-- Origine + dimensioni per elementi areali -->
          <template v-else>
            <div class="field-group-label">Posizione origine (m)</div>
            <div class="coords-grid">
              <div class="field"><label>X</label>
                <input type="number" step="0.5" :value="elements[selectedIdx].n1.x"
                  @change="updateNode(selectedIdx,'n1','x',$event.target.valueAsNumber)" /></div>
              <div class="field"><label>Y</label>
                <input type="number" step="0.5" :value="elements[selectedIdx].n1.y"
                  @change="updateNode(selectedIdx,'n1','y',$event.target.valueAsNumber)" /></div>
              <div class="field"><label>Z alt</label>
                <input type="number" step="0.5" :value="elements[selectedIdx].n1.z"
                  @change="updateNode(selectedIdx,'n1','z',$event.target.valueAsNumber)" /></div>
            </div>
            <div class="field-group-label">Dimensioni (m)</div>
            <div class="coords-grid">
              <div class="field"><label>L</label>
                <input type="number" step="0.1" min="0.1" :value="elements[selectedIdx].length"
                  @change="updateProp(selectedIdx,'length',$event.target.valueAsNumber)" /></div>
              <div class="field"><label>W</label>
                <input type="number" step="0.1" min="0.1" :value="elements[selectedIdx].width"
                  @change="updateProp(selectedIdx,'width',$event.target.valueAsNumber)" /></div>
              <div class="field"><label>H</label>
                <input type="number" step="0.1" min="0.1" :value="elements[selectedIdx].height"
                  @change="updateProp(selectedIdx,'height',$event.target.valueAsNumber)" /></div>
            </div>
            <div class="field">
              <label>Rotazione Y (°)</label>
              <input type="number" step="15" :value="elements[selectedIdx].rotY||0"
                @change="updateProp(selectedIdx,'rotY',$event.target.valueAsNumber)" />
            </div>
          </template>

          <button class="btn btn-danger" @click="removeElement(selectedIdx)">✕ Rimuovi elemento</button>
        </section>

        <!-- 04 Esporta -->
        <section class="panel" :class="{ disabled: !model || elements.length===0 }">
          <h2 class="panel-title"><span class="panel-icon">04</span> Esporta</h2>
          <button class="btn btn-export"    @click="exportIfc"       :disabled="!model||elements.length===0">↓ Scarica .ifc</button>
          <button class="btn btn-secondary" @click="copyToClipboard" :disabled="!model||elements.length===0">⎘ Copia STEP</button>
        </section>
      </aside>

      <!-- ═══ MAIN ═══════════════════════════════════════════════════════════ -->
      <main class="main-area">

        <!-- Welcome -->
        <div class="welcome-state" v-if="!model">
          <div class="welcome-graphic">
            <div class="cube c1"></div><div class="cube c2"></div><div class="cube c3"></div>
          </div>
          <h2>Costruisci il tuo modello IFC</h2>
          <p>
            Inizia creando un modello. Gli elementi lineari (travi, pilastri, pali…) vengono definiti
            tramite <strong>nodo iniziale N1</strong> e <strong>nodo finale N2</strong> con coordinate
            3D. La geometria e la rotazione IFC sono calcolate automaticamente.
          </p>
        </div>

        <!-- 3D Viewer -->
        <div class="viewer-wrap" v-show="model">
          <div class="viewer-banner" v-if="placingMode">
            <span class="blink">●</span>
            Clicca sulla griglia → N1 · secondo click → N2 per
            <strong>{{ newElement.type }}</strong> — <kbd>ESC</kbd> annulla
          </div>
          <div class="viewer-hud" v-if="hoverCoord">
            X {{ hoverCoord.x.toFixed(2) }} · Y {{ hoverCoord.y.toFixed(2) }} · Z {{ hoverCoord.z.toFixed(2) }}
          </div>
          <div class="viewer-legend">
            <span>Drag sin = orbit</span>
            <span>Drag dx = pan</span>
            <span>Scroll = zoom</span>
            <span>Click = seleziona</span>
          </div>
          <!-- N1 picking indicator -->
          <div class="n1-picked" v-if="placingMode && pendingN1">
            N1 fissato: ({{ pendingN1.x.toFixed(2) }}, {{ pendingN1.y.toFixed(2) }}, {{ pendingN1.z.toFixed(2) }}) · ora clicca per N2
          </div>
          <canvas ref="canvasRef" class="three-canvas"></canvas>
        </div>

        <!-- Stats -->
        <div class="stats-bar" v-if="model">
          <div class="stat"><span class="stat-value">{{ elements.length }}</span><span class="stat-label">Elementi</span></div>
          <div class="stat"><span class="stat-value">{{ ifcSchema }}</span><span class="stat-label">Schema</span></div>
          <div class="stat"><span class="stat-value">{{ uniqueTypes }}</span><span class="stat-label">Tipi</span></div>
          <div class="stat"><span class="stat-value">{{ lastEntityId }}</span><span class="stat-label">Entità STEP</span></div>
        </div>

        <!-- Element list -->
        <div class="elements-section" v-if="model">
          <div class="elements-header">
            <h3>Elementi nel modello</h3>
            <span class="badge">{{ elements.length }}</span>
          </div>
          <div class="empty-state" v-if="elements.length===0">
            <div class="empty-icon">◫</div>
            <p>Nessun elemento. Aggiungine uno dal pannello laterale o con "Posiziona nel viewer".</p>
          </div>
          <div class="element-list" v-else>
            <div
              v-for="(el, idx) in elements" :key="el.guid"
              class="element-card" :class="{ selected: selectedIdx===idx }"
              @click="selectElement(idx)"
            >
              <div class="el-type-badge" :style="{ background: typeColor(el.type) }">{{ el.type.replace('IFC','') }}</div>
              <div class="el-info">
                <div class="el-name">{{ el.name }}</div>
                <div class="el-meta" v-if="isLinear(el.type)">
                  N1 ({{ el.n1.x }}, {{ el.n1.y }}, {{ el.n1.z }}) →
                  N2 ({{ el.n2.x }}, {{ el.n2.y }}, {{ el.n2.z }}) ·
                  L={{ nodeLength(el.n1, el.n2).toFixed(2) }}m ·
                  {{ el.width }}×{{ el.height }}
                </div>
                <div class="el-meta" v-else>
                  ({{ el.n1.x }}, {{ el.n1.y }}, {{ el.n1.z }}) · {{ el.length }}×{{ el.width }}×{{ el.height }} m
                </div>
              </div>
              <button class="el-remove" @click.stop="removeElement(idx)">✕</button>
            </div>
          </div>
        </div>

        <!-- IFC STEP preview -->
        <div class="ifc-preview" v-if="model && elements.length>0">
          <div class="preview-header">
            <span>Anteprima STEP / IFC</span>
            <span class="preview-lines">{{ ifcLines }} righe</span>
          </div>
          <pre class="ifc-code">{{ ifcPreview }}</pre>
        </div>

        <!-- Log -->
        <div class="log-panel" v-if="logs.length>0">
          <div class="log-header">Log operazioni</div>
          <div class="log-entries">
            <div v-for="(log,i) in logs" :key="i" class="log-entry" :class="log.type">
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
import { ref, computed, onBeforeUnmount, nextTick } from 'vue'

// ──────────────────────────────────────────────────────────────────────────────
// COSTANTI
// ──────────────────────────────────────────────────────────────────────────────

/** Tipi che vengono definiti con nodo iniziale + nodo finale (elementi lineari) */
const LINEAR_TYPES = new Set([
  'IFCBEAM','IFCCOLUMN','IFCPILE','IFCWALL','IFCWALLSTANDARDCASE',
  'IFCSTAIR','IFCRAILING','IFCMEMBER',
])

const TYPE_HEX = {
  IFCBEAM:0x2563EB, IFCCOLUMN:0x16A34A, IFCSLAB:0xCA8A04,
  IFCWALL:0xDC2626, IFCWALLSTANDARDCASE:0xDC2626,
  IFCDOOR:0x9333EA, IFCWINDOW:0x0891B2, IFCROOF:0xEA580C,
  IFCSTAIR:0xDB2777, IFCFURNISHINGELEMENT:0x65A30D,
  IFCFOOTING:0x57534E, IFCPILE:0x78716C, IFCMEMBER:0x0E7490,
}

// ──────────────────────────────────────────────────────────────────────────────
// STATE REATTIVO
// ──────────────────────────────────────────────────────────────────────────────
const projectName  = ref('Progetto BIM')
const organization = ref('Studio Tecnico')
const ifcSchema    = ref('IFC4')
const model        = ref(null)
const elements     = ref([])
const logs         = ref([])
const selectedIdx  = ref(null)
const placingMode  = ref(false)
const snapEnabled  = ref(true)
const showNodes    = ref(true)
const viewMode     = ref('perspective')
const hoverCoord   = ref(null)
const canvasRef    = ref(null)
const pendingN1    = ref(null)   // primo click nel viewer per elementi lineari

/** Template elemento nuovo — condiviso fra form e viewer placement */
const newElement = ref(makeBlankElement('IFCBEAM'))

const elementTypes = [
  { value:'IFCBEAM',              label:'IfcBeam — Trave' },
  { value:'IFCCOLUMN',            label:'IfcColumn — Pilastro' },
  { value:'IFCPILE',              label:'IfcPile — Palo' },
  { value:'IFCMEMBER',            label:'IfcMember — Elemento strutturale' },
  { value:'IFCWALL',              label:'IfcWall — Parete' },
  { value:'IFCWALLSTANDARDCASE',  label:'IfcWallStandardCase' },
  { value:'IFCSTAIR',             label:'IfcStair — Scala' },
  { value:'IFCSLAB',              label:'IfcSlab — Solaio' },
  { value:'IFCDOOR',              label:'IfcDoor — Porta' },
  { value:'IFCWINDOW',            label:'IfcWindow — Finestra' },
  { value:'IFCROOF',              label:'IfcRoof — Copertura' },
  { value:'IFCFURNISHINGELEMENT', label:'IfcFurnishingElement' },
  { value:'IFCFOOTING',           label:'IfcFooting — Fondazione' },
]

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS NODI
// ──────────────────────────────────────────────────────────────────────────────

function makeBlankElement(type) {
  return {
    type,
    name: '',
    material: 'Calcestruzzo C25/30',
    n1: { x:0, y:0, z:0 },
    n2: { x:5, y:0, z:0 },
    length: 5,   // usato solo per elementi areali
    width:  0.30,
    height: 0.50,
    rotY:   0,   // usato solo per elementi areali
  }
}

/** Lunghezza segmento N1→N2 */
function nodeLength(n1, n2) {
  const dx = n2.x-n1.x, dy = n2.y-n1.y, dz = n2.z-n1.z
  return Math.sqrt(dx*dx + dy*dy + dz*dz)
}

/** Angolo d'inclinazione rispetto al piano orizzontale (°) */
function nodeSlopeAngle(n1, n2) {
  const L = nodeLength(n1, n2)
  if (L < 1e-6) return 0
  const dz = Math.abs(n2.z - n1.z)
  return Math.asin(dz / L) * 180 / Math.PI
}

/** Calcola la direzione locale di un elemento lineare → vettore unitario N1→N2 */
function nodeDirection(n1, n2) {
  const L = nodeLength(n1, n2)
  if (L < 1e-6) return { x:1, y:0, z:0 }
  return { x:(n2.x-n1.x)/L, y:(n2.y-n1.y)/L, z:(n2.z-n1.z)/L }
}

/**
 * Ricava: origine (= n1), lunghezza asseiale, vettore direzione, angolo rotY piano
 * per un elemento lineare. Usato sia da Three.js che da IFC.
 */
function linearGeom(el) {
  const L   = nodeLength(el.n1, el.n2)
  const dir = nodeDirection(el.n1, el.n2)
  // Angolo nel piano XY (usato per rotazione Y in IFC e Three.js)
  const rotY = Math.atan2(dir.x, dir.z) // radianti
  return { origin: { ...el.n1 }, L, dir, rotY }
}

function isLinear(type) { return LINEAR_TYPES.has(type) }

function onTypeChange() {
  newElement.value = { ...makeBlankElement(newElement.value.type), name: newElement.value.name }
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPUTED
// ──────────────────────────────────────────────────────────────────────────────
const uniqueTypes  = computed(() => new Set(elements.value.map(e => e.type)).size)
const lastEntityId = computed(() => model.value ? model.value.nextId - 1 : 0)
const ifcContent   = computed(() => model.value ? generateIfcFile() : '')
const ifcPreview   = computed(() => {
  const lines = ifcContent.value.split('\n')
  return lines.slice(0,80).join('\n') + (lines.length>80 ? '\n...' : '')
})
const ifcLines = computed(() => ifcContent.value.split('\n').length)

// ──────────────────────────────────────────────────────────────────────────────
// THREE.JS — variabili modulo (non reattive)
// ──────────────────────────────────────────────────────────────────────────────
let T = null
let renderer = null, scene = null, camera = null
let raycaster = null, pointerVec = null, groundMesh = null, animId = null

let sph        = { theta: Math.PI/4, phi: Math.PI/3, radius: 30 }
let panTarget  = null
let orbitDown  = false, panDown = false
let lastMouse  = { x:0, y:0 }
let clickMoved = false

// guid → { mesh, nodeSpheres[] }
const meshMap  = new Map()

// ──────────────────────────────────────────────────────────────────────────────
// THREE INIT
// ──────────────────────────────────────────────────────────────────────────────

async function initThree() {
  if (!canvasRef.value) return

  if (typeof window.THREE !== 'undefined') { T = window.THREE }
  else {
    await new Promise((res, rej) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
      s.onload = res; s.onerror = rej
      document.head.appendChild(s)
    })
    T = window.THREE
  }

  panTarget  = new T.Vector3(0,0,0)
  pointerVec = new T.Vector2()

  const cv = canvasRef.value
  const W  = cv.clientWidth  || 800
  const H  = cv.clientHeight || 420

  renderer = new T.WebGLRenderer({ canvas: cv, antialias: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = T.PCFSoftShadowMap

  scene = new T.Scene()
  scene.background = new T.Color(0x070910)
  scene.fog = new T.FogExp2(0x070910, 0.007)

  camera = new T.PerspectiveCamera(45, W/H, 0.1, 500)
  _applyCam()

  // Luci
  scene.add(new T.AmbientLight(0x2244AA, 0.9))
  const sun = new T.DirectionalLight(0xFFFFFF, 1.3)
  sun.position.set(25,50,25); sun.castShadow = true
  Object.assign(sun.shadow.camera,{left:-70,right:70,top:70,bottom:-70,near:.5,far:250})
  sun.shadow.mapSize.set(2048,2048)
  scene.add(sun)
  const fill = new T.DirectionalLight(0x5577FF, 0.35)
  fill.position.set(-15,15,-15); scene.add(fill)

  // Griglia
  const grid = new T.GridHelper(100,100,0x00D4FF,0x181D28)
  grid.material.opacity = 0.45; grid.material.transparent = true
  scene.add(grid)
  scene.add(new T.AxesHelper(5))

  // Piano ground invisibile
  groundMesh = new T.Mesh(
    new T.PlaneGeometry(400,400),
    new T.MeshBasicMaterial({ visible:false, side:T.DoubleSide })
  )
  groundMesh.rotation.x = -Math.PI/2; groundMesh.name = '__ground__'
  scene.add(groundMesh)

  raycaster = new T.Raycaster()

  for (const el of elements.value) addMeshForElement(el)

  cv.addEventListener('mousedown',   _onMouseDown)
  cv.addEventListener('mousemove',   _onMouseMove)
  cv.addEventListener('mouseup',     _onMouseUp)
  cv.addEventListener('wheel',       _onWheel, { passive:false })
  cv.addEventListener('contextmenu', e => e.preventDefault())
  window.addEventListener('keydown', _onKeyDown)
  window.addEventListener('resize',  _onResize)

  _loop()
}

function _loop() { animId = requestAnimationFrame(_loop); renderer.render(scene, camera) }

function _onResize() {
  if (!canvasRef.value || !renderer) return
  const W = canvasRef.value.clientWidth, H = canvasRef.value.clientHeight
  renderer.setSize(W, H); camera.aspect = W/H; camera.updateProjectionMatrix()
}

// ──────────────────────────────────────────────────────────────────────────────
// INPUT
// ──────────────────────────────────────────────────────────────────────────────

function _onMouseDown(e) {
  clickMoved = false; lastMouse = { x:e.clientX, y:e.clientY }
  if (e.button===0) orbitDown = true
  if (e.button===2||e.button===1) { panDown=true; e.preventDefault() }
}

function _onMouseMove(e) {
  const dx=e.clientX-lastMouse.x, dy=e.clientY-lastMouse.y
  if (Math.abs(dx)+Math.abs(dy)>3) clickMoved=true

  if (orbitDown && !placingMode.value) {
    sph.theta -= dx*0.008
    sph.phi    = Math.max(0.05, Math.min(Math.PI/2-0.04, sph.phi-dy*0.008))
    _applyCam()
  }
  if (panDown) {
    const right = new T.Vector3()
    right.crossVectors(camera.getWorldDirection(new T.Vector3()), camera.up).normalize()
    panTarget.addScaledVector(right, -dx*0.04)
    panTarget.addScaledVector(camera.up, dy*0.04)
    _applyCam()
  }
  lastMouse = { x:e.clientX, y:e.clientY }

  if (!canvasRef.value) return
  const r = canvasRef.value.getBoundingClientRect()
  pointerVec.x =  ((e.clientX-r.left)/r.width)*2-1
  pointerVec.y = -((e.clientY-r.top)/r.height)*2+1
  _updateHover()
}

function _onMouseUp(e) {
  if (e.button===0) {
    if (!clickMoved) {
      if (placingMode.value) _handlePlace()
      else                   _handleSelect()
    }
    orbitDown = false
  }
  if (e.button===2||e.button===1) panDown=false
}

function _onWheel(e) {
  e.preventDefault()
  sph.radius = Math.max(2, Math.min(180, sph.radius+e.deltaY*0.05))
  _applyCam()
}

function _onKeyDown(e) {
  if (e.key==='Escape') { placingMode.value=false; pendingN1.value=null }
  if ((e.key==='Delete'||e.key==='Backspace') && selectedIdx.value!==null)
    removeElement(selectedIdx.value)
}

// ──────────────────────────────────────────────────────────────────────────────
// CAMERA
// ──────────────────────────────────────────────────────────────────────────────

function _applyCam() {
  if (!camera||!T) return
  const {theta,phi,radius} = sph
  camera.position.set(
    panTarget.x + radius*Math.sin(phi)*Math.sin(theta),
    panTarget.y + radius*Math.cos(phi),
    panTarget.z + radius*Math.sin(phi)*Math.cos(theta)
  )
  camera.lookAt(panTarget)
}

function setCamera(mode) {
  viewMode.value = mode
  if (mode==='perspective') sph={theta:Math.PI/4,  phi:Math.PI/3,       radius:30}
  if (mode==='top')         sph={theta:0,           phi:0.01,            radius:40}
  if (mode==='front')       sph={theta:Math.PI,     phi:Math.PI/2-0.01,  radius:30}
  if (mode==='side')        sph={theta:Math.PI/2,   phi:Math.PI/2-0.01,  radius:30}
  _applyCam()
}

function fitAll() {
  if (!elements.value.length) { setCamera('perspective'); return }
  let minX=Infinity, maxX=-Infinity, minZ=Infinity, maxZ=-Infinity
  for (const el of elements.value) {
    const pts = isLinear(el.type) ? [el.n1,el.n2] : [el.n1,{x:el.n1.x+el.length,y:el.n1.y+el.width,z:el.n1.z}]
    for (const p of pts) {
      minX=Math.min(minX,p.x); maxX=Math.max(maxX,p.x)
      minZ=Math.min(minZ,p.y); maxZ=Math.max(maxZ,p.y)
    }
  }
  if (T) panTarget.set((minX+maxX)/2,0,(minZ+maxZ)/2)
  sph.radius = Math.max(maxX-minX, maxZ-minZ, 6)*2
  _applyCam()
}

// ──────────────────────────────────────────────────────────────────────────────
// RAYCAST
// ──────────────────────────────────────────────────────────────────────────────

function _groundHit() {
  if (!raycaster||!camera||!groundMesh) return null
  raycaster.setFromCamera(pointerVec, camera)
  const hits = raycaster.intersectObject(groundMesh)
  return hits.length>0 ? hits[0].point : null
}

function _snap(v) { return snapEnabled.value ? Math.round(v*2)/2 : v }

function _updateHover() {
  if (!model.value) { hoverCoord.value=null; return }
  const p = _groundHit()
  if (p) hoverCoord.value={x:parseFloat(_snap(p.x).toFixed(2)),y:newElement.value.n1.z,z:parseFloat(_snap(p.z).toFixed(2))}
  else   hoverCoord.value=null
}

/**
 * Gestisce i click nel viewer durante il posizionamento.
 * Per elementi lineari: 1° click = N1, 2° click = N2 → crea elemento.
 * Per elementi areali: 1 solo click = origine.
 */
function _handlePlace() {
  const p = _groundHit()
  if (!p) return

  const snapped = {
    x: parseFloat(_snap(p.x).toFixed(2)),
    y: newElement.value.n1.z,        // altitudine dal form
    z: parseFloat(_snap(p.z).toFixed(2)),
  }

  if (isLinear(newElement.value.type)) {
    if (!pendingN1.value) {
      // Primo click → N1
      pendingN1.value = { x: snapped.x, y: snapped.y, z: snapped.z }
      addLog(`N1 fissato @ (${snapped.x}, ${snapped.y}, ${snapped.z})`, 'info')
    } else {
      // Secondo click → N2 → crea elemento
      const n1 = { ...pendingN1.value }
      const n2 = { x: snapped.x, y: snapped.y, z: snapped.z }
      pendingN1.value = null
      addBimElement({ ...newElement.value, n1, n2 })
    }
  } else {
    addBimElement({ ...newElement.value, n1: { x:snapped.x, y:snapped.y, z:snapped.z } })
  }
}

function _handleSelect() {
  if (!raycaster||!camera) return
  raycaster.setFromCamera(pointerVec, camera)
  const allMeshes = []
  meshMap.forEach(v => { allMeshes.push(v.mesh); if(v.nodeSpheres) allMeshes.push(...v.nodeSpheres) })
  const hits = raycaster.intersectObjects(allMeshes, true)
  if (hits.length>0) {
    let obj = hits[0].object
    while (obj && !obj.userData.guid) obj = obj.parent
    if (obj?.userData.guid) {
      const idx = elements.value.findIndex(e => e.guid===obj.userData.guid)
      selectElement(idx); return
    }
  }
  selectElement(null)
}

// ──────────────────────────────────────────────────────────────────────────────
// MESH MANAGEMENT
// ──────────────────────────────────────────────────────────────────────────────

function addMeshForElement(el) {
  if (!T||!scene) return

  const col    = TYPE_HEX[el.type] || 0x4B5563
  const mat    = new T.MeshPhongMaterial({ color:col, transparent:true, opacity:0.82, shininess:80 })
  const group  = new T.Group()
  group.userData.guid = el.guid

  let bodyMesh

  if (isLinear(el.type)) {
    // ── Elemento lineare: cilindro/box lungo l'asse N1→N2 ──────────────────
    const g = linearGeom(el)
    const L = Math.max(g.L, 0.01)

    const geo = new T.BoxGeometry(el.width, el.height, L)
    bodyMesh  = new T.Mesh(geo, mat)
    bodyMesh.castShadow = bodyMesh.receiveShadow = true
    bodyMesh.userData.guid = el.guid

    // Wireframe
    bodyMesh.add(new T.LineSegments(
      new T.EdgesGeometry(geo),
      new T.LineBasicMaterial({ color:0xFFFFFF, transparent:true, opacity:0.18 })
    ))

    // Posiziona il box: centro a metà tra N1 e N2
    const cx = (el.n1.x+el.n2.x)/2
    const cy = (el.n1.z+el.n2.z)/2  // z IFC = altezza THREE
    const cz = (el.n1.y+el.n2.y)/2  // y IFC = profondità THREE
    bodyMesh.position.set(cx, cy, cz)
    // Ruota in modo che l'asse Z locale punti verso N2
    bodyMesh.rotation.y = -g.rotY
    // Inclinazione (pitch) rispetto al piano orizzontale
    const dz = el.n2.z - el.n1.z
    bodyMesh.rotation.x = Math.asin(Math.max(-1, Math.min(1, dz/L)))

    group.add(bodyMesh)

    // Sfere nodi
    if (showNodes.value) {
      const nodeSpheres = []
      for (const [node, color] of [[el.n1, 0x00FF9D],[el.n2, 0xFF4D6D]]) {
        const sphere = new T.Mesh(
          new T.SphereGeometry(0.18, 12, 12),
          new T.MeshPhongMaterial({ color, emissive:color, emissiveIntensity:0.4 })
        )
        sphere.position.set(node.x, node.z, node.y)
        sphere.userData.guid = el.guid
        group.add(sphere)
        nodeSpheres.push(sphere)
      }
      // Linea asse N1→N2
      const pts = [
        new T.Vector3(el.n1.x, el.n1.z, el.n1.y),
        new T.Vector3(el.n2.x, el.n2.z, el.n2.y),
      ]
      const axisLine = new T.Line(
        new T.BufferGeometry().setFromPoints(pts),
        new T.LineBasicMaterial({ color:0x00D4FF, transparent:true, opacity:0.5, linewidth:2 })
      )
      group.add(axisLine)
      meshMap.set(el.guid, { mesh: group, bodyMesh, nodeSpheres })
    } else {
      meshMap.set(el.guid, { mesh: group, bodyMesh, nodeSpheres: [] })
    }

  } else {
    // ── Elemento areale/volumetrico ────────────────────────────────────────
    const L = Math.max(el.length||1, 0.01)
    const W = Math.max(el.width||0.3, 0.01)
    const H = Math.max(el.height||0.5, 0.01)
    const geo = new T.BoxGeometry(L, H, W)
    bodyMesh  = new T.Mesh(geo, mat)
    bodyMesh.castShadow = bodyMesh.receiveShadow = true
    bodyMesh.userData.guid = el.guid
    bodyMesh.add(new T.LineSegments(
      new T.EdgesGeometry(geo),
      new T.LineBasicMaterial({ color:0xFFFFFF, transparent:true, opacity:0.18 })
    ))
    bodyMesh.position.set(el.n1.x+L/2, el.n1.z+H/2, el.n1.y+W/2)
    bodyMesh.rotation.y = T.MathUtils.degToRad(el.rotY||0)
    group.add(bodyMesh)
    // Sfera origine
    if (showNodes.value) {
      const sph = new T.Mesh(
        new T.SphereGeometry(0.14,10,10),
        new T.MeshPhongMaterial({ color:0x00FF9D, emissive:0x00FF9D, emissiveIntensity:0.4 })
      )
      sph.position.set(el.n1.x, el.n1.z, el.n1.y)
      sph.userData.guid = el.guid
      group.add(sph)
      meshMap.set(el.guid, { mesh: group, bodyMesh, nodeSpheres: [sph] })
    } else {
      meshMap.set(el.guid, { mesh: group, bodyMesh, nodeSpheres: [] })
    }
  }

  scene.add(group)
}

function removeMeshForElement(guid) {
  const entry = meshMap.get(guid)
  if (!entry) return
  scene.remove(entry.mesh)
  entry.bodyMesh?.geometry?.dispose()
  entry.bodyMesh?.material?.dispose()
  meshMap.delete(guid)
}

function updateMeshForElement(el) { removeMeshForElement(el.guid); addMeshForElement(el) }

function _highlightMesh(guid, on) {
  const entry = meshMap.get(guid)
  if (!entry?.bodyMesh||!T) return
  const bm = entry.bodyMesh
  if (!bm.material) return
  bm.material.emissive = new T.Color(on ? 0x00D4FF : 0x000000)
  bm.material.emissiveIntensity = on ? 0.5 : 0
  bm.material.opacity = on ? 1 : 0.82
}

// ──────────────────────────────────────────────────────────────────────────────
// ACTIONS
// ──────────────────────────────────────────────────────────────────────────────

function createModel() {
  model.value = { name:projectName.value||'Progetto BIM', organization:organization.value||'Org',
                  schema:ifcSchema.value, createdAt:new Date().toISOString(), nextId:1 }
  elements.value=[]; selectedIdx.value=null
  addLog(`Modello "${model.value.name}" creato (${ifcSchema.value})`, 'success')
  nextTick(() => { if (!renderer) initThree() })
}

/**
 * Aggiunge un elemento BIM.
 * @param {Object|null} opts  Se null usa il form; altrimenti oggetto con le proprietà
 */
function addBimElement(opts) {
  if (!model.value) { addLog('Nessun modello attivo','error'); return }
  const src = opts || newElement.value
  const lin = isLinear(src.type)

  const el = {
    guid:     generateGuid(),
    type:     src.type,
    name:     src.name || `${src.type}_${String(elements.value.length+1).padStart(3,'0')}`,
    material: src.material || 'Non specificato',
    // Nodi (sempre presenti)
    n1: { x: src.n1?.x??0, y: src.n1?.y??0, z: src.n1?.z??0 },
    n2: lin
          ? { x: src.n2?.x??5, y: src.n2?.y??0, z: src.n2?.z??0 }
          : { x: (src.n1?.x??0)+(src.length??5), y: src.n1?.y??0, z: src.n1?.z??0 },
    // Dimensioni
    length: Math.max(0.01, src.length ?? 5),
    width:  Math.max(0.01, src.width  ?? 0.30),
    height: Math.max(0.01, src.height ?? 0.50),
    rotY:   src.rotY ?? 0,
  }

  elements.value.push(el)
  addMeshForElement(el)
  selectElement(elements.value.length-1)

  const loc = lin
    ? `N1(${el.n1.x},${el.n1.y},${el.n1.z}) N2(${el.n2.x},${el.n2.y},${el.n2.z}) L=${nodeLength(el.n1,el.n2).toFixed(2)}m`
    : `(${el.n1.x},${el.n1.y},${el.n1.z}) ${el.length}×${el.width}×${el.height}m`
  addLog(`Aggiunto ${el.type}: "${el.name}" — ${loc}`, 'success')
  if (!opts) newElement.value.name=''
}

function removeElement(idx) {
  if (idx===null||idx<0||idx>=elements.value.length) return
  const el = elements.value[idx]
  removeMeshForElement(el.guid)
  elements.value.splice(idx,1)
  if (selectedIdx.value===idx)       selectedIdx.value=null
  else if (selectedIdx.value>idx)    selectedIdx.value--
  addLog(`Rimosso "${el.name}"`, 'warn')
}

function selectElement(idx) {
  if (selectedIdx.value!==null && elements.value[selectedIdx.value])
    _highlightMesh(elements.value[selectedIdx.value].guid, false)
  selectedIdx.value = idx
  if (idx!==null && elements.value[idx])
    _highlightMesh(elements.value[idx].guid, true)
}

/** Aggiorna una proprietà scalare (width, height, length, rotY) */
function updateProp(idx, prop, value) {
  if (idx===null||!elements.value[idx]||isNaN(value)) return
  elements.value[idx][prop] = value
  updateMeshForElement(elements.value[idx])
  _highlightMesh(elements.value[idx].guid, true)
}

/** Aggiorna una coordinata di un nodo (n1 o n2) */
function updateNode(idx, node, coord, value) {
  if (idx===null||!elements.value[idx]||isNaN(value)) return
  elements.value[idx][node][coord] = value
  updateMeshForElement(elements.value[idx])
  _highlightMesh(elements.value[idx].guid, true)
}

function togglePlacing() {
  placingMode.value = !placingMode.value
  if (!placingMode.value) pendingN1.value = null
}

// ──────────────────────────────────────────────────────────────────────────────
// EXPORT
// ──────────────────────────────────────────────────────────────────────────────

function exportIfc() {
  if (!model.value||!elements.value.length) return
  const blob = new Blob([ifcContent.value],{type:'application/x-step'})
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href=url; a.download=`${model.value.name.replace(/\s+/g,'_')}.ifc`; a.click()
  URL.revokeObjectURL(url)
  addLog(`File IFC esportato (${elements.value.length} elementi)`,'success')
}

async function copyToClipboard() {
  try { await navigator.clipboard.writeText(ifcContent.value); addLog('STEP copiato','success') }
  catch { addLog('Impossibile copiare','error') }
}

// ──────────────────────────────────────────────────────────────────────────────
// IFC GENERATION  (con geometria da nodi per elementi lineari)
// ──────────────────────────────────────────────────────────────────────────────

function generateGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0
    return (c==='x'?r:(r&0x3|0x8)).toString(16).toUpperCase()
  })
}

function guidToIfc(g) {
  const hex   = g.replace(/-/g,'')
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$'
  let r = ''
  for (let i=0;i<32;i+=6){
    const c=parseInt(hex.substr(i,6),16)
    r+=chars[(c>>30)&63]+chars[(c>>24)&63]+chars[(c>>18)&63]+chars[(c>>12)&63]+chars[(c>>6)&63]+chars[c&63]
  }
  return r.substring(0,22)
}

function fmt(v) { return Number(v).toFixed(6) }

function generateIfcFile() {
  const m = model.value
  const ts = new Date().toISOString().split('.')[0]
  const ents=[];  let id=1; const n=()=>id++
  const push=(...l)=>ents.push(...l)

  // ── Struttura base ────────────────────────────────────────────────────────
  const [idApp,idOrg,idPer,idPO,idOH]=[n(),n(),n(),n(),n()]
  const [idU1,idU2,idU3,idU4,idUA]  =[n(),n(),n(),n(),n()]
  const [idCO,idCD,idCA,idGC]        =[n(),n(),n(),n()]
  const idPrj=n()
  const [idSO,idSA,idSP,idSite]     =[n(),n(),n(),n()]
  const [idBO,idBA,idBP,idBldg]     =[n(),n(),n(),n()]
  const [idStO,idStA,idStP,idStor]  =[n(),n(),n(),n()]
  const [idAg1,idAg2,idAg3]         =[n(),n(),n()]

  push(
    `#${idApp}=IFCAPPLICATION(#${idOrg},'1.0','IFC Model Builder Vue3 Nodes','IfcMBV3N');`,
    `#${idOrg}=IFCORGANIZATION($,'${m.organization}',$,$,$);`,
    `#${idPer}=IFCPERSON($,'BIM','Author',$,$,$,$,$);`,
    `#${idPO}=IFCPERSONANDORGANIZATION(#${idPer},#${idOrg},$);`,
    `#${idOH}=IFCOWNERHISTORY(#${idPO},#${idApp},$,.ADDED.,$,$,$,${Math.floor(Date.now()/1000)});`,
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
    `#${idSO}=IFCCARTESIANPOINT((0.,0.,0.));#${idSA}=IFCAXIS2PLACEMENT3D(#${idSO},$,$);`,
    `#${idSP}=IFCLOCALPLACEMENT($,#${idSA});`,
    `#${idSite}=IFCSITE('${guidToIfc(generateGuid())}',#${idOH},'Sito',$,$,#${idSP},$,$,.ELEMENT.,$,$,$,$,$);`,
    `#${idBO}=IFCCARTESIANPOINT((0.,0.,0.));#${idBA}=IFCAXIS2PLACEMENT3D(#${idBO},$,$);`,
    `#${idBP}=IFCLOCALPLACEMENT(#${idSP},#${idBA});`,
    `#${idBldg}=IFCBUILDING('${guidToIfc(generateGuid())}',#${idOH},'${m.name}',$,$,#${idBP},$,$,.ELEMENT.,$,$,$);`,
    `#${idStO}=IFCCARTESIANPOINT((0.,0.,0.));#${idStA}=IFCAXIS2PLACEMENT3D(#${idStO},$,$);`,
    `#${idStP}=IFCLOCALPLACEMENT(#${idBP},#${idStA});`,
    `#${idStor}=IFCBUILDINGSTOREY('${guidToIfc(generateGuid())}',#${idOH},'Piano Terra',$,$,#${idStP},$,$,.ELEMENT.,0.);`,
    `#${idAg1}=IFCRELAGGREGATES('${guidToIfc(generateGuid())}',#${idOH},$,$,#${idPrj},(#${idSite}));`,
    `#${idAg2}=IFCRELAGGREGATES('${guidToIfc(generateGuid())}',#${idOH},$,$,#${idSite},(#${idBldg}));`,
    `#${idAg3}=IFCRELAGGREGATES('${guidToIfc(generateGuid())}',#${idOH},$,$,#${idBldg},(#${idStor}));`,
  )

  const elIds=[]
  for (const el of elements.value) {
    const W = el.width*1000, H = el.height*1000

    if (isLinear(el.type)) {
      // ── Geometria lineare da N1→N2 ─────────────────────────────────────
      // Il sistema di riferimento locale è:
      //   origine = N1 (in mm)
      //   asse Z locale = direzione N1→N2 (direzione di estrusione)
      //   asse Y locale = Up globale (0,0,1) se non allineato, altrimenti (0,1,0)
      const g   = linearGeom(el)
      const L   = g.L * 1000   // lunghezza in mm
      const dir = g.dir        // vettore unitario N1→N2 (coords IFC: X,Y=piano, Z=alto)

      // IFC usa X,Y come piano e Z come altezza
      // THREE usa X,Z come piano e Y come altezza
      // Vettore direzione in IFC (X=est, Y=nord, Z=su)
      const dX = fmt(dir.x), dY = fmt(dir.y), dZ = fmt(dir.z)

      // Vettore Up locale: se dir non è parallelo a Z globale, usiamo (0,0,1)
      // altrimenti (0,1,0)
      const absZ = Math.abs(dir.z)
      const upX  = absZ>0.99 ? '0.' : '0.'
      const upY  = absZ>0.99 ? '1.' : '0.'
      const upZ  = absZ>0.99 ? '0.' : '1.'

      const X1=fmt(el.n1.x*1000), Y1=fmt(el.n1.y*1000), Z1=fmt(el.n1.z*1000)

      const [eO,eAx,eRefDir,eAP,eLP]  = [n(),n(),n(),n(),n()]
      const [pO,pAx,pDef]             = [n(),n(),n()]
      const [exDir,sO,sAx,solid]       = [n(),n(),n(),n()]
      const [shRep,pds,mat,elId,maId]  = [n(),n(),n(),n(),n()]

      push(
        // Placement: origine = N1, RefDirection = dir linea, Axis = up locale
        `#${eO}=IFCCARTESIANPOINT((${X1},${Y1},${Z1}));`,
        `#${eAx}=IFCDIRECTION((${upX},${upY},${upZ}));`,
        `#${eRefDir}=IFCDIRECTION((${dX},${dY},${dZ}));`,
        `#${eAP}=IFCAXIS2PLACEMENT3D(#${eO},#${eAx},#${eRefDir});`,
        `#${eLP}=IFCLOCALPLACEMENT(#${idStP},#${eAP});`,
        // Profilo rettangolare: width × height nel piano locale XY
        `#${pO}=IFCCARTESIANPOINT((0.,0.));`,
        `#${pAx}=IFCAXIS2PLACEMENT2D(#${pO},$);`,
        `#${pDef}=IFCRECTANGLEPROFILEDEF(.AREA.,$,#${pAx},${fmt(W)},${fmt(H)});`,
        // Estrusione lungo Z locale = direzione N1→N2 → lunghezza L
        `#${exDir}=IFCDIRECTION((0.,0.,1.));`,
        `#${sO}=IFCCARTESIANPOINT((0.,0.,0.));`,
        `#${sAx}=IFCAXIS2PLACEMENT3D(#${sO},$,$);`,
        `#${solid}=IFCEXTRUDEDAREASOLID(#${pDef},#${sAx},#${exDir},${fmt(L)});`,
        `#${shRep}=IFCSHAPEREPRESENTATION(#${idGC},'Body','SweptSolid',(#${solid}));`,
        `#${pds}=IFCPRODUCTDEFINITIONSHAPE($,$,(#${shRep}));`,
        `#${mat}=IFCMATERIAL('${el.material}');`,
        `#${elId}=${el.type}('${guidToIfc(el.guid)}',#${idOH},'${el.name}',$,'${el.type}',#${eLP},#${pds},$);`,
        `#${maId}=IFCRELASSOCIATESMATERIAL('${guidToIfc(generateGuid())}',#${idOH},$,$,(#${elId}),#${mat});`,
      )
      elIds.push(elId)

    } else {
      // ── Geometria areale (invariata, usa n1 come origine) ─────────────
      const L = el.length*1000
      const X=fmt(el.n1.x*1000), Y=fmt(el.n1.y*1000), Z=fmt(el.n1.z*1000)
      const rad = (el.rotY||0)*Math.PI/180
      const cR=Math.cos(rad).toFixed(6), sR=Math.sin(rad).toFixed(6)

      const [eO,eRD,eAx,eAP,eLP]    = [n(),n(),n(),n(),n()]
      const [pO,pAx,pDef]            = [n(),n(),n()]
      const [exDir,sO,sAx,solid]     = [n(),n(),n(),n()]
      const [shRep,pds,mat,elId,maId]= [n(),n(),n(),n(),n()]

      push(
        `#${eO}=IFCCARTESIANPOINT((${X},${Y},${Z}));`,
        `#${eRD}=IFCDIRECTION((${cR},0.,${sR}));`,
        `#${eAx}=IFCDIRECTION((0.,1.,0.));`,
        `#${eAP}=IFCAXIS2PLACEMENT3D(#${eO},#${eAx},#${eRD});`,
        `#${eLP}=IFCLOCALPLACEMENT(#${idStP},#${eAP});`,
        `#${pO}=IFCCARTESIANPOINT((0.,0.));`,
        `#${pAx}=IFCAXIS2PLACEMENT2D(#${pO},$);`,
        `#${pDef}=IFCRECTANGLEPROFILEDEF(.AREA.,$,#${pAx},${fmt(W)},${fmt(H)});`,
        `#${exDir}=IFCDIRECTION((0.,0.,1.));`,
        `#${sO}=IFCCARTESIANPOINT((0.,0.,0.));`,
        `#${sAx}=IFCAXIS2PLACEMENT3D(#${sO},$,$);`,
        `#${solid}=IFCEXTRUDEDAREASOLID(#${pDef},#${sAx},#${exDir},${fmt(L)});`,
        `#${shRep}=IFCSHAPEREPRESENTATION(#${idGC},'Body','SweptSolid',(#${solid}));`,
        `#${pds}=IFCPRODUCTDEFINITIONSHAPE($,$,(#${shRep}));`,
        `#${mat}=IFCMATERIAL('${el.material}');`,
        `#${elId}=${el.type}('${guidToIfc(el.guid)}',#${idOH},'${el.name}',$,'${el.type}',#${eLP},#${pds},$);`,
        `#${maId}=IFCRELASSOCIATESMATERIAL('${guidToIfc(generateGuid())}',#${idOH},$,$,(#${elId}),#${mat});`,
      )
      elIds.push(elId)
    }
  }

  if (elIds.length>0) {
    const rc=n()
    push(`#${rc}=IFCRELCONTAINEDINSPATIALSTRUCTURE('${guidToIfc(generateGuid())}',#${idOH},'Elementi',$,(${elIds.map(i=>'#'+i).join(',')}),#${idStor});`)
  }

  m.nextId=id
  return [
    'ISO-10303-21;','HEADER;',
    `FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');`,
    `FILE_NAME('${m.name}.ifc','${ts}',('BIM Author'),('${m.organization}'),'IFC Model Builder Vue3','1.0','');`,
    `FILE_SCHEMA(('${ifcSchema.value}'));`,
    'ENDSEC;','','DATA;', ...ents,
    'ENDSEC;','','END-ISO-10303-21;',
  ].join('\n')
}

// ──────────────────────────────────────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────────────────────────────────────

function typeColor(type) {
  const n = TYPE_HEX[type]||0x4B5563
  return `#${n.toString(16).padStart(6,'0')}`
}

function addLog(msg,type='info') {
  logs.value.unshift({msg,type,time:new Date().toLocaleTimeString('it-IT')})
  if(logs.value.length>20) logs.value.pop()
}

// ──────────────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ──────────────────────────────────────────────────────────────────────────────
onBeforeUnmount(()=>{
  if(animId) cancelAnimationFrame(animId)
  if(renderer) renderer.dispose()
  const cv=canvasRef.value
  if(cv){
    cv.removeEventListener('mousedown',_onMouseDown)
    cv.removeEventListener('mousemove',_onMouseMove)
    cv.removeEventListener('mouseup',  _onMouseUp)
    cv.removeEventListener('wheel',    _onWheel)
  }
  window.removeEventListener('keydown',_onKeyDown)
  window.removeEventListener('resize', _onResize)
})

defineExpose({ createModel, addBimElement, removeElement, updateProp, updateNode, exportIfc, model, elements, ifcContent, isLinear, nodeLength })
</script>

<style scoped>
/* ─── Tokens ──────────────────────────────────────────────────────────── */
.ifc-builder {
  --bg:      #070910;
  --surface: #111420;
  --border:  #1A1F30;
  --accent:  #00D4FF;
  --green:   #00FF9D;
  --text:    #DDE6F0;
  --muted:   #546070;
  --danger:  #FF4D6D;
  --warn:    #FFB800;
  --n1:      #00FF9D;
  --n2:      #FF4D6D;

  display:flex; flex-direction:column; height:100vh;
  background:var(--bg); color:var(--text);
  font-family:'JetBrains Mono','Fira Code','Courier New',monospace;
  font-size:13px; overflow:hidden;
}

/* ─── Header ──────────────────────────────────────────────────────────── */
.ifc-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:8px 18px; background:var(--surface); border-bottom:1px solid var(--border);
  flex-shrink:0; gap:12px;
}
.header-brand { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.brand-icon { font-size:24px; color:var(--accent); }
.header-brand h1 { margin:0; font-size:13px; font-weight:700; letter-spacing:.06em; }
.subtitle { margin:0; font-size:9px; color:var(--muted); text-transform:uppercase; letter-spacing:.07em; }

.header-controls { display:flex; align-items:center; gap:10px; flex:1; justify-content:flex-end; flex-wrap:wrap; }
.viewer-tools { display:flex; align-items:center; gap:2px; flex-wrap:wrap; }
.tool-btn {
  padding:3px 9px; background:transparent; border:1px solid var(--border);
  border-radius:3px; color:var(--muted); cursor:pointer;
  font-family:inherit; font-size:9px; font-weight:700; letter-spacing:.03em;
  transition:all .12s; white-space:nowrap;
}
.tool-btn:hover:not(:disabled){ border-color:var(--accent); color:var(--accent); }
.tool-btn.active { background:#00D4FF18; border-color:var(--accent); color:var(--accent); }
.tool-btn:disabled { opacity:.3; cursor:not-allowed; }
.tool-sep { width:1px; height:16px; background:var(--border); margin:0 3px; }

.header-meta { display:flex; align-items:center; gap:6px; flex-shrink:0; }
.status-dot { width:7px; height:7px; border-radius:50%; background:var(--border); border:1px solid var(--muted); transition:all .3s; }
.status-dot.active { background:var(--green); border-color:var(--green); box-shadow:0 0 8px #00FF9D88; }
.status-label { font-size:9px; color:var(--muted); }

/* ─── Layout ──────────────────────────────────────────────────────────── */
.workspace { display:flex; flex:1; overflow:hidden; }

/* ─── Sidebar ─────────────────────────────────────────────────────────── */
.sidebar {
  width:270px; flex-shrink:0; background:var(--surface);
  border-right:1px solid var(--border); overflow-y:auto;
}
.sidebar::-webkit-scrollbar { width:3px; }
.sidebar::-webkit-scrollbar-thumb { background:var(--border); }

.panel { padding:14px; border-bottom:1px solid var(--border); transition:opacity .2s; }
.panel.disabled { opacity:.3; pointer-events:none; }

.panel-title {
  display:flex; align-items:center; gap:7px; margin:0 0 12px;
  font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#6A82A0;
}
.panel-icon {
  font-size:8px; font-weight:800; color:var(--accent);
  background:#00D4FF18; padding:2px 5px; border-radius:2px; letter-spacing:0;
}

/* ── Nodo blocks ──────────────────────────────────────────────────────── */
.node-block {
  background:#0A0D18; border:1px solid var(--border);
  border-radius:4px; padding:9px; margin-bottom:8px;
}
.node-block-title {
  display:flex; align-items:center; gap:6px;
  font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.07em;
  color:#6A82A0; margin-bottom:7px;
}
.node-dot {
  width:9px; height:9px; border-radius:50%; flex-shrink:0;
}
.node-dot.start { background:var(--n1); box-shadow:0 0 5px var(--n1); }
.node-dot.end   { background:var(--n2); box-shadow:0 0 5px var(--n2); }
.node-label {
  margin-left:auto; font-size:8px; color:var(--muted);
  background:var(--border); padding:1px 5px; border-radius:2px;
}

/* ── Derived info box ─────────────────────────────────────────────────── */
.derived-info {
  background:#050710; border:1px solid var(--border); border-radius:4px;
  padding:7px 10px; margin-bottom:10px; display:flex; flex-direction:column; gap:4px;
}
.derived-row { display:flex; justify-content:space-between; align-items:center; }
.derived-lbl { font-size:9px; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; }
.derived-val { font-size:10px; font-weight:700; color:var(--text); }
.derived-val.accent { color:var(--accent); }

/* ── Fields ───────────────────────────────────────────────────────────── */
.field { margin-bottom:6px; }
.field label { display:block; font-size:8px; color:var(--muted); margin-bottom:3px; letter-spacing:.06em; text-transform:uppercase; }
.field input,.field select {
  width:100%; box-sizing:border-box;
  background:#070910; border:1px solid var(--border); border-radius:3px;
  color:var(--text); padding:5px 7px; font-family:inherit; font-size:11px; transition:border .15s;
}
.field input:focus,.field select:focus { outline:none; border-color:#00D4FF55; }
.field select option { background:#070910; }
.field-group-label {
  font-size:8px; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin:9px 0 4px;
}
.coords-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px; }

/* ── Buttons ──────────────────────────────────────────────────────────── */
.btn {
  width:100%; padding:7px 10px; border-radius:3px; border:none;
  cursor:pointer; font-family:inherit; font-size:9px; font-weight:700;
  letter-spacing:.05em; text-transform:uppercase; transition:all .12s; margin-top:5px;
}
.btn:disabled { opacity:.3; cursor:not-allowed; }
.btn-primary  { background:#00D4FF15; color:var(--accent); border:1px solid #00D4FF44; }
.btn-primary:hover:not(:disabled)  { background:#00D4FF28; }
.btn-accent   { background:#00FF9D15; color:var(--green);  border:1px solid #00FF9D44; }
.btn-accent:hover:not(:disabled)   { background:#00FF9D28; }
.btn-ghost    { background:transparent; color:var(--muted); border:1px dashed var(--border); }
.btn-ghost:hover:not(:disabled)    { border-color:var(--accent); color:var(--accent); }
.btn-placing  { background:#FFB80015; color:var(--warn);   border:1px solid #FFB80044; }
.btn-export   { background:#2563EB15; color:#60A5FA;        border:1px solid #2563EB44; }
.btn-export:hover:not(:disabled)   { background:#2563EB28; }
.btn-secondary { background:var(--border); color:#6A82A0;  border:1px solid #232840; }
.btn-secondary:hover:not(:disabled){ background:#232840; }
.btn-danger   { background:#FF4D6D15; color:var(--danger); border:1px solid #FF4D6D44; }
.btn-danger:hover:not(:disabled)   { background:#FF4D6D28; }

.selected-el-header { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.sel-name { font-size:10px; font-weight:600; color:var(--text); }
.el-type-badge.sm { padding:2px 6px; font-size:8px; }

/* ─── Main ────────────────────────────────────────────────────────────── */
.main-area {
  flex:1; overflow-y:auto; padding:14px;
  display:flex; flex-direction:column; gap:12px;
}
.main-area::-webkit-scrollbar { width:3px; }
.main-area::-webkit-scrollbar-thumb { background:var(--border); }

/* ─── Viewer ──────────────────────────────────────────────────────────── */
.viewer-wrap {
  position:relative; height:400px;
  background:#040609; border:1px solid var(--border); border-radius:4px; overflow:hidden; flex-shrink:0;
}
.three-canvas { width:100% !important; height:100% !important; display:block; }

.viewer-banner {
  position:absolute; z-index:10; pointer-events:none;
  top:10px; left:50%; transform:translateX(-50%);
  background:#FFB80020; border:1px solid #FFB80066;
  color:var(--warn); padding:5px 16px; border-radius:20px; font-size:10px; white-space:nowrap;
}
.n1-picked {
  position:absolute; z-index:10; pointer-events:none;
  top:46px; left:50%; transform:translateX(-50%);
  background:#00FF9D18; border:1px solid #00FF9D66;
  color:var(--green); padding:4px 14px; border-radius:20px; font-size:9px; white-space:nowrap;
}
.viewer-hud {
  position:absolute; z-index:10; bottom:10px; left:10px; pointer-events:none;
  background:#00000099; border:1px solid var(--border);
  color:var(--muted); padding:3px 10px; border-radius:3px; font-size:9px;
}
.viewer-legend {
  position:absolute; z-index:10; bottom:10px; right:10px; pointer-events:none;
  display:flex; gap:10px; font-size:8px; color:#2A3850;
}
kbd {
  background:var(--border); border:1px solid #232840;
  padding:1px 5px; border-radius:2px; font-family:inherit;
}
.blink { animation:blink 1s step-end infinite; }
@keyframes blink { 50%{ opacity:0; } }

/* ─── Stats ───────────────────────────────────────────────────────────── */
.stats-bar { display:flex; gap:2px; flex-shrink:0; }
.stat { flex:1; background:var(--surface); border:1px solid var(--border); padding:8px 10px; border-radius:3px; }
.stat-value { display:block; font-size:16px; font-weight:800; color:var(--accent); line-height:1; margin-bottom:2px; }
.stat-label { font-size:8px; color:var(--muted); text-transform:uppercase; letter-spacing:.07em; }

/* ─── Element list ────────────────────────────────────────────────────── */
.elements-header { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.elements-header h3 { margin:0; font-size:9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#6A82A0; }
.badge {
  background:#00D4FF15; color:var(--accent); border:1px solid #00D4FF33;
  border-radius:10px; padding:1px 7px; font-size:9px; font-weight:700;
}
.empty-state {
  text-align:center; padding:24px 16px; color:var(--muted);
  background:var(--surface); border:1px dashed var(--border); border-radius:3px; font-size:11px;
}
.empty-icon { font-size:28px; margin-bottom:8px; opacity:.4; }
.element-list { display:flex; flex-direction:column; gap:2px; }
.element-card {
  display:flex; align-items:center; gap:8px;
  padding:7px 10px; background:var(--surface); border:1px solid var(--border);
  border-radius:3px; cursor:pointer; transition:all .1s;
}
.element-card:hover   { border-color:#28304A; background:#161C2C; }
.element-card.selected{ border-color:#00D4FF55; background:#00D4FF08; }
.el-type-badge {
  padding:2px 6px; border-radius:2px; font-size:8px; font-weight:800;
  letter-spacing:.03em; color:white; flex-shrink:0; min-width:52px; text-align:center;
}
.el-info { flex:1; min-width:0; }
.el-name { font-size:10px; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.el-meta { font-size:8px; color:var(--muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.el-remove {
  background:none; border:none; color:#2A3850; cursor:pointer;
  font-size:10px; padding:2px 4px; border-radius:2px; transition:all .1s; flex-shrink:0;
}
.el-remove:hover { background:#FF4D6D22; color:var(--danger); }

/* ─── IFC Preview ─────────────────────────────────────────────────────── */
.ifc-preview { background:#030508; border:1px solid var(--border); border-radius:3px; overflow:hidden; }
.preview-header {
  display:flex; justify-content:space-between; align-items:center;
  padding:5px 10px; background:var(--surface); border-bottom:1px solid var(--border);
  font-size:8px; text-transform:uppercase; letter-spacing:.07em; color:var(--muted);
}
.preview-lines { color:var(--accent); }
.ifc-code {
  padding:10px; margin:0; font-size:8px; line-height:1.6; color:var(--green);
  overflow-x:auto; max-height:200px; overflow-y:auto; font-family:inherit;
}

/* ─── Welcome ─────────────────────────────────────────────────────────── */
.welcome-state {
  flex:1; display:flex; flex-direction:column; align-items:center;
  justify-content:center; text-align:center; padding:50px 40px; color:#2A3850;
}
.welcome-state h2 { color:#6A82A0; margin:18px 0 10px; font-size:17px; }
.welcome-state p { max-width:440px; line-height:1.9; font-size:12px; }
.welcome-state strong { color:var(--accent); }
.welcome-graphic { position:relative; width:90px; height:72px; margin:0 auto; }
.cube { position:absolute; width:26px; height:26px; border-radius:3px; animation:float 3s ease-in-out infinite; }
.c1 { top:9px;  left:6px;  background:#00D4FF18; border:1px solid #00D4FF44; animation-delay:0s; }
.c2 { top:0;    left:34px; background:#00FF9D18; border:1px solid #00FF9D44; animation-delay:.5s; }
.c3 { top:18px; left:60px; background:#2563EB18; border:1px solid #2563EB44; animation-delay:1s; }
@keyframes float { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-7px); } }

/* ─── Log ─────────────────────────────────────────────────────────────── */
.log-panel { background:var(--surface); border:1px solid var(--border); border-radius:3px; overflow:hidden; }
.log-header { padding:5px 10px; font-size:8px; text-transform:uppercase; letter-spacing:.07em; color:var(--muted); border-bottom:1px solid var(--border); }
.log-entries { max-height:100px; overflow-y:auto; }
.log-entry { display:flex; gap:8px; padding:4px 10px; border-bottom:1px solid #1A1F3055; font-size:9px; }
.log-time { color:#2A3850; flex-shrink:0; }
.log-entry.success .log-msg { color:var(--green); }
.log-entry.error   .log-msg { color:var(--danger); }
.log-entry.warn    .log-msg { color:var(--warn); }
.log-entry.info    .log-msg { color:#6A82A0; }
</style>
