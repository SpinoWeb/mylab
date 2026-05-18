<template>
  <div class="ifc-app">
    <!-- ════════════════════════════════════════════════════════ HEADER -->
    <header class="topbar">
      <div class="topbar-brand">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polygon
            points="14,2 26,9 26,19 14,26 2,19 2,9"
            fill="none"
            stroke="#00E5FF"
            stroke-width="1.5"
          />
          <polygon
            points="14,7 21,11 21,17 14,21 7,17 7,11"
            fill="#00E5FF22"
            stroke="#00E5FF"
            stroke-width="1"
          />
        </svg>
        <div class="topbar-title">
          <span class="topbar-name">IFC Model Builder</span>
          <span class="topbar-sub">ThatOpen · web-ifc · Vue 3 · Vite</span>
        </div>
      </div>

      <div class="topbar-toolbar" v-if="modelReady">
        <div class="tool-group">
          <button
            class="tbtn"
            :class="{ active: view === '3d' }"
            @click="setCameraPreset('3d')"
          >
            3D
          </button>
          <button
            class="tbtn"
            :class="{ active: view === 'top' }"
            @click="setCameraPreset('top')"
          >
            Top
          </button>
          <button
            class="tbtn"
            :class="{ active: view === 'front' }"
            @click="setCameraPreset('front')"
          >
            Front
          </button>
          <button
            class="tbtn"
            :class="{ active: view === 'side' }"
            @click="setCameraPreset('side')"
          >
            Side
          </button>
        </div>
        <div class="tool-sep" />
        <div class="tool-group">
          <button class="tbtn" @click="fitCamera">⊡ Fit</button>
          <button class="tbtn" :class="{ active: snap }" @click="snap = !snap">
            ⊞ Snap {{ snap ? "ON" : "OFF" }}
          </button>
          <button
            class="tbtn"
            :class="{ active: showAxes }"
            @click="toggleAxes"
          >
            Assi
          </button>
          <button
            class="tbtn"
            :class="{ active: placing }"
            @click="togglePlacing"
            :disabled="!modelReady"
          >
            {{ placing ? "✕ Annulla" : "⊕ Posiziona" }}
          </button>
        </div>
      </div>

      <div class="topbar-status">
        <span class="status-dot" :class="{ live: modelReady }" />
        <span class="status-txt">{{
          modelReady ? "Modello attivo" : "Nessun modello"
        }}</span>
      </div>
    </header>

    <div class="shell">
      <!-- ═══════════════════════════════════════════════════ SIDEBAR -->
      <aside class="sidebar">
        <!-- ── 01 Inizializza ──────────────────────────────────────── -->
        <section class="panel">
          <div class="panel-hd">
            <span class="step">01</span> Inizializza Modello
          </div>

          <div class="field">
            <label>Nome progetto</label>
            <input
              v-model="cfg.name"
              placeholder="Edificio A"
              :disabled="modelReady"
            />
          </div>
          <div class="field">
            <label>Organizzazione</label>
            <input
              v-model="cfg.org"
              placeholder="Studio XYZ"
              :disabled="modelReady"
            />
          </div>
          <div class="field">
            <label>Schema IFC</label>
            <select v-model="cfg.schema" :disabled="modelReady">
              <option value="IFC4">IFC 4</option>
              <option value="IFC2X3">IFC 2x3</option>
            </select>
          </div>

          <button class="btn primary" @click="initModel" :disabled="modelReady">
            {{ modelReady ? "✓ Modello pronto" : "Inizializza Modello" }}
          </button>
          <button class="btn ghost" @click="resetModel" v-if="modelReady">
            ↺ Nuovo modello
          </button>
        </section>

        <!-- ── 02 Nuovo Elemento ────────────────────────────────────── -->
        <section class="panel" :class="{ locked: !modelReady }">
          <div class="panel-hd">
            <span class="step">02</span> Nuovo Elemento
          </div>

          <div class="field">
            <label>Tipo IFC</label>
            <select v-model="form.type" @change="onTypeChange">
              <option v-for="t in ELEMENT_TYPES" :key="t.v" :value="t.v">
                {{ t.label }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>Nome</label>
            <input v-model="form.name" :placeholder="form.type + '_001'" />
          </div>
          <div class="field">
            <label>Materiale</label>
            <input v-model="form.material" placeholder="C25/30" />
          </div>

          <!-- Lineari: N1 + N2 -->
          <template v-if="isLinear(form.type)">
            <div class="node-card n1-card">
              <div class="node-hd">
                <span class="ndot n1" />Nodo iniziale N1
              </div>
              <div class="xyz-row">
                <div class="field">
                  <label>X</label
                  ><input v-model.number="form.n1.x" type="number" step="0.5" />
                </div>
                <div class="field">
                  <label>Y</label
                  ><input v-model.number="form.n1.y" type="number" step="0.5" />
                </div>
                <div class="field">
                  <label>Z</label
                  ><input v-model.number="form.n1.z" type="number" step="0.5" />
                </div>
              </div>
            </div>
            <div class="node-card n2-card">
              <div class="node-hd"><span class="ndot n2" />Nodo finale N2</div>
              <div class="xyz-row">
                <div class="field">
                  <label>X</label
                  ><input v-model.number="form.n2.x" type="number" step="0.5" />
                </div>
                <div class="field">
                  <label>Y</label
                  ><input v-model.number="form.n2.y" type="number" step="0.5" />
                </div>
                <div class="field">
                  <label>Z</label
                  ><input v-model.number="form.n2.z" type="number" step="0.5" />
                </div>
              </div>
            </div>
            <div class="derived-box">
              <div class="dr">
                <span>Lunghezza</span
                ><strong class="acc">{{ fmtLen(form.n1, form.n2) }} m</strong>
              </div>
              <div class="dr">
                <span>Inclinazione</span
                ><strong>{{ fmtSlope(form.n1, form.n2) }}°</strong>
              </div>
            </div>
            <div class="field-group-lbl">Sezione trasversale (m)</div>
            <div class="xyz-row">
              <div class="field">
                <label>W</label
                ><input
                  v-model.number="form.w"
                  type="number"
                  step="0.05"
                  min="0.01"
                />
              </div>
              <div class="field">
                <label>H</label
                ><input
                  v-model.number="form.h"
                  type="number"
                  step="0.05"
                  min="0.01"
                />
              </div>
            </div>
          </template>

          <!-- Areali: origine + dimensioni -->
          <template v-else>
            <div class="node-card n1-card">
              <div class="node-hd"><span class="ndot n1" />Origine</div>
              <div class="xyz-row">
                <div class="field">
                  <label>X</label
                  ><input v-model.number="form.n1.x" type="number" step="0.5" />
                </div>
                <div class="field">
                  <label>Y</label
                  ><input v-model.number="form.n1.y" type="number" step="0.5" />
                </div>
                <div class="field">
                  <label>Z</label
                  ><input v-model.number="form.n1.z" type="number" step="0.5" />
                </div>
              </div>
            </div>
            <div class="field-group-lbl">Dimensioni (m)</div>
            <div class="xyz-row">
              <div class="field">
                <label>L</label
                ><input
                  v-model.number="form.l"
                  type="number"
                  step="0.1"
                  min="0.1"
                />
              </div>
              <div class="field">
                <label>W</label
                ><input
                  v-model.number="form.w"
                  type="number"
                  step="0.1"
                  min="0.1"
                />
              </div>
              <div class="field">
                <label>H</label
                ><input
                  v-model.number="form.h"
                  type="number"
                  step="0.1"
                  min="0.1"
                />
              </div>
            </div>
            <div class="field">
              <label>Rotazione Y (°)</label>
              <input v-model.number="form.rotY" type="number" step="15" />
            </div>
          </template>

          <button
            class="btn accent"
            @click="addElement(null)"
            :disabled="!modelReady"
          >
            + Aggiungi elemento
          </button>
          <button
            class="btn ghost"
            @click="togglePlacing"
            :disabled="!modelReady"
            v-if="!placing"
          >
            ⊕ Posiziona nel viewer
          </button>
          <button class="btn warn-btn" @click="togglePlacing" v-if="placing">
            ✕ Annulla posizionamento
          </button>
        </section>

        <!-- ── 03 Modifica selezionato ──────────────────────────────── -->
        <section
          class="panel edit-panel"
          v-if="selIdx !== null && elements[selIdx]"
        >
          <div class="panel-hd"><span class="step">03</span> Modifica</div>
          <div class="sel-hd">
            <span
              class="type-pill"
              :style="{ background: typeColor(elements[selIdx].type) }"
            >
              {{ elements[selIdx].type.replace("IFC", "") }}
            </span>
            <span class="sel-name">{{ elements[selIdx].name }}</span>
          </div>

          <template v-if="isLinear(elements[selIdx].type)">
            <div class="node-card n1-card">
              <div class="node-hd"><span class="ndot n1" />N1</div>
              <div class="xyz-row">
                <div class="field">
                  <label>X</label
                  ><input
                    type="number"
                    step="0.5"
                    :value="elements[selIdx].n1.x"
                    @change="
                      updNode(selIdx, 'n1', 'x', $event.target.valueAsNumber)
                    "
                  />
                </div>
                <div class="field">
                  <label>Y</label
                  ><input
                    type="number"
                    step="0.5"
                    :value="elements[selIdx].n1.y"
                    @change="
                      updNode(selIdx, 'n1', 'y', $event.target.valueAsNumber)
                    "
                  />
                </div>
                <div class="field">
                  <label>Z</label
                  ><input
                    type="number"
                    step="0.5"
                    :value="elements[selIdx].n1.z"
                    @change="
                      updNode(selIdx, 'n1', 'z', $event.target.valueAsNumber)
                    "
                  />
                </div>
              </div>
            </div>
            <div class="node-card n2-card">
              <div class="node-hd"><span class="ndot n2" />N2</div>
              <div class="xyz-row">
                <div class="field">
                  <label>X</label
                  ><input
                    type="number"
                    step="0.5"
                    :value="elements[selIdx].n2.x"
                    @change="
                      updNode(selIdx, 'n2', 'x', $event.target.valueAsNumber)
                    "
                  />
                </div>
                <div class="field">
                  <label>Y</label
                  ><input
                    type="number"
                    step="0.5"
                    :value="elements[selIdx].n2.y"
                    @change="
                      updNode(selIdx, 'n2', 'y', $event.target.valueAsNumber)
                    "
                  />
                </div>
                <div class="field">
                  <label>Z</label
                  ><input
                    type="number"
                    step="0.5"
                    :value="elements[selIdx].n2.z"
                    @change="
                      updNode(selIdx, 'n2', 'z', $event.target.valueAsNumber)
                    "
                  />
                </div>
              </div>
            </div>
            <div class="derived-box">
              <div class="dr">
                <span>Lunghezza</span
                ><strong class="acc"
                  >{{
                    fmtLen(elements[selIdx].n1, elements[selIdx].n2)
                  }}
                  m</strong
                >
              </div>
              <div class="dr">
                <span>Inclinazione</span
                ><strong
                  >{{
                    fmtSlope(elements[selIdx].n1, elements[selIdx].n2)
                  }}°</strong
                >
              </div>
            </div>
            <div class="field-group-lbl">Sezione (m)</div>
            <div class="xyz-row">
              <div class="field">
                <label>W</label
                ><input
                  type="number"
                  step="0.05"
                  min="0.01"
                  :value="elements[selIdx].w"
                  @change="updProp(selIdx, 'w', $event.target.valueAsNumber)"
                />
              </div>
              <div class="field">
                <label>H</label
                ><input
                  type="number"
                  step="0.05"
                  min="0.01"
                  :value="elements[selIdx].h"
                  @change="updProp(selIdx, 'h', $event.target.valueAsNumber)"
                />
              </div>
            </div>
          </template>

          <template v-else>
            <div class="node-card n1-card">
              <div class="node-hd"><span class="ndot n1" />Origine</div>
              <div class="xyz-row">
                <div class="field">
                  <label>X</label
                  ><input
                    type="number"
                    step="0.5"
                    :value="elements[selIdx].n1.x"
                    @change="
                      updNode(selIdx, 'n1', 'x', $event.target.valueAsNumber)
                    "
                  />
                </div>
                <div class="field">
                  <label>Y</label
                  ><input
                    type="number"
                    step="0.5"
                    :value="elements[selIdx].n1.y"
                    @change="
                      updNode(selIdx, 'n1', 'y', $event.target.valueAsNumber)
                    "
                  />
                </div>
                <div class="field">
                  <label>Z</label
                  ><input
                    type="number"
                    step="0.5"
                    :value="elements[selIdx].n1.z"
                    @change="
                      updNode(selIdx, 'n1', 'z', $event.target.valueAsNumber)
                    "
                  />
                </div>
              </div>
            </div>
            <div class="field-group-lbl">Dimensioni (m)</div>
            <div class="xyz-row">
              <div class="field">
                <label>L</label
                ><input
                  type="number"
                  step="0.1"
                  min="0.01"
                  :value="elements[selIdx].l"
                  @change="updProp(selIdx, 'l', $event.target.valueAsNumber)"
                />
              </div>
              <div class="field">
                <label>W</label
                ><input
                  type="number"
                  step="0.1"
                  min="0.01"
                  :value="elements[selIdx].w"
                  @change="updProp(selIdx, 'w', $event.target.valueAsNumber)"
                />
              </div>
              <div class="field">
                <label>H</label
                ><input
                  type="number"
                  step="0.1"
                  min="0.01"
                  :value="elements[selIdx].h"
                  @change="updProp(selIdx, 'h', $event.target.valueAsNumber)"
                />
              </div>
            </div>
          </template>

          <button class="btn danger" @click="removeElement(selIdx)">
            ✕ Rimuovi
          </button>
        </section>

        <!-- ── 04 Esporta ───────────────────────────────────────────── -->
        <section
          class="panel"
          :class="{ locked: !modelReady || !elements.length }"
        >
          <div class="panel-hd"><span class="step">04</span> Esporta</div>
          <button
            class="btn export-btn"
            @click="exportIfc"
            :disabled="!modelReady || !elements.length"
          >
            ↓ Scarica .ifc
          </button>
          <button
            class="btn ghost"
            @click="copyStep"
            :disabled="!modelReady || !elements.length"
          >
            ⎘ Copia STEP
          </button>
          <div class="export-note" v-if="modelReady && elements.length">
            File IFC generato con <strong>web-ifc</strong> tramite ThatOpen API
          </div>
        </section>
      </aside>

      <!-- ═══════════════════════════════════════════════════ MAIN -->
      <main class="main">
        <!-- Welcome -->
        <div class="welcome" v-if="!modelReady">
          <div class="welcome-glyph">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <polygon
                points="40,5 75,22.5 75,57.5 40,75 5,57.5 5,22.5"
                fill="none"
                stroke="#00E5FF"
                stroke-width="1.5"
                opacity="0.4"
              />
              <polygon
                points="40,18 62,30 62,50 40,62 18,50 18,30"
                fill="none"
                stroke="#00E5FF"
                stroke-width="1"
                opacity="0.6"
              />
              <circle cx="40" cy="40" r="6" fill="#00E5FF" opacity="0.8" />
            </svg>
          </div>
          <h2>ThatOpen IFC Builder</h2>
          <p>
            Genera modelli IFC nativi con la libreria
            <code>@thatopen/components</code> + <code>web-ifc</code>.<br />
            Elementi lineari definiti tramite <strong>nodi N1/N2</strong> con
            coordinate 3D.
          </p>
          <div class="welcome-deps">
            <span>@thatopen/components</span>
            <span>@thatopen/fragments</span>
            <span>web-ifc</span>
            <span>three</span>
          </div>
        </div>

        <!-- 3D Viewer (canvas ThatOpen) -->
        <div class="viewer-wrap" v-show="modelReady">
          <!-- Banner posizionamento -->
          <div class="place-banner" v-if="placing">
            <span class="blink">●</span>
            {{
              pendingN1
                ? `N1 fissato (${pendingN1.x.toFixed(1)},${pendingN1.y.toFixed(1)}) — clicca per N2`
                : `Clicca griglia per N1 di ${form.type}`
            }}
            <kbd>ESC</kbd> per annullare
          </div>
          <div class="coord-hud" v-if="hoverPt">
            X {{ hoverPt.x.toFixed(2) }} · Y {{ hoverPt.y.toFixed(2) }} · Z
            {{ hoverPt.z.toFixed(2) }}
          </div>
          <div class="viewer-legend">
            <span>Drag sin = orbit</span><span>Drag dx = pan</span>
            <span>Scroll = zoom</span><span>Click = seleziona</span>
          </div>
          <canvas ref="canvasEl" class="viewer-canvas" />
        </div>

        <!-- Stats -->
        <div class="stats" v-if="modelReady">
          <div class="stat-card">
            <div class="sv">{{ elements.length }}</div>
            <div class="sl">Elementi IFC</div>
          </div>
          <div class="stat-card">
            <div class="sv">{{ cfg.schema }}</div>
            <div class="sl">Schema</div>
          </div>
          <div class="stat-card">
            <div class="sv">{{ uniqueTypes }}</div>
            <div class="sl">Tipi</div>
          </div>
          <div class="stat-card">
            <div class="sv">{{ ifcEntityCount }}</div>
            <div class="sl">Entità STEP</div>
          </div>
        </div>

        <!-- Lista elementi -->
        <div class="el-section" v-if="modelReady">
          <div class="el-section-hd">
            <h3>Elementi nel modello</h3>
            <span class="badge">{{ elements.length }}</span>
          </div>
          <div class="el-empty" v-if="!elements.length">
            <span>◫</span> Nessun elemento — aggiungine uno dal pannello
            laterale
          </div>
          <div class="el-list" v-else>
            <div
              v-for="(el, i) in elements"
              :key="el.guid"
              class="el-row"
              :class="{ sel: selIdx === i }"
              @click="selectEl(i)"
            >
              <span
                class="type-pill sm"
                :style="{ background: typeColor(el.type) }"
                >{{ el.type.replace("IFC", "") }}</span
              >
              <div class="el-row-info">
                <div class="el-row-name">{{ el.name }}</div>
                <div class="el-row-meta" v-if="isLinear(el.type)">
                  N1({{ el.n1.x }},{{ el.n1.y }},{{ el.n1.z }}) → N2({{
                    el.n2.x
                  }},{{ el.n2.y }},{{ el.n2.z }}) · L={{
                    segLen(el.n1, el.n2).toFixed(2)
                  }}m · {{ el.w }}×{{ el.h }}
                </div>
                <div class="el-row-meta" v-else>
                  ({{ el.n1.x }},{{ el.n1.y }},{{ el.n1.z }}) · {{ el.l }}×{{
                    el.w
                  }}×{{ el.h }} m
                </div>
              </div>
              <button class="el-del" @click.stop="removeElement(i)">✕</button>
            </div>
          </div>
        </div>

        <!-- IFC STEP preview -->
        <div
          class="step-preview"
          v-if="modelReady && elements.length && stepText"
        >
          <div class="step-hd">
            <span>Anteprima STEP</span>
            <span class="step-lines"
              >{{ stepText.split("\n").length }} righe</span
            >
          </div>
          <pre class="step-code"
            >{{ stepText.split("\n").slice(0, 90).join("\n")
            }}{{ stepText.split("\n").length > 90 ? "\n..." : "" }}</pre
          >
        </div>

        <!-- Log -->
        <div class="log-box" v-if="logs.length">
          <div class="log-hd">Log</div>
          <div v-for="(l, i) in logs" :key="i" class="log-row" :class="l.t">
            <span class="lt">{{ l.time }}</span
            ><span>{{ l.msg }}</span>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
/**
 * IfcModelBuilder.vue
 * ────────────────────────────────────────────────────────────────────────────
 * Crea modelli IFC nativi usando @thatopen/components (web-ifc) con viewer
 * Three.js integrato. Elementi lineari definiti da nodi N1/N2.
 *
 * Dipendenze (package.json):
 *   "three": "^0.160.0",
 *   "web-ifc": "^0.0.57",
 *   "@thatopen/components": "^2.4.0",
 *   "@thatopen/fragments": "^2.4.0"
 *
 * vite.config.js — necessario per il WASM:
 *   import { defineConfig } from 'vite'
 *   import vue from '@vitejs/plugin-vue'
 *   export default defineConfig({
 *     plugins: [vue()],
 *     optimizeDeps: { exclude: ['web-ifc'] },
 *   })
 * ────────────────────────────────────────────────────────────────────────────
 */

import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as WEBIFC from "web-ifc";

// ─────────────────────────────────────────────────────────────────────────────
// COSTANTI
// ─────────────────────────────────────────────────────────────────────────────

/** Tipi IFC definiti da nodo iniziale + nodo finale */
const LINEAR_TYPES = new Set([
  "IFCBEAM",
  "IFCCOLUMN",
  "IFCPILE",
  "IFCMEMBER",
  "IFCWALL",
  "IFCWALLSTANDARDCASE",
  "IFCSTAIR",
  "IFCRAILING",
]);

const ELEMENT_TYPES = [
  { v: "IFCBEAM", label: "IfcBeam — Trave" },
  { v: "IFCCOLUMN", label: "IfcColumn — Pilastro" },
  { v: "IFCPILE", label: "IfcPile — Palo" },
  { v: "IFCMEMBER", label: "IfcMember — Membratura" },
  { v: "IFCWALL", label: "IfcWall — Parete" },
  { v: "IFCWALLSTANDARDCASE", label: "IfcWallStandardCase" },
  { v: "IFCSTAIR", label: "IfcStair — Scala" },
  { v: "IFCSLAB", label: "IfcSlab — Solaio" },
  { v: "IFCDOOR", label: "IfcDoor — Porta" },
  { v: "IFCWINDOW", label: "IfcWindow — Finestra" },
  { v: "IFCROOF", label: "IfcRoof — Copertura" },
  { v: "IFCFOOTING", label: "IfcFooting — Fondazione" },
  { v: "IFCFURNISHINGELEMENT", label: "IfcFurnishingElement" },
];

const TYPE_COLOR = {
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
  IFCMEMBER: 0x0e7490,
};

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────

const canvasEl = ref(null);
const modelReady = ref(false);
const placing = ref(false);
const pendingN1 = ref(null);
const snap = ref(true);
const showAxes = ref(true);
const view = ref("3d");
const hoverPt = ref(null);
const selIdx = ref(null);
const elements = ref([]); // array di element-data (non IFC objects)
const logs = ref([]);
const stepText = ref("");
const ifcEntityCount = ref(0);

const cfg = ref({
  name: "Progetto BIM",
  org: "Studio Tecnico",
  schema: "IFC4",
});

const form = ref(makeBlankForm("IFCBEAM"));

// ─────────────────────────────────────────────────────────────────────────────
// ThatOpen / web-ifc internals (non reattivi)
// ─────────────────────────────────────────────────────────────────────────────

let components = null; // OBC.Components
let worlds = null; // OBC.Worlds
let world = null; // world corrente
let ifcApi = null; // WEBIFC.IfcAPI — usata per generare il file STEP
let modelID = null; // ID modello web-ifc

// Three.js extras per nodi / picking
let groundPlane = null;
let raycaster = null;
let pointer = new THREE.Vector2();
let clickMoved = false;
let mouseDown = { x: 0, y: 0 };
const meshMap = new Map(); // guid → THREE.Group

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTED
// ─────────────────────────────────────────────────────────────────────────────

const uniqueTypes = computed(
  () => new Set(elements.value.map((e) => e.type)).size,
);

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function isLinear(t) {
  return LINEAR_TYPES.has(t);
}

function segLen(n1, n2) {
  const dx = n2.x - n1.x,
    dy = n2.y - n1.y,
    dz = n2.z - n1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function fmtLen(n1, n2) {
  return segLen(n1, n2).toFixed(3);
}
function fmtSlope(n1, n2) {
  const L = segLen(n1, n2);
  if (L < 1e-6) return "0.0";
  return ((Math.asin(Math.abs(n2.z - n1.z) / L) * 180) / Math.PI).toFixed(1);
}

/** Vettore unitario N1→N2 in IFC coords (X=est, Y=nord, Z=alto) */
function segDir(n1, n2) {
  const L = segLen(n1, n2);
  if (L < 1e-6) return { x: 1, y: 0, z: 0 };
  return { x: (n2.x - n1.x) / L, y: (n2.y - n1.y) / L, z: (n2.z - n1.z) / L };
}

/** Ricava angolo Y (nel piano XY) del segmento */
function segRotY(n1, n2) {
  const d = segDir(n1, n2);
  return Math.atan2(d.x, d.y);
}

function snapV(v) {
  return snap.value ? Math.round(v * 2) / 2 : v;
}

function makeBlankForm(type) {
  return {
    type,
    name: "",
    material: "Calcestruzzo C25/30",
    n1: { x: 0, y: 0, z: 0 },
    n2: { x: 5, y: 0, z: 0 },
    l: 5,
    w: 0.3,
    h: 0.5,
    rotY: 0,
  };
}

function onTypeChange() {
  const nm = form.value.name;
  form.value = makeBlankForm(form.value.type);
  form.value.name = nm;
}

// ─────────────────────────────────────────────────────────────────────────────
// THATOPEN INIT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inizializza OBC.Components, crea un World con renderer Three.js
 * e prepara la scena (griglia, luci, piano picking).
 */
async function initThatOpen() {
  if (!canvasEl.value) return;

  // ── Components ────────────────────────────────────────────────────────────
  components = new OBC.Components();

  worlds = components.get(OBC.Worlds);
  world = worlds.create();
  //world = worlds.create<OBC.ShadowedScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>();

  world.scene = new OBC.ShadowedScene(components);
  world.renderer = new OBF.PostproductionRenderer(components, canvasEl.value);
  world.camera = new OBC.OrthoPerspectiveCamera(components);

  components.init();

  world.camera.controls.setLookAt(50, 50, 50, 0, 0, 0);

  world.renderer.three.shadowMap.enabled = true;
  world.renderer.three.shadowMap.type = THREE.VSMShadowMap;

  // Renderer
  //world.renderer = new OBC.SimpleRenderer(components, canvasEl.value);
  //world.renderer.postproduction.enabled = false;

  // Scena
  //world.scene = new OBC.SimpleScene(components);
  //world.scene.setup(); // aggiunge luci di default
  //world.scene.three.background = new THREE.Color(0x070910);

  // Camera
  //world.camera = new OBC.SimpleCamera(components);
  //world.camera.controls.setLookAt(15, 15, 15, 0, 0, 0);
  //world.camera.controls.enableDamping = true;

  //components.init(); // avvia il render loop interno

  // ── Scena extra ───────────────────────────────────────────────────────────
  const grid = new THREE.GridHelper(100, 100, 0x00d4ff, 0x151a28);
  grid.material.opacity = 0.45;
  grid.material.transparent = true;
  world.scene.three.add(grid);

  if (showAxes.value) world.scene.three.add(new THREE.AxesHelper(5));

  // Piano ground invisibile per raycasting manuale
  groundPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
  );
  groundPlane.rotation.x = -Math.PI / 2;
  world.scene.three.add(groundPlane);

  raycaster = new THREE.Raycaster();

  // ── web-ifc API ───────────────────────────────────────────────────────────
  ifcApi = new WEBIFC.IfcAPI();
  // Indica a web-ifc dove trovare il file .wasm
  //ifcApi.SetWasmPath("/node_modules/web-ifc/", true);
  ifcApi.SetWasmPath("/wasm/", true);
  await ifcApi.Init();

  // ── Canvas events ─────────────────────────────────────────────────────────
  const cv = canvasEl.value;
  cv.addEventListener("mousedown", _md);
  cv.addEventListener("mousemove", _mm);
  cv.addEventListener("mouseup", _mu);
  cv.addEventListener("contextmenu", (e) => e.preventDefault());
  window.addEventListener("keydown", _kd);
  window.addEventListener("resize", _resize);

  log("ThatOpen + web-ifc inizializzati", "success");
}

function _resize() {
  world?.renderer?.resize();
  if (world?.camera?.renderer) world.camera.renderer.resize();
}

// ─────────────────────────────────────────────────────────────────────────────
// INPUT
// ─────────────────────────────────────────────────────────────────────────────

function _md(e) {
  clickMoved = false;
  mouseDown = { x: e.clientX, y: e.clientY };
}

function _mm(e) {
  if (Math.abs(e.clientX - mouseDown.x) + Math.abs(e.clientY - mouseDown.y) > 4)
    clickMoved = true;

  if (!canvasEl.value || !raycaster || !world?.camera) return;
  const r = canvasEl.value.getBoundingClientRect();
  pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;

  raycaster.setFromCamera(pointer, world.camera.three);
  const hits = raycaster.intersectObject(groundPlane);
  if (hits.length) {
    const p = hits[0].point;
    hoverPt.value = { x: snapV(p.x), y: form.value.n1.z, z: snapV(p.z) };
  } else hoverPt.value = null;
}

function _mu(e) {
  if (e.button === 0 && !clickMoved) {
    if (placing.value) _handlePlace(e);
    else _handleSelect();
  }
}

function _kd(e) {
  if (e.key === "Escape") {
    placing.value = false;
    pendingN1.value = null;
  }
  if ((e.key === "Delete" || e.key === "Backspace") && selIdx.value !== null)
    removeElement(selIdx.value);
}

function _handlePlace(e) {
  if (!raycaster || !world?.camera) return;
  const r = canvasEl.value.getBoundingClientRect();
  pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  raycaster.setFromCamera(pointer, world.camera.three);
  const hits = raycaster.intersectObject(groundPlane);
  if (!hits.length) return;

  const p = hits[0].point;
  const pt = { x: snapV(p.x), y: form.value.n1.z, z: snapV(p.z) };

  if (isLinear(form.value.type)) {
    if (!pendingN1.value) {
      pendingN1.value = pt;
      log(`N1 @ (${pt.x},${pt.y},${pt.z})`, "info");
    } else {
      addElement({ ...form.value, n1: { ...pendingN1.value }, n2: pt });
      pendingN1.value = null;
    }
  } else {
    addElement({ ...form.value, n1: pt });
  }
}

function _handleSelect() {
  if (!raycaster || !world?.camera) return;
  raycaster.setFromCamera(pointer, world.camera.three);
  const meshes = Array.from(meshMap.values());
  const hits = raycaster.intersectObjects(meshes, true);
  if (hits.length) {
    let obj = hits[0].object;
    while (obj && !obj.userData.guid) obj = obj.parent;
    if (obj?.userData.guid) {
      const i = elements.value.findIndex((e) => e.guid === obj.userData.guid);
      selectEl(i);
      return;
    }
  }
  selectEl(null);
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA PRESETS
// ─────────────────────────────────────────────────────────────────────────────

function setCameraPreset(preset) {
  view.value = preset;
  const ctl = world?.camera?.controls;
  if (!ctl) return;
  if (preset === "3d") ctl.setLookAt(15, 15, 15, 0, 0, 0, true);
  if (preset === "top") ctl.setLookAt(0, 40, 0, 0, 0, 0, true);
  if (preset === "front") ctl.setLookAt(0, 5, 30, 0, 5, 0, true);
  if (preset === "side") ctl.setLookAt(30, 5, 0, 0, 5, 0, true);
}

function fitCamera() {
  if (!elements.value.length) {
    setCameraPreset("3d");
    return;
  }
  let cx = 0,
    cy = 0,
    cz = 0,
    n = 0;
  for (const el of elements.value) {
    const pts = isLinear(el.type) ? [el.n1, el.n2] : [el.n1];
    for (const p of pts) {
      cx += p.x;
      cy += p.z;
      cz += p.y;
      n++;
    }
  }
  cx /= n;
  cy /= n;
  cz /= n;
  world?.camera?.controls.setLookAt(
    cx + 15,
    cy + 12,
    cz + 15,
    cx,
    cy,
    cz,
    true,
  );
}

function toggleAxes() {
  showAxes.value = !showAxes.value;
  const scene = world?.scene?.three;
  if (!scene) return;
  const ax = scene.children.find((c) => c.type === "AxesHelper");
  if (ax) ax.visible = showAxes.value;
}

// ─────────────────────────────────────────────────────────────────────────────
// IFC MODEL — usa web-ifc API direttamente
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inizializza il modello IFC interno tramite web-ifc.
 * Crea le entità di struttura spaziale (Project → Site → Building → Storey).
 */
async function initModel() {
  await nextTick();
  if (!canvasEl.value) return;

  // Init Three / ThatOpen se non ancora fatto
  if (!components) await initThatOpen();

  // Crea un modello vuoto in web-ifc
  modelID = ifcApi.CreateModel({
    schema:
      cfg.value.schema === "IFC4" ? WEBIFC.Schemas.IFC4 : WEBIFC.Schemas.IFC2X3,
  });

  elements.value = [];
  selIdx.value = null;
  modelReady.value = true;

  log(
    `Modello "${cfg.value.name}" creato con web-ifc (${cfg.value.schema})`,
    "success",
  );
  _refreshStep();
}

function resetModel() {
  // Rimuovi tutte le mesh dalla scena
  for (const guid of meshMap.keys()) _removeMesh(guid);
  meshMap.clear();
  elements.value = [];
  selIdx.value = null;
  modelReady.value = false;
  stepText.value = "";
  ifcEntityCount.value = 0;
  if (modelID !== null && ifcApi) {
    try {
      ifcApi.CloseModel(modelID);
    } catch {}
    modelID = null;
  }
  log("Modello resettato", "warn");
}

// ─────────────────────────────────────────────────────────────────────────────
// IFC ENTITY CREATION con web-ifc API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea un'entità IFCCARTESIANPOINT nel modello web-ifc.
 * Le coordinate sono convertite in mm (IFC usa mm se l'unità è LENGTHUNIT MILLI METRE).
 */
function ifcPoint(x, y, z) {
  return ifcApi.CreateIfcEntity(modelID, WEBIFC.IFCCARTESIANPOINT, {
    type: WEBIFC.IFCLENGTHMEASURE,
    value: [x * 1000, y * 1000, z * 1000],
  });
}

function ifcDirection(x, y, z) {
  return ifcApi.CreateIfcEntity(modelID, WEBIFC.IFCDIRECTION, {
    type: WEBIFC.IFCREAL,
    value: [x, y, z],
  });
}

function ifcAxis2Placement3D(originID, axisID = null, refDirID = null) {
  return ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCAXIS2PLACEMENT3D,
    { type: WEBIFC.IFCID, value: originID },
    axisID ? { type: WEBIFC.IFCID, value: axisID } : null,
    refDirID ? { type: WEBIFC.IFCID, value: refDirID } : null,
  );
}

function ifcLocalPlacement(relativeTo, placementID) {
  return ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCLOCALPLACEMENT,
    relativeTo ? { type: WEBIFC.IFCID, value: relativeTo } : null,
    { type: WEBIFC.IFCID, value: placementID },
  );
}

/**
 * Crea la geometria IFC per un elemento.
 * Restituisce l'expressID del ProductDefinitionShape.
 *
 * Per elementi lineari:
 *   - Profilo: IfcRectangleProfileDef (W × H) nel piano locale
 *   - Estrusione lungo Z locale = direzione N1→N2 = lunghezza del segmento
 *   - Il placement è centrato in N1 con RefDirection = dir(N1→N2)
 *
 * Per elementi areali:
 *   - Profilo: IfcRectangleProfileDef (W × H)
 *   - Estrusione lungo Z locale = L
 */
function createGeometry(el) {
  const lin = isLinear(el.type);
  const W = el.w * 1000; // mm
  const H = el.h * 1000;
  const L = lin ? segLen(el.n1, el.n2) * 1000 : el.l * 1000;

  // ── Profilo rettangolare ──────────────────────────────────────────────────
  const profOrigin = ifcApi.CreateIfcEntity(modelID, WEBIFC.IFCCARTESIANPOINT, {
    type: WEBIFC.IFCLENGTHMEASURE,
    value: [0, 0],
  });
  const profAxis = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCAXIS2PLACEMENT2D,
    { type: WEBIFC.IFCID, value: profOrigin },
    null,
  );
  const profile = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCRECTANGLEPROFILEDEF,
    { type: WEBIFC.IFCPROFILETYPEENUM, value: "AREA" },
    null,
    { type: WEBIFC.IFCID, value: profAxis },
    { type: WEBIFC.IFCLENGTHMEASURE, value: W },
    { type: WEBIFC.IFCLENGTHMEASURE, value: H },
  );

  // ── Solid placement ───────────────────────────────────────────────────────
  const solidOrigin = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCCARTESIANPOINT,
    { type: WEBIFC.IFCLENGTHMEASURE, value: [0, 0, 0] },
  );
  const solidAx = ifcAxis2Placement3D(solidOrigin);
  const extDir = ifcDirection(0, 0, 1);

  const solid = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCEXTRUDEDAREASOLID,
    { type: WEBIFC.IFCID, value: profile },
    { type: WEBIFC.IFCID, value: solidAx },
    { type: WEBIFC.IFCID, value: extDir },
    { type: WEBIFC.IFCLENGTHMEASURE, value: L },
  );

  // ── ShapeRepresentation + ProductDefinitionShape ──────────────────────────
  const shapeRep = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCSHAPEREPRESENTATION,
    { type: WEBIFC.IFCID, value: _getGeomContextID() },
    { type: WEBIFC.IFCLABEL, value: "Body" },
    { type: WEBIFC.IFCLABEL, value: "SweptSolid" },
    [{ type: WEBIFC.IFCID, value: solid }],
  );

  return ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCPRODUCTDEFINITIONSHAPE,
    null,
    null,
    [{ type: WEBIFC.IFCID, value: shapeRep }],
  );
}

