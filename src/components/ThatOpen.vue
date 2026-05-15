<template>
  <div class="page">
    <div ref="container" class="viewer"></div>

    <button class="export-btn" @click="exportIFC">Export IFC</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";

const container = ref<HTMLDivElement | null>(null);

let ifcApi: WEBIFC.IfcAPI;
let modelID = -1;

onMounted(async () => {
  if (!container.value) return;

  //
  // ==========================================
  // VIEWER
  // ==========================================
  //

  const components = new OBC.Components();

  const worlds = components.get(OBC.Worlds);

  const world = worlds.create<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBC.SimpleRenderer
  >();

  world.scene = new OBC.SimpleScene(components);

  world.renderer = new OBC.SimpleRenderer(components, container.value);

  world.camera = new OBC.SimpleCamera(components);

  components.init();

  world.scene.setup();

  //
  // CAMERA
  //

  world.camera.controls.setLookAt(10, 10, 10, 0, 2, 0);

  //
  // GRID
  //

  const grids = components.get(OBC.Grids);
  grids.create(world);

  //
  // LIGHTS
  //

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);

  world.scene.three.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 1);

  directional.position.set(10, 20, 10);

  world.scene.three.add(directional);

  //
  // ==========================================
  // IFC API
  // ==========================================
  //

  ifcApi = new WEBIFC.IfcAPI();

  await ifcApi.Init();

  modelID = ifcApi.CreateModel({
    schema: "IFC4",
  });

  //
  // ==========================================
  // OWNER HISTORY
  // ==========================================
  //

  const person = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCPERSON,
    null,
    null,
    "Mario",
    "Rossi",
    null,
    null,
  );

  ifcApi.WriteLine(modelID, person);

  const organization = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCORGANIZATION,
    null,
    "MyCompany",
    null,
    null,
    null,
  );

  ifcApi.WriteLine(modelID, organization);

  const personOrg = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCPERSONANDORGANIZATION,
    person,
    organization,
    null,
  );

  ifcApi.WriteLine(modelID, personOrg);

  const application = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCAPPLICATION,
    organization,
    "1.0",
    "Vue IFC Generator",
    "VUEIFC",
  );

  ifcApi.WriteLine(modelID, application);

  const ownerHistory = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCOWNERHISTORY,
    personOrg,
    application,
    null,
    "ADDED",
    null,
    personOrg,
    application,
    Math.floor(Date.now() / 1000),
  );

  ifcApi.WriteLine(modelID, ownerHistory);

  //
  // ==========================================
  // PROJECT
  // ==========================================
  //

  const project = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCPROJECT,
    new WEBIFC.Handle(1),
    ownerHistory,
    "Vue IFC Project",
    null,
    null,
    null,
    [],
    null,
  );

  ifcApi.WriteLine(modelID, project);

  //
  // ==========================================
  // MATERIAL
  // ==========================================
  //

  const concreteMaterial = new THREE.MeshStandardMaterial({
    color: "#bdbdbd",
  });

  //
  // ==========================================
  // COLUMN GEOMETRY
  // ==========================================
  //

  const columnGeometry = new THREE.BoxGeometry(0.4, 4, 0.4);

  //
  // ==========================================
  // COLUMN 1
  // ==========================================
  //

  const column1 = new THREE.Mesh(columnGeometry, concreteMaterial);

  column1.position.set(-2, 2, 0);

  world.scene.three.add(column1);

  const ifcColumn1 = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCCOLUMN,
    new WEBIFC.Handle(100),
    ownerHistory,
    "Column-01",
    null,
    null,
    null,
    null,
  );

  ifcApi.WriteLine(modelID, ifcColumn1);

  //
  // ==========================================
  // COLUMN 2
  // ==========================================
  //

  const column2 = new THREE.Mesh(columnGeometry, concreteMaterial);

  column2.position.set(2, 2, 0);

  world.scene.three.add(column2);

  const ifcColumn2 = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCCOLUMN,
    new WEBIFC.Handle(101),
    ownerHistory,
    "Column-02",
    null,
    null,
    null,
    null,
  );

  ifcApi.WriteLine(modelID, ifcColumn2);

  //
  // ==========================================
  // BEAM
  // ==========================================
  //

  const beamGeometry = new THREE.BoxGeometry(4.4, 0.6, 0.4);

  const beam = new THREE.Mesh(beamGeometry, concreteMaterial);

  beam.position.set(0, 4, 0);

  world.scene.three.add(beam);

  const ifcBeam = ifcApi.CreateIfcEntity(
    modelID,
    WEBIFC.IFCBEAM,
    new WEBIFC.Handle(102),
    ownerHistory,
    "Beam-01",
    null,
    null,
    null,
    null,
  );

  ifcApi.WriteLine(modelID, ifcBeam);
});

//
// ==========================================
// EXPORT IFC
// ==========================================
//

const exportIFC = () => {
  if (modelID === -1) return;

  //
  // Uint8Array IFC
  //

  const data = ifcApi.SaveModel(modelID);

  //
  // Blob download
  //

  const blob = new Blob([data], {
    type: "application/octet-stream",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "structure.ifc";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.page {
  width: 100%;
  height: 100vh;
  position: relative;
}

.viewer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.export-btn {
  position: absolute;
  top: 20px;
  left: 20px;

  z-index: 10;

  border: none;
  border-radius: 8px;

  padding: 12px 18px;

  background: #1976d2;
  color: white;

  font-weight: bold;

  cursor: pointer;
}
</style>
