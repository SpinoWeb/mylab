<template>
  <div class="ifc-app">

    <!-- ══════════════════════════════════════════════════════ HEADER -->
    <header class="topbar">
      <div class="topbar-brand">
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
          <polygon points="14,2 26,9 26,19 14,26 2,19 2,9" fill="none" stroke="#00E5FF" stroke-width="1.5"/>
          <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="#00E5FF22" stroke="#00E5FF" stroke-width="1"/>
        </svg>
        <div class="topbar-title">
          <span class="topbar-name">IFC Model Builder</span>
          <span class="topbar-sub">web-ifc · Three.js · Vue 3 · Vite</span>
        </div>
      </div>

      <div class="topbar-toolbar" v-if="modelReady">
        <div class="tool-group">
          <button class="tbtn" :class="{active:view==='3d'}"    @click="setCam('3d')">3D</button>
          <button class="tbtn" :class="{active:view==='top'}"   @click="setCam('top')">Top</button>
          <button class="tbtn" :class="{active:view==='front'}" @click="setCam('front')">Front</button>
          <button class="tbtn" :class="{active:view==='side'}"  @click="setCam('side')">Side</button>
        </div>
        <div class="tool-sep"/>
        <div class="tool-group">
          <button class="tbtn" @click="fitCam">⊡ Fit</button>
          <button class="tbtn" :class="{active:snap}" @click="snap=!snap">
            ⊞ Snap {{ snap?'ON':'OFF' }}
          </button>
          <button class="tbtn" :class="{active:placing}" @click="togglePlacing">
            {{ placing ? '✕ Annulla' : '⊕ Posiziona' }}
          </button>
        </div>
      </div>

      <div class="topbar-status">
        <span class="sdot" :class="{live:modelReady}"/>
        <span class="stxt">{{ modelReady ? 'Modello attivo' : 'Nessun modello' }}</span>
      </div>
    </header>

    <div class="shell">

      <!-- ═════════════════════════════════════════════════ SIDEBAR -->
      <aside class="sidebar">

        <!-- 01 Crea modello -->
        <section class="panel">
          <div class="phd"><span class="step">01</span>Crea Modello</div>
          <div class="field"><label>Nome progetto</label>
            <input v-model="cfg.name" placeholder="Edificio A" :disabled="modelReady"/>
          </div>
          <div class="field"><label>Organizzazione</label>
            <input v-model="cfg.org" placeholder="Studio XYZ" :disabled="modelReady"/>
          </div>
          <div class="field"><label>Schema IFC</label>
            <select v-model="cfg.schema" :disabled="modelReady">
              <option value="IFC4">IFC 4</option>
              <option value="IFC2X3">IFC 2x3</option>
            </select>
          </div>
          <button class="btn primary" @click="initModel" :disabled="modelReady">
            {{ modelReady ? '✓ Modello pronto' : 'Inizializza Modello' }}
          </button>
          <button class="btn ghost" @click="resetModel" v-if="modelReady">↺ Nuovo modello</button>
        </section>

        <!-- 02 Nuovo elemento -->
        <section class="panel" :class="{locked:!modelReady}">
          <div class="phd"><span class="step">02</span>Nuovo Elemento</div>

          <div class="field"><label>Tipo IFC</label>
            <select v-model="form.type" @change="onTypeChange">
              <option v-for="t in EL_TYPES" :key="t.v" :value="t.v">{{ t.label }}</option>
            </select>
          </div>
          <div class="field"><label>Nome</label>
            <input v-model="form.name" :placeholder="form.type+'_001'"/>
          </div>
          <div class="field"><label>Materiale</label>
            <input v-model="form.mat" placeholder="C25/30"/>
          </div>

          <!-- LINEARI: N1 + N2 -->
          <template v-if="isLinear(form.type)">
            <div class="ncard n1c">
              <div class="nhd"><span class="nd n1d"/>Nodo iniziale N1</div>
              <div class="xyz">
                <div class="field"><label>X (m)</label><input v-model.number="form.n1.x" type="number" step="0.5"/></div>
                <div class="field"><label>Y (m)</label><input v-model.number="form.n1.y" type="number" step="0.5"/></div>
                <div class="field"><label>Z (m)</label><input v-model.number="form.n1.z" type="number" step="0.5"/></div>
              </div>
            </div>
            <div class="ncard n2c">
              <div class="nhd"><span class="nd n2d"/>Nodo finale N2</div>
              <div class="xyz">
                <div class="field"><label>X (m)</label><input v-model.number="form.n2.x" type="number" step="0.5"/></div>
                <div class="field"><label>Y (m)</label><input v-model.number="form.n2.y" type="number" step="0.5"/></div>
                <div class="field"><label>Z (m)</label><input v-model.number="form.n2.z" type="number" step="0.5"/></div>
              </div>
            </div>
            <div class="dbox">
              <div class="dr"><span>Lunghezza</span><b class="acc">{{ fmtL(form.n1,form.n2) }} m</b></div>
              <div class="dr"><span>Inclinazione</span><b>{{ fmtSlope(form.n1,form.n2) }}°</b></div>
            </div>
            <div class="flbl">Sezione (m)</div>
            <div class="xyz">
              <div class="field"><label>W</label><input v-model.number="form.w" type="number" step="0.05" min="0.01"/></div>
              <div class="field"><label>H</label><input v-model.number="form.h" type="number" step="0.05" min="0.01"/></div>
            </div>
          </template>

          <!-- AREALI: origine + dimensioni -->
          <template v-else>
            <div class="ncard n1c">
              <div class="nhd"><span class="nd n1d"/>Origine</div>
              <div class="xyz">
                <div class="field"><label>X (m)</label><input v-model.number="form.n1.x" type="number" step="0.5"/></div>
                <div class="field"><label>Y (m)</label><input v-model.number="form.n1.y" type="number" step="0.5"/></div>
                <div class="field"><label>Z (m)</label><input v-model.number="form.n1.z" type="number" step="0.5"/></div>
              </div>
            </div>
            <div class="flbl">Dimensioni (m)</div>
            <div class="xyz">
              <div class="field"><label>L</label><input v-model.number="form.l" type="number" step="0.1" min="0.1"/></div>
              <div class="field"><label>W</label><input v-model.number="form.w" type="number" step="0.1" min="0.1"/></div>
              <div class="field"><label>H</label><input v-model.number="form.h" type="number" step="0.1" min="0.1"/></div>
            </div>
            <div class="field"><label>Rotazione Y (°)</label>
              <input v-model.number="form.rotY" type="number" step="15"/>
            </div>
          </template>

          <button class="btn accent"   @click="addElement(null)" :disabled="!modelReady">+ Aggiungi elemento</button>
          <button class="btn ghost"    @click="togglePlacing" :disabled="!modelReady" v-if="!placing">⊕ Posiziona nel viewer</button>
          <button class="btn warnbtn"  @click="togglePlacing" v-if="placing">✕ Annulla posizionamento</button>
        </section>

        <!-- 03 Modifica selezionato -->
        <section class="panel" v-if="selIdx!==null && elements[selIdx]">
          <div class="phd"><span class="step">03</span>Modifica</div>
          <div class="selbadge">
            <span class="tpill" :style="{background:tCol(elements[selIdx].type)}">
              {{ elements[selIdx].type.replace('IFC','') }}
            </span>
            <span class="selname">{{ elements[selIdx].name }}</span>
          </div>

          <template v-if="isLinear(elements[selIdx].type)">
            <div class="ncard n1c">
              <div class="nhd"><span class="nd n1d"/>N1</div>
              <div class="xyz">
                <div class="field"><label>X</label><input type="number" step="0.5" :value="elements[selIdx].n1.x" @change="updNode(selIdx,'n1','x',$event.target.valueAsNumber)"/></div>
                <div class="field"><label>Y</label><input type="number" step="0.5" :value="elements[selIdx].n1.y" @change="updNode(selIdx,'n1','y',$event.target.valueAsNumber)"/></div>
                <div class="field"><label>Z</label><input type="number" step="0.5" :value="elements[selIdx].n1.z" @change="updNode(selIdx,'n1','z',$event.target.valueAsNumber)"/></div>
              </div>
            </div>
            <div class="ncard n2c">
              <div class="nhd"><span class="nd n2d"/>N2</div>
              <div class="xyz">
                <div class="field"><label>X</label><input type="number" step="0.5" :value="elements[selIdx].n2.x" @change="updNode(selIdx,'n2','x',$event.target.valueAsNumber)"/></div>
                <div class="field"><label>Y</label><input type="number" step="0.5" :value="elements[selIdx].n2.y" @change="updNode(selIdx,'n2','y',$event.target.valueAsNumber)"/></div>
                <div class="field"><label>Z</label><input type="number" step="0.5" :value="elements[selIdx].n2.z" @change="updNode(selIdx,'n2','z',$event.target.valueAsNumber)"/></div>
              </div>
            </div>
            <div class="dbox">
              <div class="dr"><span>Lunghezza</span><b class="acc">{{ fmtL(elements[selIdx].n1,elements[selIdx].n2) }} m</b></div>
              <div class="dr"><span>Inclinazione</span><b>{{ fmtSlope(elements[selIdx].n1,elements[selIdx].n2) }}°</b></div>
            </div>
            <div class="flbl">Sezione (m)</div>
            <div class="xyz">
              <div class="field"><label>W</label><input type="number" step="0.05" min="0.01" :value="elements[selIdx].w" @change="updProp(selIdx,'w',$event.target.valueAsNumber)"/></div>
              <div class="field"><label>H</label><input type="number" step="0.05" min="0.01" :value="elements[selIdx].h" @change="updProp(selIdx,'h',$event.target.valueAsNumber)"/></div>
            </div>
          </template>

          <template v-else>
            <div class="ncard n1c">
              <div class="nhd"><span class="nd n1d"/>Origine</div>
              <div class="xyz">
                <div class="field"><label>X</label><input type="number" step="0.5" :value="elements[selIdx].n1.x" @change="updNode(selIdx,'n1','x',$event.target.valueAsNumber)"/></div>
                <div class="field"><label>Y</label><input type="number" step="0.5" :value="elements[selIdx].n1.y" @change="updNode(selIdx,'n1','y',$event.target.valueAsNumber)"/></div>
                <div class="field"><label>Z</label><input type="number" step="0.5" :value="elements[selIdx].n1.z" @change="updNode(selIdx,'n1','z',$event.target.valueAsNumber)"/></div>
              </div>
            </div>
            <div class="flbl">Dimensioni (m)</div>
            <div class="xyz">
              <div class="field"><label>L</label><input type="number" step="0.1" min="0.01" :value="elements[selIdx].l" @change="updProp(selIdx,'l',$event.target.valueAsNumber)"/></div>
              <div class="field"><label>W</label><input type="number" step="0.1" min="0.01" :value="elements[selIdx].w" @change="updProp(selIdx,'w',$event.target.valueAsNumber)"/></div>
              <div class="field"><label>H</label><input type="number" step="0.1" min="0.01" :value="elements[selIdx].h" @change="updProp(selIdx,'h',$event.target.valueAsNumber)"/></div>
            </div>
          </template>

          <button class="btn danger" @click="removeElement(selIdx)">✕ Rimuovi</button>
        </section>

        <!-- 04 Esporta -->
        <section class="panel" :class="{locked:!modelReady||!elements.length}">
          <div class="phd"><span class="step">04</span>Esporta</div>
          <button class="btn exportbtn" @click="exportIfc" :disabled="!modelReady||!elements.length">↓ Scarica .ifc</button>
          <button class="btn ghost"     @click="copyStep"  :disabled="!modelReady||!elements.length">⎘ Copia STEP</button>
          <p class="enote" v-if="modelReady&&elements.length">
            Generato con <code>web-ifc</code> IfcAPI.WriteFile()
          </p>
        </section>
      </aside>

      <!-- ═════════════════════════════════════════════════ MAIN -->
      <main class="main">

        <!-- Welcome -->
        <div class="welcome" v-if="!modelReady">
          <svg width="72" height="72" viewBox="0 0 72 72" style="margin-bottom:18px">
            <polygon points="36,4 68,20 68,52 36,68 4,52 4,20" fill="none" stroke="#00E5FF" stroke-width="1.2" opacity=".35"/>
            <polygon points="36,16 56,27 56,45 36,56 16,45 16,27" fill="none" stroke="#00E5FF" stroke-width="1" opacity=".6"/>
            <circle cx="36" cy="36" r="5" fill="#00E5FF" opacity=".9"/>
          </svg>
          <h2>ThatOpen IFC Builder</h2>
          <p>Genera file <strong>.ifc</strong> nativi con <code>web-ifc</code> IfcAPI.<br/>
          Viewer 3D con <code>OBC.ShadowedScene</code> + <code>OBF.PostproductionRenderer</code>.<br/>
          Elementi lineari da <strong>nodi N1/N2</strong> in 3D.</p>
          <div class="deplist">
            <span>web-ifc</span><span>three</span>
            <span>@thatopen/components</span><span>@thatopen/components-front</span>
          </div>
        </div>

        <!-- 3D Viewer — il canvas viene iniettato da OBF.PostproductionRenderer dentro #obc-container -->
        <div class="vwrap" v-show="modelReady">
          <div class="pbanner" v-if="placing">
            <span class="blink">●</span>
            {{ pendingN1
               ? `N1(${pendingN1.x},${pendingN1.y},${pendingN1.z}) fissato — clicca per N2`
               : `Clicca la griglia → N1 per ${form.type}` }}
            <kbd>ESC</kbd>
          </div>
          <div class="chud" v-if="hoverPt">
            X {{ hoverPt.x.toFixed(2) }} · Y {{ hoverPt.y.toFixed(2) }} · Z {{ hoverPt.z.toFixed(2) }}
          </div>
          <div class="vlegend">
            <span>Drag sin=orbit</span><span>Drag dx=pan</span>
            <span>Scroll=zoom</span><span>Click=seleziona</span>
          </div>
          <!-- ref="cvs" punta a questo div; initThatOpen usa cvs.value come container -->
          <div ref="cvs" class="obc-container"/>
        </div>

        <!-- Stats -->
        <div class="stats" v-if="modelReady">
          <div class="sc"><div class="sv">{{ elements.length }}</div><div class="sl">Elementi</div></div>
          <div class="sc"><div class="sv">{{ cfg.schema }}</div><div class="sl">Schema</div></div>
          <div class="sc"><div class="sv">{{ uniqueTypes }}</div><div class="sl">Tipi</div></div>
          <div class="sc"><div class="sv">{{ stepLines }}</div><div class="sl">Righe STEP</div></div>
        </div>

        <!-- Lista elementi -->
        <div class="elsect" v-if="modelReady">
          <div class="elhd">
            <h3>Elementi nel modello</h3><span class="badge">{{ elements.length }}</span>
          </div>
          <div class="elempty" v-if="!elements.length">◫ Nessun elemento ancora</div>
          <div class="ellist" v-else>
            <div v-for="(el,i) in elements" :key="el.guid"
                 class="elrow" :class="{sel:selIdx===i}" @click="selectEl(i)">
              <span class="tpill" :style="{background:tCol(el.type)}">{{ el.type.replace('IFC','') }}</span>
              <div class="elinfo">
                <div class="elname">{{ el.name }}</div>
                <div class="elmeta" v-if="isLinear(el.type)">
                  N1({{ el.n1.x }},{{ el.n1.y }},{{ el.n1.z }}) →
                  N2({{ el.n2.x }},{{ el.n2.y }},{{ el.n2.z }}) ·
                  L={{ segL(el.n1,el.n2).toFixed(2) }}m · {{ el.w }}×{{ el.h }}
                </div>
                <div class="elmeta" v-else>
                  ({{ el.n1.x }},{{ el.n1.y }},{{ el.n1.z }}) · {{ el.l }}×{{ el.w }}×{{ el.h }} m
                </div>
              </div>
              <button class="eldel" @click.stop="removeElement(i)">✕</button>
            </div>
          </div>
        </div>

        <!-- STEP Preview -->
        <div class="stepbox" v-if="modelReady && stepText">
          <div class="stephd">
            <span>Anteprima STEP / IFC</span>
            <span class="stlines">{{ stepLines }} righe</span>
          </div>
          <pre class="stepcode">{{ stepPreview }}</pre>
        </div>

        <!-- Log -->
        <div class="logbox" v-if="logs.length">
          <div class="loghd">Log</div>
          <div v-for="(l,i) in logs" :key="i" class="logrow" :class="l.t">
            <span class="lt">{{ l.time }}</span><span>{{ l.msg }}</span>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
