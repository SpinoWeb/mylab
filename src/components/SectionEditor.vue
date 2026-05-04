<script setup lang="ts">
import {
  toRef,
  ref,
  //watch,
  computed,
  onMounted,
  onUnmounted,
  //markRaw,
  //defineAsyncComponent,
} from "vue";

import { Listener, Point2D } from "../services/Types";

import { myUtils } from "../services/myUtils";
import { mySvg } from "../services/mySvg";

import { myS2k } from "../services/myS2k";

// emit
const emit = defineEmits([
  "update:sections",
  "update:options",
  //"action",
  //"selectedElement",
  //"selectedElements",
]);

// const
//const BoardID: string = `Board-${u.uuid(8)}`;
const SvgBoardID: string = `SvgBoard-${myUtils.uuid(8)}`;

// props
interface Props {
  sections?: any[];
  options?: any;
  scaleUnits?: [number, number, number];
  //readOnlyElements?: any[];
  size?: [number, number];
}
const props = withDefaults(defineProps<Props>(), {
  sections: () => [],
  options: () => {},
  scaleUnits: () => [1, 1, 1],
  //readOnlyElements: () => [],
  size: () => [800, 600],
});

// toRef
//const section = toRef(props, "section");
const sections = toRef(props, "sections");
const options = toRef(props, "options");
const scaleUnits = toRef(props, "scaleUnits");
//const readOnlyElements = toRef(props, "readOnlyElements");
const size = toRef(props, "size");

// ref
const section = ref<any>();

//
const width = ref<number>(800);
const height = ref<number>(600);

//const root = ref<HTMLDivElement | null>(null);
const svg = ref<SVGSVGElement | null>(null);
const parent = ref<HTMLElement | null>(null);
const loading = ref<boolean>(false);
const svgOffset = ref<any>();
const cursor = ref<string>("default");

// mounted
onMounted(async () => {
  //console.log("onMounted", section.value);
  loading.value = true;

  if (svg.value) svg.value.focus();

  setTimeout(() => {
    //console.log("Board > onMounted");

    // svg event
    myAddEventListener(
      document.getElementById(SvgBoardID),
      eventsListSvgDefault,
    );

    // set toggle
    setToggle(options.value.toggle);

    //
    loading.value = false;
  }, 200); // delay.value
});
const getParentSize = () => {
  //console.log("Board > getParentSize");

  const rect: DOMRect | undefined = parent.value?.getBoundingClientRect();
  //console.log("Board > getParentSize", rect);

  width.value = rect ? rect.width : 800;
  height.value = rect ? rect.height : 600;
  //console.log("Board > getParentSize", width.value, height.value);
};
// unmounted
onUnmounted(() => {
  //console.log("SectionEditor > onUnmounted");
  window.removeEventListener("resize", getParentSize);

  // remove default Event Listener
  myRemoveEventListener(
    document.getElementById(SvgBoardID),
    eventsListSvgDefault,
  );
});

// zoom
const handleWheel = (event: WheelEvent) => {
  //console.log("Board > handleWheel", event);
  //event.preventDefault();

  const {
    //clientX,
    //clientY,
    //deltaX,
    deltaY,
    //ctrlKey
  } = event;
  /*
  console.log("Board > handleWheel", {
    clientX,
    clientY,
    deltaX,
    deltaY,
    ctrlKey,
  });
  */

  //if (ctrlKey) {
  event.preventDefault();

  //const center = { x: 0, y: 0 };
  const center = {
    x: size.value[0] / 2,
    y: size.value[1] / 2,
  };

  const dz = 1 / 10; // = default in svg

  options.value.camera =
    deltaY < 0
      ? mySvg.zoomIn(options.value.camera, center, dz)
      : mySvg.zoomOut(options.value.camera, center, dz);
  //options.value.camera = svg.zoomcamera({ x: clientX, y: clientY }, deltaY / 100);

  //console.log("Board > handleWheel > camera", options.value.camera);
  //}
};
const resetCamera = () => {
  //console.log("SectionEditor > resetCamera");

  const { xMin, xMax, yMin, yMax } = polygonsProperties.value;
  const center: Point2D = {
    X: xMin + (xMax - xMin) / 2,
    Y: yMin + (yMax - yMin) / 2,
  };
  //console.log("resetCamera", { xMin, xMax, yMin, yMax, center });
  //console.log("resetCamera", viewport.value);

  let z: number = Math.min(
    viewport.value.X / ((xMax - xMin) * scale4svg.value[1]),
    viewport.value.Y / ((yMax - yMin) * scale4svg.value[1]),
  );
  if (z > 0.1) z -= 0.1;
  if (z > 1) z = 1;
  //console.log("resetCamera > z", z);

  /*
  const camera = mySvg.zoomReset(options.value.camera, {
    x: center.X * scale4svg.value[1],
    y: center.Y * scale4svg.value[1],
  });
  */
  const camera = {
    x: viewport.value.X / 2 - center.X * scale4svg.value[1] * z,
    y: viewport.value.Y / 2 - center.Y * scale4svg.value[1] * z,
    z: z,
  };
  //console.log("resetCamera > camera", camera);
  Object.assign(options.value, { camera: camera });
  //console.log("resetCamera", options.value.camera);
};

