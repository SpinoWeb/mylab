<template>
  <div ref="frag-container" id="frag-container" class="w-full h-full">
    <div class="absolute top-12 left-0 flex flex-column gap-2 p-2">
      <Button icon="pi pi-play" :disabled="loading" @click="play()" />
      <Button icon="pi pi-times" :disabled="loading" @click="clear()" />
      <Button
        icon="pi pi-table"
        :style="`background: ${Settings.grids.labelColor}`"
        :disabled="loading"
        @click="setObjectVisible('grids')"
      />
      <Button
        icon="pi pi-tag"
        :style="`background: ${Settings.joints.labelColor}`"
        :disabled="loading"
        @click="setObjectVisible('jointsLabels')"
      />
      <Button
        icon="pi pi-tag"
        :style="`background: ${Settings.frames.labelColor}`"
        :disabled="loading"
        @click="setObjectVisible('framesLabels')"
      />
      <Button
        icon="pi pi-arrow-right"
        :style="`background: ${Settings.frames.labelColor}`"
        :disabled="loading"
        @click="setObjectVisible('framesLocalAxes')"
      />
      <Button
        icon="pi pi-box"
        :style="`background: ${Settings.frames.extrudeColor}`"
        :disabled="loading"
        @click="setObjectVisible('framesSolids')"
      />
      <Button
        icon="pi pi-bolt"
        :style="`background: ${Settings.links.color}`"
        :disabled="loading"
        @click="setObjectVisible('links')"
      />
      <Button
        icon="pi pi-wave-pulse"
        :style="`background: ${Settings.tendons.color}`"
        :disabled="loading"
        @click="setObjectVisible('tendons')"
      />
    </div>

    <div class="absolute top-12 right-0 p-2">{{ getModelsIds() }}</div>

    <ConsoleLog :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, onMounted, watch } from "vue";

import ConsoleLog from "./ConsoleLog.vue";

import * as THREE from "three";
//import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
//import * as BUI from "@thatopen/ui";
//import * as WEBIFC from "web-ifc";
//import Stats from "stats.js";
import * as FRAGS from "@thatopen/fragments";

import { myTri } from "./myTri";
import { myS2k } from "../services/myS2k";

import { Point2D, Point3D, Section, Polygon } from "../services/Types";

//
// groups
//
const Groups: string[] = [
  "grids",
  //"gridsLabel",
  "jointsLabels",
  "framesLabels",
  "framesSolids",
  "framesLocalAxes",
  "links",
  "tendons",
];

// props
interface Props {
  data?: any;
  options?: any;
  loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  data: () => {},
  loading: false,
  options: () => {
    return {
      scaleUnits: [1, 1, 1],
      xyzLimits: {
        Xmin: 0,
        Xmax: 0,
        Xlen: 0,
        Ymin: 0,
        Ymax: 0,
        Ylen: 0,
        Zmin: 0,
        Zmax: 0,
        Zlen: 0,
      },
    };
  },
});

const emit = defineEmits(["update:loading"]);

// toRef
const data = toRef(props, "data");
const options = toRef(props, "options");
const loading = toRef(props, "loading");

import { inject } from "vue";
import { backgroundSize } from "highcharts";
//const darkMode = inject("darkMode");
const darkMode = inject("darkMode", true);

// setPalette
const palette = ref();
const setPalette = (dark: boolean = true) => {
  //console.log(`setPalette > dark: ${dark}`);
  palette.value = dark
    ? { background: "#424242", black: "#eee", gray: "#868e96" }
    : { background: "#eee", black: "#424242", gray: "#f8f9fa" };
};
setPalette(darkMode);

//
// Settings
//
const Settings = {
  grids: {
    color: "#4CAF50",
    linewidth: 0.5,
    labelColor: "#4CAF50",
  },
  joints: {
    size: 0.2,
    color: "#FB8C00",
    labelColor: "#FB8C00",
  },
  frames: {
    color: "#2196F3",
    linewidth: 0.3,
    extrudeOpacity: 0.7,
    extrudeColor: "#2196F3",
    labelColor: "#2196F3",
  },
  links: {
    color: "#6200EE",
    linewidth: 0.5,
    labelColor: "#6200EE",
  },
  tendons: {
    color: "#B00020",
    linewidth: 0.4,
    labelColor: "#B00020",
  },
};

// init
let mainContainer: any,
  container: HTMLDivElement | undefined,
  components: OBC.Components,
  worlds: OBC.Worlds,
  world: any,
  prevBackground: any,
  fragments: any,
  model: any;

