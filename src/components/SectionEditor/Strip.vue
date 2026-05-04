<script setup lang="ts">
import { toRef, onMounted, watch, computed } from "vue";

import Handle from "./Handle.vue";

// Types
import type { Point } from "../../libs/Types";

import { useElement } from "./useElement";
import { SectionProperties, SectionMesh } from "../Retrofit/Retrofit";
const sps: SectionProperties = new SectionProperties();
//const smh: SectionMesh = new SectionMesh();

const emit = defineEmits(["update:modelValue"]);

// props
interface Props {
  modelValue?: any;
  options?: any;
  selected?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => {},
  options: () => {},
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

// watch params to update properties
const params = computed(() => {
  return {
    points: element.value.points,
    thickness: element.value.thickness,
  };
});
watch(
  params,
  (n) => Object.assign(element.value, sps.getStripProperties(n.points)),
  { deep: true }
);

// computed
const points = computed(() =>
  element.value.points.map((p: Point) => `${p.x},${p.y}`).join(" ")
);

const stroke = computed(() =>
  element.value.hasOwnProperty("fill") ? `#${element.value.fill}` : "#000"
);
const strokeWidth = computed(() =>
  element.value.hasOwnProperty("thickness") ? element.value.thickness * 20 : 2
);
</script>

<template>
  <g :id="element.id">
    <polyline
      :points="points"
      fill="none"
      :stroke="stroke"
      :stroke-width="strokeWidth"
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
      <Handle
        v-for="p in element.points"
        v-model:x="p.x"
        v-model:y="p.y"
        :options="options"
      />
    </g>
  </g>
</template>
