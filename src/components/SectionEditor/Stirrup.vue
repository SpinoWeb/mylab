<script setup lang="ts">
import { toRef, onMounted, watch, computed } from "vue";

//import Handle from "./Handle.vue";

import { useElement } from "./useElement";
//import { SectionProperties, SectionMesh } from "../Retrofit/Retrofit";
//const sps: any = new SectionProperties();
//const smh: any = new SectionMesh();

const emit = defineEmits(["update:modelValue"]);

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

// onMounted
//onMounted(() => Object.assign(element.value, sps.getFibersLineProperties(element.value)));
onMounted(() => useElement(element.value, options.value)); // composable
watch(element, () => useElement(element.value, options.value)); // composable
// composable
//useElement(element.value, options.value);

// watch params
/*
const params = computed(() => {
  return {
    x: element.value.x,
    y: element.value.y,
  };
});
watch(params, (n) =>
  Object.assign(element.value, sps.getFibersLineProperties(n))
);
*/

// methods

// closedStirrup
const closedStirrup = (element: any | undefined) => {
  if (!element) return;

  const {
    x,
    y,
    x0,
    y0,
    v,
    h,
    rt,
    rb,
  }: {
    x: number;
    y: number;
    x0: number;
    y0: number;
    v: number;
    h: number;
    rt: number;
    rb: number;
  } = element;

  return `M${x + x0},${
    y + y0
  } h${h} a${rt},${rt} 0 0 1 ${rt},${rt} v${v} a${rb},${rb} 0 0 1 -${rb},${rb} h-${h} a${rb},${rb} 0 0 1 -${rb},-${rb} v-${v} a${rt},${rt} 0 0 1 ${rt},-${rt} z`;
};

// circularStirrup
const circularStirrup = (element: any | undefined) => {
  if (!element) return;

  const {
    x,
    y,
    x0,
    y0,
    rh,
    rv,
  }: {
    x: number;
    y: number;
    x0: number;
    y0: number;
    rh: number;
    rv: number;
  } = element;

  return `M${x + x0},${
    y + y0
  } a${rh},${rv} 0 0 1 ${rh},${-rv} a${rh},${rv} 0 0 1 ${rh},${rv} a${-rh},${rv} 0 0 1 ${-rh},${rv} a${rh},${-rv} 0 0 1 ${-rh},${-rv}`;
};

// stirrup
const stirrup = computed(() => {
  const { shape }: { shape: string } = element.value;

  // default: closed
  if (!shape) return closedStirrup(element.value);

  return shape === "circular"
    ? circularStirrup(element.value)
    : closedStirrup(element.value);
});
</script>

<template>
  <g :id="element.id">
    <path
      v-if="stirrup"
      :d="stirrup"
      :stroke="element.hasOwnProperty('stroke') ? `#${element.stroke}` : '#000'"
      :stroke-width="
        element.hasOwnProperty('strokeWidth') ? element.strokeWidth : 1
      "
      fill="none"
    />
  </g>
</template>