watch(darkMode, (n: any) => {
  //console.log(`darkMode: ${n}`);
  setPalette(n);
  world.scene.three.background = palette.value.background;
});

watch(data, () => {
  console.olog(`data updating...`);
  //console.log(`data: ${JSON.stringify(n)}`);
  clear(model.modelID);
});

onMounted(async () => {
  await setScene();
  await setFragments();
  await setFragmentsModel();
  //await loadFragmentsModel();
});

// -------------
// setScene
// -------------
const setScene = async () => {
  //container = document.getElementById("container")!;
  container = document.getElementById("frag-container") as HTMLDivElement;
  if (!container) throw new Error("Missing #frag-container container");

  components = new OBC.Components();

  worlds = components.get(OBC.Worlds);

  world = worlds.create<
    OBC.ShadowedScene,
    OBC.OrthoPerspectiveCamera,
    OBF.PostproductionRenderer
  >();

  world.scene = new OBC.ShadowedScene(components);
  world.renderer = new OBF.PostproductionRenderer(components, container);
  world.camera = new OBC.OrthoPerspectiveCamera(components);

  // Source - https://stackoverflow.com/a/44781658
  //world.camera.up.set(0, 0, 1);

  components.init();

  world.camera.controls?.setLookAt(25, 25, 25, 0, 0, 0);

  world.renderer.showLogo = false;
  world.renderer.three.shadowMap.enabled = true;
  world.renderer.three.shadowMap.type = THREE.VSMShadowMap;

  world.scene.setup({
    shadows: {
      cascade: 1,
      resolution: 2048,
    },
  });

  const prevBackground = world.scene.three.background;

  await world.scene.updateShadows();

  world.camera.controls?.addEventListener("rest", async () => {
    await world.scene.updateShadows();
  });

  //const grids: OBC.Grids = components.get(OBC.Grids);
  //grids.create(world);

  const axes: THREE.AxesHelper = new THREE.AxesHelper(1);
  world.scene.three.add(axes);
};

// -------------
// setFragments
// -------------
const setFragments = async () => {
  // `FragmentsModels.getWorker()` fetches the matching worker for this library version from unpkg
  // and returns a blob URL.
  // You can also pass your own URL to `fragments.init(...)` if you'd rather host the worker yourself.
  const workerUrl = await FRAGS.FragmentsModels.getWorker();
  fragments = components.get(OBC.FragmentsManager);
  fragments.init(workerUrl);

  // Remove z fighting
  fragments.core.models.materials.list.onItemSet.add(
    ({ value: material }: { value: any }) => {
      if (!("isLodMaterial" in material && material.isLodMaterial)) {
        material.polygonOffset = true;
        material.polygonOffsetUnits = 1;
        material.polygonOffsetFactor = Math.random();
      }
    },
  );

  // Temp until we publish the libraries, to be able to use postproduction
  // @ts-ignore

  fragments.core.settings.graphicsQuality = 1;

  world.camera.controls.addEventListener("control", () =>
    fragments.core.update(),
  );

  // Once a model is available in the list, we can tell it
  // to use shadows and to use the clipping planes we are using
  fragments.core.models.list.onItemSet.add(
    ({ value: model }: { value: any }) => {
      model.tiles.onItemSet.add(({ value: mesh }: { value: any }) => {
        if ("isMesh" in mesh) {
          const mat = mesh.material as THREE.MeshStandardMaterial[];
          if (mat[0].opacity === 1) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        }
      });

      //model.getClippingPlanesEvent = () => Array.from(world.renderer!.three.clippingPlanes) || [];
    },
  );

  world.renderer.postproduction.enabled = true;
  //world.renderer.postproduction.style = OBF.PostproductionAspect.COLOR_PEN;
};

// -------------
// setFragmentsModel
// -------------
const setFragmentsModel = async (modelId: string = "my-model") => {
  const bytes = FRAGS.EditUtils.newModel({ raw: true });
  model = await fragments.core.load(bytes, {
    modelId: modelId,
    camera: world.camera.three,
    raw: true,
  });

  //const file = await fetch("https://thatopen.github.io/engine_fragment/resources/frags/school_arq.frag");
  //const buffer = await file.arrayBuffer();
  //model = await fragments.load(buffer, { modelId: modelId });

  world.scene.three.add(model.object);
  await fragments.core.update(true);
};