/**
 * IfcModelBuilder.vue — Vue 3 + Vite
 * ─────────────────────────────────────────────────────────────────────────────
 * Viewer 3D:  ThatOpen OBC.ShadowedScene + OBF.PostproductionRenderer
 *             + OBC.OrthoPerspectiveCamera
 *             (pattern ufficiale: docs.thatopen.com → BuildingConfigurator)
 * IFC Writer: web-ifc IfcAPI — bassa astrazione, massima stabilità
 *
 * package.json deps:
 *   "three": "^0.160.0"
 *   "web-ifc": "^0.0.57"
 *   "@thatopen/components": "^2.x"
 *   "@thatopen/components-front": "^2.x"
 *
 * vite.config.ts:
 *   export default defineConfig({
 *     plugins: [vue()],
 *     optimizeDeps: { exclude: ['web-ifc'] },
 *     server: {
 *       headers: {
 *         'Cross-Origin-Opener-Policy':   'same-origin',
 *         'Cross-Origin-Embedder-Policy': 'require-corp',
 *       }
 *     }
 *   })
 *
 * web-ifc WASM: SetWasmPath punta a unpkg per semplicità.
 * Per produzione: cp node_modules/web-ifc/web-ifc*.wasm public/
 *                 e usa SetWasmPath('/')
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { ref, computed, onBeforeUnmount, nextTick } from 'vue'
import * as THREE from 'three'
import * as WebIFC from 'web-ifc'
import * as OBC from '@thatopen/components'
import * as OBF from '@thatopen/components-front'

// ─────────────────────────────────────────────────────────────────────────────
// COSTANTI
// ─────────────────────────────────────────────────────────────────────────────

const LINEAR_TYPES = new Set([
  'IFCBEAM','IFCCOLUMN','IFCPILE','IFCMEMBER',
  'IFCWALL','IFCWALLSTANDARDCASE','IFCSTAIR','IFCRAILING',
])

const EL_TYPES = [
  { v:'IFCBEAM',              label:'IfcBeam — Trave' },
  { v:'IFCCOLUMN',            label:'IfcColumn — Pilastro' },
  { v:'IFCPILE',              label:'IfcPile — Palo' },
  { v:'IFCMEMBER',            label:'IfcMember — Membratura' },
  { v:'IFCWALL',              label:'IfcWall — Parete' },
  { v:'IFCWALLSTANDARDCASE',  label:'IfcWallStandardCase' },
  { v:'IFCSTAIR',             label:'IfcStair — Scala' },
  { v:'IFCSLAB',              label:'IfcSlab — Solaio' },
  { v:'IFCDOOR',              label:'IfcDoor — Porta' },
  { v:'IFCWINDOW',            label:'IfcWindow — Finestra' },
  { v:'IFCROOF',              label:'IfcRoof — Copertura' },
  { v:'IFCFOOTING',           label:'IfcFooting — Fondazione' },
  { v:'IFCFURNISHINGELEMENT', label:'IfcFurnishingElement' },
]

const TYPE_HEX = {
  IFCBEAM:0x2563EB, IFCCOLUMN:0x16A34A, IFCSLAB:0xCA8A04,
  IFCWALL:0xDC2626, IFCWALLSTANDARDCASE:0xDC2626,
  IFCDOOR:0x9333EA, IFCWINDOW:0x0891B2, IFCROOF:0xEA580C,
  IFCSTAIR:0xDB2777, IFCFURNISHINGELEMENT:0x65A30D,
  IFCFOOTING:0x57534E, IFCPILE:0x78716C, IFCMEMBER:0x0E7490,
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE REATTIVO
// ─────────────────────────────────────────────────────────────────────────────
const cvs         = ref(null)          // canvas element
const modelReady  = ref(false)
const placing     = ref(false)
const pendingN1   = ref(null)
const snap        = ref(true)
const view        = ref('3d')
const hoverPt     = ref(null)
const selIdx      = ref(null)
const elements    = ref([])
const logs        = ref([])
const stepText    = ref('')

const cfg  = ref({ name:'Progetto BIM', org:'Studio Tecnico', schema:'IFC4' })
const form = ref(blankForm('IFCBEAM'))

// ─────────────────────────────────────────────────────────────────────────────
// web-ifc STATE (non reattivo)
// ─────────────────────────────────────────────────────────────────────────────
let ifcApi  = null          // WebIFC.IfcAPI instance
let modelID = null          // ID modello web-ifc
let geomCtxID   = null      // expressID del GeometricRepresentationContext
let storeyPlcID = null      // expressID del LocalPlacement del piano terra
let storeyID    = null      // expressID del BuildingStorey

// ─────────────────────────────────────────────────────────────────────────────
// THATOPEN / THREE.JS STATE (non reattivo)
// ─────────────────────────────────────────────────────────────────────────────
// OBC/OBF objects
let components = null   // OBC.Components
let world      = null   // world corrente (ShadowedScene + PostproductionRenderer + OrthoPerspectiveCamera)

// Three.js refs estratti dal world dopo initThatOpen()
let renderer   = null   // world.renderer.three  (THREE.WebGLRenderer)
let scene      = null   // world.scene.three     (THREE.Scene)
let camera     = null   // world.camera.three    (THREE.Camera)

let ground     = null   // piano invisibile per picking
let raycaster  = null
let ptr        = new THREE.Vector2()
let animId     = null   // non usato: il loop è gestito da components.init()

// Orbit / pan
let sph       = { theta: Math.PI/4, phi: Math.PI/3, r: 28 }
let panTarget = new THREE.Vector3()
let orbDown   = false
let panDown   = false
let lastMouse = { x:0, y:0 }
let moved     = false

const meshMap = new Map()   // guid → THREE.Group

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTED
// ─────────────────────────────────────────────────────────────────────────────
const uniqueTypes = computed(() => new Set(elements.value.map(e=>e.type)).size)
const stepLines   = computed(() => stepText.value ? stepText.value.split('\n').length : 0)
const stepPreview = computed(() => {
  const lines = stepText.value.split('\n')
  return lines.slice(0,90).join('\n') + (lines.length>90 ? '\n...' : '')
})

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function isLinear(t) { return LINEAR_TYPES.has(t) }

function segL(n1,n2) {
  const dx=n2.x-n1.x, dy=n2.y-n1.y, dz=n2.z-n1.z
  return Math.sqrt(dx*dx+dy*dy+dz*dz)
}
function fmtL(n1,n2) { return segL(n1,n2).toFixed(3) }
function fmtSlope(n1,n2) {
  const L=segL(n1,n2); if(L<1e-6) return '0.0'
  return (Math.asin(Math.abs(n2.z-n1.z)/L)*180/Math.PI).toFixed(1)
}
function segDir(n1,n2) {
  const L=segL(n1,n2); if(L<1e-6) return {x:1,y:0,z:0}
  return {x:(n2.x-n1.x)/L, y:(n2.y-n1.y)/L, z:(n2.z-n1.z)/L}
}
function snapV(v) { return snap.value ? Math.round(v*2)/2 : v }

function blankForm(type) {
  return { type, name:'', mat:'Calcestruzzo C25/30',
           n1:{x:0,y:0,z:0}, n2:{x:5,y:0,z:0},
           l:5, w:0.3, h:0.5, rotY:0 }
}
function onTypeChange() {
  const nm = form.value.name
  form.value = blankForm(form.value.type)
  form.value.name = nm
}

// ─────────────────────────────────────────────────────────────────────────────
// THATOPEN INIT
// Pattern da: https://docs.thatopen.com/Tutorials/Fragments/FragmentsModels/BuildingConfigurator
//
// Dipendenze aggiuntive rispetto al vecchio approccio:
//   npm install @thatopen/components-front
//
// Il container passato a PostproductionRenderer deve essere un HTMLElement
// (non un canvas) — usiamo il div wrapper .vwrap come container.
// ─────────────────────────────────────────────────────────────────────────────

async function initThatOpen() {
  const container = cvs.value?.parentElement   // div.vwrap
  if (!container) return

  // ── 1. Components (orchestratore globale) ─────────────────────────────────
  components = new OBC.Components()

  // ── 2. World: ShadowedScene + PostproductionRenderer + OrthoPerspectiveCamera
  //    Esattamente come nell'esempio BuildingConfigurator della documentazione.
  const worlds = components.get(OBC.Worlds)

  world = worlds.create()

  world.scene    = new OBC.ShadowedScene(components)
  world.renderer = new OBF.PostproductionRenderer(components, container)
  world.camera   = new OBC.OrthoPerspectiveCamera(components)

  // ── 3. Avvia il loop di rendering interno di OBC ──────────────────────────
  components.init()

  // ── 4. Posizione camera iniziale ──────────────────────────────────────────
  world.camera.controls.setLookAt(15, 12, 15, 0, 0, 0)
  world.camera.controls.enableDamping = true

  // ── 5. Ombre ──────────────────────────────────────────────────────────────
  world.renderer.three.shadowMap.enabled = true
  world.renderer.three.shadowMap.type    = THREE.VSMShadowMap

  world.scene.setup({
    shadows: { cascade: 1, resolution: 2048 },
  })

  world.camera.controls.addEventListener('rest', async () => {
    await world.scene.updateShadows()
  })

  // ── 6. Postproduction ─────────────────────────────────────────────────────
  world.renderer.postproduction.enabled = true
  world.renderer.postproduction.style   = OBF.PostproductionAspect.COLOR_PEN

  // ── 7. Scena extra: griglia, assi ─────────────────────────────────────────
  world.scene.three.background = new THREE.Color(0x070910)

  const grid = new THREE.GridHelper(100, 100, 0x00D4FF, 0x141828)
  grid.material.opacity = 0.45
  grid.material.transparent = true
  world.scene.three.add(grid)
  world.scene.three.add(new THREE.AxesHelper(5))

  // ── 8. Piano invisibile per picking manuale ───────────────────────────────
  ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
  )
  ground.rotation.x = -Math.PI / 2
  world.scene.three.add(ground)

  raycaster = new THREE.Raycaster()

  // ── 9. Estrai refs Three.js dal world per i metodi esistenti ──────────────
  //    renderer, scene, camera usati da _addMesh, _rmMesh, raycasting, ecc.
  renderer = world.renderer.three
  scene    = world.scene.three
  camera   = world.camera.three

  // ── 10. Event listeners canvas ────────────────────────────────────────────
  //    OBC usa il container div, noi aggiungiamo i nostri listener sul canvas
  //    interno che PostproductionRenderer crea dentro container.
  const cv = renderer.domElement
  cv.addEventListener('mousedown',   _onMD)
  cv.addEventListener('mousemove',   _onMM)
  cv.addEventListener('mouseup',     _onMU)
  cv.addEventListener('contextmenu', e => e.preventDefault())
  window.addEventListener('keydown', _onKD)
  // Il resize è gestito da OBC internamente; ne aggiungiamo uno nostro
  // solo per aggiornare il raycaster pointer
  window.addEventListener('resize',  _onResize)

  log('ThatOpen (OBC + OBF) viewer inizializzato', 'success')
}

function _onResize() {
  // PostproductionRenderer ridimensiona da solo; aggiorniamo solo camera.aspect
  // nel caso in cui il loop esterno ne abbia bisogno
  if (!camera || !renderer) return
  const cv = renderer.domElement
  camera.aspect = cv.clientWidth / cv.clientHeight
  if (camera.updateProjectionMatrix) camera.updateProjectionMatrix()
}

// ─────────────────────────────────────────────────────────────────────────────
// INPUT
// Orbit / pan / zoom sono gestiti nativamente da OBC.OrthoPerspectiveCamera
// via camera-controls. Noi intercettiamo solo:
//   - mousemove per l'HUD coordinate
//   - mouseup click sinistro per placing / select
//   - keydown per shortcuts
// ─────────────────────────────────────────────────────────────────────────────

function _onMD(e) {
  moved = false; lastMouse = { x: e.clientX, y: e.clientY }
}
function _onMM(e) {
  if (Math.abs(e.clientX-lastMouse.x)+Math.abs(e.clientY-lastMouse.y) > 3) moved = true
  lastMouse = { x: e.clientX, y: e.clientY }

  // HUD coordinate: raycasting sul piano ground
  if (!raycaster || !camera || !ground) return
  const cv  = renderer.domElement
  const rc  = cv.getBoundingClientRect()
  ptr.x =  ((e.clientX - rc.left) / rc.width)  * 2 - 1
  ptr.y = -((e.clientY - rc.top)  / rc.height) * 2 + 1
  raycaster.setFromCamera(ptr, camera)
  const hits = raycaster.intersectObject(ground)
  if (hits.length) {
    const p = hits[0].point
    hoverPt.value = { x: snapV(p.x), y: form.value.n1.z, z: snapV(p.z) }
  } else hoverPt.value = null
}
function _onMU(e) {
  if (e.button === 0 && !moved) {
    // aggiorna ptr al momento dell'up
    const cv = renderer.domElement
    const rc = cv.getBoundingClientRect()
    ptr.x =  ((e.clientX - rc.left) / rc.width)  * 2 - 1
    ptr.y = -((e.clientY - rc.top)  / rc.height) * 2 + 1
    placing.value ? _doPlace(e) : _doSelect()
  }
}
function _onKD(e) {
  if (e.key === 'Escape') { placing.value = false; pendingN1.value = null }
  if ((e.key === 'Delete' || e.key === 'Backspace') && selIdx.value !== null)
    removeElement(selIdx.value)
}

// _applyCam: usa CameraControls di OBC invece di manipolare camera.position
function _applyCam() {
  // Non necessario: OBC gestisce la camera. Usato solo dai preset setCam/fitCam.
}

// Wheel non serve: OBC la gestisce già sul container

// ─────────────────────────────────────────────────────────────────────────────
// PICKING
// ─────────────────────────────────────────────────────────────────────────────

function _groundPt(e) {
  if (!renderer||!raycaster||!camera||!ground) return null
  const cv = renderer.domElement
  const rc = cv.getBoundingClientRect()
  ptr.x =  ((e.clientX-rc.left)/rc.width)*2-1
  ptr.y = -((e.clientY-rc.top)/rc.height)*2+1
  raycaster.setFromCamera(ptr, camera)
  const hits = raycaster.intersectObject(ground)
  return hits.length ? hits[0].point : null
}

function _doPlace(e) {
  const p=_groundPt(e); if(!p) return
  const pt={x:snapV(p.x), y:form.value.n1.z, z:snapV(p.z)}
  if (isLinear(form.value.type)) {
    if (!pendingN1.value) { pendingN1.value=pt; log(`N1 @ (${pt.x},${pt.y},${pt.z})`,'info') }
    else { addElement({...form.value,n1:{...pendingN1.value},n2:pt}); pendingN1.value=null }
  } else {
    addElement({...form.value,n1:pt})
  }
}
function _doSelect() {
  if (!raycaster||!camera) return
  raycaster.setFromCamera(ptr,camera)
  const hits=raycaster.intersectObjects([...meshMap.values()],true)
  if (hits.length) {
    let obj=hits[0].object
    while(obj&&!obj.userData.guid) obj=obj.parent
    if (obj?.userData.guid) { selectEl(elements.value.findIndex(e=>e.guid===obj.userData.guid)); return }
  }
  selectEl(null)
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA PRESETS — usa OBC CameraControls (camera-controls)
// ─────────────────────────────────────────────────────────────────────────────

function setCam(p) {
  view.value = p
  if (!world?.camera?.controls) return
  const ctl = world.camera.controls
  if (p === '3d')    ctl.setLookAt(15, 12, 15, 0, 0, 0, true)
  if (p === 'top')   ctl.setLookAt(0,  40,  0, 0, 0, 0, true)
  if (p === 'front') ctl.setLookAt(0,   5, 30, 0, 5, 0, true)
  if (p === 'side')  ctl.setLookAt(30,  5,  0, 0, 5, 0, true)
}

function fitCam() {
  if (!elements.value.length || !world?.camera?.controls) { setCam('3d'); return }
  let sx=0, sy=0, sz=0, n=0
  for (const el of elements.value) {
    for (const p of (isLinear(el.type) ? [el.n1, el.n2] : [el.n1]))
      { sx+=p.x; sy+=p.z; sz+=p.y; n++ }
  }
  sx/=n; sy/=n; sz/=n
  world.camera.controls.setLookAt(sx+15, sy+12, sz+15, sx, sy, sz, true)
}

// ─────────────────────────────────────────────────────────────────────────────
// web-ifc INIT
// ─────────────────────────────────────────────────────────────────────────────

async function initWebIfc() {
  ifcApi = new WebIFC.IfcAPI()
  /**
   * Percorso WASM — stesso pattern dell'esempio BuildingConfigurator di ThatOpen:
   *   api.SetWasmPath("https://unpkg.com/web-ifc@0.0.77/", true)
   *
   * Adatta la versione alla tua (controlla: node_modules/web-ifc/package.json).
   * Per produzione locale copia i .wasm in public/ e usa SetWasmPath('/', true).
   */
  const version = '0.0.57'   // ← aggiorna con la tua versione installata
  ifcApi.SetWasmPath(`https://unpkg.com/web-ifc@${version}/`, true)
  await ifcApi.Init()
  log('web-ifc IfcAPI inizializzato', 'success')
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL INIT
// ─────────────────────────────────────────────────────────────────────────────

