<script setup lang="ts">
import { toRef, ref, onMounted, onUnmounted, computed } from "vue";

// Types
import type { Listener } from "../../libs/Types";

// Classes
import { Utils } from "../../libs/Utils";
import { SvgJs } from "../../libs/Svg";
const u: any = new Utils();
const svg: any = new SvgJs();

const emit = defineEmits(["update:x", "update:y"]);

// const
const id: string = `handle_${u.uuid()}`;

// props
interface Props {
  x: number;
  y: number;
  options?: any;
}
const props = withDefaults(defineProps<Props>(), {
  x: 25,
  y: 25,
  options: () => {
    return {
      camera: { x: 0, y: 0, z: 1 },
      showGrid: true,
      snapGrid: 25,
      pitch: 5,
    };
  },
});

// toRef
const x = toRef(props, "x");
const y = toRef(props, "y");
const options = toRef(props, "options");

// ref
const handleIsDragging = ref<any | undefined>();

onMounted(() => addEventListener());
onUnmounted(() => removeEventListener());

// computed
const size = computed(() => {
  const width: number = 2.5 * options.value.pitch * options.value.camera.z;
  const height: number = 2.5 * options.value.pitch * options.value.camera.z;

  return {
    x: x.value - width / 2,
    y: y.value - height / 2,
    width: width,
    height: height,
    rx: (options.value.pitch * options.value.camera.z) / 1.25,
  };
});

// methods
const onPointerDown = (event: any) => {
  //console.log("Handle > onPointerDown", event.currentTarget.id);
  if (!event) return;
  event.stopPropagation();

  //event.currentTarget.setPointerCapture(event.pointerId);

  //const index: string = event.currentTarget?.id.split("_")[1];
  //console.log("Handle > onPointerHandleDown > index", index);

  const client: number[] = [event.clientX, event.clientY];

  let handle_x: number = u.clone(x.value);
  let handle_y: number = u.clone(y.value);
  if (options.value.showGrid) {
    handle_x =
      Math.floor(handle_x / options.value.snapGrid) * options.value.snapGrid;
    handle_y =
      Math.floor(handle_y / options.value.snapGrid) * options.value.snapGrid;
  } else {
    handle_x = Math.floor(handle_x);
    handle_y = Math.floor(handle_y);
  }
  //console.log("Handle > onPointerHandleDown", width, height);

  handleIsDragging.value = {
    //index: index,
    offset: client,
    handle_x: handle_x,
    handle_y: handle_y,
  };
  //console.log("Handle > onPointerHandleDown", handleIsDragging.value);
};
const onPointerMove = (event: any) => {
  //console.log("Handle > onPointerHandleMove", event);
  if (!event) return;
  event.stopPropagation();

  if (!handleIsDragging.value) return;

  event.currentTarget.setPointerCapture(event.pointerId);
  const point: number[] = [event.clientX, event.clientY];
  //console.log("Handle > onPointerHandleMove > point", point);

  //
  // update
  //

  // drag handle
  let [dx, dy] = svg
    .sub(point, handleIsDragging.value.offset)
    .map((n: number) => n / options.value.camera.z);
  if (options.value.showGrid) {
    dx = Math.floor(dx / options.value.snapGrid) * options.value.snapGrid;
    dy = Math.floor(dy / options.value.snapGrid) * options.value.snapGrid;
  } else {
    dx = Math.floor(dx);
    dy = Math.floor(dy);
  }
  //console.log("Handle > onPointerHandleMove > dx, dy", dx, dy);

  //let handle_x: number = handleIsDragging.value.handle_x + dx;
  //let handle_y: number = handleIsDragging.value.handle_y + dy;

  emit("update:x", handleIsDragging.value.handle_x + dx);
  emit("update:y", handleIsDragging.value.handle_y + dy);
};
const onPointerUp = (event: any) => {
  //console.log("Handle > onPointerHandleUp", event);
  if (!event) return;
  //event.preventDefault();
  event.stopPropagation();

  event.currentTarget.releasePointerCapture(event.pointerId);
  handleIsDragging.value = undefined;
};

const eventsList: Listener[] = [
  //{ type: "click", listener: onhandleClick, useCapture: false },
  { type: "pointerdown", listener: onPointerDown, useCapture: false },
  { type: "pointermove", listener: onPointerMove, useCapture: false },
  { type: "pointerup", listener: onPointerUp, useCapture: false },
  //{ type: "pointercancel", listener: onPointer, useCapture: false },
  //{ type: "pointerleave", listener: onPointer, useCapture: false },
];

const addEventListener = () => {
  //console.log("Handle > addEventListener");
  const handle = document.getElementById(id);
  //console.log("Handle > addEventListener", handle);
  for (const e of eventsList) {
    //console.log("Handle > addEventListener > e", e);
    handle?.addEventListener(e.type, e.listener, e.useCapture);
  }
};

const removeEventListener = () => {
  //console.log("Handle > removeEventListener");
  const handle = document.getElementById(id);
  for (const e of eventsList) {
    handle?.removeEventListener(e.type, e.listener, e.useCapture);
  }
};
</script>

<template>
  <g v-if="x !== undefined && y !== undefined" :id="id">
    <text
      class="text"
      :x="x + options.pitch * options.camera.z"
      :y="y - 2 * options.pitch * options.camera.z"
      >{{ `(${x} : ${y})` }}</text
    >
    <rect
      class="handle"
      :x="size.x"
      :y="size.y"
      :width="size.width"
      :height="size.height"
      :rx="size.rx"
      stroke="#000"
  /></g>
</template>

<style>
.handle {
  cursor: pointer;
  fill: #eee;
}
.handle:hover {
  fill: #aaa;
}
.text {
  font: 14px sans-serif;
  color: #000;
}
</style>
