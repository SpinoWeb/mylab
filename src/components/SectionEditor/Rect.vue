<script setup lang="ts">
import { toRef, onMounted, watch, computed } from "vue";

import Handle from "./Handle.vue";

import { useElement } from "./useElement";
import { SectionProperties } from "../Retrofit/Retrofit";
const sps: any = new SectionProperties();

const emit = defineEmits(["update:modelValue"]);

// const
const minWidth: number = 25;
const minHeight: number = 25;

// props
interface Props {
  modelValue?: any;
  options?: any;
  selected?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => {},
  options: () => {},
});

// toRef
const element = toRef(props, "modelValue");
const options = toRef(props, "options");

// onMounted
//onMounted(() => Object.assign(element.value, sps.getRectProperties(element.value)));
onMounted(() => useElement(element.value, options.value)); // composable
watch(element, () => useElement(element.value, options.value)); // composable
// composable
//useElement(element.value, options.value);

// watch params
const params = computed(() => {
  return {
    x: element.value.x,
    y: element.value.y,
    width: element.value.width,
    height: element.value.height,
  };
});
watch(params, (n) => Object.assign(element.value, sps.getRectProperties(n)));

// computed
const se_x = computed({
  get() {
    return element.value.x + element.value.width;
  },
  set(val: number) {
    const width: number = val - element.value.x;
    element.value.width = width > minWidth ? width : minWidth;
  },
});
const se_y = computed({
  get() {
    return element.value.y + element.value.height;
  },
  set(val: number) {
    const height: number = val - element.value.y;
    element.value.height = height > minHeight ? height : minHeight;
  },
});
</script>

<template>
  <g :id="element.id">
    <rect
      :x="element.x"
      :y="element.y"
      :width="element.width"
      :height="element.height"
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
    <Handle
      v-if="element.selected"
      v-model:x="se_x"
      v-model:y="se_y"
      :options="options"
    />
  </g>
</template>