/**
 * Crea il LocalPlacement per un elemento.
 * Per elementi lineari: origine = N1, RefDirection = dir(N1→N2).
 * Per areali: origine = N1, rotazione intorno a Y.
 */
function createPlacement(el, storeyPlacementID) {
  const lin = isLinear(el.type);

  if (lin) {
    const dir = segDir(el.n1, el.n2);
    // IFC: X=est, Y=nord, Z=alto
    const originID = ifcPoint(el.n1.x, el.n1.y, el.n1.z);

    // RefDirection = vettore N1→N2 (proiettato in IFC XY per plane elements,
    // ma qui lo usiamo come direzione 3D normalizzata)
    const refDirID = ifcDirection(dir.x, dir.y, dir.z);

    // Asse verticale locale: se l'elemento non è verticale usiamo Z globale (0,0,1)
    // altrimenti Y globale (0,1,0)
    const absZ = Math.abs(dir.z);
    const axisID = absZ > 0.98 ? ifcDirection(0, 1, 0) : ifcDirection(0, 0, 1);

    const ap3d = ifcAxis2Placement3D(originID, axisID, refDirID);
    return ifcLocalPlacement(storeyPlacementID, ap3d);
  } else {
    const rad = ((el.rotY || 0) * Math.PI) / 180;
    const originID = ifcPoint(el.n1.x, el.n1.y, el.n1.z);
    const refDirID = ifcDirection(Math.cos(rad), Math.sin(rad), 0);
    const axisID = ifcDirection(0, 0, 1);
    const ap3d = ifcAxis2Placement3D(originID, axisID, refDirID);
    return ifcLocalPlacement(storeyPlacementID, ap3d);
  }
}