async function initModel() {
  await nextTick()

  // 1. Avvia ThatOpen (OBC + OBF) + Three.js se non ancora fatto
  if (!components) await initThatOpen()

  // 2. Avvia web-ifc se non ancora fatto
  if (!ifcApi) await initWebIfc()

  // 3. Crea modello vuoto
  const schema = cfg.value.schema==='IFC4' ? WebIFC.Schemas.IFC4 : WebIFC.Schemas.IFC2X3
  modelID = ifcApi.CreateModel({ schema })

  // 4. Crea struttura spaziale minima (Project → Site → Building → Storey)
  _buildSpatialStructure()

  elements.value=[]
  selIdx.value=null
  modelReady.value=true

  log(`Modello "${cfg.value.name}" creato (${cfg.value.schema})`, 'success')
  _refreshStep()
}

function resetModel() {
  for (const g of meshMap.keys()) _rmMesh(g)
  meshMap.clear()
  elements.value=[]; selIdx.value=null; modelReady.value=false
  stepText.value=''; geomCtxID=null; storeyPlcID=null; storeyID=null
  if (modelID!==null&&ifcApi) { try{ifcApi.CloseModel(modelID)}catch{} modelID=null }
  log('Modello resettato','warn')
}

// ─────────────────────────────────────────────────────────────────────────────
// STRUTTURA SPAZIALE — web-ifc low-level API
// Usiamo ifcApi.WriteLine per massima compatibilità con qualsiasi versione
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea un'entità IFC usando il metodo di basso livello `ifcApi.CreateIfcEntity`.
 * Ogni parametro è un oggetto { type: WEBIFC.*, value: ... } oppure null.
 *
 * Questo approccio funziona con web-ifc >=0.0.46 indipendentemente
 * dalla versione di @thatopen/components installata.
 */
