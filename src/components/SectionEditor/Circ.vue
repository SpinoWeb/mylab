<script setup lang="ts">
import { toRef, onMounted, watch, computed } from "vue";

import Handle from "./Handle.vue";

// Types
import type { Point } from "../../libs/Types";

import { useElement } from "./useElement";
import { SectionProperties } from "../Retrofit/Retrofit";
const sps: any = new SectionProperties();

const emit = defineEmits(["update:modelValue"]);

// props
interface Props {
  modelValue?: any;
  options?: any;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => {
    return {};
  },
  options: () => {
    return {};
  },
});

// toRef
const element = toRef(props, "modelValue");
const options = toRef(props, "options");

// onMounted
onMounted(() => useElement(element.value, options.value)); // composable
watch(element, () => useElement(element.value, options.value)); // composable
// composable
//useElement(element.value, options.value);

// watch params
const params = computed(() => {
  return {
    x: element.value.x,
    y: element.value.y,
    eR: element.value.eR,
    iR: element.value.iR,
    sA: element.value.sA,
    eA: element.value.eA,
    nSC: element.value.nSC,
  };
});
watch(params, (n) => Object.assign(element.value, sps.getCircProperties(n)));

// computed
const points = computed(() =>
  sps
    .getCircPoints(element.value)
    .map((p: Point) => `${p.x},${p.y}`)
    .join(" ")
);
</script>

<template>
  <g :id="element.id">
    <polygon
      :points="points"
      :fill="element.hasOwnProperty('fill') ? `#${element.fill}` : 'none'"
      :fill-opacity="
        element.hasOwnProperty('fillOpacity') ? element.fillOpacity : 1
      "
      :stroke="element.hasOwnProperty('stroke') ? `#${element.stroke}` : '#000'"
      :stroke-width="
        element.hasOwnProperty('strokeWidth') ? element.strokeWidth : 1
      "
    />
    <circle
      v-if="element.selected && element.hasOwnProperty('centroid')"
      :cx="element.centroid.x"
      :cy="element.centroid.y"
      r="3"
      stroke="#000"
      :fill="element.hasOwnProperty('fill') ? `#${element.fill}` : 'none'"
    />
    <g v-if="element.selected">
      <Handle v-model:x="element.x" v-model:y="element.y" :options="options" />
    </g>
  </g>
</template>