// -------------
// loadFragmentsModel
// -------------
const loadFragmentsModel = async (modelId: string = "my-model") => {
  // https://github.com/ThatOpen/engine_fragment/tree/main/resources/frags
  const file = await fetch(
    //"https://thatopen.github.io/engine_fragment/resources/frags/school_arq.frag",
    //"https://thatopen.github.io/engine_fragment/resources/frags/school_str.frag",
    "https://thatopen.github.io/engine_fragment/resources/frags/small_test.frag",
  );
  const buffer = await file.arrayBuffer();
  model = await fragments.core.load(buffer, { modelId: modelId });
  //console.log(model);

  world.scene.three.add(model.object);
  await fragments.core.update(true);
};

// -------------
// resetFragmentsModel
// -------------
const resetFragmentsModel = async (modelId: string = "my-model") => {
  await fragments.core.editor.reset(modelId);
  //await fragments.core.update(true);
};

// -------------
// getModels
// -------------
const getModels = () => {
  const models = fragments.core.models.list.values();
  [...models].map((model) => console.log(model.modelId));
};

// -------------
// getBinaryData
// -------------
const getBinaryData = async (modelId: string = "my-model") => {
  if (!fragments) return;

  const model = fragments.core.models.list.get(modelId);
  if (!model) return null;
  const buffer = await model.getBuffer(false);
  return { name: model.modelId, buffer };
};

// -------------
// getModelsIds
// -------------
const getModelsIds = () => {
  if (!fragments) return;

  const models = fragments.core.models.list.values();
  //console.log("getModelsIds", models);
  const ids = [...models].map((model) => model.modelId);
  //console.log("getModelsIds", ids);
  return ids;
};

// -------------
// disposeModels
// -------------
const disposeModels = async (ids = getModelsIds()) => {
  //console.log("disposeModels > ids", ids);
  if (!ids) return;

  const promises = [];
  for (const id of ids) promises.push(fragments.core.disposeModel(id));
  //console.log("disposeModels > promises", promises);

  console.olog("disposing all models...");
  await Promise.all(promises);
  console.olog("all models have been disposed!");
};

// -------------
// addGrid
// -------------
const addGrid = async ({
  GridID,
  AxisDir,
  XRYZCoord,
  BubbleSize,
  scale,
}: {
  GridID: string;
  AxisDir: string;
  XRYZCoord: number;
  BubbleSize?: number;
  scale?: Point3D;
}) => {
  //console.log("addGrid");

  if (!scale) scale = { X: 1, Y: 1, Z: 1 };

  // get setting from model
  const color: string | undefined = Settings?.grids?.color;
  const linewidth: number | undefined = Settings?.grids?.linewidth;
  const labelColor: string | undefined = Settings?.grids?.labelColor;

  if (!BubbleSize) BubbleSize = 1 / options.value.scaleUnits[1]; // m to current unit

  const xyzLimits = options.value.xyzLimits;
  //console.log("addGrid > xyzLimits", xyzLimits);

  // vertex line
  let vertex: Point3D[] = [];
  // X
  if (AxisDir === "X") {
    vertex = [
      { X: XRYZCoord, Z: xyzLimits.Ymin - BubbleSize, Y: 0 },
      { X: XRYZCoord, Z: xyzLimits.Ymax + BubbleSize, Y: 0 },
    ];
  }
  // Y
  if (AxisDir === "Y") {
    vertex = [
      { X: xyzLimits.Xmin - BubbleSize, Z: XRYZCoord, Y: 0 },
      { X: xyzLimits.Xmax + BubbleSize, Z: XRYZCoord, Y: 0 },
    ];
  }
  // skip z (vertical)
  //if (AxisDir === "Z") return;

  // line
  const line: THREE.Line | undefined = myTri.getLine({
    name: `Grid-${GridID}`,
    vertex: vertex,
    scale: scale,
    dashed: true,
    color: color,
    linewidth: linewidth,
  });

  // label
  const label: THREE.Sprite | undefined = myTri.getLabel({
    name: `Grid-${GridID}-Label`,
    text: GridID,
    vertex: vertex[1],
    scale: scale,
    color: labelColor,
  });

  //
  return { line: line, label: label };
};

// -------------
// addJoint
// -------------
const addJoint = ({
  Joint,
  XYZ,
  scale,
}: {
  Joint: string;
  XYZ: Point3D;
  scale?: Point3D;
}) => {
  //const id: string = uuidv4();

  if (!scale) scale = { X: 1, Y: 1, Z: 1 };

  // get setting from model
  const color: string | undefined = Settings?.joints?.color;
  const size: number | undefined = Settings?.joints?.size;
  const labelColor: string | undefined = Settings?.joints?.labelColor;

  // point
  const point: THREE.Points = myTri.getPoint({
    name: `Joint-${Joint}`,
    vertex: XYZ,
    scale: scale,
    color: color,
    size: size,
    //visible:true,
  });

  // label
  const label: THREE.Sprite | undefined = myTri.getLabel({
    name: `Joint-${Joint}-Label`,
    text: Joint,
    vertex: XYZ,
    scale: scale,
    color: labelColor,
  });

  //
  return { point: point, label: label };
};

