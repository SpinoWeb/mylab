<script setup lang="ts">
import { toRef, ref, watch, computed } from "vue";

import Handle from "./Handle.vue";

import { Utils } from "../../libs/Utils";
import { SvgJs } from "../../libs/Svg";
const u: any = new Utils();
const svg: any = new SvgJs();

const emit = defineEmits(["update:modelValue"]);

// const
const pitch: number = 5;
const minWidth: number = 25;
const minHeight: number = 25;

// props
interface Props {
  modelValue?: any;
  options?: any;
  selected?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => {
    return {};
  },
  options: () => {
    return {};
  },
  selected: false,
});

// toRef
const element = toRef(props, "modelValue");
const options = toRef(props, "options");
const selected = toRef(props, "selected");

// watch
watch(
  () => selected.value,
  (n) => (n ? addEventListener() : removeEventListener())
);

// ref
const handleIsDragging = ref<any | undefined>();

// computed
const start = computed(() => {
  return {
    id: "start",
    x: +element.value.x1,
    y: +element.value.y1,
    pitch: pitch,
    z: 1 / options.value.Camera.z,
  };
});
const end = computed(() => {
  return {
    id: "end",
    x: +element.value.x2,
    y: +element.value.y2,
    pitch: pitch,
    z: 1 / options.value.Camera.z,
  };
});

const lines = computed(() => {
  let lines: any[] = [];

  const width: number = element.value.x2 - element.value.x1;
  const height: number = element.value.y2 - element.value.y1;

  // direction = 0
  if (element.value.direction === 0) {
    let y: number = 0;
    while (y <= height) {
      lines.push({
        x1: element.value.x1,
        y1: element.value.y1 + y,
        x2: element.value.x2,
        y2: element.value.y1 + y,
      });

      y += element.value.spacing;
    }
  }

  // direction = 90
  if (element.value.direction === 90) {
    let x: number = 0;
    while (x <= width) {
      lines.push({
        x1: element.value.x1 + x,
        y1: element.value.y1,
        x2: element.value.x1 + x,
        y2: element.value.y2,
      });

      x += element.value.spacing;
    }
  }

  return lines;
});

// methods

// Handle
const onPointerHandle = (obj: any) => {
  //console.log("Stirrups > onPointer", obj);

  const { type, event } = obj;
  //console.log("Stirrups > onPointer > event.type", event.type);
  event.stopPropagation();

  // drag element
  if (type == "handle") {
    if (event.type === "pointerdown") onPointerHandleDown(event);
    if (event.type === "pointermove") onPointerHandleMove(event);
    if (event.type === "pointerup") onPointerHandleUp(event);
  }
};
const onPointerHandleDown = (event: any) => {
  //console.log("Stirrups > onPointerHandleDown", event.currentTarget.id);
  if (!event) return;
  event.stopPropagation();

  //event.currentTarget.setPointerCapture(event.pointerId);

  const id: string = event.currentTarget?.id;
  //console.log("Stirrups > onPointerHandleDown > id", id);

  const client: Array<number> = [event.clientX, event.clientY];

  const ui: any = u.clone(element.value);
  let x: number = 0;
  let y: number = 0;

  if (id === "start") {
    x = ui.x1;
    y = ui.y1;
  }
  if (id === "end") {
    x = ui.x2;
    y = ui.y2;
  }

  if (options.value.ShowGrid) {
    x = Math.floor(x / options.value.SnapGrid) * options.value.SnapGrid;
    y = Math.floor(y / options.value.SnapGrid) * options.value.SnapGrid;
  } else {
    x = Math.floor(x);
    y = Math.floor(y);
  }
  //console.log("Stirrups > onPointerHandleDown", width, height);

  handleIsDragging.value = {
    //index: index,
    //handle: handle,
    id: id,
    offset: client,
    x: x,
    y: y,
  };
  //console.log("Stirrups > onPointerHandleDown", handleIsDragging.value);
};
const onPointerHandleMove = (event: any) => {
  //console.log("Stirrups > onPointerHandleMove", event);
  if (!event) return;
  event.stopPropagation();

  if (!handleIsDragging.value) return;

  event.currentTarget.setPointerCapture(event.pointerId);
  const point: Array<number> = [event.clientX, event.clientY];
  //console.log("Stirrups > onPointerHandleMove > point", point);

  //
  // update
  //

  // drag handle
  let [dx, dy] = svg
    .sub(point, handleIsDragging.value.offset)
    .map((n: number) => n / options.value.Camera.z);
  if (options.value.ShowGrid) {
    dx = Math.floor(dx / options.value.SnapGrid) * options.value.SnapGrid;
    dy = Math.floor(dy / options.value.SnapGrid) * options.value.SnapGrid;
  } else {
    dx = Math.floor(dx);
    dy = Math.floor(dy);
  }
  //console.log("Stirrups > onPointerHandleMove > dx, dy", dx, dy);

  let x: number = handleIsDragging.value.x + dx;
  let y: number = handleIsDragging.value.y + dy;

  let xy = null;
  if (handleIsDragging.value.id === "start") {
    xy = { x1: x, y1: y };
  }
  if (handleIsDragging.value.id === "end") {
    xy = { x2: x, y2: y };
  }

  Object.assign(element.value, xy);
};
const onPointerHandleUp = (event: any) => {
  //console.log("Stirrups > onPointerHandleUp", event);
  if (!event) return;
  //event.preventDefault();
  event.stopPropagation();

  event.currentTarget.releasePointerCapture(event.pointerId);
  handleIsDragging.value = undefined;
};