// pan
const onSvgPointerDown = (event: any) => {
  //console.log("Board > onSvgPointerDown", event);
  if (!event) return;
  event.stopPropagation();
  if (options.value.toggle === "Select") return;

  //event.currentTarget.setPointerCapture(event.pointerId);

  const client: [number, number] = [event.clientX, event.clientY];
  //console.log("Board > onSvgPointerDown > client", client);

  svgOffset.value = client;
  cursor.value = "grab";
};
const onSvgPointerMove = (event: any) => {
  //console.log("Board > onSvgPointerMove", event);
  if (!event) return;
  event.stopPropagation();
  if (options.value.toggle === "Select") return;

  if (!svgOffset.value) return;

  if (svgOffset) {
    const point: [number, number] = [event.clientX, event.clientY];
    //console.log("Board > onPointerMove > point", point);
    const [dx, dy]: [number, number] = mySvg.sub(point, svgOffset.value);
    //.map((n: number) => n / z.value);
    //console.log("Board > onPointerMove > dx, dy", dx, dy);

    // update here
    options.value.camera = mySvg.panCamera(options.value.camera, -dx, -dy);
    //console.log("Board > onPointerMove > camera", options.value.camera);
    svgOffset.value = point;
    cursor.value = "grabbing";
  }
};
const onSvgPointerUp = (event: any) => {
  //console.log("Board > onSvgPointerUp", event);
  if (!event) return;
  //event.preventDefault();
  event.stopPropagation();
  if (options.value.toggle === "Select") return;

  svgOffset.value = null;
  cursor.value = "grab";
};

// event svg Default
const eventsListSvgDefault: Listener[] = [
  //{ type: "click", listener: onSvgClick, useCapture: false },
  { type: "wheel", listener: handleWheel, useCapture: false },
];

// event Select
const eventsListsComponentSelect: Listener[] = [
  //{ type: "click", listener: clickComponent, useCapture: false },
  //{ type: "keydown", listener: keydownComponent, useCapture: false },
];

// event Pan
const eventsListSvgPan: Listener[] = [
  { type: "pointerdown", listener: onSvgPointerDown, useCapture: false },
  { type: "pointermove", listener: onSvgPointerMove, useCapture: false },
  { type: "pointerup", listener: onSvgPointerUp, useCapture: false },
];

const myAddEventListener = (
  element: HTMLElement | null = null,
  eventsList: Listener[] = [],
) => {
  //console.log("Board > addEventListener", element, eventsList);
  if (!element) return;

  for (const e of eventsList) {
    //console.log("Board > addEventListener > e", e);
    element?.addEventListener(e.type, e.listener, e.useCapture);
  }
};
const myRemoveEventListener = (
  element: HTMLElement | null = null,
  eventsList: Listener[] = [],
) => {
  //console.log("Board > removeEventListener", element, eventsList);
  if (!element) return;

  for (const e of eventsList) {
    //console.log("Board > removeEventListener > e", e);
    element?.removeEventListener(e.type, e.listener, e.useCapture);
  }
};

const setToggle = (toggle: string = "Pan") => {
  //console.log("Board > setToggle", toggle);
  switch (toggle) {
    case "Select":
      SelectMode();
      break;

    case "Pan":
      PanMode();
      break;

    default:
      console.log("Board > setToggle", toggle);
  }
};
const SelectMode = () => {
  //console.log("Board > SelectMode");
  options.value.toggle = "Select";
  cursor.value = "default";

  // remove Pan
  myRemoveEventListener(document.getElementById(SvgBoardID), eventsListSvgPan);

  // add Select
  /*
  elements.value.forEach((element: Element) => {
    //console.log("Board > SelectMode", element);
    myAddEventListener(
      document.getElementById(element.id),
      eventsListsComponentSelect,
    );
  });
  */
};
const PanMode = () => {
  //console.log("Board > PanMode");
  options.value.toggle = "Pan";
  cursor.value = "grab";

  //element.value = null;
  //selectedElements.value = [];

  // remove Select
  /*
  elements.value.forEach((element: any) => {
    //console.log("PanMode", element.id, document.getElementById(element.id));
    myRemoveEventListener(
      document.getElementById(`${element.id}`),
      eventsListsComponentSelect,
    );
  });
  */

  // add Pan
  myAddEventListener(document.getElementById(SvgBoardID), eventsListSvgPan);
};

