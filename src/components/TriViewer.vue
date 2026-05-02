<template>
  <div
    ref="my-viewer-container"
    id="my-viewer-container"
    class="my-viewer-container"
  >
    <div class="absolute top-0 left-0 flex flex-column gap-2 p-2">
      <Button icon="pi pi-play" :disabled="loading" @click="play" />
      <Button icon="pi pi-times" :disabled="loading" @click="clear" />
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
    </div>

    <ConsoleLog :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, onMounted, watch } from "vue";
import { v4 as uuidv4 } from "uuid";

import ConsoleLog from "./ConsoleLog.vue";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ViewportGizmo } from "three-viewport-gizmo";

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
];

//
// Settings
//
const Settings = {
  grids: {
    color: "#696",
    linewidth: 1,
    labelColor: "#696",
  },
  joints: {
    size: 0.3,
    color: "#FB8C00",
    labelColor: "#FB8C00",
  },
  frames: {
    color: "#2196F3",
    //color: "#BBB",
    linewidth: 0.2,
    extrudeOpacity: 0.7,
    extrudeColor: "#2196F3",
    labelColor: "#2196F3",
  },
};

// props
interface Props {
  modelValue?: any;
  options?: any;
  loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => {},
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
  loading: false,
});

// toRef
const data = toRef(props, "modelValue");
const options = toRef(props, "options");
const loading = toRef(props, "loading");

import { inject } from "vue";
//const darkMode = inject("darkMode");
const darkMode = inject("darkMode", true);

// setPalette
const palette = ref();
const setPalette = (dark: boolean = true) => {
  //console.log(`setPalette > dark: ${dark}`);
  palette.value = dark ? { black: "#424242" } : { black: "#EEE" };
};
setPalette(darkMode);

const scene: THREE.Scene = new THREE.Scene();
scene.background = myTri.setColor(palette.value.black);

watch(darkMode, (n: any) => {
  //console.log(`darkMode: ${n}`);
  setPalette(n);
  //console.warn(`palette: ${palette.value.black}`);
  scene.background = myTri.setColor(palette.value.black);
});

watch(data, () => {
  console.olog(`data updating...`);
  //console.log(`data: ${JSON.stringify(n)}`);
  clear();
  //play();
});

onMounted(async () => {
  //await initModel();
  setTimeout(() => init(), 200);
});