// Cache dell'ID del GeometricRepresentationContext per non ricrearlo
let _geomCtxID = null;
function _getGeomContextID() {
  if (_geomCtxID) return _geomCtxID;
  // Cerca nel modello un'entità IFCGEOMETRICREPRESENTATIONCONTEXT
  const ids = ifcApi.GetLineIDsWithType(
    modelID,
    WEBIFC.IFCGEOMETRICREPRESENTATIONCONTEXT,
  );
  if (ids.size() > 0) {
    _geomCtxID = ids.get(0);
    return _geomCtxID;
  }
  // Se non esiste ancora (modello vuoto), crealo
  const origin = ifcApi.CreateIfcEntity(modelID, WEBIFC.IFCCARTESIANPOINT, {
    type: WEBIFC.IFCLENGTHMEASURE,
    value: [0, 0, 0],
  });
  const axis = ifcAxis2Placement3D(origin);
  const ctx = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCGEOMETRICREPRESENTATIONCONTEXT,
    null,
    { type: WEBIFC.IFCLABEL, value: "Model" },
    { type: WEBIFC.IFCINTEGER, value: 3 },
    { type: WEBIFC.IFCREAL, value: 1e-5 },
    { type: WEBIFC.IFCID, value: axis },
    null,
  );
  _geomCtxID = ctx;
  return ctx;
}