import { inject } from "vue";
const darkMode = inject("darkMode");

// computed
const palette = computed(() =>
  darkMode
    ? { black: "#FFF", gray: "#424242" }
    : { black: "#000", gray: "#D3D3D3" },
);
const sizeHeight = computed(() => `${0.8 * size.value[1]}px`);
const scale4svg = computed((): [number, number, number] => [
  scaleUnits.value[0],
  scaleUnits.value[1] * 1e3,
  scaleUnits.value[2],
]);
const transform = computed(() => {
  return "camera" in options.value
    ? `scale(${options.value.camera.z}) translate(${options.value.camera.x},${options.value.camera.y})`
    : "scale(1) translate(0,0)";
});
const z = computed(
  () => 1 / ("camera" in options.value ? options.value.camera.z : 10),
);
const zoomLevel = computed(
  () => `${((z.value ? 1 / z.value : 1) * 100).toFixed(1)} %`,
);
const viewport = computed((): Point2D => {
  return {
    X: svg.value ? svg.value.clientWidth : 0,
    Y: svg.value ? svg.value.clientHeight : 0,
  };
});

// keys
const keys = computed(() => {
  const { Shape } = section.value;
  return Shape !== undefined ? myS2k.getKeys({ Shape }) : [];
});

// polygons for svg
const polygons = computed(() => {
  let polygons: any[] = [];
  // m to mm

  for (const polygon of myS2k.getPolygons({
    section: section.value,
    X0: options.value.snapGrid / scale4svg.value[1],
    Y0: options.value.snapGrid / scale4svg.value[1],
  })) {
    //console.log("SectionEditor > polygons", polygon);
    let points4polygon: string = "";
    polygon.points.map(
      (p: Point2D) =>
        (points4polygon += `${p.X * scale4svg.value[1]},${p.Y * scale4svg.value[1]} `),
    );
    polygons.push(
      Object.assign(polygon, {
        scale: polygon.hasOwnProperty("scale") ? polygon.scale : 1,
        points4polygon: points4polygon,
        fill: polygon.hasOwnProperty("fill")
          ? polygon.fill
          : palette.value.gray,
        strokeWidth: 2,
      }),
    );
  }

  //console.log("polygons", polygons);
  return polygons;
});

// properties of polygons for svg
const polygonsProperties = computed(() =>
  myS2k.getPolygonsProperties(polygons.value),
);

// centroid of polygons for svg
const polygonsCentroid = computed(
  (): Point2D =>
    polygonsProperties.value
      ? polygonsProperties.value.centroid
        ? {
            X: polygonsProperties.value.centroid.X * scale4svg.value[1],
            Y: polygonsProperties.value.centroid.Y * scale4svg.value[1],
          }
        : { X: 0, Y: 0 }
      : { X: 0, Y: 0 },
);

// quotes for svg
const quotes = computed(() => {
  let quotes: any[] = [];

  for (const quote of myS2k.getQuotes({
    section: section.value,
    X0: options.value.snapGrid / scale4svg.value[1],
    Y0: options.value.snapGrid / scale4svg.value[1],
    delta: options.value.snapGrid / scale4svg.value[1],
  })) {
    Object.assign(quote, {
      X: quote.X * scale4svg.value[1],
      Y: quote.Y * scale4svg.value[1],
    });

    quotes.push(quote);
  }

  return quotes;
});
</script>

