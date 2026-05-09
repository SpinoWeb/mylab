<template>
  <div
    id="mainContainer"
    style="
      position: relative;
      width: 100%;
      border: 1px solid;
      border-radius: 4px;
    "
  >
    <div
      id="container"
      style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
      "
    ></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

//
// https://github.com/ThatOpen/engine_fragment/blob/main/packages/fragments/src/FragmentsModels/examples/BuildingConfigurator/example.ts
//

/* MD
  ## Building a Configurator 🤏
  ---
  In early design stages, architects and developers need to explore building options — changing floor count, column grid, building footprint — but traditional BIM tools require manually re-modeling every variant, making rapid iteration impractical.

  The Fragments API exposes an editable model and a geometry engine that together make parametric generation possible: define shapes programmatically, write them into a live Fragment model, and regenerate on demand.

  This tutorial covers creating an empty Fragment model at runtime; using the geometry engine to produce extruded columns, floors, walls, windows, a staircase opening, and a roof from parametric settings; writing all generated elements into the model via the editor API; setting up a horizontal clipping plane with filled section cuts via ClipStyler; enabling VSM shadows that update on camera rest; applying a postproduction style; and wiring all parameters to a live UI panel so the building regenerates on any change.

  By the end, you’ll have a fully parametric building configurator where adjusting width, floor count, column spacing, or clip height instantly regenerates the 3D model.
  
  ### 🖖 Importing our Libraries
  First things first, let's install all necessary dependencies to make this example work:
*/

import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as THREE from "three";
import * as BUI from "@thatopen/ui";
import * as WEBIFC from "web-ifc";
import Stats from "stats.js";
import * as FRAGS from "@thatopen/fragments";

//
/* MD
    We will also define some settings that will be used to create the building.
  */

const settings = {
  width: 25,
  length: 35,
  columnLengthDistance: 2.5,
  columnWidthDistance: 2.5,
  floorHeight: 3,
  exteriorColumnWidth: 0.5,
  exteriorColumnLength: 0.5,
  frameWidth: 0.25,
  frameLength: 0.25,
  floorThickness: 0.3,
  numberOfFloors: 1,
  clipPlaneHeight: 13.5,
  windowHeight: 2,
  windowWidth: 1,
  roofHeight: 2,
};

//
let mainContainer: any,
  container: HTMLDivElement | undefined,
  components: OBC.Components,
  worlds: OBC.Worlds,
  world: any,
  prevBackground: any,
  fragments: any,
  model: any;

onMounted(async () => {
  await setScene();
  await setFragments();
  await setFragmentsModel();
  //await loadFragmentsModel();

  await test();
});

// -------------
// setScene
// -------------
const setScene = async () => {
  //container = document.getElementById("container")!;
  container = document.getElementById("container") as HTMLDivElement;
  if (!container) throw new Error("Missing #container container");

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
  // `FragmentsModels.getWorker()` fetches the matching worker for this library version from unpkg and returns a blob URL.
  // You can also pass your own URL to `fragments.init(...)` if you'd rather host the worker yourself.
  const workerUrl = await FRAGS.FragmentsModels.getWorker();
  fragments = components.get(OBC.FragmentsManager);
  fragments.init(workerUrl);

  // Remove z fighting
  fragments.core.models.materials.list.onItemSet.add(({ value: material }) => {
    if (!("isLodMaterial" in material && material.isLodMaterial)) {
      material.polygonOffset = true;
      material.polygonOffsetUnits = 1;
      material.polygonOffsetFactor = Math.random();
    }
  });

  // Temp until we publish the libraries, to be able to use postproduction
  // @ts-ignore

  fragments.core.settings.graphicsQuality = 1;

  world.camera.controls.addEventListener("control", () => {
    fragments.core.update();
  });

  // Once a model is available in the list, we can tell it
  // to use shadows and to use the clipping planes we are using
  fragments.core.models.list.onItemSet.add(({ value: model }) => {
    model.tiles.onItemSet.add(({ value: mesh }) => {
      if ("isMesh" in mesh) {
        const mat = mesh.material as THREE.MeshStandardMaterial[];
        if (mat[0].opacity === 1) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      }
    });

    //model.getClippingPlanesEvent = () => Array.from(world.renderer!.three.clippingPlanes) || [];
  });

  world.renderer.postproduction.enabled = true;
  world.renderer.postproduction.style = OBF.PostproductionAspect.COLOR_PEN;
};

