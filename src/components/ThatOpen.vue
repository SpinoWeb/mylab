<template>
  <div class="ifc-builder">
    <!-- Header -->
    <header class="ifc-header">
      <div class="header-brand">
        <span class="brand-icon">⬡</span>
        <div>
          <h1>IFC Model Builder</h1>
          <p class="subtitle">Open BIM · IFC 2x3 / IFC 4</p>
        </div>
      </div>
      <div class="header-meta">
        <span class="status-dot" :class="{ active: model !== null }"></span>
        <span class="status-label">{{
          model ? "Modello attivo" : "Nessun modello"
        }}</span>
      </div>
    </header>

    <div class="workspace">
      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Create Model -->
        <section class="panel">
          <h2 class="panel-title">
            <span class="panel-icon">01</span>
            Crea Modello
          </h2>
          <div class="field">
            <label>Nome progetto</label>
            <input
              v-model="projectName"
              type="text"
              placeholder="es. Edificio Residenziale A"
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
              placeholder="es. Studio Tecnico XYZ"
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

        <!-- Add BIM Element -->
        <section class="panel" :class="{ disabled: !model }">
          <h2 class="panel-title">
            <span class="panel-icon">02</span>
            Aggiungi Elemento BIM
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
            <label>Nome elemento</label>
            <input
              v-model="newElement.name"
              type="text"
              :placeholder="'es. ' + newElement.type + '_001'"
            />
          </div>
          <div class="field">
            <label>Materiale</label>
            <input
              v-model="newElement.material"
              type="text"
              placeholder="es. C25/30 - Cls Armato"
            />
          </div>
          <div class="coords-grid">
            <div class="field">
              <label>X (m)</label>
              <input v-model.number="newElement.x" type="number" step="0.1" />
            </div>
            <div class="field">
              <label>Y (m)</label>
              <input v-model.number="newElement.y" type="number" step="0.1" />
            </div>
            <div class="field">
              <label>Z (m)</label>
              <input v-model.number="newElement.z" type="number" step="0.1" />
            </div>
          </div>
          <div class="coords-grid">
            <div class="field">
              <label>L (m)</label>
              <input
                v-model.number="newElement.length"
                type="number"
                step="0.1"
                min="0.1"
              />
            </div>
            <div class="field">
              <label>W (m)</label>
              <input
                v-model.number="newElement.width"
                type="number"
                step="0.1"
                min="0.1"
              />
            </div>
            <div class="field">
              <label>H (m)</label>
              <input
                v-model.number="newElement.height"
                type="number"
                step="0.1"
                min="0.1"
              />
            </div>
          </div>
          <button
            class="btn btn-accent"
            @click="addBimElement"
            :disabled="!model"
          >
            + Aggiungi elemento
          </button>
        </section>

        <!-- Export -->
        <section
          class="panel"
          :class="{ disabled: !model || elements.length === 0 }"
        >
          <h2 class="panel-title">
            <span class="panel-icon">03</span>
            Esporta
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

      <!-- Main Content -->
      <main class="main-area">
        <!-- Stats Bar -->
        <div class="stats-bar" v-if="model">
          <div class="stat">
            <span class="stat-value">{{ elements.length }}</span>
            <span class="stat-label">Elementi</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ ifcSchema }}</span>
            <span class="stat-label">Schema</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ uniqueTypes }}</span>
            <span class="stat-label">Tipi</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ lastEntityId }}</span>
            <span class="stat-label">Entità STEP</span>
          </div>
        </div>

        <!-- Element List -->
        <div class="elements-section" v-if="model">
          <div class="elements-header">
            <h3>Elementi nel modello</h3>
            <span class="badge">{{ elements.length }}</span>
          </div>

          <div class="empty-state" v-if="elements.length === 0">
            <div class="empty-icon">◫</div>
            <p>
              Nessun elemento. Usa il pannello laterale per aggiungere un
              elemento BIM.
            </p>
          </div>

          <div class="element-list" v-else>
            <div
              v-for="(el, idx) in elements"
              :key="el.guid"
              class="element-card"
              :class="{ selected: selectedElement === idx }"
              @click="selectedElement = idx"
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
                  {{ el.material }} · ({{ el.x }}, {{ el.y }}, {{ el.z }}) m
                </div>
              </div>
              <div class="el-dims">
                {{ el.length }}×{{ el.width }}×{{ el.height }}
              </div>
              <button class="el-remove" @click.stop="removeElement(idx)">
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- IFC Preview -->
        <div class="ifc-preview" v-if="model && elements.length > 0">
          <div class="preview-header">
            <span>Anteprima STEP / IFC</span>
            <span class="preview-lines">{{ ifcLines }} righe</span>
          </div>
          <pre class="ifc-code">{{ ifcPreview }}</pre>
        </div>

        <!-- Welcome State -->
        <div class="welcome-state" v-if="!model">
          <div class="welcome-graphic">
            <div class="cube c1"></div>
            <div class="cube c2"></div>
            <div class="cube c3"></div>
          </div>
          <h2>Costruisci il tuo modello IFC</h2>
          <p>
            Inizia creando un modello nel pannello a sinistra, poi aggiungi gli
            elementi BIM e scarica il file .ifc pronto per Revit, ArchiCAD, BIM
            360 e altri software compatibili.
          </p>
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
import { ref, computed } from "vue";