// Component
const onPointerDown = (event: any) => {
  //console.log("Stirrups > onPointerDown", event.currentTarget.id);
  if (!event) return;
  event.stopPropagation();

  //event.currentTarget.setPointerCapture(event.pointerId);

  const id: string = event.currentTarget?.id;

  const client: Array<number> = [event.clientX, event.clientY];

  let line: any = u.clone(element.value);

  handleIsDragging.value = {
    id: id,
    offset: client,
    x1: line.x1,
    y1: line.y1,
    x2: line.x2,
    y2: line.y2,
  };
  //console.log("Stirrups > onPointerDown", handleIsDragging.value);
};
const onPointerMove = (event: any) => {
  //console.log("Stirrups > onPointerMove", event);
  if (!event) return;
  event.stopPropagation();

  if (!handleIsDragging.value) return;

  event.currentTarget.setPointerCapture(event.pointerId);
  const myPoint: Array<number> = [event.clientX, event.clientY];
  //console.log("Stirrups > onPointerMove > myPoint", myPoint);

  //
  // update
  //

  // drag handle
  let [dx, dy]: Array<number> = svg
    .sub(myPoint, handleIsDragging.value.offset)
    .map((n: number) => n / options.value.Camera.z);
  if (options.value.ShowGrid) {
    dx = Math.floor(dx / options.value.SnapGrid) * options.value.SnapGrid;
    dy = Math.floor(dy / options.value.SnapGrid) * options.value.SnapGrid;
  } else {
    dx = Math.floor(dx);
    dy = Math.floor(dy);
  }
  //console.log("Stirrups > onPointerMove > dx, dy", dx, dy);

  let x1: number = handleIsDragging.value.x1 + dx;
  let y1: number = handleIsDragging.value.y1 + dy;
  let x2: number = handleIsDragging.value.x2 + dx;
  let y2: number = handleIsDragging.value.y2 + dy;

  Object.assign(element.value, { x1: x1, y1: y1, x2: x2, y2: y2 });
};
const onPointerUp = (event: any) => {
  //console.log("Stirrups > onPointerUp", event);
  if (!event) return;
  //event.preventDefault();
  event.stopPropagation();

  event.currentTarget.releasePointerCapture(event.pointerId);
  handleIsDragging.value = undefined;
};

// keydown event non funziona
const onKeyDown = (event: any) => {
  console.log("Stirrups > onKeyDown", event);
};

// event list
interface Listener {
  type: string;
  listener: any; // Function
  useCapture?: boolean;
}
const eventsList: Array<Listener> = [
  { type: "pointerdown", listener: onPointerDown, useCapture: false },
  { type: "pointermove", listener: onPointerMove, useCapture: false },
  { type: "pointerup", listener: onPointerUp, useCapture: false },
  { type: "keydown", listener: onKeyDown, useCapture: false },
];

const addEventListener = () => {
  //console.log("Stirrups > addEventListener", element, eventsList);

  const myElement: HTMLElement | null = document.getElementById(
    element.value.id
  );
  if (!myElement) return;

  for (const e of eventsList) {
    //console.log("Stirrups > addEventListener > e", e);
    myElement?.addEventListener(e.type, e.listener, e.useCapture);
  }
};
const removeEventListener = () => {
  //console.log("Stirrups > removeEventListener", element, eventsList);
  const myElement: HTMLElement | null = document.getElementById(
    element.value.id
  );
  if (!myElement) return;

  for (const e of eventsList) {
    //console.log("Stirrups > addEventListener > e", e);
    myElement?.removeEventListener(e.type, e.listener, e.useCapture);
  }
};
</script>

<template>
  <g :id="element.id">
    <line
      v-for="line in lines"
      :x1="line.x1"
      :y1="line.y1"
      :x2="line.x2"
      :y2="line.y2"
      :stroke="element.hasOwnProperty('stroke') ? `#${element.stroke}` : '#000'"
      :stroke-width="
        element.hasOwnProperty('strokeWidth') ? element.strokeWidth : 2
      "
    />
    <Handle v-if="selected" :element="start" @onPointer="onPointerHandle" />
    <Handle v-if="selected" :element="end" @onPointer="onPointerHandle" />
  </g>
</template>