// -------------
// setFragmentsModel
// -------------
const setFragmentsModel = async (modelId: string = "example") => {
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
const loadFragmentsModel = async (modelId: string = "example") => {
  const file = await fetch(
    "https://thatopen.github.io/engine_fragment/resources/frags/school_arq.frag",
  );
  const buffer = await file.arrayBuffer();
  model = await fragments.load(buffer, { modelId: modelId });
};

// -------------
// building
// -------------
const building = async () => {
  console.log("test");

  /* MD
    ### 🧊 Setting up the Geometry Engine  
    Now, let's set up the Geometry Engine. We'll use it to generate the building geometry.

    :::
      warning Geometry Engine?
      The Geometry Engine is a library that allows us to easily generate geometry parametrically using
      the Fragments API.
    :::
  */

  const api = new WEBIFC.IfcAPI();
  api.SetWasmPath("https://unpkg.com/web-ifc@0.0.77/", true);
  await api.Init();
  const geometryEngine = new FRAGS.GeometryEngine(api);

  /* MD
    ### 🔧 Creating Basic Geometries
    Now we'll create all the basic geometries that will be used to construct our building.
    These include materials, floor, columns, walls, windows, and more:
  */

  // Grid

  // Frames

  const frameGeometry = new THREE.BufferGeometry();

  /* MD
  ### 🏗️ Building Generation Logic
  Now let's define the main function that will regenerate the building fragments based on our settings.
  This function will create all the building elements and position them correctly:
*/

  let processing: boolean = false;
  // We'll use this for boolean operations

  //
  const regenerateFragments = async () => {
    const elementsData: FRAGS.NewElementData[] = [];

    //console.log("regenerateFragments > model", model);
    await fragments.core.editor.reset(model.modelId);

    // Create base items

    const matId = fragments.core.editor.createMaterial(
      model.modelId,
      new THREE.MeshLambertMaterial({
        color: "#2196F3",
        side: THREE.DoubleSide,
      }),
    );

    const ltId = fragments.core.editor.createLocalTransform(
      model.modelId,
      new THREE.Matrix4().identity(),
    );

    // CREATE GEOMETRIES

    /* MD
    ### 📐 Geometry Creation Process
    Now we'll create all the individual geometries that make up our building.
    This includes exterior columns, interior columns, walls, windows, floors, and more.
    Each geometry is carefully calculated based on our building parameters:
  */

    // frame
    const bw: number = 0.1,
      h: number = 0.5,
      b: number = 0.5;
    //console.log(b, h);

    // prettier-ignore
    const framePoints = [
      // x, y, z
      0, 0, 0, // v0
      0, h, 0, // v1
      b, h, 0, // v2
      b, 0, 0, // v3
      // chiusura del profilo
      0, 0, 0,
    ];
    const framePointsHorizontal = geometryEngine.transformPoints(
      framePoints,
      new THREE.Matrix4().makeRotationX(Math.PI / 2),
    );

    geometryEngine.getExtrusion(frameGeometry, {
      profilePoints: framePointsHorizontal,
      direction: [0, 1, 0],
      length: 3,
      cap: true,
    });

    const frameGeoId = fragments.core.editor.createShell(
      model.modelId,
      frameGeometry,
    );

    // CREATE ELEMENTS

    /* MD
    ### 🏢 Element Assembly
    Now we'll create all the building elements by positioning our geometries throughout the building. This includes placing columns, floors, walls, windows, and other structural elements at the correct locations:
  */

    const tempObject = new THREE.Object3D();

    // frame

    const framePositions: THREE.Vector3[] = [];

    const icLenthCount = 3;
    const icWidthCount = 2;

    // positions
    for (let i = 0; i <= icLenthCount; i++) {
      const z = i * settings.columnLengthDistance;
      for (let j = 0; j <= icWidthCount; j++) {
        const x = j * settings.columnWidthDistance;
        framePositions.push(new THREE.Vector3(x, 0, z));
      }
    }

    // elements
    for (const position of framePositions) {
      for (let i = 0; i < settings.numberOfFloors; i++) {
        tempObject.position.copy(position);
        tempObject.position.y = i * settings.floorHeight;
        tempObject.updateMatrix();

        elementsData.push({
          attributes: {
            _category: {
              value: "test",
            },
          },
          globalTransform: tempObject.matrix.clone(),
          samples: [
            {
              localTransform: ltId,
              representation: frameGeoId,
              material: matId,
            },
          ],
        });
      }
    }

    await fragments.core.editor.createElements(model.modelId, elementsData);

    //clearEdges();

    await fragments.core.update(true);

    processing = false;
  };

  /* MD
    ### 🎯 Final Steps
    Once all elements are created, 
    we update the fragments model and clear any processing flags to prepare for the next regeneration cycle.
  */

  await regenerateFragments();
};

const test = async () => {
  // rettangolo 2D
  const shape = new THREE.Shape();

  shape.moveTo(-0.15, -0.3);
  shape.lineTo(0.15, -0.3);
  shape.lineTo(0.15, 0.3);
  shape.lineTo(-0.15, 0.3);
  shape.closePath();

  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 25; j++) {
      //for (let k = 0; k < 5; k++) {
      // joints
      const start = new THREE.Vector3(i, 0, j);
      const end = new THREE.Vector3(i, 1 + i / 10 + j / 10, j);

      // vettore direzione
      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();
      const normalizedDirection = direction.clone().normalize();

      // estrusione
      const extrudeSettings = {
        depth: length,
        steps: 1,
        bevelEnabled: false,
      };

      const geometry: THREE.ExtrudeGeometry = new THREE.ExtrudeGeometry(
        shape,
        extrudeSettings,
      );

      // orientamento asse Z -> direzione
      const zAxis: THREE.Vector3 = new THREE.Vector3(0, 0, 1);

      const quaternion: THREE.Quaternion =
        new THREE.Quaternion().setFromUnitVectors(zAxis, normalizedDirection);

      geometry.applyQuaternion(quaternion);

      // traslazione nello start point
      geometry.translate(start.x, start.y, start.z);

      // material
      const material: THREE.MeshStandardMaterial =
        new THREE.MeshStandardMaterial({
          color: "#2196F3",
        });

      // mesh
      const mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
      // add
      world.scene.three.add(mesh);
      //}
    }
  }
};
</script>

<style scoped></style>