function ent(typeConst, ...args) {
  return ifcApi.CreateIfcEntity(modelID, typeConst, ...args)
}

const R   = (v)   => ({ type:WebIFC.IFCREAL,          value: v })
const L   = (v)   => ({ type:WebIFC.IFCLENGTHMEASURE, value: v })
const Lbl = (v)   => ({ type:WebIFC.IFCLABEL,         value: v })
const ID  = (v)   => ({ type:WebIFC.IFCID,            value: v })
const GUID= (v)   => ({ type:WebIFC.IFCGLOBALLYUNIQUEID, value: v })
const Ls  = (arr) => arr.map(v=>ID(v))
const Enum= (v)   => ({ type:WebIFC.IFCPROFILETYPEENUM, value: v })

function mkPoint2D(x,y) {
  return ent(WebIFC.IFCCARTESIANPOINT, { type:WebIFC.IFCLENGTHMEASURE, value:[x,y] })
}
function mkPoint3D(x,y,z) {
  return ent(WebIFC.IFCCARTESIANPOINT, { type:WebIFC.IFCLENGTHMEASURE, value:[x,y,z] })
}
function mkDir(x,y,z) {
  return ent(WebIFC.IFCDIRECTION, { type:WebIFC.IFCREAL, value:[x,y,z] })
}
function mkAP2D(originID) {
  return ent(WebIFC.IFCAXIS2PLACEMENT2D, ID(originID), null)
}
function mkAP3D(originID, axisID=null, refDirID=null) {
  return ent(WebIFC.IFCAXIS2PLACEMENT3D,
    ID(originID),
    axisID   ? ID(axisID)   : null,
    refDirID ? ID(refDirID) : null
  )
}
function mkLocalPlacement(relToID, placementID) {
  return ent(WebIFC.IFCLOCALPLACEMENT,
    relToID ? ID(relToID) : null,
    ID(placementID)
  )
}