/** Ottiene o crea l'expressID del BuildingStorey del piano terra */
let _storeyID = null;
let _storeyPlacementID = null;
function _ensureStorey() {
  if (_storeyID) return;
  const ids = ifcApi.GetLineIDsWithType(modelID, WEBIFC.IFCBUILDINGSTOREY);
  if (ids.size() > 0) {
    _storeyID = ids.get(0);
    return;
  }
  // Crea struttura spaziale minima
  const o0 = ifcApi.CreateIfcEntity(modelID, WEBIFC.IFCCARTESIANPOINT, {
    type: WEBIFC.IFCLENGTHMEASURE,
    value: [0, 0, 0],
  });
  const ax0 = ifcAxis2Placement3D(o0);
  const lp0 = ifcLocalPlacement(null, ax0);
  _storeyPlacementID = lp0;
  _storeyID = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCBUILDINGSTOREY,
    { type: WEBIFC.IFCGLOBALLYUNIQUEID, value: _guid() },
    null,
    { type: WEBIFC.IFCLABEL, value: "Piano Terra" },
    null,
    null,
    { type: WEBIFC.IFCID, value: lp0 },
    null,
    null,
    { type: WEBIFC.IFCELEMENTCOMPOSITIONENUM, value: "ELEMENT" },
    { type: WEBIFC.IFCLENGTHMEASURE, value: 0 },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AGGIUNGI / RIMUOVI ELEMENTO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aggiunge un elemento BIM al modello IFC e alla scena Three.js.
 * @param {Object|null} opts - override del form; null = usa form
 */
function addElement(opts) {
  if (!modelReady.value) {
    log("Nessun modello attivo", "error");
    return;
  }
  const src = opts || form.value;
  const lin = isLinear(src.type);

  _ensureStorey();

  const el = {
    guid: _guid(),
    type: src.type,
    name:
      src.name ||
      `${src.type}_${String(elements.value.length + 1).padStart(3, "0")}`,
    material: src.material || "",
    n1: { x: src.n1?.x ?? 0, y: src.n1?.y ?? 0, z: src.n1?.z ?? 0 },
    n2: lin
      ? { x: src.n2?.x ?? 5, y: src.n2?.y ?? 0, z: src.n2?.z ?? 0 }
      : {
          x: (src.n1?.x ?? 0) + (src.l ?? 5),
          y: src.n1?.y ?? 0,
          z: src.n1?.z ?? 0,
        },
    l: Math.max(0.01, src.l ?? 5),
    w: Math.max(0.01, src.w ?? 0.3),
    h: Math.max(0.01, src.h ?? 0.5),
    rotY: src.rotY ?? 0,
    ifcExpressID: null, // sarà settato dopo la creazione IFC
  };

  // ── Crea entità IFC via web-ifc ───────────────────────────────────────────
  try {
    const placementID = createPlacement(el, _storeyPlacementID);
    const shapeID = createGeometry(el);

    // Tipo IFC dinamico — usa la costante WEBIFC[tipo]
    const ifcTypeConst = WEBIFC[el.type];
    if (!ifcTypeConst) throw new Error(`Tipo IFC non trovato: ${el.type}`);

    const ifcEl = ifcApi.CreateIfcEntity(
      modelID,
      ifcTypeConst,
      {
        type: WEBIFC.IFCGLOBALLYUNIQUEID,
        value: el.guid.replace(/-/g, "").substring(0, 22),
      },
      null,
      { type: WEBIFC.IFCLABEL, value: el.name },
      null,
      { type: WEBIFC.IFCLABEL, value: el.type },
      { type: WEBIFC.IFCID, value: placementID },
      { type: WEBIFC.IFCID, value: shapeID },
      null,
    );
    el.ifcExpressID = ifcEl;
    log(`IFC entità #${ifcEl} creata (${el.type})`, "info");
  } catch (err) {
    log(`web-ifc error: ${err.message}`, "error");
  }

  elements.value.push(el);
  _addMesh(el);
  selectEl(elements.value.length - 1);

  const info = lin
    ? `N1(${el.n1.x},${el.n1.y},${el.n1.z})→N2(${el.n2.x},${el.n2.y},${el.n2.z}) L=${segLen(el.n1, el.n2).toFixed(2)}m`
    : `(${el.n1.x},${el.n1.y},${el.n1.z}) ${el.l}×${el.w}×${el.h}m`;
  log(`Aggiunto ${el.type} "${el.name}" — ${info}`, "success");

  if (!opts) form.value.name = "";
  _refreshStep();
}

function removeElement(idx) {
  if (idx === null || idx < 0 || idx >= elements.value.length) return;
  const el = elements.value[idx];
  _removeMesh(el.guid);
  // Rimuovi entità da web-ifc
  if (el.ifcExpressID !== null && ifcApi && modelID !== null) {
    try {
      ifcApi.DeleteLine(modelID, el.ifcExpressID);
    } catch {}
  }
  elements.value.splice(idx, 1);
  if (selIdx.value === idx) selIdx.value = null;
  else if (selIdx.value > idx) selIdx.value--;
  log(`Rimosso "${el.name}"`, "warn");
  _refreshStep();
}

function selectEl(idx) {
  if (selIdx.value !== null && elements.value[selIdx.value])
    _highlightMesh(elements.value[selIdx.value].guid, false);
  selIdx.value = idx;
  if (idx !== null && elements.value[idx])
    _highlightMesh(elements.value[idx].guid, true);
}

function updNode(idx, node, coord, val) {
  if (idx === null || !elements.value[idx] || isNaN(val)) return;
  elements.value[idx][node][coord] = val;
  _rebuildElement(idx);
}

function updProp(idx, prop, val) {
  if (idx === null || !elements.value[idx] || isNaN(val)) return;
  elements.value[idx][prop] = val;
  _rebuildElement(idx);
}

/** Rimuove e ricrea mesh + entità IFC per un elemento modificato */
function _rebuildElement(idx) {
  const el = elements.value[idx];
  _removeMesh(el.guid);
  // Ricrea entità IFC
  if (el.ifcExpressID !== null && ifcApi && modelID !== null) {
    try {
      ifcApi.DeleteLine(modelID, el.ifcExpressID);
      el.ifcExpressID = null;
    } catch {}
  }
  try {
    _ensureStorey();
    const placementID = createPlacement(el, _storeyPlacementID);
    const shapeID = createGeometry(el);
    const ifcTypeConst = WEBIFC[el.type];
    if (ifcTypeConst) {
      el.ifcExpressID = ifcApi.CreateIfcEntity(
        modelID,
        ifcTypeConst,
        {
          type: WEBIFC.IFCGLOBALLYUNIQUEID,
          value: el.guid.replace(/-/g, "").substring(0, 22),
        },
        null,
        { type: WEBIFC.IFCLABEL, value: el.name },
        null,
        { type: WEBIFC.IFCLABEL, value: el.type },
        { type: WEBIFC.IFCID, value: placementID },
        { type: WEBIFC.IFCID, value: shapeID },
        null,
      );
    }
  } catch (err) {
    log(`Rebuild error: ${err.message}`, "error");
  }
  _addMesh(el);
  _highlightMesh(el.guid, true);
  _refreshStep();
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS MESH
// ─────────────────────────────────────────────────────────────────────────────

function _addMesh(el) {
  if (!world?.scene) return;
  const lin = isLinear(el.type);
  const col = TYPE_COLOR[el.type] || 0x4b5563;
  const mat = new THREE.MeshPhongMaterial({
    color: col,
    transparent: true,
    opacity: 0.83,
    shininess: 80,
  });
  const group = new THREE.Group();
  group.userData.guid = el.guid;

  let body;
  if (lin) {
    const L = Math.max(segLen(el.n1, el.n2), 0.01);
    const geo = new THREE.BoxGeometry(el.w, el.h, L);
    body = new THREE.Mesh(geo, mat);
    body.userData.guid = el.guid;
    body.castShadow = body.receiveShadow = true;
    body.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.15,
        }),
      ),
    );

    // Centra a metà N1→N2; THREE: X=est, Y=alto, Z=nord
    body.position.set(
      (el.n1.x + el.n2.x) / 2,
      (el.n1.z + el.n2.z) / 2,
      (el.n1.y + el.n2.y) / 2,
    );
    // Ruota l'asse Z locale verso N2
    body.rotation.y = -segRotY(el.n1, el.n2);
    const dz = el.n2.z - el.n1.z;
    body.rotation.x = Math.asin(Math.max(-1, Math.min(1, dz / L)));
    group.add(body);

    // Sfere nodi
    for (const [n, c] of [
      [el.n1, 0x00ff9d],
      [el.n2, 0xff4d6d],
    ]) {
      const sp = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 10, 10),
        new THREE.MeshPhongMaterial({
          color: c,
          emissive: c,
          emissiveIntensity: 0.4,
        }),
      );
      sp.position.set(n.x, n.z, n.y);
      sp.userData.guid = el.guid;
      group.add(sp);
    }
    // Linea asse
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(el.n1.x, el.n1.z, el.n1.y),
          new THREE.Vector3(el.n2.x, el.n2.z, el.n2.y),
        ]),
        new THREE.LineBasicMaterial({
          color: 0x00d4ff,
          transparent: true,
          opacity: 0.5,
        }),
      ),
    );
  } else {
    const L = Math.max(el.l || 1, 0.01),
      W = Math.max(el.w || 0.3, 0.01),
      H = Math.max(el.h || 0.5, 0.01);
    const geo = new THREE.BoxGeometry(L, H, W);
    body = new THREE.Mesh(geo, mat);
    body.userData.guid = el.guid;
    body.castShadow = body.receiveShadow = true;
    body.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.15,
        }),
      ),
    );
    body.position.set(el.n1.x + L / 2, el.n1.z + H / 2, el.n1.y + W / 2);
    body.rotation.y = THREE.MathUtils.degToRad(el.rotY || 0);
    group.add(body);
    // Sfera origine
    const sp = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 8, 8),
      new THREE.MeshPhongMaterial({
        color: 0x00ff9d,
        emissive: 0x00ff9d,
        emissiveIntensity: 0.4,
      }),
    );
    sp.position.set(el.n1.x, el.n1.z, el.n1.y);
    sp.userData.guid = el.guid;
    group.add(sp);
  }

  world.scene.three.add(group);
  meshMap.set(el.guid, group);
}