// ─── State ────────────────────────────────────────────────────────────────────

const projectName = ref("Progetto BIM");
const organization = ref("Studio Tecnico");
const ifcSchema = ref("IFC4");
const model = ref(null); // oggetto modello interno
const elements = ref([]); // lista elementi BIM
const logs = ref([]);
const selectedElement = ref(null);

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
});

const elementTypes = [
  { value: "IFCBEAM", label: "IfcBeam — Trave" },
  { value: "IFCCOLUMN", label: "IfcColumn — Pilastro" },
  { value: "IFCSLAB", label: "IfcSlab — Solaio" },
  { value: "IFCWALL", label: "IfcWall — Parete" },
  { value: "IFCWALLSTANDARDCASE", label: "IfcWallStandardCase — Parete std" },
  { value: "IFCDOOR", label: "IfcDoor — Porta" },
  { value: "IFCWINDOW", label: "IfcWindow — Finestra" },
  { value: "IFCROOF", label: "IfcRoof — Copertura" },
  { value: "IFCSTAIR", label: "IfcStair — Scala" },
  { value: "IFCFURNISHINGELEMENT", label: "IfcFurnishingElement — Arredo" },
  { value: "IFCFOOTING", label: "IfcFooting — Fondazione" },
  { value: "IFCPILE", label: "IfcPile — Palo" },
];

// ─── Computed ─────────────────────────────────────────────────────────────────

const uniqueTypes = computed(
  () => new Set(elements.value.map((e) => e.type)).size,
);

const lastEntityId = computed(() => (model.value ? model.value.nextId - 1 : 0));

/** Genera il contenuto STEP/IFC completo */
const ifcContent = computed(() => {
  if (!model.value) return "";
  return generateIfcFile();
});

const ifcPreview = computed(() => {
  const lines = ifcContent.value.split("\n");
  return lines.slice(0, 80).join("\n") + (lines.length > 80 ? "\n..." : "");
});

const ifcLines = computed(() => ifcContent.value.split("\n").length);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Genera un GUID IFC-compatibile (formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx) */
function generateGuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16).toUpperCase();
  });
}