// -------------
// addFrame
// -------------
const addFrame = ({
  Frame,
  start,
  end,
  scale,
}: {
  Frame: string;
  start: Point3D;
  end: Point3D;
  scale?: Point3D;
}) => {
  //console.log("addFrame");

  if (!scale) scale = { X: 1, Y: 1, Z: 1 };

  // get setting from model
  const color: string | undefined = Settings?.frames?.color;
  //const size: number | undefined = Settings?.frames?.size;
  const labelColor: string | undefined = Settings?.frames?.labelColor;
  const extrudeColor: string | undefined = Settings?.frames?.extrudeColor;
  const extrudeOpacity: number | undefined = Settings?.frames?.extrudeOpacity;
  const linewidth: number | undefined = Settings?.frames?.linewidth;
  //console.log("myFrame > create > color", color);

  const vertex = [
    { X: start.X, Y: start.Y, Z: start.Z },
    { X: end.X, Y: end.Y, Z: end.Z },
  ];

  //
  // midpoint
  //
  const total: Point3D = vertex.reduce(
    (acc, p) => {
      return { X: acc.X + p.X, Y: acc.Y + p.Y, Z: acc.Z + p.Z };
    },
    { X: 0, Y: 0, Z: 0 },
  );
  const midpoint: Point3D = {
    X: (scale.X * total.X) / vertex.length,
    Y: (scale.Y * total.Y) / vertex.length,
    Z: (scale.Z * total.Z) / vertex.length,
  };
  //console.log(midpoint);

  const line: THREE.Line | undefined = myTri.getLine({
    name: `Frame-${Frame}`,
    vertex: vertex,
    scale: scale,
    color: color,
  });

  //
  // label
  //
  const label: THREE.Sprite | undefined = myTri.getLabel({
    name: `Frame-${Frame}-Label`,
    text: Frame,
    vertex: midpoint,
    color: labelColor,
  });

  //
  // direction
  //
  const jI: THREE.Vector3 = new THREE.Vector3(
    start.X * scale.X,
    start.Y * scale.Y,
    start.Z * scale.Z,
  );
  const jJ: THREE.Vector3 = new THREE.Vector3(
    end.X * scale.X,
    end.Y * scale.Y,
    end.Z * scale.Z,
  );
  const direction: THREE.Vector3 = new THREE.Vector3().subVectors(jJ, jI);
  //const length: number = direction.length();
  const axisDirection: THREE.Vector3 = direction.normalize();

  //
  // localAxes
  //
  const localAxes: THREE.AxesHelper = new THREE.AxesHelper(0.5);

  // Use quaternion to rotate localAxes from default to target orientation
  const quaternion: THREE.Quaternion = new THREE.Quaternion();
  const xAxis: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
  quaternion.setFromUnitVectors(xAxis, axisDirection);
  localAxes.geometry.applyQuaternion(quaternion);

  // translate to midpoint of frame
  localAxes.geometry.translate(midpoint.X, midpoint.Y, midpoint.Z);

  // add name
  localAxes.name = `Frame-${Frame}-LocalAxes`;

  //
  return { line: line, label: label, localAxes: localAxes, midpoint: midpoint };
};