function _buildSpatialStructure() {
  const t  = new Date().toISOString().replace('T',' ').split('.')[0]
  const ts = Math.floor(Date.now()/1000)

  // OwnerHistory
  const orgID   = ent(WebIFC.IFCORGANIZATION, null, Lbl(cfg.value.org), null, null, null)
  const appID   = ent(WebIFC.IFCAPPLICATION, ID(orgID), Lbl('1.0'), Lbl('IFC Builder Vue3'), Lbl('IfcBV3'))
  const perID   = ent(WebIFC.IFCPERSON, null, Lbl('Author'), Lbl('BIM'), null, null, null, null, null)
  const poID    = ent(WebIFC.IFCPERSONANDORGANIZATION, ID(perID), ID(orgID), null)
  const ohID    = ent(WebIFC.IFCOWNERHISTORY, ID(poID), ID(appID), null,
                    { type:WebIFC.IFCCHANGEACTIONENUM, value:'ADDED' },
                    null, null, null,
                    { type:WebIFC.IFCTIMESTAMP, value:ts })

  // Unità
  const u1 = ent(WebIFC.IFCSIUNIT, null,
    { type:WebIFC.IFCUNITSENUM, value:'LENGTHUNIT' },
    { type:WebIFC.IFCSIPREFIX, value:'MILLI' },
    { type:WebIFC.IFCSIUNITNAME, value:'METRE' })
  const u2 = ent(WebIFC.IFCSIUNIT, null,
    { type:WebIFC.IFCUNITSENUM, value:'AREAUNIT' }, null,
    { type:WebIFC.IFCSIUNITNAME, value:'SQUARE_METRE' })
  const u3 = ent(WebIFC.IFCSIUNIT, null,
    { type:WebIFC.IFCUNITSENUM, value:'VOLUMEUNIT' }, null,
    { type:WebIFC.IFCSIUNITNAME, value:'CUBIC_METRE' })
  const ua = ent(WebIFC.IFCUNITASSIGNMENT, [ID(u1),ID(u2),ID(u3)])

  // Contesto geometrico
  const ctxOrigin = mkPoint3D(0,0,0)
  const ctxDir    = mkDir(0,1,0)
  const ctxAP     = mkAP3D(ctxOrigin)
  const ctx       = ent(WebIFC.IFCGEOMETRICREPRESENTATIONCONTEXT,
    null, Lbl('Model'), R(3), R(1e-5), ID(ctxAP), ID(ctxDir))
  geomCtxID = ctx

  // Project
  const prjID = ent(WebIFC.IFCPROJECT, GUID(_ifcGuid()), ID(ohID),
    Lbl(cfg.value.name), null, null, null, null,
    [ID(ctx)], ID(ua))

  // Site
  const siteO  = mkPoint3D(0,0,0); const siteA=mkAP3D(siteO)
  const sitePl = mkLocalPlacement(null, siteA)
  const siteID = ent(WebIFC.IFCSITE, GUID(_ifcGuid()), ID(ohID), Lbl('Sito'),
    null, null, ID(sitePl), null, null,
    { type:WebIFC.IFCELEMENTCOMPOSITIONENUM, value:'ELEMENT' },
    null, null, null, null, null)

  // Building
  const bldgO  = mkPoint3D(0,0,0); const bldgA=mkAP3D(bldgO)
  const bldgPl = mkLocalPlacement(sitePl, bldgA)
  const bldgID = ent(WebIFC.IFCBUILDING, GUID(_ifcGuid()), ID(ohID), Lbl(cfg.value.name),
    null, null, ID(bldgPl), null, null,
    { type:WebIFC.IFCELEMENTCOMPOSITIONENUM, value:'ELEMENT' },
    null, null, null)

  // Storey
  const stO  = mkPoint3D(0,0,0); const stA=mkAP3D(stO)
  const stPl = mkLocalPlacement(bldgPl, stA)
  storeyPlcID = stPl
  const stID = ent(WebIFC.IFCBUILDINGSTOREY, GUID(_ifcGuid()), ID(ohID), Lbl('Piano Terra'),
    null, null, ID(stPl), null, null,
    { type:WebIFC.IFCELEMENTCOMPOSITIONENUM, value:'ELEMENT' },
    L(0))
  storeyID = stID

  // Aggregazioni
  ent(WebIFC.IFCRELAGGREGATES, GUID(_ifcGuid()), ID(ohID), null, null, ID(prjID), [ID(siteID)])
  ent(WebIFC.IFCRELAGGREGATES, GUID(_ifcGuid()), ID(ohID), null, null, ID(siteID), [ID(bldgID)])
  ent(WebIFC.IFCRELAGGREGATES, GUID(_ifcGuid()), ID(ohID), null, null, ID(bldgID), [ID(stID)])
}