/** Converte GUID standard in formato IFC base64-like compresso (22 char) */
function guidToIfc(guid) {
  // IFC usa una rappresentazione compressa da 22 caratteri
  const hex = guid.replace(/-/g, "");
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$";
  let result = "";
  for (let i = 0; i < 32; i += 6) {
    const chunk = parseInt(hex.substr(i, 6), 16);
    result += chars[(chunk >> 30) & 0x3f];
    result += chars[(chunk >> 24) & 0x3f];
    result += chars[(chunk >> 18) & 0x3f];
    result += chars[(chunk >> 12) & 0x3f];
    result += chars[(chunk >> 6) & 0x3f];
    result += chars[chunk & 0x3f];
  }
  return result.substring(0, 22);
}

function now() {
  return new Date().toLocaleTimeString("it-IT");
}

function addLog(msg, type = "info") {
  logs.value.unshift({ msg, type, time: now() });
  if (logs.value.length > 20) logs.value.pop();
}

function typeColor(type) {
  const map = {
    IFCBEAM: "#2563EB",
    IFCCOLUMN: "#16A34A",
    IFCSLAB: "#CA8A04",
    IFCWALL: "#DC2626",
    IFCWALLSTANDARDCASE: "#DC2626",
    IFCDOOR: "#9333EA",
    IFCWINDOW: "#0891B2",
    IFCROOF: "#EA580C",
    IFCSTAIR: "#DB2777",
    IFCFURNISHINGELEMENT: "#65A30D",
    IFCFOOTING: "#57534E",
    IFCPILE: "#78716C",
  };
  return map[type] || "#4B5563";
}

// ─── Core IFC generation ──────────────────────────────────────────────────────

/**
 * Genera il file IFC in formato STEP (ISO 10303-21)
 * Struttura:
 *   ISO-10303-21 header
 *   DATA section:
 *     - IFCPROJECT
 *     - IFCSITE
 *     - IFCBUILDING
 *     - IFCBUILDINGSTOREY (piano terra)
 *     - Per ogni elemento: placement, geometry, product definition, element
 */