function _removeMesh(guid) {
  const g = meshMap.get(guid);
  if (!g) return;
  world?.scene?.three?.remove(g);
  g.traverse((c) => {
    if (c.geometry) c.geometry.dispose();
    if (c.material) c.material.dispose();
  });
  meshMap.delete(guid);
}

function _highlightMesh(guid, on) {
  const g = meshMap.get(guid);
  if (!g || !THREE) return;
  g.traverse((c) => {
    if (c.isMesh && c.userData.guid === guid) {
      c.material.emissive = new THREE.Color(on ? 0x00d4ff : 0x000000);
      c.material.emissiveIntensity = on ? 0.45 : 0;
      c.material.opacity = on ? 1 : 0.83;
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT — usa web-ifc per serializzare il modello
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Serializza il modello corrente in formato STEP con web-ifc
 * e aggiorna la preview.
 */
function _refreshStep() {
  if (!ifcApi || modelID === null) return;
  try {
    const data = ifcApi.SaveModel(modelID);
    const text = new TextDecoder().decode(data);
    stepText.value = text;
    // Conta le entità STEP (#NNN=...)
    ifcEntityCount.value = (text.match(/^#\d+=/gm) || []).length;
  } catch (e) {
    stepText.value = `/* Errore serializzazione: ${e.message} */`;
  }
}

function exportIfc() {
  if (!ifcApi || modelID === null) return;
  _refreshStep();
  const data = ifcApi.SaveModel(modelID);
  const blob = new Blob([data], { type: "application/x-step" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cfg.value.name.replace(/\s+/g, "_")}.ifc`;
  a.click();
  URL.revokeObjectURL(url);
  log(
    `IFC esportato via web-ifc (${elements.value.length} elementi)`,
    "success",
  );
}

async function copyStep() {
  _refreshStep();
  try {
    await navigator.clipboard.writeText(stepText.value);
    log("STEP copiato", "success");
  } catch {
    log("Impossibile copiare", "error");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────

function togglePlacing() {
  placing.value = !placing.value;
  if (!placing.value) pendingN1.value = null;
}

function typeColor(type) {
  const n = TYPE_COLOR[type] || 0x4b5563;
  return `#${n.toString(16).padStart(6, "0")}`;
}

function _guid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16).toUpperCase();
  });
}

function log(msg, t = "info") {
  logs.value.unshift({ msg, t, time: new Date().toLocaleTimeString("it-IT") });
  if (logs.value.length > 30) logs.value.pop();
}

// ─────────────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────

onMounted(() => {
  // Il viewer viene inizializzato solo quando si crea il modello (initModel)
  // per non caricare il WASM inutilmente al mount
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", _kd);
  window.removeEventListener("resize", _resize);
  const cv = canvasEl.value;
  if (cv) {
    cv.removeEventListener("mousedown", _md);
    cv.removeEventListener("mousemove", _mm);
    cv.removeEventListener("mouseup", _mu);
  }
  if (modelID !== null && ifcApi)
    try {
      ifcApi.CloseModel(modelID);
    } catch {}
  if (components) components.dispose();
});

defineExpose({
  addElement,
  removeElement,
  updNode,
  updProp,
  exportIfc,
  elements,
  modelReady,
  isLinear,
  segLen,
});
</script>

<style scoped>
/* ════════════════════════════════════════════════ TOKENS */
.ifc-app {
  --bg: #070910;
  --surf: #0f1220;
  --border: #191f32;
  --acc: #00e5ff;
  --green: #00ffa3;
  --text: #d8e6f2;
  --muted: #4a607a;
  --danger: #ff3d5a;
  --warn: #ffc107;
  --n1: #00ffa3;
  --n2: #ff3d5a;

  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: "IBM Plex Mono", "JetBrains Mono", "Fira Code", monospace;
  font-size: 12.5px;
  overflow: hidden;
}

/* ════════════════════════════════════════════════ TOPBAR */
.topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-content: space-between;
  padding: 9px 20px;
  background: var(--surf);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.topbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.topbar-title {
  display: flex;
  flex-direction: column;
}
.topbar-name {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.07em;
  color: var(--text);
}
.topbar-sub {
  font-size: 8.5px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.topbar-toolbar {
  display: flex;
  align-items: center;
  gap: 3px;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}
.tool-group {
  display: flex;
  align-items: center;
  gap: 2px;
}
.tbtn {
  padding: 3px 10px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--muted);
  cursor: pointer;
  font-family: inherit;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: all 0.13s;
  white-space: nowrap;
}
.tbtn:hover:not(:disabled) {
  border-color: var(--acc);
  color: var(--acc);
}
.tbtn.active {
  background: #00e5ff18;
  border-color: var(--acc);
  color: var(--acc);
}
.tbtn:disabled {
  opacity: 0.28;
  cursor: not-allowed;
}
.tool-sep {
  width: 1px;
  height: 16px;
  background: var(--border);
  margin: 0 4px;
}

.topbar-status {
  display: flex;
  align-items: center;
  gap: 7px;
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
.status-dot.live {
  background: var(--green);
  border-color: var(--green);
  box-shadow: 0 0 8px #00ffa388;
}
.status-txt {
  font-size: 9px;
  color: var(--muted);
}

/* ════════════════════════════════════════════════ SHELL */
.shell {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ════════════════════════════════════════════════ SIDEBAR */
.sidebar {
  width: 272px;
  flex-shrink: 0;
  background: var(--surf);
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
.panel.locked {
  opacity: 0.28;
  pointer-events: none;
}
.panel-hd {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5a7090;
  margin-bottom: 13px;
}
.step {
  font-size: 8px;
  font-weight: 800;
  color: var(--acc);
  background: #00e5ff18;
  padding: 2px 5px;
  border-radius: 2px;
  letter-spacing: 0;
}

/* ── Node cards ─────────────────────────────────────────── */
.node-card {
  border-radius: 4px;
  padding: 9px 10px;
  margin-bottom: 7px;
  border: 1px solid var(--border);
  background: #080b14;
}
.n1-card {
  border-left: 2px solid var(--n1);
}
.n2-card {
  border-left: 2px solid var(--n2);
}
.node-hd {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 8.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #5a7090;
  margin-bottom: 7px;
}
.ndot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ndot.n1 {
  background: var(--n1);
  box-shadow: 0 0 5px var(--n1);
}
.ndot.n2 {
  background: var(--n2);
  box-shadow: 0 0 5px var(--n2);
}

.xyz-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
}

/* ── Derived box ────────────────────────────────────────── */
.derived-box {
  background: #050710;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 7px 10px;
  margin-bottom: 9px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dr {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dr span {
  font-size: 8.5px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.dr strong {
  font-size: 10px;
  font-weight: 700;
  color: var(--text);
}
.dr strong.acc {
  color: var(--acc);
}

/* ── Fields ─────────────────────────────────────────────── */
.field {
  margin-bottom: 6px;
}
.field label {
  display: block;
  font-size: 8px;
  color: var(--muted);
  margin-bottom: 3px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.field input,
.field select {
  width: 100%;
  box-sizing: border-box;
  background: #050710;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--text);
  padding: 5px 7px;
  font-family: inherit;
  font-size: 11px;
  transition: border 0.13s;
}
.field input:focus,
.field select:focus {
  outline: none;
  border-color: #00e5ff55;
}
.field select option {
  background: #050710;
}
.field-group-lbl {
  font-size: 8px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 9px 0 4px;
}

/* ── Buttons ────────────────────────────────────────────── */
.btn {
  width: 100%;
  padding: 7px 12px;
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
  opacity: 0.28;
  cursor: not-allowed;
}
.btn.primary {
  background: #00e5ff18;
  color: var(--acc);
  border: 1px solid #00e5ff44;
}
.btn.primary:hover:not(:disabled) {
  background: #00e5ff28;
}
.btn.accent {
  background: #00ffa318;
  color: var(--green);
  border: 1px solid #00ffa344;
}
.btn.accent:hover:not(:disabled) {
  background: #00ffa328;
}
.btn.ghost {
  background: transparent;
  color: var(--muted);
  border: 1px dashed var(--border);
}
.btn.ghost:hover:not(:disabled) {
  border-color: var(--acc);
  color: var(--acc);
}
.btn.warn-btn {
  background: #ffc10718;
  color: var(--warn);
  border: 1px solid #ffc10744;
}
.btn.export-btn {
  background: #2563eb18;
  color: #60a5fa;
  border: 1px solid #2563eb55;
}
.btn.export-btn:hover:not(:disabled) {
  background: #2563eb28;
}
.btn.danger {
  background: #ff3d5a18;
  color: var(--danger);
  border: 1px solid #ff3d5a44;
}
.btn.danger:hover:not(:disabled) {
  background: #ff3d5a28;
}

.export-note {
  font-size: 8px;
  color: var(--muted);
  margin-top: 8px;
  line-height: 1.5;
}
.export-note strong {
  color: var(--acc);
}

.sel-hd {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 11px;
}
.sel-name {
  font-size: 10px;
  font-weight: 600;
  color: var(--text);
}
.type-pill.sm {
  font-size: 8px;
  padding: 2px 6px;
}

/* ════════════════════════════════════════════════ MAIN */
.main {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.main::-webkit-scrollbar {
  width: 3px;
}
.main::-webkit-scrollbar-thumb {
  background: var(--border);
}

/* ── Welcome ──────────────────────────────────────────── */
.welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 32px;
  color: var(--muted);
}
.welcome-glyph {
  margin-bottom: 20px;
}
.welcome h2 {
  font-size: 18px;
  font-weight: 700;
  color: #6a88a8;
  margin: 0 0 12px;
}
.welcome p {
  max-width: 440px;
  line-height: 1.9;
  font-size: 12px;
}
.welcome code {
  background: #0f1220;
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 5px;
  color: var(--acc);
  font-size: 11px;
}
.welcome strong {
  color: var(--green);
}
.welcome-deps {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
}
.welcome-deps span {
  font-size: 9px;
  background: #0f1220;
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 3px 8px;
  color: #5a7090;
}

/* ── Viewer ───────────────────────────────────────────── */
.viewer-wrap {
  position: relative;
  height: 400px;
  flex-shrink: 0;
  background: #040608;
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
}
.viewer-canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
.place-banner {
  position: absolute;
  z-index: 10;
  pointer-events: none;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffc10720;
  border: 1px solid #ffc10766;
  color: var(--warn);
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 10px;
  white-space: nowrap;
}
kbd {
  background: var(--border);
  border: 1px solid #252d40;
  padding: 1px 5px;
  border-radius: 2px;
  font-family: inherit;
  font-size: 9px;
  margin-left: 6px;
}
.coord-hud {
  position: absolute;
  z-index: 10;
  bottom: 10px;
  left: 10px;
  pointer-events: none;
  background: #00000099;
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
  gap: 10px;
  font-size: 8px;
  color: #243040;
}
.blink {
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* ── Stats ────────────────────────────────────────────── */
.stats {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}
.stat-card {
  flex: 1;
  background: var(--surf);
  border: 1px solid var(--border);
  padding: 8px 10px;
  border-radius: 3px;
}
.sv {
  font-size: 16px;
  font-weight: 800;
  color: var(--acc);
  line-height: 1;
  margin-bottom: 2px;
}
.sl {
  font-size: 8px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

/* ── Element list ────────────────────────────────────── */
.el-section-hd {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.el-section-hd h3 {
  margin: 0;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5a7090;
}
.badge {
  background: #00e5ff15;
  color: var(--acc);
  border: 1px solid #00e5ff33;
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 9px;
  font-weight: 700;
}
.el-empty {
  text-align: center;
  padding: 22px;
  color: var(--muted);
  font-size: 11px;
  background: var(--surf);
  border: 1px dashed var(--border);
  border-radius: 3px;
}
.el-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.el-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: var(--surf);
  border: 1px solid var(--border);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.1s;
}
.el-row:hover {
  border-color: #252d40;
  background: #141a28;
}
.el-row.sel {
  border-color: #00e5ff55;
  background: #00e5ff08;
}
.type-pill {
  padding: 2px 7px;
  border-radius: 2px;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: white;
  flex-shrink: 0;
  min-width: 54px;
  text-align: center;
}
.el-row-info {
  flex: 1;
  min-width: 0;
}
.el-row-name {
  font-size: 10px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-row-meta {
  font-size: 8px;
  color: var(--muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-del {
  background: none;
  border: none;
  color: #243040;
  cursor: pointer;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
  transition: all 0.1s;
  flex-shrink: 0;
}
.el-del:hover {
  background: #ff3d5a22;
  color: var(--danger);
}

/* ── STEP Preview ────────────────────────────────────── */
.step-preview {
  background: #040608;
  border: 1px solid var(--border);
  border-radius: 3px;
  overflow: hidden;
}
.step-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  background: var(--surf);
  border-bottom: 1px solid var(--border);
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--muted);
}
.step-lines {
  color: var(--acc);
}
.step-code {
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

/* ── Log ─────────────────────────────────────────────── */
.log-box {
  background: var(--surf);
  border: 1px solid var(--border);
  border-radius: 3px;
  overflow: hidden;
}
.log-hd {
  padding: 5px 10px;
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--muted);
  border-bottom: 1px solid var(--border);
}
.log-row {
  display: flex;
  gap: 8px;
  padding: 4px 10px;
  border-bottom: 1px solid #191f3255;
  font-size: 9px;
}
.lt {
  color: #243040;
  flex-shrink: 0;
}
.log-row.success span:last-child {
  color: var(--green);
}
.log-row.error span:last-child {
  color: var(--danger);
}
.log-row.warn span:last-child {
  color: var(--warn);
}
.log-row.info span:last-child {
  color: #5a7090;
}
</style>
