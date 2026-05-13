<template>
  <div class="viewer-wrapper">
    <div class="toolbar">
      <button @click="createPortal">Genera Portale con Diagonale</button>
      <button @click="exportIFC" class="secondary">Esporta .ifc</button>
      <span>Elementi: {{ elementCount }}</span>
    </div>
    <!-- Il canvas dove IFClite eseguirà il rendering WebGPU -->
    <canvas ref="canvasRef" class="ifc-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, shallowRef } from "vue";
//import { IfcStore, Schema } from "@ifc-lite/core";
// Import fittizi basati sulle specifiche API di ifc-lite
// Nota: i percorsi dipendono dalla struttura del pacchetto installato
//import { Renderer } from "@ifc-lite/renderer";
//import { GeometryProcessor } from "@ifc-lite/geometry";

const canvasRef = ref(null);
const elementCount = ref(0);

// Usiamo shallowRef per evitare che Vue renda reattivi gli oggetti pesanti di IFClite
const store = shallowRef(null);
const renderer = shallowRef(null);
const geometryProcessor = shallowRef(null);

onMounted(async () => {
  // 1. Inizializza lo Store IFC4
  store.value = new IfcStore({ schema: Schema.IFC4 });

  // 2. Inizializza il Renderer (WebGPU)
  renderer.value = new Renderer(canvasRef.value);
  await renderer.value.init();

  // 3. Inizializza il processore geometrico (WASM)
  geometryProcessor.value = new GeometryProcessor();
  await geometryProcessor.value.init();

  console.log("IFClite inizializzato con successo");
});

/**
 * Funzione helper per aggiungere un elemento tra due punti generici
 */
const addElement = async (type, pointA, pointB, name) => {
  const dx = pointB[0] - pointA[0];
  const dy = pointB[1] - pointA[1];
  const dz = pointB[2] - pointA[2];
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const direction = [dx / length, dy / length, dz / length];

  const profile = store.value.createEntity("IfcRectangleProfileDef", {
    ProfileType: "AREA",
    XDim: 0.3,
    YDim: 0.3,
  });

  const solid = store.value.createEntity("IfcExtrudedAreaSolid", {
    SweptArea: profile,
    ExtrudedDirection: store.value.createEntity("IfcDirection", {
      DirectionRatios: direction,
    }),
    Depth: length,
  });

  const shape = store.value.createEntity("IfcShapeRepresentation", {
    RepresentationIdentifier: "Body",
    RepresentationType: "SweptSolid",
    Items: [solid],
  });

  const product = store.value.createEntity(type, {
    GlobalId: Math.random().toString(36).substring(2, 15),
    Name: name,
    ObjectPlacement: store.value.createEntity("IfcLocalPlacement", {
      RelativePlacement: store.value.createEntity("IfcAxis2Placement3D", {
        Location: store.value.createEntity("IfcCartesianPoint", {
          Coordinates: pointA,
        }),
      }),
    }),
    Representation: store.value.createEntity("IfcProductDefinitionShape", {
      Representations: [shape],
    }),
  });

  elementCount.value++;
  return product;
};

const createPortal = async () => {
  if (!store.value) return;

  // Coordinate Portale (L:4m, H:3m)
  const p1 = [0, 0, 0]; // Base colonna 1
  const p2 = [0, 0, 3]; // Testa colonna 1
  const p3 = [4, 0, 0]; // Base colonna 2
  const p4 = [4, 0, 3]; // Testa colonna 2

  await addElement("IfcColumn", p1, p2, "Colonna A");
  await addElement("IfcColumn", p3, p4, "Colonna B");
  await addElement("IfcBeam", p2, p4, "Trave Orizzontale");
  await addElement("IfcMember", p1, p4, "Diagonale"); // Tra base A e testa B

  // Aggiorna la vista 3D
  updateViewer();
};

const updateViewer = async () => {
  // Converte i dati testuali IFC in mesh ottimizzate per il renderer
  const meshes = await geometryProcessor.value.process(store.value);
  renderer.value.setMeshes(meshes);
};

const exportIFC = async () => {
  const data = await store.value.export();
  const blob = new Blob([data], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "portale_strutturale.ifc";
  a.click();
};
</script>

<style scoped>
.viewer-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: #1a1a1a;
}
.toolbar {
  padding: 1rem;
  background: #2a2a2a;
  color: white;
  display: flex;
  gap: 15px;
  align-items: center;
}
.ifc-canvas {
  flex-grow: 1;
  width: 100%;
  touch-action: none;
}
button {
  padding: 8px 16px;
  background: #42b883;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
button.secondary {
  background: #35495e;
}
</style>