// -------------
// addFrameExtrude
// -------------
const addFrameExtrude = ({
  Frame,
  start,
  end,
  Offset,
  section,
  polygons,
  scale,
}: {
  Frame: string;
  start: Point3D;
  end: Point3D;
  Offset?: [number, number, number, number, number, number];
  section: Section;
  polygons?: Polygon[];
  scale?: Point3D;
}) => {
  //console.log("addFrameExtrude", section);
  if (!section) return { extrude: undefined };

  if (!Offset) Offset = [0, 0, 0, 0, 0, 0];
  //if (!section) return;
  if (!polygons) polygons = [];
  if (!scale) scale = { X: 1, Y: 1, Z: 1 };

  // get setting from model
  //const color: string | undefined = Settings?.frames?.color;
  //const size: number | undefined = Settings?.frames?.size;
  //const labelColor: string | undefined = Settings?.frames?.labelColor;
  const extrudeColor: string | undefined = Settings?.frames?.extrudeColor;
  const extrudeOpacity: number | undefined = Settings?.frames?.extrudeOpacity;
  //const linewidth: number | undefined = Settings?.frames?.linewidth;

  // direction to extrude
  const startExtrude: THREE.Vector3 = new THREE.Vector3(
    (start.X + Offset[0]) * scale.X,
    (start.Y + Offset[1]) * scale.Y,
    (start.Z + Offset[2]) * scale.Z,
  );
  const endExtrude: THREE.Vector3 = new THREE.Vector3(
    (end.X + Offset[3]) * scale.X,
    (end.Y + Offset[4]) * scale.Y,
    (end.Z + Offset[5]) * scale.Z,
  );
  const directionExtrude: THREE.Vector3 = new THREE.Vector3().subVectors(
    endExtrude,
    startExtrude,
  );
  const lengthExtrude: number = directionExtrude.length();
  const axisDirectionExtrude: THREE.Vector3 = directionExtrude.normalize();
  //console.log("lengthExtrude", lengthExtrude);

  const { Shape } = section;

  // init getPolygons array
  let getPolygons: Polygon[] = [];
  let shapes: THREE.Shape[] = [];

  if (Shape === "SD Section") {
    // "YES" SD Section
    const getPolygons = myS2k.getSDSectionPolygons({
      Section: section,
      Polygons: polygons,
      //Materials: [],
    });
    //console.log("getPolygons", getPolygons);

    // properties of polygons for svg
    const polygonsProperties = myS2k.getPolygonsProperties(getPolygons);
    //console.log("polygonsProperties", polygonsProperties);

    const Xg: number = polygonsProperties.centroid?.X,
      Yg: number = polygonsProperties.centroid?.Y;

    // get ShapeNames list
    let ShapeNames: string[] = [...polygons].map((p: any) => p.ShapeName);
    ShapeNames = [...new Set(ShapeNames)]; // remove duplicates
    //console.log("ShapeNames", ShapeNames);

    for (const ShapeName of ShapeNames) {
      const polys: Polygon[] = [...polygons].filter(
        (p: any) => p.ShapeName === ShapeName,
      );
      //console.log("polys", polys.length);

      const { points }: { points?: Point2D[] } = polys[0];
      //console.log("points", points);
      if (!points) continue;

      // new shape
      let shape: THREE.Shape = new THREE.Shape();
      //shape.moveTo(-Xg1, -Yg1);

      // moveTo first point
      let { X, Y }: { X: number; Y: number } = points[0];
      //console.log("X, Y", X, Y);

      let X0: number = (-Xg + X) * scale.X;
      let Y0: number = (-Yg + Y) * scale.Y;
      //console.log("X0, Y0", X0, Y0);
      shape.moveTo(X0, Y0);

      // intermediate points
      for (let p: number = 1; p < points.length; p++) {
        const { X, Y }: { X: number; Y: number } = points[p];
        //console.log("X, Y", (-Xg + X) * scale.X, (-Yg + Y) * scale.Y);
        shape.lineTo((-Xg + X) * scale.X, (-Yg + Y) * scale.Y);
      }

      // last == first point
      shape.lineTo(X0, Y0);

      // add shape
      shapes.push(shape);
    }
  } else {
    // "NO" SD Section
    getPolygons = myS2k.getPolygons({ section: section });
    //console.log("getPolygons", getPolygons);

    // properties of polygons for svg
    const polygonsProperties = myS2k.getPolygonsProperties(getPolygons);
    //console.log("polygonsProperties", polygonsProperties);

    const Xg: number = polygonsProperties.centroid?.X,
      Yg: number = polygonsProperties.centroid?.Y;

    for (const polygon of getPolygons) {
      //console.log("polygon", polygon);

      const { points }: { points?: Point2D[] } = polygon;
      //console.log("points", points);
      if (!points) continue;

      // new shape
      let shape: THREE.Shape = new THREE.Shape();

      // moveTo first point
      let { X, Y }: { X: number; Y: number } = points[0];

      let X0: number = (-Xg + X) * scale.X;
      let Y0: number = (-Yg + Y) * scale.Y;
      //console.log("X0, Y0", X0, Y0);
      shape.moveTo(X0, Y0);

      // intermediate points
      for (let p: number = 1; p < points.length; p++) {
        const { X, Y }: { X: number; Y: number } = points[p];
        //console.log("X, Y", (-Xg + X) * scale.X, (-Yg + Y) * scale.Y);
        shape.lineTo((-Xg + X) * scale.X, (-Yg + Y) * scale.Y);
      }

      // last point = first point
      shape.lineTo(X0, Y0);

      // add shape
      shapes.push(shape);
    }
  }
  //console.log("shapes", shapes);

  const geometry: THREE.ExtrudeGeometry = new THREE.ExtrudeGeometry(shapes, {
    // extrude settings
    // https://stackoverflow.com/questions/25626171/threejs-extrudegeometry-depth-gives-different-result-than-extrudepath
    //
    //
    //steps: 10,
    depth: lengthExtrude,
    bevelEnabled: false,
    //bevelThickness: 1,
    //bevelSize: 0,
    //bevelOffset: 0,
    //bevelSegments: 1,
    //extrudePath: randomSpline,
    //extrudePath: centroidalLine3,
    //extrusionSegments: 10,
  });

  // centroid of frame ==> Gxyz
  geometry.translate(0, 0, -lengthExtrude / 2);

  // edges
  const edges: THREE.EdgesGeometry = new THREE.EdgesGeometry(geometry);
  let lines: THREE.LineSegments = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      //color: myTri.setColor(palette.value.black),
      color: myTri.setColor("#424242"),
    }),
  );

  // solids == mesh
  const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
    color: extrudeColor,
  });

  material.transparent = true;
  material.opacity = extrudeOpacity ? extrudeOpacity : 0.7; // 0.7
  let mesh: THREE.Mesh = new THREE.Mesh(geometry, material);

  // extrudeFrames
  let extrude: THREE.Group = new THREE.Group();
  extrude.add(mesh);
  extrude.add(lines);
  //
  extrude.name = `Frame-${Frame}-Extrude`;
  //extrude.visible = false;

  // move to correct position
  //
  const q: number = 0; // ruota la sezione rispetto all'asse dell'elemento
  const qRad: number = (q * Math.PI) / 180;
  const midpointV3: THREE.Vector3 = new THREE.Vector3()
    .addVectors(startExtrude, endExtrude)
    .multiplyScalar(0.5);

  const z = directionExtrude.clone(); // In threejs the extrusion occurs in the Z axis.
  let up = new THREE.Vector3(0, 1, 0); // Default for local UP horizontal members
  const cross_vec = new THREE.Vector3().crossVectors(up, z);

  if (cross_vec.length() === 0) up = new THREE.Vector3(1, 0, 0); // Local UP vertical members

  const x = new THREE.Vector3().crossVectors(up, z).normalize();
  const y = new THREE.Vector3().crossVectors(z, x).normalize();

  const rotation = new THREE.Quaternion().setFromAxisAngle(z, qRad);

  x.applyQuaternion(rotation);
  y.applyQuaternion(rotation);

  const m: THREE.Matrix4 = new THREE.Matrix4().makeBasis(x, y, z);
  const qWorld: THREE.Quaternion = new THREE.Quaternion().setFromRotationMatrix(
    m,
  );
  extrude.quaternion.copy(qWorld);

  extrude.position.copy(midpointV3);

  //
  return { extrude: extrude };
};