// ─────────────────────────────────────────────────────────────────────────────
// AGGIUNGI ELEMENTO
// ─────────────────────────────────────────────────────────────────────────────

function addElement(opts) {
  if (!modelReady.value) { log('Nessun modello','error'); return }
  const src = opts || form.value
  const lin = isLinear(src.type)

  const el = {
    guid: _uuid(),
    type: src.type,
    name: src.name || `${src.type}_${String(elements.value.length+1).padStart(3,'0')}`,
    mat:  src.mat  || '',
    n1: { ...src.n1 },
    n2: lin ? { ...src.n2 } : { x:src.n1.x+(src.l||5), y:src.n1.y, z:src.n1.z },
    l: Math.max(0.01, src.l||5),
    w: Math.max(0.01, src.w||0.3),
    h: Math.max(0.01, src.h||0.5),
    rotY: src.rotY||0,
    ifcID: null,
  }

  // ── Crea entità IFC ───────────────────────────────────────────────────────
  try {
    const plcID = _createPlacement(el)
    const shpID = _createGeometry(el)
    const typeC = WebIFC[el.type]
    if (!typeC) throw new Error(`Tipo non trovato: ${el.type}`)

    el.ifcID = ent(typeC,
      GUID(_ifcGuid(el.guid)),
      null,
      Lbl(el.name),
      null,
      Lbl(el.type),
      ID(plcID),
      ID(shpID),
      null
    )

    // Materiale
    const matID = ent(WebIFC.IFCMATERIAL, Lbl(el.mat||'Non specificato'), null, null)
    ent(WebIFC.IFCRELASSOCIATESMATERIAL,
      GUID(_ifcGuid()), null, null, null,
      [ID(el.ifcID)], ID(matID))

    // Contenimento nel piano
    ent(WebIFC.IFCRELCONTAINEDINSPATIALSTRUCTURE,
      GUID(_ifcGuid()), null, null, null,
      [ID(el.ifcID)], ID(storeyID))

    log(`IFC entità #${el.ifcID} creata`,'info')
  } catch(err) {
    log(`web-ifc error: ${err.message}`,'error')
    console.error(err)
  }

  elements.value.push(el)
  _addMesh(el)
  selectEl(elements.value.length-1)

  const info = lin
    ? `N1(${el.n1.x},${el.n1.y},${el.n1.z})→N2(${el.n2.x},${el.n2.y},${el.n2.z}) L=${segL(el.n1,el.n2).toFixed(2)}m`
    : `(${el.n1.x},${el.n1.y},${el.n1.z}) ${el.l}×${el.w}×${el.h}m`
  log(`Aggiunto ${el.type} "${el.name}" — ${info}`,'success')
  if (!opts) form.value.name=''
  _refreshStep()
}

function removeElement(idx) {
  if (idx===null||idx<0||idx>=elements.value.length) return
  const el=elements.value[idx]
  _rmMesh(el.guid)
  if (el.ifcID!==null&&ifcApi&&modelID!==null) try{ifcApi.DeleteLine(modelID,el.ifcID)}catch{}
  elements.value.splice(idx,1)
  if (selIdx.value===idx)       selIdx.value=null
  else if (selIdx.value>idx)    selIdx.value--
  log(`Rimosso "${el.name}"`,'warn')
  _refreshStep()
}

function selectEl(idx) {
  if (selIdx.value!==null&&elements.value[selIdx.value]) _hl(elements.value[selIdx.value].guid,false)
  selIdx.value=idx
  if (idx!==null&&elements.value[idx]) _hl(elements.value[idx].guid,true)
}

function updNode(idx,node,coord,val) {
  if (idx===null||!elements.value[idx]||isNaN(val)) return
  elements.value[idx][node][coord]=val; _rebuild(idx)
}
function updProp(idx,prop,val) {
  if (idx===null||!elements.value[idx]||isNaN(val)) return
  elements.value[idx][prop]=val; _rebuild(idx)
}
function _rebuild(idx) {
  const el=elements.value[idx]; _rmMesh(el.guid)
  if (el.ifcID!==null&&ifcApi&&modelID!==null) try{ifcApi.DeleteLine(modelID,el.ifcID);el.ifcID=null}catch{}
  try {
    const plcID=_createPlacement(el); const shpID=_createGeometry(el)
    const typeC=WebIFC[el.type]
    if (typeC) el.ifcID=ent(typeC,GUID(_ifcGuid(el.guid)),null,Lbl(el.name),null,Lbl(el.type),ID(plcID),ID(shpID),null)
  } catch(e){log(`Rebuild: ${e.message}`,'error')}
  _addMesh(el); _hl(el.guid,true); _refreshStep()
}

// ─────────────────────────────────────────────────────────────────────────────
// IFC GEOMETRY CREATION
// ─────────────────────────────────────────────────────────────────────────────

function _createPlacement(el) {
  const lin=isLinear(el.type)
  if (lin) {
    // Origine = N1 in mm; RefDirection = vettore N1→N2; Axis = up locale
    const d = segDir(el.n1,el.n2)
    const o = mkPoint3D(el.n1.x*1000, el.n1.y*1000, el.n1.z*1000)
    const rd= mkDir(d.x, d.y, d.z)
    // Asse verticale: se l'elemento è prevalentemente verticale (pilastro) usa Y globale
    const ax= Math.abs(d.z)>0.98 ? mkDir(0,1,0) : mkDir(0,0,1)
    const ap= mkAP3D(o, ax, rd)
    return mkLocalPlacement(storeyPlcID, ap)
  } else {
    const rad=(el.rotY||0)*Math.PI/180
    const o  = mkPoint3D(el.n1.x*1000, el.n1.y*1000, el.n1.z*1000)
    const rd = mkDir(Math.cos(rad), Math.sin(rad), 0)
    const ax = mkDir(0,0,1)
    const ap = mkAP3D(o, ax, rd)
    return mkLocalPlacement(storeyPlcID, ap)
  }
}

function _createGeometry(el) {
  const lin=isLinear(el.type)
  const W = el.w*1000, H = el.h*1000
  const Lv= lin ? segL(el.n1,el.n2)*1000 : el.l*1000

  // Profilo rettangolare
  const po  = mkPoint2D(0,0)
  const pax = mkAP2D(po)
  const prof= ent(WebIFC.IFCRECTANGLEPROFILEDEF,
    Enum('AREA'), null, ID(pax), L(W), L(H))

  // Estrusione
  const so  = mkPoint3D(0,0,0)
  const sax = mkAP3D(so)
  const exd = mkDir(0,0,1)
  const solid= ent(WebIFC.IFCEXTRUDEDAREASOLID, ID(prof), ID(sax), ID(exd), L(Lv))

  // ShapeRepresentation
  const srep= ent(WebIFC.IFCSHAPEREPRESENTATION,
    ID(geomCtxID), Lbl('Body'), Lbl('SweptSolid'), [ID(solid)])

  return ent(WebIFC.IFCPRODUCTDEFINITIONSHAPE, null, null, [ID(srep)])
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS MESH
// ─────────────────────────────────────────────────────────────────────────────

function _addMesh(el) {
  if (!scene) return
  const lin=isLinear(el.type)
  const col=TYPE_HEX[el.type]||0x4B5563
  const mat=new THREE.MeshPhongMaterial({color:col,transparent:true,opacity:0.82,shininess:80})
  const g  =new THREE.Group(); g.userData.guid=el.guid

  if (lin) {
    const L=Math.max(segL(el.n1,el.n2),0.01)
    const geo=new THREE.BoxGeometry(el.w,el.h,L)
    const mesh=new THREE.Mesh(geo,mat); mesh.userData.guid=el.guid
    mesh.castShadow=mesh.receiveShadow=true
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({color:0xFFFFFF,transparent:true,opacity:0.15})))
    // Centro tra N1 e N2; THREE: Y=alto, Z=nord
    mesh.position.set((el.n1.x+el.n2.x)/2,(el.n1.z+el.n2.z)/2,(el.n1.y+el.n2.y)/2)
    const d=segDir(el.n1,el.n2)
    mesh.rotation.y=-Math.atan2(d.x,d.y)
    mesh.rotation.x=Math.asin(Math.max(-1,Math.min(1,d.z)))
    g.add(mesh)
    // Sfere nodi
    for (const [n,c] of [[el.n1,0x00FFA3],[el.n2,0xFF3D5A]]) {
      const sp=new THREE.Mesh(new THREE.SphereGeometry(0.15,10,10),
        new THREE.MeshPhongMaterial({color:c,emissive:c,emissiveIntensity:.4}))
      sp.position.set(n.x,n.z,n.y); sp.userData.guid=el.guid; g.add(sp)
    }
    g.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(el.n1.x,el.n1.z,el.n1.y),
        new THREE.Vector3(el.n2.x,el.n2.z,el.n2.y)]),
      new THREE.LineBasicMaterial({color:0x00E5FF,transparent:true,opacity:.45})))
  } else {
    const Lv=Math.max(el.l,0.01),W=Math.max(el.w,0.01),H=Math.max(el.h,0.01)
    const geo=new THREE.BoxGeometry(Lv,H,W)
    const mesh=new THREE.Mesh(geo,mat); mesh.userData.guid=el.guid
    mesh.castShadow=mesh.receiveShadow=true
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({color:0xFFFFFF,transparent:true,opacity:0.15})))
    mesh.position.set(el.n1.x+Lv/2,el.n1.z+H/2,el.n1.y+W/2)
    mesh.rotation.y=THREE.MathUtils.degToRad(el.rotY||0)
    g.add(mesh)
    const sp=new THREE.Mesh(new THREE.SphereGeometry(0.13,8,8),
      new THREE.MeshPhongMaterial({color:0x00FFA3,emissive:0x00FFA3,emissiveIntensity:.4}))
    sp.position.set(el.n1.x,el.n1.z,el.n1.y); sp.userData.guid=el.guid; g.add(sp)
  }
  scene.add(g); meshMap.set(el.guid,g)
}

