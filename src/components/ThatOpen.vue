<template>
  <div id="container" style="width: 40%; border: 1px solid black"></div>
  <div style="width: 60%; height: 100%">
    <div id="3dcontainer" style="width: 100%; height: 90%"></div>
    <input type="button" id="runcode" value="Run Code" />
    <input type="file" id="finput" />
    <input type="button" id="cmem" value="Clear Memory" />
    <input type="button" id="rcode" value="Reset Editor" />
    Log Level:
    <select id="logLevel">
      <option value="6">Off</option>
      <option value="4" selected>Error</option>
      <option value="1">Debug</option>
      <option value="3">Warn</option>
    </select>
  </div>
</template>

<script setup lang="ts">
//import { ref, onMounted } from "vue";

//const WebIFC = require("web-ifc/web-ifc-api.js");
import * as WebIFC from "web-ifc";

// initialize the API
const IfcAPI = new WebIFC.IfcAPI();

// initialize the library
await IfcAPI.Init();

// open a model from data
const uint8: Uint8Array = new Uint8Array();
let modelID: number = IfcAPI.OpenModel(
  uint8 /* IFC data as a string or UInt8Array */,
  /* optional settings object */
);

// the model is now loaded! use modelID to fetch geometry or properties
// checkout examples/usage for some details on how to read/write IFC

interface pt {
  x: number;
  y: number;
  z: number;
}

const gridSize = 6;

let dir: pt = { x: 0, y: 0, z: 1 };
let rad: number = 0.25;
let len: number = 2;
let direction = IfcAPI.CreateIfcEntity(modelID, WebIFC.IFCDIRECTION, [
  IfcAPI.CreateIfcType(modelID, WebIFC.IFCREAL, dir.x),
  IfcAPI.CreateIfcType(modelID, WebIFC.IFCREAL, dir.y),
  IfcAPI.CreateIfcType(modelID, WebIFC.IFCREAL, dir.z),
]);
let profileLocation = IfcAPI.CreateIfcEntity(
  modelID,
  WebIFC.IFCCARTESIANPOINT,
  [
    IfcAPI.CreateIfcType(modelID, WebIFC.IFCLENGTHMEASURE, 0),
    IfcAPI.CreateIfcType(modelID, WebIFC.IFCLENGTHMEASURE, 0),
  ],
);
let profileAxis = IfcAPI.CreateIfcEntity(
  modelID,
  WebIFC.IFCAXIS2PLACEMENT2D,
  profileLocation,
  null,
);
let profile = IfcAPI.CreateIfcEntity(
  modelID,
  WebIFC.IFCCIRCLEPROFILEDEF,
  WebIFC.IFC4.IfcProfileTypeEnum.AREA,
  IfcAPI.CreateIfcType(modelID, WebIFC.IFCLABEL, "column-prefab"),
  profileAxis,
  IfcAPI.CreateIfcType(modelID, WebIFC.IFCPOSITIVELENGTHMEASURE, rad),
);

for (let i = 0; i < gridSize; i++) {
  for (let j = 0; j < gridSize; j++) {
    let pos: pt = { x: i, y: j, z: i + j };

    let location = IfcAPI.CreateIfcEntity(modelID, WebIFC.IFCCARTESIANPOINT, [
      IfcAPI.CreateIfcType(modelID, WebIFC.IFCLENGTHMEASURE, pos.x),
      IfcAPI.CreateIfcType(modelID, WebIFC.IFCLENGTHMEASURE, pos.y),
      IfcAPI.CreateIfcType(modelID, WebIFC.IFCLENGTHMEASURE, pos.z),
    ]);
    let placement = IfcAPI.CreateIfcEntity(
      modelID,
      WebIFC.IFCAXIS2PLACEMENT3D,
      location,
      null,
      null,
    );

    let solid = IfcAPI.CreateIfcEntity(
      modelID,
      WebIFC.IFCEXTRUDEDAREASOLID,
      profile,
      placement,
      direction,
      IfcAPI.CreateIfcType(modelID, WebIFC.IFCPOSITIVELENGTHMEASURE, len),
    );

    let column = IfcAPI.CreateIfcEntity(
      modelID,
      WebIFC.IFCCOLUMN,
      IfcAPI.CreateIfcType(modelID, WebIFC.IFCGLOBALLYUNIQUEID, "GUID"),
      null,
      IfcAPI.CreateIfcType(modelID, WebIFC.IFCLABEL, "name"),
      null,
      IfcAPI.CreateIfcType(modelID, WebIFC.IFCLABEL, "label"),
      placement,
      solid,
      IfcAPI.CreateIfcType(modelID, WebIFC.IFCIDENTIFIER, "sadf"),
      null,
    );

    IfcAPI.WriteLine(modelID, column);
  }
}

// close the model, all memory is freed
IfcAPI.CloseModel(modelID);
</script>

<style scoped></style>
