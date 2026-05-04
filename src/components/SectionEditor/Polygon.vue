<script setup lang="ts">
import { toRef, watch, computed } from "vue";

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

// watch
watch(
  () => element.value.points,
  (n) => {
    // update section properties
    if (element.value.hasOwnProperty("sectionId")) {
      // trick to exclude quad elements of mesh
      //
      Object.assign(element.value, sps.getPolygonProperties(n));
      //emit("update:modelValue", element.value);
    }
  },
  { deep: true },
);

// composable
useElement(element.value, options.value);

// computed
const points = computed(() =>
  element.value.points.map((p: Point) => `${p.x},${p.y}`).join(" "),
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
      v-if="element.hasOwnProperty('centroid')"
      :cx="element.centroid.x"
      :cy="element.centroid.y"
      r="3"
      :stroke="element.hasOwnProperty('stroke') ? `#${element.stroke}` : '#000'"
      :fill="element.hasOwnProperty('fill') ? `#${element.fill}` : 'none'"
    />
    <g v-if="element.selected">
      <Handle
        v-for="p in element.points"
        v-model:x="p.x"
        v-model:y="p.y"
        :options="options"
      />
    </g>
  </g>
</template>