// -------------
// init
// -------------
const init = async () => {
  console.olog("init");

  const container = document.getElementById(
    "my-viewer-container",
  ) as HTMLDivElement;
  if (!container) throw new Error("Missing #my-viewer-container container");

  const w: number = container.clientWidth,
    h: number = container.clientHeight;
  console.olog(`container > w, h : ${w} ${h}`);

  // set camera
  const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
  camera.position.set(0, 5, 10);

  // set renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(window.devicePixelRatio);
  container?.appendChild(renderer.domElement);

  // controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.8, 0);
  controls.minDistance = 1;
  controls.maxDistance = 1000;
  controls.update();

  // on control change
  controls.addEventListener("change", () => {
    //if (scene && camera && renderer)
    renderer.render(scene, camera);
  });

  // gizmo
  const gizmo = new ViewportGizmo(camera, renderer, {
    // Position options: "top-left" | "top-right" | "bottom-left" | "bottom-right"
    placement: "bottom-left",
    size: 100, // Size of the gizmo in pixels
    offset: {
      left: 64,
      bottom: 64,
    },
    y: { label: "Z" },
    z: { label: "Y" },
  });
  gizmo.attachControls(controls);

  //
  // init scene
  //

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 8, 3);
  scene.add(directionalLight);

  scene.add(myTri.setAxesHelper({}));

  //
  //
  const render4ever = () => {
    requestAnimationFrame(render4ever.bind(this));
    if (controls) controls.update();
    if (scene && camera && renderer) {
      renderer.render(scene, camera);
      gizmo.render();
    }
  };
  render4ever();

  //
  // Animation loop
  /*
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  */

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);

    gizmo.update();
  });

  // on container size change
  new ResizeObserver((entries) => {
    //console.log("ResizeObserver", entries);
    const c = entries[0].contentRect;

    camera.aspect = c.width / c.height;
    camera.updateProjectionMatrix();

    renderer.setSize(c.width, c.height);
    //if (renderer && scene && camera)
    renderer.render(scene, camera);

    gizmo.update();
  }).observe(container);
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
// play()
// -------------
const play = async () => {
  //console.log("play");

  // clear
  clear();

  console.olog("play");

  //
  // Groups
  //
  console.olog("--------------------------");
  for (const Group of Groups) {
    console.olog(`Group: ${Group}`);

    const group: THREE.Group | undefined = myTri.getGroup({
      name: Group,
      visible: true,
    });
    if (group) scene.add(group);
  }

  //
  // Grids
  // CoordSys AxisDir GridID XRYZCoord LineType LineColor Visible BubbleLoc AllVisible BubbleSize
  //
  console.olog("--------------------------");
  let BubbleSize: number = 1 / options.value.scaleUnits[1];
  const GridLines = data.value["Grid Lines"].records;
  for (let i = 0; i < GridLines.length; i++) {
    const record = GridLines[i];

    if (record.AxisDir === "Z") continue;
    if (record.BubbleSize) BubbleSize = record.BubbleSize;
    console.olog(
      `Grid-${record.GridID} : (${record.AxisDir}, ${record.XRYZCoord}, ${BubbleSize})`,
    );

    const { line, label } = await addGrid({
      GridID: record.GridID,
      AxisDir: record.AxisDir,
      XRYZCoord: record.XRYZCoord,
      BubbleSize: BubbleSize,
    });

    if (line && label) {
      const group = scene.getObjectByName("grids");
      if (group) {
        group.add(line);
        group.add(label);
      }
    }
  }

  //
  // Joints
  //
  console.olog("--------------------------");
  const JointCoordinates = data.value["Joint Coordinates"].records;
  for (let i = 0; i < JointCoordinates.length; i++) {
    const record = JointCoordinates[i];
    console.olog(
      `Joint-${record.Joint} : (${record.XorR}, ${record.Y}, ${record.Z})`,
    );

    const {
      point,
      label,
    }: { point: THREE.Points | undefined; label: THREE.Sprite | undefined } =
      addJoint({
        Joint: record.Joint,
        XYZ: { X: record.XorR, Y: record.Z, Z: record.Y },
      });
    if (point) scene.add(point);

    if (label) {
      const group = scene.getObjectByName("jointsLabels");
      if (group) group.add(label);
    }
  }

  // Frames
  console.olog("--------------------------");
  const ConnectivityFrame = data.value["Connectivity - Frame"].records;
  for (let i = 0; i < ConnectivityFrame.length; i++) {
    const { Frame, JointI, JointJ } = ConnectivityFrame[i];
    console.olog(`Frame-${Frame} : (${JointI}, ${JointJ})`);

    const start = JointCoordinates.find((k: any) => k.Joint === JointI);
    const end = JointCoordinates.find((k: any) => k.Joint === JointJ);

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
      name: `Frame-${Frame}`,
      vertex: vertex,
      scale: scale,
      color: Settings?.frames?.color,
    });
    if (line) scene.add(line);
  }
};

// -------------
// clear scene
// -------------
const clear = () => {
  console.olog("clear");
  myTri.clear(scene);

  // re-init
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 8, 3);
  scene.add(directionalLight);

  scene.add(myTri.setAxesHelper({}));
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
    scene,
    name: name,
    visible: visible,
  });
};
</script>

<style scoped>
.my-viewer-container {
  position: relative;
  display: inline-block;
  margin: 0;
  padding: 0;
  width: 100%;
  height: calc(100vh - 156px);
  /* min-height: 500px;*/
  /* border: 1px solid; */
}
</style>