function generateIfcFile() {
  const m = model.value;
  const schema = ifcSchema.value;
  const timestamp = new Date().toISOString().replace("T", "T").split(".")[0];

  // Registra tutte le entità con ID sequenziali
  const entities = [];
  let id = 1;
  const nextId = () => id++;

  // ── Header entità condivise ──────────────────────────────────────────────

  const idApp = nextId(); // IfcApplication
  const idOrg = nextId(); // IfcOrganization
  const idPerson = nextId(); // IfcPerson
  const idPersonOrg = nextId(); // IfcPersonAndOrganization
  const idOwnerHist = nextId(); // IfcOwnerHistory
  const idUnit1 = nextId(); // IfcSIUnit (LENGTHUNIT)
  const idUnit2 = nextId(); // IfcSIUnit (AREAUNIT)
  const idUnit3 = nextId(); // IfcSIUnit (VOLUMEUNIT)
  const idUnit4 = nextId(); // IfcSIUnit (PLANEANGLEUNIT)
  const idUnitAssign = nextId(); // IfcUnitAssignment
  const idGeomCtx = nextId(); // IfcGeometricRepresentationContext
  const idProject = nextId(); // IfcProject
  const idSitePlace = nextId(); // IfcLocalPlacement (site)
  const idSite = nextId(); // IfcSite
  const idBldgPlace = nextId(); // IfcLocalPlacement (building)
  const idBuilding = nextId(); // IfcBuilding
  const idStoreyPlace = nextId(); // IfcLocalPlacement (storey)
  const idStorey = nextId(); // IfcBuildingStorey
  const idRelAggSite = nextId(); // IfcRelAggregates site→project
  const idRelAggBldg = nextId(); // IfcRelAggregates building→site
  const idRelAggStory = nextId(); // IfcRelAggregates storey→building

  // ── Entità base ──────────────────────────────────────────────────────────

  entities.push(
    `#${idApp}=IFCAPPLICATION(#${idOrg},'1.0','IFC Model Builder Vue3','IfcModelBuilderVue3');`,
  );
  entities.push(`#${idOrg}=IFCORGANIZATION($,'${m.organization}',$,$,$);`);
  entities.push(`#${idPerson}=IFCPERSON($,'BIM','Author',$,$,$,$,$);`);
  entities.push(
    `#${idPersonOrg}=IFCPERSONANDORGANIZATION(#${idPerson},#${idOrg},$);`,
  );
  entities.push(
    `#${idOwnerHist}=IFCOWNERHISTORY(#${idPersonOrg},#${idApp},$,.ADDED.,$,$,$,${Math.floor(Date.now() / 1000)});`,
  );

  entities.push(`#${idUnit1}=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);`);
  entities.push(`#${idUnit2}=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);`);
  entities.push(`#${idUnit3}=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);`);
  entities.push(`#${idUnit4}=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);`);
  entities.push(
    `#${idUnitAssign}=IFCUNITASSIGNMENT((#${idUnit1},#${idUnit2},#${idUnit3},#${idUnit4}));`,
  );

  entities.push(
    `#${idGeomCtx}=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-05,#${nextId()},#${nextId()});`,
  );
  // Axis2Placement3D e Direction per il contesto
  const idCtxAxis = id - 2;
  const idCtxDir = id - 1;
  entities.push(`#${idCtxAxis}=IFCAXIS2PLACEMENT3D(#${nextId()},$,$);`);
  const idCtxOrigin = id - 1;
  entities.push(`#${idCtxOrigin}=IFCCARTESIANPOINT((0.,0.,0.));`);
  entities.push(`#${idCtxDir}=IFCDIRECTION((0.,1.,0.));`);

  const projGuid = guidToIfc(generateGuid());
  entities.push(
    `#${idProject}=IFCPROJECT('${projGuid}',#${idOwnerHist},'${m.name}',$,$,$,$,(#${idGeomCtx}),#${idUnitAssign});`,
  );

  // Placements base (identità)
  const makeAxisPlacement = (originId) => {
    const axId = nextId();
    entities.push(`#${axId}=IFCAXIS2PLACEMENT3D(#${originId},$,$);`);
    return axId;
  };
  const makeOrigin = (x = 0, y = 0, z = 0) => {
    const oId = nextId();
    entities.push(`#${oId}=IFCCARTESIANPOINT((${x}.,${y}.,${z}.));`);
    return oId;
  };

  const siteOriginId = makeOrigin(0, 0, 0);
  const siteAxisId = makeAxisPlacement(siteOriginId);
  entities.push(`#${idSitePlace}=IFCLOCALPLACEMENT($,#${siteAxisId});`);

  const siteGuid = guidToIfc(generateGuid());
  entities.push(
    `#${idSite}=IFCSITE('${siteGuid}',#${idOwnerHist},'Sito',$,$,#${idSitePlace},$,$,.ELEMENT.,$,$,$,$,$);`,
  );

  const bldgOriginId = makeOrigin(0, 0, 0);
  const bldgAxisId = makeAxisPlacement(bldgOriginId);
  entities.push(
    `#${idBldgPlace}=IFCLOCALPLACEMENT(#${idSitePlace},#${bldgAxisId});`,
  );

  const bldgGuid = guidToIfc(generateGuid());
  entities.push(
    `#${idBuilding}=IFCBUILDING('${bldgGuid}',#${idOwnerHist},'${m.name}',$,$,#${idBldgPlace},$,$,.ELEMENT.,$,$,$);`,
  );

  const storeyOriginId = makeOrigin(0, 0, 0);
  const storeyAxisId = makeAxisPlacement(storeyOriginId);
  entities.push(
    `#${idStoreyPlace}=IFCLOCALPLACEMENT(#${idBldgPlace},#${storeyAxisId});`,
  );

  const storeyGuid = guidToIfc(generateGuid());
  entities.push(
    `#${idStorey}=IFCBUILDINGSTOREY('${storeyGuid}',#${idOwnerHist},'Piano Terra',$,$,#${idStoreyPlace},$,$,.ELEMENT.,0.);`,
  );

  // Aggregazioni struttura spaziale
  entities.push(
    `#${idRelAggSite}=IFCRELAGGREGATES('${guidToIfc(generateGuid())}',#${idOwnerHist},$,$,#${idProject},(#${idSite}));`,
  );
  entities.push(
    `#${idRelAggBldg}=IFCRELAGGREGATES('${guidToIfc(generateGuid())}',#${idOwnerHist},$,$,#${idSite},(#${idBuilding}));`,
  );
  entities.push(
    `#${idRelAggStory}=IFCRELAGGREGATES('${guidToIfc(generateGuid())}',#${idOwnerHist},$,$,#${idBuilding},(#${idStorey}));`,
  );

  // ── Elementi BIM ─────────────────────────────────────────────────────────

  const elementIds = [];

  for (const el of elements.value) {
    // Scala mm→ valori reali (IFC usa mm se unit = MILLIMETRE)
    const L = el.length * 1000;
    const W = el.width * 1000;
    const H = el.height * 1000;
    const X = el.x * 1000;
    const Y = el.y * 1000;
    const Z = el.z * 1000;

    // Placement
    const elOriginId = nextId();
    entities.push(`#${elOriginId}=IFCCARTESIANPOINT((${X}.,${Y}.,${Z}.));`);
    const elAxisId = nextId();
    entities.push(`#${elAxisId}=IFCAXIS2PLACEMENT3D(#${elOriginId},$,$);`);
    const elPlaceId = nextId();
    entities.push(
      `#${elPlaceId}=IFCLOCALPLACEMENT(#${idStoreyPlace},#${elAxisId});`,
    );

    // Geometria: IfcExtrudedAreaSolid con profilo rettangolare
    const profId = nextId();
    entities.push(
      `#${profId}=IFCRECTANGLEPROFILEDEF(.AREA.,$,#${nextId()},${W}.,${H}.);`,
    );
    const profOriginId = id - 1;
    entities.push(`#${profOriginId}=IFCAXIS2PLACEMENT2D(#${nextId()},$);`);
    const prof2dOriginId = id - 1;
    entities.push(`#${prof2dOriginId}=IFCCARTESIANPOINT((0.,0.));`);

    const extDirId = nextId();
    entities.push(`#${extDirId}=IFCDIRECTION((0.,0.,1.));`);
    const solidOriginId = nextId();
    entities.push(`#${solidOriginId}=IFCCARTESIANPOINT((0.,0.,0.));`);
    const solidAxisId = nextId();
    entities.push(
      `#${solidAxisId}=IFCAXIS2PLACEMENT3D(#${solidOriginId},$,$);`,
    );
    const solidId = nextId();
    entities.push(
      `#${solidId}=IFCEXTRUDEDAREASOLID(#${profId},#${solidAxisId},#${extDirId},${L}.);`,
    );

    // ShapeRepresentation
    const shapeRepId = nextId();
    entities.push(
      `#${shapeRepId}=IFCSHAPEREPRESENTATION(#${idGeomCtx},'Body','SweptSolid',(#${solidId}));`,
    );
    const prodDefShapeId = nextId();
    entities.push(
      `#${prodDefShapeId}=IFCPRODUCTDEFINITIONSHAPE($,$,(#${shapeRepId}));`,
    );

    // Materiale
    const matId = nextId();
    entities.push(`#${matId}=IFCMATERIAL('${el.material}');`);

    // Elemento principale
    const elId = nextId();
    const elGuid = guidToIfc(generateGuid());
    entities.push(
      `#${elId}=${el.type}('${elGuid}',#${idOwnerHist},'${el.name}',$,'${el.type}',#${elPlaceId},#${prodDefShapeId},$);`,
    );
    elementIds.push(elId);

    // Associazione materiale
    const matAssocId = nextId();
    entities.push(
      `#${matAssocId}=IFCRELASSOCIATESMATERIAL('${guidToIfc(generateGuid())}',#${idOwnerHist},$,$,(#${elId}),#${matId});`,
    );
  }

  // Contenimento elementi nel piano
  if (elementIds.length > 0) {
    const relContainId = nextId();
    entities.push(
      `#${relContainId}=IFCRELCONTAINEDINSPATIALSTRUCTURE('${guidToIfc(generateGuid())}',#${idOwnerHist},'Elementi piano terra',$,(${elementIds.map((i) => "#" + i).join(",")}),#${idStorey});`,
    );
  }

  // Aggiorna il contatore per le statistiche
  m.nextId = id;

  // ── Assemblaggio file STEP ────────────────────────────────────────────────
  const header = [
    "ISO-10303-21;",
    "HEADER;",
    `FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');`,
    `FILE_NAME('${m.name}.ifc','${timestamp}',('BIM Author'),('${m.organization}'),'IFC Model Builder Vue3','IFC Model Builder Vue3 1.0','');`,
    `FILE_SCHEMA(('${schema}'));`,
    "ENDSEC;",
    "",
    "DATA;",
  ];

  const footer = ["ENDSEC;", "", "END-ISO-10303-21;"];

  return [...header, ...entities, ...footer].join("\n");
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Crea un nuovo modello IFC inizializzando le strutture dati.
 */
function createModel() {
  model.value = {
    name: projectName.value || "Progetto BIM",
    organization: organization.value || "Organizzazione",
    schema: ifcSchema.value,
    createdAt: new Date().toISOString(),
    nextId: 1,
  };
  elements.value = [];
  addLog(
    `Modello "${model.value.name}" creato (${ifcSchema.value})`,
    "success",
  );
}

/**
 * Aggiunge un elemento BIM al modello.
 * @param {Object} opts - opzioni elemento (sovrascrivono il form)
 */
function addBimElement(opts = null) {
  if (!model.value) {
    addLog("Errore: nessun modello attivo", "error");
    return;
  }

  const source = opts || newElement.value;
  const element = {
    guid: generateGuid(),
    type: source.type,
    name:
      source.name ||
      `${source.type}_${String(elements.value.length + 1).padStart(3, "0")}`,
    material: source.material || "Non specificato",
    x: source.x ?? 0,
    y: source.y ?? 0,
    z: source.z ?? 0,
    length: source.length ?? 5,
    width: source.width ?? 0.3,
    height: source.height ?? 0.5,
  };

  elements.value.push(element);
  addLog(`Aggiunto ${element.type}: "${element.name}"`, "success");

  // Reset nome per il prossimo elemento
  if (!opts) {
    newElement.value.name = "";
  }
}

function removeElement(idx) {
  const el = elements.value[idx];
  elements.value.splice(idx, 1);
  if (selectedElement.value === idx) selectedElement.value = null;
  addLog(`Rimosso "${el.name}"`, "warn");
}

/**
 * Scarica il file IFC generato.
 */
function exportIfc() {
  if (!model.value || elements.value.length === 0) return;
  const content = ifcContent.value;
  const blob = new Blob([content], { type: "application/x-step" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${model.value.name.replace(/\s+/g, "_")}.ifc`;
  a.click();
  URL.revokeObjectURL(url);
  addLog(`File IFC esportato (${elements.value.length} elementi)`, "success");
}

/**
 * Copia il contenuto STEP negli appunti.
 */
async function copyToClipboard() {
  if (!model.value) return;
  try {
    await navigator.clipboard.writeText(ifcContent.value);
    addLog("Contenuto STEP copiato negli appunti", "success");
  } catch {
    addLog("Impossibile copiare (permessi browser)", "error");
  }
}

// ─── Expose per uso programmatico ─────────────────────────────────────────────
defineExpose({
  createModel,
  addBimElement,
  exportIfc,
  model,
  elements,
  ifcContent,
});
</script>

<style scoped>
/* ─── Design tokens ─────────────────────────────────────────────────── */
:root {
  --bg: #0d0f14;
  --surface: #14171f;
  --border: #1e2330;
  --accent: #00d4ff;
  --accent2: #00ff9d;
  --text: #e2e8f0;
  --muted: #64748b;
  --danger: #ff4d6d;
  --warn: #ffb800;
}

/* ─── Layout ────────────────────────────────────────────────────────── */
.ifc-builder {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0d0f14;
  color: #e2e8f0;
  font-family: "JetBrains Mono", "Fira Code", "Courier New", monospace;
  font-size: 13px;
}

.ifc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: #14171f;
  border-bottom: 1px solid #1e2330;
  flex-shrink: 0;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  font-size: 28px;
  color: #00d4ff;
  line-height: 1;
}

.header-brand h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #f1f5f9;
}

.subtitle {
  margin: 0;
  font-size: 10px;
  color: #64748b;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1e2330;
  border: 1px solid #64748b;
  transition: all 0.3s;
}
.status-dot.active {
  background: #00ff9d;
  border-color: #00ff9d;
  box-shadow: 0 0 8px #00ff9d88;
}

.status-label {
  color: #64748b;
  font-size: 11px;
}

.workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ─── Sidebar ────────────────────────────────────────────────────────── */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: #14171f;
  border-right: 1px solid #1e2330;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.panel {
  padding: 20px 18px;
  border-bottom: 1px solid #1e2330;
  transition: opacity 0.2s;
}
.panel.disabled {
  opacity: 0.35;
  pointer-events: none;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94a3b8;
}

.panel-icon {
  font-size: 10px;
  font-weight: 800;
  color: #00d4ff;
  background: #00d4ff18;
  padding: 2px 6px;
  border-radius: 3px;
  letter-spacing: 0;
}

.field {
  margin-bottom: 10px;
}
.field label {
  display: block;
  font-size: 10px;
  color: #64748b;
  margin-bottom: 4px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.field input,
.field select {
  width: 100%;
  background: #0d0f14;
  border: 1px solid #1e2330;
  border-radius: 4px;
  color: #e2e8f0;
  padding: 7px 10px;
  font-family: inherit;
  font-size: 12px;
  box-sizing: border-box;
  transition: border 0.2s;
}
.field input:focus,
.field select:focus {
  outline: none;
  border-color: #00d4ff44;
}
.field select option {
  background: #0d0f14;
}

.coords-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
}

/* ─── Buttons ────────────────────────────────────────────────────────── */
.btn {
  width: 100%;
  padding: 9px 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all 0.15s;
  margin-top: 4px;
}
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  background: #00d4ff18;
  color: #00d4ff;
  border: 1px solid #00d4ff44;
}
.btn-primary:hover:not(:disabled) {
  background: #00d4ff30;
  border-color: #00d4ff;
}

.btn-accent {
  background: #00ff9d18;
  color: #00ff9d;
  border: 1px solid #00ff9d44;
}
.btn-accent:hover:not(:disabled) {
  background: #00ff9d30;
  border-color: #00ff9d;
}

.btn-export {
  background: #2563eb18;
  color: #60a5fa;
  border: 1px solid #2563eb44;
}
.btn-export:hover:not(:disabled) {
  background: #2563eb30;
}

.btn-secondary {
  background: #1e2330;
  color: #94a3b8;
  border: 1px solid #2d3748;
  margin-top: 6px;
}
.btn-secondary:hover:not(:disabled) {
  background: #2d3748;
}

/* ─── Main area ──────────────────────────────────────────────────────── */
.main-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Stats bar */
.stats-bar {
  display: flex;
  gap: 2px;
}
.stat {
  flex: 1;
  background: #14171f;
  border: 1px solid #1e2330;
  padding: 12px 16px;
  border-radius: 4px;
}
.stat-value {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: #00d4ff;
  line-height: 1;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Elements section */
.elements-section {
}

.elements-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.elements-header h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}
.badge {
  background: #00d4ff18;
  color: #00d4ff;
  border: 1px solid #00d4ff33;
  border-radius: 10px;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #475569;
  background: #14171f;
  border: 1px dashed #1e2330;
  border-radius: 4px;
}
.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.4;
}

/* Element cards */
.element-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.element-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #14171f;
  border: 1px solid #1e2330;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}
.element-card:hover {
  border-color: #2d3748;
  background: #1a1e2a;
}
.element-card.selected {
  border-color: #00d4ff44;
  background: #00d4ff08;
}

.el-type-badge {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: white;
  flex-shrink: 0;
  min-width: 60px;
  text-align: center;
}
.el-info {
  flex: 1;
  min-width: 0;
}
.el-name {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-meta {
  font-size: 10px;
  color: #64748b;
  margin-top: 2px;
}
.el-dims {
  font-size: 10px;
  color: #475569;
  white-space: nowrap;
  flex-shrink: 0;
}
.el-remove {
  background: none;
  border: none;
  color: #475569;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 3px;
  flex-shrink: 0;
  transition: all 0.15s;
}
.el-remove:hover {
  background: #ff4d6d22;
  color: #ff4d6d;
}

/* IFC Preview */
.ifc-preview {
  background: #0a0c10;
  border: 1px solid #1e2330;
  border-radius: 4px;
  overflow: hidden;
}
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #14171f;
  border-bottom: 1px solid #1e2330;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}
.preview-lines {
  color: #00d4ff;
}
.ifc-code {
  padding: 14px;
  margin: 0;
  font-size: 10px;
  line-height: 1.6;
  color: #00ff9d;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  font-family: "JetBrains Mono", monospace;
}

/* Welcome */
.welcome-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 40px;
  color: #475569;
}
.welcome-state h2 {
  color: #94a3b8;
  margin: 20px 0 12px;
  font-size: 18px;
}
.welcome-state p {
  max-width: 400px;
  line-height: 1.7;
  font-size: 12px;
}

/* Isometric cubes decoration */
.welcome-graphic {
  position: relative;
  width: 100px;
  height: 80px;
  margin: 0 auto;
}
.cube {
  position: absolute;
  width: 30px;
  height: 30px;
  background: #1e2330;
  border: 1px solid #2d3748;
  border-radius: 3px;
  animation: float 3s ease-in-out infinite;
}
.c1 {
  top: 10px;
  left: 10px;
  background: #00d4ff18;
  border-color: #00d4ff44;
  animation-delay: 0s;
}
.c2 {
  top: 0;
  left: 40px;
  background: #00ff9d18;
  border-color: #00ff9d44;
  animation-delay: 0.5s;
}
.c3 {
  top: 20px;
  left: 65px;
  background: #2563eb18;
  border-color: #2563eb44;
  animation-delay: 1s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* Log */
.log-panel {
  background: #14171f;
  border: 1px solid #1e2330;
  border-radius: 4px;
  overflow: hidden;
}
.log-header {
  padding: 8px 14px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  border-bottom: 1px solid #1e2330;
  background: #0d0f14;
}
.log-entries {
  max-height: 140px;
  overflow-y: auto;
}
.log-entry {
  display: flex;
  gap: 12px;
  padding: 6px 14px;
  border-bottom: 1px solid #1e233044;
  font-size: 11px;
}
.log-time {
  color: #475569;
  flex-shrink: 0;
}
.log-entry.success .log-msg {
  color: #00ff9d;
}
.log-entry.error .log-msg {
  color: #ff4d6d;
}
.log-entry.warn .log-msg {
  color: #ffb800;
}
.log-entry.info .log-msg {
  color: #94a3b8;
}
</style>