// -------------
// _test
// -------------
const _test = async (): Promise<void> => {
  // cerchio 2D
  const shape = new THREE.Shape();

  const radius: number = 0.15,
    slices: number = 18;
  for (let i = 0; i < slices; i++) {
    const alpha: number = (i * 2 * Math.PI) / slices,
      ca: number = Math.cos(alpha),
      sa: number = Math.sin(alpha);
    //console.log(i, alpha, ca, sa);
    i < 1
      ? shape.moveTo(radius * ca, radius * sa)
      : shape.lineTo(radius * ca, radius * sa); // P
  }
  shape.closePath();

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      //for (let k = 0; k < 5; k++) {
      // joints
      const start = new THREE.Vector3(i, 0, j);
      const end = new THREE.Vector3(i + j / 5, 3, j);

      // vettore direzione
      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();
      const normalized = direction.clone().normalize();

      // estrusione
      const extrudeSettings = {
        depth: length,
        //steps: 1,
        bevelEnabled: false,
      };

      const geometry: THREE.ExtrudeGeometry = new THREE.ExtrudeGeometry(
        shape,
        extrudeSettings,
      );

      // asse Z locale
      const zAxis = new THREE.Vector3(0, 0, 1);

      // rotazione verso il target
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        zAxis,
        normalized,
      );

      geometry.applyQuaternion(quaternion);

      // traslazione nello start point
      geometry.translate(start.x, start.y, start.z);

      // material
      const material: THREE.MeshStandardMaterial =
        new THREE.MeshStandardMaterial({
          color: "#2196F3",
          //color: new THREE.Color(i, j, i + j),
        });

      // mesh
      const mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
      // add
      world.scene.three.add(mesh);
      //}
    }
  }
};