<template>
  <div ref="root" class="relative w-full h-full">
    <svg
      ref="svg"
      :id="SvgBoardID"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      :class="`w-full h-full display-block ${cursor}`"
      :width="size[0]"
      :height="size[1]"
    >
      <defs>
        <pattern
          id="grid"
          :width="options.snapGrid"
          :height="options.snapGrid"
          patternUnits="userSpaceOnUse"
        >
          <path
            :d="`M ${options.snapGrid} 0 L 0 0 0 ${options.snapGrid}`"
            fill="none"
            :stroke="palette.gray"
            :stroke-width="1"
          />
        </pattern>
      </defs>

      <g :transform="transform" ref="viewport">
        <!-- grid -->
        <rect
          v-if="options.showGrid"
          :x="-options.camera.x"
          :y="-options.camera.y"
          :width="size[0] * z"
          :height="size[1] * z"
          fill="url(#grid)"
        />
        <g v-if="myUtils.debug() && false">
          <!-- center -->
          <circle
            :cx="viewport.X / 2 - options.camera.x / z"
            :cy="viewport.Y / 2 - options.camera.y / z"
            r="6"
            fill="red"
          />
          <line
            :x1="-options.camera.x"
            :y1="-options.camera.y"
            :x2="z * viewport.X - options.camera.x / z"
            :y2="z * viewport.Y - options.camera.y / z"
            stroke="red"
            stroke-width="1"
          />
          <line
            :x1="-options.camera.x"
            :y1="z * viewport.Y - options.camera.y / z"
            :x2="z * viewport.X - options.camera.x / z"
            :y2="-options.camera.y"
            stroke="red"
            stroke-width="1"
          />
        </g>
        <!-- Oxy -->
        <line
          x1="0"
          y1="0"
          :x2="options.snapGrid / 2"
          y2="0"
          :stroke="palette.black"
          stroke-width="3"
        />
        <line
          x1="0"
          y1="0"
          x2="0"
          :y2="options.snapGrid / 2"
          :stroke="palette.black"
          stroke-width="3"
        />
        <!-- polygons -->
        <polygon
          v-for="polygon in polygons"
          :points="polygon.points4polygon"
          :stroke="palette.black"
          :stroke-width="polygon.strokeWidth"
          :fill="polygon.scale < 1 ? palette.black : polygon.fill"
          fill-opacity="0.7"
        />
        <!-- centroid -->
        <circle
          :cx="polygonsCentroid.X"
          :cy="polygonsCentroid.Y"
          r="4"
          :fill="palette.black"
        />
        <!-- text -->
        <g v-if="options.showQuote">
          <text
            v-for="quote in quotes"
            :x="quote.X"
            :y="quote.Y"
            :transform="`rotate(${quote.angle}, ${quote.X}, ${quote.Y})`"
            text-anchor="middle"
            :fill="palette.black"
            :style="`font: normal ${14 * z}px 'Fira Sans', sans-serif;`"
          >
            {{ quote.txt }}
          </text>
        </g>
      </g>
    </svg>

    <div class="toolbar">
      <Button
        icon="pi pi-arrow-up-left"
        class="mr-1"
        raised
        v-tooltip.bottom="'Select'"
        :severity="
          options.toggle && options.toggle === 'Select'
            ? 'success'
            : 'trasparent'
        "
        @click="SelectMode"
        :disabled="options.toggle === 'Select'"
      />
      <Button
        icon="pi pi-arrows-alt"
        class="mr-1"
        raised
        v-tooltip.bottom="'Pan'"
        :severity="
          options.toggle && options.toggle === 'Pan' ? 'success' : 'trasparent'
        "
        @click="PanMode"
        :disabled="options.toggle === 'Pan'"
      />

      <div v-if="myUtils.debug()" class="flex flex-row gap-2">
        <span>{{ options.toggle }}</span>
        <span>{{ cursor }}</span>
      </div>
    </div>

    <div class="zoomToolbar">
      <ToggleSwitch v-model="options.showGrid" class="mr-1" />
      <Select
        v-model="options.snapGrid"
        :options="[10, 25, 50]"
        :disabled="!options.showGrid"
        placeholder="snapGrid"
        :id="`${SvgBoardID}_snapGrid`"
        class="md:w-6rem mr-1"
      />
      <InputText
        v-if="zoomLevel"
        :value="zoomLevel"
        disabled
        class="w-20 md:w-6rem mr-1"
      />
      <Button
        icon="pi pi-refresh"
        v-tooltip.top="'Reset camera'"
        raised
        @click="resetCamera"
      />
    </div>

    <div class="sidebar">
      <div class="flex flex-row gap-2">
        <Select
          v-model="section"
          :options="sections"
          optionLabel="SectionName"
          placeholder="Select a Section"
          style="min-width: 128px"
        />
        <Button
          icon="pi pi-info"
          class="mr-1"
          raised
          v-tooltip.bottom="'Quote'"
          @click="options.showQuote = !options.showQuote"
          :severity="options.showQuote ? 'success' : 'trasparent'"
        />
      </div>

      <div v-if="section" class="overflow-y-auto">
        <Tabs value="geometry" scrollable>
          <TabList>
            <Tab value="geometry">geo</Tab>
            <Tab value="properties">props</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="geometry">
              <!-- geometry -->
              <div class="flex flex-column gap-1">
                <div class="flex flex-row gap-2">
                  <div class="w-1/2 flex-none mt-1">Section</div>
                  <div class="flex-1">
                    <InputText
                      v-model="section.SectionName"
                      style="width: 100%"
                    />
                  </div>
                </div>
                <div class="flex flex-row gap-2">
                  <div class="w-1/2 flex-none mt-1">Shape</div>
                  <div class="flex-1">
                    <InputText
                      v-model="section.Shape"
                      style="width: 100%"
                      :disabled="true"
                    />
                  </div>
                </div>
                <div class="flex flex-row gap-2" v-for="i of keys">
                  <div class="w-1/2 flex-none mt-1">{{ i }}</div>
                  <div class="flex-1">
                    <InputText
                      v-model.number="section[i]"
                      style="width: 100%"
                    />
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel value="properties">
              <!-- geometry -->
              <div class="flex flex-column gap-1">
                <div
                  class="flex flex-row gap-2"
                  v-for="(value, key) in polygonsProperties"
                >
                  <div class="w-1/2 flex-none mt-1">{{ key }}</div>
                  <div class="flex-1">
                    {{ value }}
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  position: relative;
  width: 100%;
  height: 100%;
  user-select: none;
  overflow: hidden;
  /* display: flex; */
}