function _rmMesh(guid) {
  const g=meshMap.get(guid); if(!g) return
  scene.remove(g)
  g.traverse(c=>{ if(c.geometry)c.geometry.dispose(); if(c.material)c.material.dispose() })
  meshMap.delete(guid)
}

function _hl(guid,on) {
  const g=meshMap.get(guid); if(!g) return
  g.traverse(c=>{
    if(c.isMesh&&c.userData.guid===guid) {
      c.material.emissive=new THREE.Color(on?0x00E5FF:0x000000)
      c.material.emissiveIntensity=on?.45:0
      c.material.opacity=on?1:.82
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT — usa web-ifc SaveModel
// ─────────────────────────────────────────────────────────────────────────────

function _refreshStep() {
  if (!ifcApi||modelID===null) return
  try {
    const buf = ifcApi.SaveModel(modelID)
    stepText.value = new TextDecoder().decode(buf)
  } catch(e) { stepText.value=`/* ${e.message} */` }
}

function exportIfc() {
  _refreshStep()
  const blob=new Blob([stepText.value],{type:'application/x-step'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a')
  a.href=url; a.download=`${cfg.value.name.replace(/\s+/g,'_')}.ifc`; a.click()
  URL.revokeObjectURL(url)
  log(`Esportato via web-ifc.SaveModel() — ${elements.value.length} elementi`,'success')
}

async function copyStep() {
  _refreshStep()
  try { await navigator.clipboard.writeText(stepText.value); log('STEP copiato','success') }
  catch { log('Copia fallita','error') }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────

function togglePlacing() { placing.value=!placing.value; if(!placing.value) pendingN1.value=null }

function tCol(type) {
  const n=TYPE_HEX[type]||0x4B5563
  return `#${n.toString(16).padStart(6,'0')}`
}

function _uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{
    const r=Math.random()*16|0; return(c==='x'?r:(r&3|8)).toString(16).toUpperCase()
  })
}

/**
 * Converte un UUID standard nel formato GloballyUniqueId IFC (22 char base64-like).
 * Se non viene passato un guid usa ne genera uno nuovo.
 */
function _ifcGuid(uuid) {
  const hex=(uuid||_uuid()).replace(/-/g,'')
  const chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$'
  let r=''
  for(let i=0;i<32;i+=6){
    const c=parseInt(hex.substr(i,6),16)
    r+=chars[(c>>30)&63]+chars[(c>>24)&63]+chars[(c>>18)&63]
      +chars[(c>>12)&63]+chars[(c>>6) &63]+chars[c       &63]
  }
  return r.substring(0,22)
}

function log(msg,t='info') {
  logs.value.unshift({msg,t,time:new Date().toLocaleTimeString('it-IT')})
  if(logs.value.length>30) logs.value.pop()
}

// ─────────────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────

onBeforeUnmount(() => {
  window.removeEventListener('keydown', _onKD)
  window.removeEventListener('resize',  _onResize)
  // Rimuovi listener dal canvas creato da OBF.PostproductionRenderer
  const cv = renderer?.domElement
  if (cv) {
    cv.removeEventListener('mousedown', _onMD)
    cv.removeEventListener('mousemove', _onMM)
    cv.removeEventListener('mouseup',   _onMU)
  }
  if (modelID !== null && ifcApi) try { ifcApi.CloseModel(modelID) } catch {}
  // components.dispose() chiude renderer, scene, camera e tutti i sistemi OBC
  if (components) try { components.dispose() } catch {}
})

defineExpose({ addElement, removeElement, updNode, updProp, exportIfc, elements, modelReady })
</script>

<style scoped>
.ifc-app {
  --bg:    #070910; --surf:  #0F1220; --brd:  #181E30;
  --acc:   #00E5FF; --grn:   #00FFA3; --txt:  #D8E6F2;
  --muted: #4A607A; --dng:   #FF3D5A; --wrn:  #FFC107;
  --n1: #00FFA3; --n2: #FF3D5A;

  display:flex; flex-direction:column; height:100vh;
  background:var(--bg); color:var(--txt);
  font-family:'IBM Plex Mono','JetBrains Mono',monospace;
  font-size:12.5px; overflow:hidden;
}

/* ── Topbar ─────────────────────────────────────────── */
.topbar {
  display:flex; align-items:center; gap:14px; justify-content:space-between;
  padding:9px 20px; background:var(--surf); border-bottom:1px solid var(--brd); flex-shrink:0;
}
.topbar-brand { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.topbar-title { display:flex; flex-direction:column; }
.topbar-name { font-size:13px; font-weight:700; letter-spacing:.07em; }
.topbar-sub  { font-size:8.5px; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; }
.topbar-toolbar { display:flex; align-items:center; gap:3px; flex:1; justify-content:center; flex-wrap:wrap; }
.tool-group { display:flex; gap:2px; }
.tbtn {
  padding:3px 10px; background:transparent; border:1px solid var(--brd);
  border-radius:3px; color:var(--muted); cursor:pointer;
  font-family:inherit; font-size:9px; font-weight:600; transition:all .12s; white-space:nowrap;
}
.tbtn:hover:not(:disabled){ border-color:var(--acc); color:var(--acc); }
.tbtn.active { background:#00E5FF18; border-color:var(--acc); color:var(--acc); }
.tbtn:disabled { opacity:.25; cursor:not-allowed; }
.tool-sep { width:1px; height:16px; background:var(--brd); margin:0 4px; }
.topbar-status { display:flex; align-items:center; gap:7px; flex-shrink:0; }
.sdot { width:7px; height:7px; border-radius:50%; background:var(--brd); border:1px solid var(--muted); transition:all .3s; }
.sdot.live { background:var(--grn); border-color:var(--grn); box-shadow:0 0 8px #00FFA388; }
.stxt { font-size:9px; color:var(--muted); }

/* ── Shell ──────────────────────────────────────────── */
.shell { display:flex; flex:1; overflow:hidden; }

/* ── Sidebar ────────────────────────────────────────── */
.sidebar {
  width:268px; flex-shrink:0; background:var(--surf);
  border-right:1px solid var(--brd); overflow-y:auto;
}
.sidebar::-webkit-scrollbar { width:3px; }
.sidebar::-webkit-scrollbar-thumb { background:var(--brd); }

.panel { padding:13px; border-bottom:1px solid var(--brd); transition:opacity .2s; }
.panel.locked { opacity:.25; pointer-events:none; }
.phd {
  display:flex; align-items:center; gap:8px; margin-bottom:12px;
  font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#5A7090;
}
.step {
  font-size:8px; font-weight:800; color:var(--acc);
  background:#00E5FF18; padding:2px 5px; border-radius:2px; letter-spacing:0;
}

.ncard { border-radius:4px; padding:9px 10px; margin-bottom:6px; border:1px solid var(--brd); background:#080B14; }
.n1c { border-left:2px solid var(--n1); }
.n2c { border-left:2px solid var(--n2); }
.nhd {
  display:flex; align-items:center; gap:6px; margin-bottom:6px;
  font-size:8.5px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:#5A7090;
}
.nd { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.n1d { background:var(--n1); box-shadow:0 0 5px var(--n1); }
.n2d { background:var(--n2); box-shadow:0 0 5px var(--n2); }

.xyz { display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px; }

.dbox {
  background:#050710; border:1px solid var(--brd); border-radius:4px;
  padding:7px 10px; margin-bottom:8px; display:flex; flex-direction:column; gap:4px;
}
.dr { display:flex; justify-content:space-between; align-items:center; }
.dr span { font-size:8.5px; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; }
.dr b { font-size:10px; font-weight:700; color:var(--txt); }
.dr b.acc { color:var(--acc); }

.field { margin-bottom:6px; }
.field label { display:block; font-size:8px; color:var(--muted); margin-bottom:3px; text-transform:uppercase; letter-spacing:.06em; }
.field input,.field select {
  width:100%; box-sizing:border-box; background:#050710;
  border:1px solid var(--brd); border-radius:3px; color:var(--txt);
  padding:5px 7px; font-family:inherit; font-size:11px; transition:border .12s;
}
.field input:focus,.field select:focus { outline:none; border-color:#00E5FF55; }
.field select option { background:#050710; }
.flbl { font-size:8px; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin:8px 0 4px; }

.btn {
  width:100%; padding:7px 12px; border-radius:3px; border:none;
  cursor:pointer; font-family:inherit; font-size:9px; font-weight:700;
  letter-spacing:.05em; text-transform:uppercase; transition:all .12s; margin-top:5px;
}
.btn:disabled { opacity:.25; cursor:not-allowed; }
.btn.primary    { background:#00E5FF18; color:var(--acc);  border:1px solid #00E5FF44; }
.btn.primary:hover:not(:disabled)  { background:#00E5FF28; }
.btn.accent     { background:#00FFA318; color:var(--grn);  border:1px solid #00FFA344; }
.btn.accent:hover:not(:disabled)   { background:#00FFA328; }
.btn.ghost      { background:transparent; color:var(--muted); border:1px dashed var(--brd); }
.btn.ghost:hover:not(:disabled)    { border-color:var(--acc); color:var(--acc); }
.btn.warnbtn    { background:#FFC10718; color:var(--wrn);  border:1px solid #FFC10744; }
.btn.exportbtn  { background:#2563EB18; color:#60A5FA;      border:1px solid #2563EB55; }
.btn.exportbtn:hover:not(:disabled){ background:#2563EB28; }
.btn.danger     { background:#FF3D5A18; color:var(--dng);  border:1px solid #FF3D5A44; }
.btn.danger:hover:not(:disabled)   { background:#FF3D5A28; }

.enote { font-size:8px; color:var(--muted); margin-top:8px; line-height:1.5; }
.enote code { color:var(--acc); background:#0F1220; border:1px solid var(--brd); border-radius:2px; padding:1px 4px; }
.selbadge { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.selname { font-size:10px; font-weight:600; color:var(--txt); }

/* ── Main ───────────────────────────────────────────── */
.main { flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:12px; }
.main::-webkit-scrollbar { width:3px; }
.main::-webkit-scrollbar-thumb { background:var(--brd); }

.welcome { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:50px 32px; color:var(--muted); }
.welcome h2 { font-size:18px; font-weight:700; color:#6A88A8; margin:0 0 12px; }
.welcome p  { max-width:420px; line-height:1.9; font-size:12px; }
.welcome code { background:#0F1220; border:1px solid var(--brd); border-radius:3px; padding:1px 5px; color:var(--acc); }
.welcome strong { color:var(--grn); }
.deplist { display:flex; gap:7px; flex-wrap:wrap; justify-content:center; margin-top:16px; }
.deplist span { font-size:9px; background:#0F1220; border:1px solid var(--brd); border-radius:3px; padding:3px 8px; color:#5A7090; }

/* ── Viewer ─────────────────────────────────────────── */
.vwrap {
  position:relative; height:400px; flex-shrink:0;
  background:#040608; border:1px solid var(--brd); border-radius:4px; overflow:hidden;
}
.obc-container { width:100%; height:100%; display:block; }
/* Il canvas iniettato da PostproductionRenderer */
.obc-container canvas { width:100% !important; height:100% !important; display:block; }
.pbanner {
  position:absolute; z-index:10; pointer-events:none;
  top:10px; left:50%; transform:translateX(-50%);
  background:#FFC10720; border:1px solid #FFC10766;
  color:var(--wrn); padding:5px 16px; border-radius:20px; font-size:10px; white-space:nowrap;
}
kbd { background:var(--brd); border:1px solid #252D40; padding:1px 5px; border-radius:2px; font-family:inherit; font-size:9px; margin-left:6px; }
.chud { position:absolute; z-index:10; bottom:10px; left:10px; pointer-events:none; background:#00000099; border:1px solid var(--brd); color:var(--muted); padding:3px 10px; border-radius:3px; font-size:9px; }
.vlegend { position:absolute; z-index:10; bottom:10px; right:10px; pointer-events:none; display:flex; gap:10px; font-size:8px; color:#243040; }
.blink { animation:blink 1s step-end infinite; }
@keyframes blink{ 50%{ opacity:0; } }

/* ── Stats ──────────────────────────────────────────── */
.stats { display:flex; gap:2px; flex-shrink:0; }
.sc { flex:1; background:var(--surf); border:1px solid var(--brd); padding:8px 10px; border-radius:3px; }
.sv { font-size:16px; font-weight:800; color:var(--acc); line-height:1; margin-bottom:2px; }
.sl { font-size:8px; color:var(--muted); text-transform:uppercase; letter-spacing:.07em; }

/* ── Element list ───────────────────────────────────── */
.elhd { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.elhd h3 { margin:0; font-size:9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#5A7090; }
.badge { background:#00E5FF15; color:var(--acc); border:1px solid #00E5FF33; border-radius:10px; padding:1px 7px; font-size:9px; font-weight:700; }
.elempty { text-align:center; padding:22px; color:var(--muted); font-size:11px; background:var(--surf); border:1px dashed var(--brd); border-radius:3px; }
.ellist { display:flex; flex-direction:column; gap:2px; }
.elrow { display:flex; align-items:center; gap:8px; padding:7px 10px; background:var(--surf); border:1px solid var(--brd); border-radius:3px; cursor:pointer; transition:all .1s; }
.elrow:hover { border-color:#252D40; background:#141A28; }
.elrow.sel   { border-color:#00E5FF55; background:#00E5FF08; }
.tpill { padding:2px 7px; border-radius:2px; font-size:8.5px; font-weight:800; color:white; flex-shrink:0; min-width:54px; text-align:center; }
.tpill.sm { font-size:8px; padding:2px 6px; }
.elinfo { flex:1; min-width:0; }
.elname { font-size:10px; font-weight:600; color:var(--txt); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.elmeta { font-size:8px; color:var(--muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.eldel { background:none; border:none; color:#243040; cursor:pointer; font-size:10px; padding:2px 4px; border-radius:2px; transition:all .1s; flex-shrink:0; }
.eldel:hover { background:#FF3D5A22; color:var(--dng); }

/* ── STEP Preview ───────────────────────────────────── */
.stepbox { background:#040608; border:1px solid var(--brd); border-radius:3px; overflow:hidden; }
.stephd { display:flex; justify-content:space-between; align-items:center; padding:5px 10px; background:var(--surf); border-bottom:1px solid var(--brd); font-size:8px; text-transform:uppercase; letter-spacing:.07em; color:var(--muted); }
.stlines { color:var(--acc); }
.stepcode { padding:10px; margin:0; font-size:8px; line-height:1.6; color:var(--grn); overflow-x:auto; max-height:200px; overflow-y:auto; font-family:inherit; }

/* ── Log ────────────────────────────────────────────── */
.logbox { background:var(--surf); border:1px solid var(--brd); border-radius:3px; overflow:hidden; }
.loghd { padding:5px 10px; font-size:8px; text-transform:uppercase; letter-spacing:.07em; color:var(--muted); border-bottom:1px solid var(--brd); }
.logrow { display:flex; gap:8px; padding:4px 10px; border-bottom:1px solid #181E3055; font-size:9px; }
.lt { color:#243040; flex-shrink:0; }
.logrow.success span:last-child { color:var(--grn); }
.logrow.error   span:last-child { color:var(--dng); }
.logrow.warn    span:last-child { color:var(--wrn); }
.logrow.info    span:last-child { color:#5A7090; }
</style>
