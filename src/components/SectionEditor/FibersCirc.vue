<script setup lang="ts">
import { toRef, onMounted, watch, computed } from "vue";

import Handle from "./Handle.vue";

import { useElement } from "./useElement";
import { SectionProperties, SectionMesh } from "../Retrofit/Retrofit";
const sps: any = new SectionProperties();
const smh: any = new SectionMesh();

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
//onMounted(() => Object.assign(element.value, sps.getFibersCircProperties(element.value)));
onMounted(() => useElement(element.value, options.value)); // composable
watch(element, () => useElement(element.value, options.value)); // composable
// composable
//useElement(element.value, options.value);

// watch params
const params = computed(() => {
  return {
    x: element.value.x,
    y: element.value.y,
    r: element.value.r,
    sA: element.value.sA,
    eA: element.value.eA,
    a: element.value.a,
    nFibers: element.value.nFibers,
  };
});
watch(params, (n) =>
  Object.assign(element.value, sps.getFibersCircProperties(n))
);

// fiber radius
const radius = computed(() =>
  element.value.hasOwnProperty("a") ? Math.sqrt(element.value.a / Math.PI) : 1
);

// fibers
const fibers = computed(() => {
  const {
    x,
    y,
    r,
    sA,
    eA,
    //a,
    nFibers,
  }: {
    x: number;
    y: number;
    r: number;
    sA: number;
    eA: number;
    //a: number,
    nFibers: number;
  } = element.value;

  return smh.getFibersCirc(x, y, r, sA, eA, nFibers);
});

const points = computed(() =>
  fibers.value.map((i: number[]) => `${i[0]},${i[1]}`).join(" ")
);
</script>

<template>
  <g :id="element.id">
    <polyline
      v-if="element.selected"
      :points="points"
      :stroke="element.hasOwnProperty('stroke') ? `#${element.stroke}` : '#000'"
      :stroke-width="
        element.hasOwnProperty('strokeWidth') ? element.strokeWidth : 1
      "
      fill="none"
      stroke-dasharray="4"
    />
    <circle
      v-for="f in fibers"
      :cx="f[0]"
      :cy="f[1]"
      :r="radius"
      :fill="element.hasOwnProperty('fill') ? `#${element.fill}` : 'none'"
      :fill-opacity="
        element.hasOwnProperty('fillOpacity') ? element.fillOpacity : 1
      "
      :stroke="element.hasOwnProperty('stroke') ? `#${element.stroke}` : '#000'"
      :stroke-width="
        element.hasOwnProperty('strokeWidth') ? element.strokeWidth : 1
      "
    />
    <g v-if="element.selected">
      <Handle v-model:x="element.x" v-model:y="element.y" :options="options" />
    </g>
  </g>
</template>