// -------------
// play()
// -------------
const _play = async (): Promise<void> => {
  // clear
  await clear(model.modelID);

  console.olog("_play");
  //const elementsData: FRAGS.NewElementData[] = [];

  //
  // scale
  //
  const scale: Point3D = {
    X: options.value.scaleUnits[1],
    Y: options.value.scaleUnits[1],
    Z: options.value.scaleUnits[1],
  };

  //
  // Groups
  //
  console.olog("--- Groups ---");
  for (const Group of Groups) {
    console.olog(`Group: ${Group}`);

    const group: THREE.Group | undefined = myTri.getGroup({
      name: Group,
      //visible: false,
    });
    if (group) world.scene.three.add(group);

    // hide
    setObjectVisible(Group, false);
  }

  //
  // Grids
  // CoordSys AxisDir GridID XRYZCoord LineType LineColor Visible BubbleLoc AllVisible BubbleSize
  //
  console.olog("--- Grids ---");
  let BubbleSize: number = 1 / options.value.scaleUnits[1];
  const GridLines = data.value.hasOwnProperty("Grids")
    ? data.value["Grids"]
    : [];
  for (let i = 0; i < GridLines.length; i++) {
    const record = GridLines[i];

    if (record.AxisDir === "Z") continue;
    if (record.BubbleSize) BubbleSize = record.BubbleSize;
    console.olog(
      `Grid: ${record.GridID} > (${record.AxisDir}, ${record.XRYZCoord}, ${BubbleSize})`,
    );

    const { line, label } = await addGrid({
      GridID: record.GridID,
      AxisDir: record.AxisDir,
      XRYZCoord: record.XRYZCoord,
      BubbleSize: BubbleSize,
      scale: scale,
    });

    if (line && label) {
      //const group = scene.getObjectByName("grids");
      const group = world.scene.three.getObjectByName("grids");
      if (group) {
        group.add(line);
        group.add(label);
      }
    }
  }

  //
  // Joints
  //
  console.olog("--- Joints ---");
  const JointCoordinates = data.value.hasOwnProperty("Joints")
    ? data.value["Joints"]
    : [];
  for (let i = 0; i < JointCoordinates.length; i++) {
    const record = JointCoordinates[i];
    console.olog(
      `Joint: ${record.Joint} > (${record.XorR}, ${record.Y}, ${record.Z})`,
    );

    const {
      point,
      label,
    }: { point: THREE.Points | undefined; label: THREE.Sprite | undefined } =
      addJoint({
        Joint: record.Joint,
        XYZ: { X: record.XorR, Y: record.Z, Z: -record.Y },
        scale: scale,
      });
    //if (point) scene.add(point);
    if (point) world.scene.three.add(point);

    if (label) {
      //const group = scene.getObjectByName("jointsLabels");
      const group = world.scene.three.getObjectByName("jointsLabels");
      if (group) group.add(label);
    }
  }

  // Frames
  console.olog("--- Frames ---");
  const ConnectivityFrame = data.value.hasOwnProperty("Frames")
    ? data.value["Frames"]
    : [];
  const Sections = data.value.hasOwnProperty("Sections")
    ? data.value["Sections"]
    : [];
  const Polygons = data.value.hasOwnProperty("Polygons")
    ? data.value["Polygons"]
    : [];
  for (let i = 0; i < ConnectivityFrame.length; i++) {
    const { Frame, JointI, JointJ, AnalSect } = ConnectivityFrame[i];
    console.olog(`Frame: ${Frame} > (${JointI}, ${JointJ})`);

    //
    // get joints
    //
    const start = JointCoordinates.find((k: any) => k.Joint == JointI);
    const end = JointCoordinates.find((k: any) => k.Joint == JointJ);

    //
    // get Offset
    //
    const Offset: [number, number, number, number, number, number] = [
      Frame.hasOwnProperty("JtOffsetXI") && !Frame.JtOffsetXI
        ? Frame.JtOffsetXI
        : 0,
      Frame.hasOwnProperty("JtOffsetZI") && !Frame.JtOffsetZI
        ? Frame.JtOffsetZI
        : 0,
      Frame.hasOwnProperty("JtOffsetYI") && !Frame.JtOffsetYI
        ? -Frame.JtOffsetYI
        : 0,
      Frame.hasOwnProperty("JtOffsetXJ") && !Frame.JtOffsetXI
        ? Frame.JtOffsetXJ
        : 0,
      Frame.hasOwnProperty("JtOffsetZJ") && !Frame.JtOffsetZJ
        ? Frame.JtOffsetZJ
        : 0,
      Frame.hasOwnProperty("JtOffsetYJ") && !Frame.JtOffsetYJ
        ? -Frame.JtOffsetYJ
        : 0,
    ];
    //console.log("Offset", Offset);

    //
    // get section, polygons
    //
    const section = Sections.find((k: any) => k.SectionName === AnalSect);
    //console.log("section", section);
    const polygons = Polygons.filter((k: any) => k.SectionName === AnalSect);
    //console.log("polygons", polygons);

    //
    // add
    //
    const { line, label, localAxes } = addFrame({
      Frame,
      start: { X: start.XorR, Y: start.Z, Z: -start.Y },
      end: { X: end.XorR, Y: end.Z, Z: -end.Y },
      scale: scale,
    });

    if (line) world.scene.three.add(line);

    if (label) {
      const group = world.scene.three.getObjectByName("framesLabels");
      if (group) group.add(label);
    }

    if (localAxes) {
      const group = world.scene.three.getObjectByName("framesLocalAxes");
      if (group) group.add(localAxes);
    }

    // extrude
    //
    const { extrude } = addFrameExtrude({
      Frame,
      start: { X: start.XorR, Y: start.Z, Z: -start.Y },
      end: { X: end.XorR, Y: end.Z, Z: -end.Y },
      Offset: Offset,
      section: section,
      polygons: polygons,
      scale: scale,
    });

    if (extrude) {
      const group = world.scene.three.getObjectByName("framesSolids");
      if (group) group.add(extrude);
    }
  }

  // Links
  console.olog("--- Links ---");
  const ConnectivityLink = data.value.hasOwnProperty("Links")
    ? data.value["Links"]
    : [];
  for (let i = 0; i < ConnectivityLink.length; i++) {
    const { Link, JointI, JointJ } = ConnectivityLink[i];
    console.olog(`Link: ${Link} > (${JointI}, ${JointJ})`);

    const start = JointCoordinates.find((k: any) => k.Joint == JointI);
    const end = JointCoordinates.find((k: any) => k.Joint == JointJ);

    const vertex = [
      { X: start.XorR, Y: start.Z, Z: -start.Y },
      { X: end.XorR, Y: end.Z, Z: -end.Y },
    ];

    const line: THREE.Line | undefined = myTri.getLine({
      name: `Link-${Link}`,
      vertex: vertex,
      scale: scale,
      color: Settings?.links?.color,
    });

    if (line) {
      const group = world.scene.three.getObjectByName("links");
      if (group) group.add(line);
    }
  }

  // Tendons
  console.olog("--- Tendons ---");
  const ConnectivityTendon = data.value.hasOwnProperty("Tendons")
    ? data.value["Tendons"]
    : [];
  for (let i = 0; i < ConnectivityTendon.length; i++) {
    const { Tendon, points } = ConnectivityTendon[i];
    console.olog(`Tendon: ${Tendon} > ${points.length - 1} segments`);

    const vertex: Point3D[] = points.map((i: Point3D) => {
      return { X: i.X, Y: i.Z, Z: -i.Y };
    });

    const line: THREE.Line | undefined = myTri.getLine({
      name: `Tendon-${Tendon}`,
      vertex: vertex,
      scale: scale,
      color: Settings?.tendons?.color,
    });

    if (line) {
      const group = world.scene.three.getObjectByName("tendons");
      if (group) group.add(line);
    }
  }

  return;
};
const play = async () => {
  emit("update:loading", true);

  try {
    await _play();
    //await _test();
    emit("update:loading", false);
  } catch (error) {
    console.error("play > error:", error);
  }
};

// -------------
// clear scene
// -------------
const clear = async (modelId: string = "my-model") => {
  console.olog("clear");

  // dispose all models
  await disposeModels();

  //
  //await resetFragmentsModel(modelId);

  myTri.clear(world.scene.three);

  // re-set
  world.camera.controls?.setLookAt(25, 25, 25, 0, 0, 0);

  //const grids: OBC.Grids = components.get(OBC.Grids);
  //grids.create(world);

  const axes: THREE.AxesHelper = new THREE.AxesHelper(1);
  world.scene.three.add(axes);

  //
  await setFragmentsModel(modelId);
};

// -------------
// set object visibility
// -------------
const setObjectVisible = (
  name: string | undefined = undefined,
  visible: boolean | undefined = undefined,
) => {
  if (!name) return;

  myTri.setObjectVisible({
    scene: world.scene.three,
    name,
    visible,
  });
};
</script>

<style scoped>
.frag-container {
  position: relative;
  display: inline-block;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  /* height: calc(100vh - 156px); */
  /* min-height: 500px;*/
  /* border: 1px solid; */
}
</style>
