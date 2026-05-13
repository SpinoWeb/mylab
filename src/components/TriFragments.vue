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

import { Point3D } from "../services/Types";

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
//const darkMode = inject("darkMode");
const darkMode = inject("darkMode", true);

// setPalette
const palette = ref();
const setPalette = (dark: boolean = true) => {
  //console.log(`setPalette > dark: ${dark}`);
  palette.value = dark
    ? { black: "#424242", gray: "#868e96" }
    : { black: "#eee", gray: "#f8f9fa" };
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
  world.scene.three.background = palette.value.black;
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
}: {
  GridID: string;
  AxisDir: string;
  XRYZCoord: number;
  BubbleSize?: number;
}) => {
  //console.log("addGrid");

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

  const scale = {
    X: options.value.scaleUnits[1],
    Y: options.value.scaleUnits[1],
    Z: options.value.scaleUnits[1],
  };

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
const addJoint = ({ Joint, XYZ }: { Joint: string; XYZ: Point3D }) => {
  //const id: string = uuidv4();

  // get setting from model
  const color: string | undefined = Settings?.joints?.color;
  const size: number | undefined = Settings?.joints?.size;
  const labelColor: string | undefined = Settings?.joints?.labelColor;

  const scale = {
    X: options.value.scaleUnits[1],
    Y: options.value.scaleUnits[1],
    Z: options.value.scaleUnits[1],
  };

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
  // Groups
  //
  console.olog("--- Groups ---");
  for (const Group of Groups) {
    console.olog(`Group: ${Group}`);

    const group: THREE.Group | undefined = myTri.getGroup({
      name: Group,
      visible: false,
    });
    //if (group) scene.add(group);
    if (group) world.scene.three.add(group);
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
        XYZ: { X: record.XorR, Y: record.Z, Z: record.Y },
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
  for (let i = 0; i < ConnectivityFrame.length; i++) {
    const { Frame, JointI, JointJ, Shape } = ConnectivityFrame[i];
    console.olog(`Frame: ${Frame} > (${JointI}, ${JointJ})`);

    const start = JointCoordinates.find((k: any) => k.Joint == JointI);
    const end = JointCoordinates.find((k: any) => k.Joint == JointJ);

    const Offset: [number, number, number, number, number, number] = [
      0, 0, 0, 0, 0, 0,
    ];

    const vertex = [
      { X: start.XorR, Y: start.Z, Z: start.Y },
      { X: end.XorR, Y: end.Z, Z: end.Y },
    ];

    //
    // centroid
    //
    const total: Point3D = vertex.reduce(
      (acc, p) => {
        return { X: acc.X + p.X, Y: acc.Y + p.Y, Z: acc.Z + p.Z };
      },
      { X: 0, Y: 0, Z: 0 },
    );
    const centroid: Point3D = {
      X: total.X / vertex.length,
      Y: total.Y / vertex.length,
      Z: total.Z / vertex.length,
    };
    //console.log(centroid);

    //
    // scale
    //
    const scale = {
      X: options.value.scaleUnits[1],
      Y: options.value.scaleUnits[1],
      Z: options.value.scaleUnits[1],
    };

    const line: THREE.Line | undefined = myTri.getLine({
      name: `Frame-${Frame}`,
      vertex: vertex,
      scale: scale,
      color: Settings?.frames?.color,
    });
    //if (line) scene.add(line);
    if (line) world.scene.three.add(line);

    //
    // midpoint + Offset
    //
    const midpoint: number[] = [
      (start.XorR + Offset[0] + end.XorR + Offset[3]) / 2,
      (start.Z + Offset[1] + end.Z + Offset[4]) / 2,
      (start.Y + Offset[2] + end.Y + Offset[5]) / 2,
    ].map((k: number) => k * options.value.scaleUnits[1]);
    //console.log(midpoint);

    //
    // direction
    //
    const jI: THREE.Vector3 = new THREE.Vector3(
      start.XorR * options.value.scaleUnits[1],
      start.Z * options.value.scaleUnits[1],
      start.Y * options.value.scaleUnits[1],
    );
    const jJ: THREE.Vector3 = new THREE.Vector3(
      end.XorR * options.value.scaleUnits[1],
      end.Z * options.value.scaleUnits[1],
      end.Y * options.value.scaleUnits[1],
    );
    const direction: THREE.Vector3 = new THREE.Vector3().subVectors(jJ, jI);
    //const length: number = direction.length();
    const axisDirection = direction.normalize();

    //
    // add local AxesHelper
    //
    const localAxes: THREE.AxesHelper = new THREE.AxesHelper(0.5);

    // Use quaternion to rotate localAxes from default to target orientation
    const quaternion: THREE.Quaternion = new THREE.Quaternion();
    const xAxis: THREE.Vector3 = new THREE.Vector3(1, 0, 0);
    quaternion.setFromUnitVectors(xAxis, axisDirection);
    localAxes.geometry.applyQuaternion(quaternion);

    // translate to midpoint of frame
    localAxes.geometry.translate(midpoint[0], midpoint[1], midpoint[2]);

    // add name
    localAxes.name = `Frame-${Frame}-LocalAxes`;

    // add localAxes to group framesLocalAxes
    const group = world.scene.three.getObjectByName("framesLocalAxes");
    if (group) group.add(localAxes);

    //
    // add label
    //
    const label: THREE.Sprite | undefined = myTri.getLabel({
      name: `Frame-${Frame}-Label`,
      text: Frame,
      vertex: centroid,
      scale: scale,
      color: Settings?.frames?.labelColor,
    });

    if (label) {
      const group = world.scene.three.getObjectByName("framesLabels");
      if (group) group.add(label);
    }

    //
    // extrude / solid
    //

    // extrude
    //

    // direction to extrude
    const startExtrude: THREE.Vector3 = new THREE.Vector3(
      (start.XorR + Offset[0]) * options.value.scaleUnits[1],
      (start.Z + Offset[1]) * options.value.scaleUnits[1],
      (start.Y + Offset[2]) * options.value.scaleUnits[1],
    );
    const endExtrude: THREE.Vector3 = new THREE.Vector3(
      (end.XorR + Offset[3]) * options.value.scaleUnits[1],
      (end.Z + Offset[4]) * options.value.scaleUnits[1],
      (end.Y + Offset[5]) * options.value.scaleUnits[1],
    );
    const directionExtrude: THREE.Vector3 = new THREE.Vector3().subVectors(
      endExtrude,
      startExtrude,
    );
    const lengthExtrude: number = directionExtrude.length();
    const axisDirectionExtrude = directionExtrude.clone().normalize();

    const Xg: number = centroid.X * options.value.scaleUnits[1],
      Yg: number = centroid.Y * options.value.scaleUnits[1];

    let shapes: THREE.Shape[] = [];

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

    /*
    if (Shape === "SD Section") {
      // 'SD Section' > polygons
      //

      if (!this.Polys) return;

      // get ShapeNames list
      let ShapeNames: string[] = [...this.Polys].map((p: any) => p.ShapeName);
      ShapeNames = [...new Set(ShapeNames)]; // remove duplicates
      //console.log("MyFrame > create > ShapeNames", this.AnalSect, ShapeNames);

      for (const ShapeName of ShapeNames) {
        const polys = [...this.Polys].filter(
          (p: any) => p.ShapeName === ShapeName,
        );
        //console.log("MyFrame > create > polys", polys);

        // new shape
        let shape: THREE.Shape = new THREE.Shape();
        //shape.moveTo(-Xg1, -Yg1);

        // moveTo first point
        let { X, Y }: { X: number; Y: number } = polys[0];
        //console.log("MyFrame > create > X, Y", X, Y);

        let X0: number = -Xg + X;
        let Y0: number = -Yg + Y;
        //console.log("MyFrame > create > X0, Y0", X0, Y0);
        shape.moveTo(X0, Y0);

        // intermediate points
        for (let p: number = 1; p < polys.length; p++) {
          //for (let p: number = polys.length - 1; p >= 0; p--) {
          const { X, Y }: { X: number; Y: number } = polys[p];
          //console.log("MyFrame > create > X, Y", X, Y);
          shape.lineTo(-Xg + X, -Yg + Y);
        }

        // last == first point
        shape.lineTo(X0, Y0);

        // add shape
        shapes.push(shape);
      }
    } else {
      // not 'SD Section' > vertex
      //
      //console.log("MyFrame > create > vertex", this.AnalSect, this.vertex);
      for (const vtx of this.Vertex) {
        const { points }: { points: Point2D[] } = vtx;
        //console.log("MyFrame > create > points", this.AnalSect, points);

        // new shape
        let shape: THREE.Shape = new THREE.Shape();

        // moveTo first point
        let { X, Y }: { X: number; Y: number } = points[0];

        let X0: number = -Xg + X;
        let Y0: number = -Yg + Y;
        //console.log("MyFrame > create > X0, Y0", X0, Y0);
        shape.moveTo(X0, Y0);

        // intermediate points
        for (let p: number = 1; p < points.length; p++) {
          const { X, Y }: { X: number; Y: number } = points[p];
          //console.log("MyFrame > create > X, Y", X, Y);
          shape.lineTo(-Xg + X, -Yg + Y);
        }

        // last point = first point
        shape.lineTo(X0, Y0);

        // add shape
        shapes.push(shape);
      }
    }
    */
    //console.log("MyFrame > create > shapes", shapes);

    // estrusione
    const extrudeSettings = {
      depth: lengthExtrude,
      bevelEnabled: false,
    };

    const geometry: THREE.ExtrudeGeometry = new THREE.ExtrudeGeometry(
      shape,
      extrudeSettings,
    );

    // asse Z locale
    const zAxis = new THREE.Vector3(0, 0, 1);

    // rotazione verso il target
    const quaternionExtrude = new THREE.Quaternion().setFromUnitVectors(
      zAxis,
      axisDirectionExtrude,
    );

    geometry.applyQuaternion(quaternionExtrude);

    // traslazione nello start point
    geometry.translate(
      start.XorR * options.value.scaleUnits[1],
      start.Z * options.value.scaleUnits[1],
      start.Y * options.value.scaleUnits[1],
    );

    // material
    const material1: THREE.MeshStandardMaterial =
      new THREE.MeshStandardMaterial({
        color: Settings?.frames?.extrudeColor,
      });

    // solids == mesh
    const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
      color: Settings?.frames?.extrudeColor,
    });

    // mesh
    const mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
    // add
    //world.scene.three.add(mesh);
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
      { X: start.XorR, Y: start.Z, Z: start.Y },
      { X: end.XorR, Y: end.Z, Z: end.Y },
    ];
    const scale = {
      X: options.value.scaleUnits[1],
      Y: options.value.scaleUnits[1],
      Z: options.value.scaleUnits[1],
    };

    const line: THREE.Line | undefined = myTri.getLine({
      name: `Link-${Link}`,
      vertex: vertex,
      scale: scale,
      color: Settings?.links?.color,
    });
    //if (line) scene.add(line);

    if (line) {
      //const group = scene.getObjectByName("links");
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
      return { X: i.X, Y: i.Z, Z: i.Y };
    });

    const scale = {
      X: options.value.scaleUnits[1],
      Y: options.value.scaleUnits[1],
      Z: options.value.scaleUnits[1],
    };

    const line: THREE.Line | undefined = myTri.getLine({
      name: `Tendon-${Tendon}`,
      vertex: vertex,
      scale: scale,
      color: Settings?.tendons?.color,
    });
    //if (line) scene.add(line);

    if (line) {
      //const group = scene.getObjectByName("tendons");
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