.svg {
  display: block;
  width: 100%;
  height: 100%;
  cursor: v-bind(cursor);
}

.toolbar {
  padding: 4px;
  display: flex;
  gap: 4px;
  align-items: center;
  z-index: 2;
  position: absolute;
  top: 0;
  left: 0;
}

.zoomToolbar {
  padding: 4px;
  display: flex;
  gap: 4px;
  align-items: center;
  z-index: 2;
  position: absolute;
  bottom: 0;
  left: 0;
}

.sidebar {
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 2;
  position: absolute;
  top: 0;
  right: 0;
  border: 0.1rem solid;
  border-radius: 0.3rem;
  width: 320px;
  height: v-bind(sizeHeight);
}

/* text */
.small {
  font:
    normal 12px "Fira Sans",
    sans-serif;
}
.medium {
  font:
    normal 16px "Fira Sans",
    sans-serif;
}
.large {
  font:
    normal 24px "Fira Sans",
    sans-serif;
}
.heavy {
  font: bold 30px sans-serif;
}

/**/
.prevent-select {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

/* https://www.w3schools.com/cssref/pr_class_cursor.php */
.alias {
  cursor: alias;
}
.all-scroll {
  cursor: all-scroll;
}
.auto {
  cursor: auto;
}
.cell {
  cursor: cell;
}
.col-resize {
  cursor: col-resize;
}
.context-menu {
  cursor: context-menu;
}
.copy {
  cursor: copy;
}
.crosshair {
  cursor: crosshair;
}
.default {
  cursor: default;
}
.e-resize {
  cursor: e-resize;
}
.ew-resize {
  cursor: ew-resize;
}
.grab {
  cursor: -webkit-grab;
  cursor: grab;
}
.grabbing {
  cursor: -webkit-grabbing;
  cursor: grabbing;
}
.help {
  cursor: help;
}
.move {
  cursor: move;
}
.n-resize {
  cursor: n-resize;
}
.ne-resize {
  cursor: ne-resize;
}
.nesw-resize {
  cursor: nesw-resize;
}
.ns-resize {
  cursor: ns-resize;
}
.nw-resize {
  cursor: nw-resize;
}
.nwse-resize {
  cursor: nwse-resize;
}
.no-drop {
  cursor: no-drop;
}
.none {
  cursor: none;
}
.not-allowed {
  cursor: not-allowed;
}
.pointer {
  cursor: pointer;
}
.progress {
  cursor: progress;
}
.row-resize {
  cursor: row-resize;
}
.s-resize {
  cursor: s-resize;
}
.se-resize {
  cursor: se-resize;
}
.sw-resize {
  cursor: sw-resize;
}
.text {
  cursor: text;
}
.url {
  cursor: url(myBall.cur), auto;
}
.w-resize {
  cursor: w-resize;
}
.wait {
  cursor: wait;
}
.zoom-in {
  cursor: zoom-in;
}
.zoom-out {
  cursor: zoom-out;
}
</style>
