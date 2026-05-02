<template>
  <div
    ref="my-viewer-container"
    id="my-viewer-container"
    class="my-viewer-container"
  >
    <div class="absolute top-0 left-0 flex flex-column gap-2 p-2">
      <Button label="play" :disabled="loading" @click="play" />
      <Button label="clear" :disabled="loading" @click="clear" />
    </div>
    <div class="absolute top-0 right-0 h-[300px] overflow-y-auto p-2 w-1/3">
      <VueJsonPretty
        :data="data"
        :collapsedNodeLength="1"
        :showLength="true"
        :showIcon="true"
      />
    </div>
    <ConsoleLog :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, onMounted, watch } from "vue";
import { v4 as uuidv4 } from "uuid";

import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

import ConsoleLog from "./ConsoleLog.vue";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ViewportGizmo } from "three-viewport-gizmo";

import { myTri } from "./myTri";

import { Point3D } from "../services/Types";

const Settings = {
  joints: {
    size: 0.2,
    color: "#FB8C00",
    labelColor: "#FB8C00",
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
    scaleUnits: [1, 1, 1];
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
  console.log(`data updating...`);
  //console.log(`data: ${JSON.stringify(n)}`);
  clear();
  //play();
});

onMounted(async () => {
  //await initModel();
  setTimeout(() => init(), 200);
});

//
/*
const initModel = async () => {
  console.log("initModel");

  const container = document.getElementById(
    "my-viewer-container",
  ) as HTMLDivElement;
  if (!container) throw new Error("Missing #my-viewer-container container");

  const w: number = container.clientWidth,
    h: number = container.clientHeight;
  console.log(`w, h : ${w} ${h}`);

  //const scene = new THREE.Scene();
  //scene.background = new THREE.Color(0xf3f4f6);

  const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
  camera.position.set(0, 5, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(window.devicePixelRatio);
  container?.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.8, 0);
  controls.update();

  //scene.add(new THREE.GridHelper(20, 20, 0x9ca3af, 0xd1d5db));

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 8, 3);
  scene.add(directionalLight);

  // Initialize OpenGeometry

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
};
*/

// init
const init = async () => {
  console.log("init");

  const container = document.getElementById(
    "my-viewer-container",
  ) as HTMLDivElement;
  if (!container) throw new Error("Missing #my-viewer-container container");

  const w: number = container.clientWidth,
    h: number = container.clientHeight;
  console.log(`container > w, h : ${w} ${h}`);

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

//
//
//

// addLine
const addLine = ({
  name,
  vertex,
  scale,
  color,
  linewidth,
  visible,
  dashed,
}: {
  name?: string;
  vertex?: Point3D[];
  scale?: Point3D;
  color?: string;
  linewidth?: number;
  visible?: boolean;
  dashed?: boolean;
}): THREE.Line | undefined => {
  //console.log("addLine");
  if (!name) name = "new line";
  if (!vertex)
    vertex = [
      { X: 0, Y: 0, Z: 0 },
      { X: 1, Y: 1, Z: 1 },
    ];
  if (!scale) scale = { X: 1, Y: 1, Z: 1 };
  const myColor: THREE.Color = color ? myTri.setColor(color) : myTri.setColor();
  if (!linewidth) linewidth = 1;
  if (!visible) visible = true;
  if (!dashed) dashed = false;

  //
  const id: string = uuidv4();

  // set material
  const material: THREE.LineBasicMaterial = dashed
    ? // dashed
      new THREE.LineDashedMaterial({
        color: myColor,
        linewidth: linewidth,
        scale: 10,
        dashSize: 3,
        gapSize: 1,
      })
    : // solid
      new THREE.LineBasicMaterial({
        color: myColor,
        linewidth: linewidth,
      });

  // set points
  const points: THREE.Vector3[] = vertex.map(
    (i: Point3D) => new THREE.Vector3(i.X, i.Y, i.Z),
  );
  //console.log("addLine", points);

  // set geometry
  const geometry: THREE.BufferGeometry =
    new THREE.BufferGeometry().setFromPoints(points);

  // set line
  const line: THREE.Line = new THREE.Line(geometry, material);
  line.scale.set(scale.X, scale.Y, scale.Z);
  //console.log("addLine", line);

  // assign line name, visible
  Object.assign(line, {
    //id: id,
    name: name,
    visible: visible,
  });

  line.computeLineDistances();

  return line;
};

const addJoint = ({ Joint, XYZ }: { Joint: string; XYZ: Point3D }) => {
  const id: string = uuidv4();

  // get setting from model
  const color: string | undefined = Settings?.joints?.color;
  const size: number | undefined = Settings?.joints?.size;
  //console.log("size", size);

  // point
  const point: THREE.Points = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ size: size, color: myTri.setColor(color) }),
  );
  //console.log("point", point);

  // position
  point.geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [XYZ.X, XYZ.Y, XYZ.Z], // model > scaleCoords
      3,
    ),
  );

  // name, visible, userData, layers
  Object.assign(point, {
    name: `Joint-${Joint}`,
    visible: true,
    userData: {
      id: id,
      type: "Joint", // point
      originalColor: color,
      label: Joint, // `${ Joint}`
    },
  });
  //point.layers.set( myViewerInstance.layer);

  // add point to scene
  // myViewerInstance.scene.add(point);

  // store
  // point = point;

  // add label to group
  // addLabel();

  return point;
};

const play = () => {
  //console.log("play");

  // clear
  clear();

  console.olog("play");

  // Joints
  const JointCoordinates = data.value["Joint Coordinates"].records;
  for (let i = 0; i < JointCoordinates.length; i++) {
    const record = JointCoordinates[i];
    console.log(
      `Joint-${record.Joint} : (${record.XorR}, ${record.Y}, ${record.Z})`,
    );

    /*
    const scale = {
      X: options.value.scaleUnits[1],
      Y: options.value.scaleUnits[1],
      Z: options.value.scaleUnits[1],
    };
    */
    //console.log(`scaleUnits: ${options.value.scaleUnits}`);

    const point: THREE.Points | undefined = addJoint({
      Joint: record.Joint,
      XYZ: {
        X: record.XorR * options.value.scaleUnits[1],
        Y: record.Z * options.value.scaleUnits[1],
        Z: record.Y * options.value.scaleUnits[1],
      },
    });
    if (point) scene.add(point);
  }

  // Frames
  const ConnectivityFrame = data.value["Connectivity - Frame"].records;
  for (let i = 0; i < ConnectivityFrame.length; i++) {
    const { Frame, JointI, JointJ } = ConnectivityFrame[i];
    console.log(`Frame-${Frame} : (${JointI}, ${JointJ})`);

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

    const line: THREE.Line | undefined = addLine({
      name: `Frame-${Frame}`,
      vertex: vertex,
      scale: scale,
    });
    if (line) scene.add(line);
  }
};

// clear scene
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
