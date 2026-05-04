<script setup lang="ts">
import { toRef, onMounted, watch, computed } from "vue";

import Handle from "./Handle.vue";

import { useElement } from "./useElement";
import { SectionProperties } from "../Retrofit/Retrofit";
const sps: any = new SectionProperties();

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
});

// toRef
const element = toRef(props, "modelValue");
const options = toRef(props, "options");

// onMounted
//onMounted(() => Object.assign(element.value, sps.getFiberProperties(element.value)));

// watch
const params = computed(() => {
  return {
    x: element.value.x,
    y: element.value.y,
    a: element.value.a,
  };
});
watch(params, (n) => Object.assign(element.value, sps.getFiberProperties(n)));

// composable
useElement(element.value, options.value);

// radius
const radius = computed(() =>
  element.value.hasOwnProperty("a") ? Math.sqrt(element.value.a / Math.PI) : 1
);
</script>

<template>
  <g :id="element.id">
    <circle
      :cx="element.x"
      :cy="element.y"
      :r="radius"
      :fill="element.hasOwnProperty('fill') ? `#${element.fill}` : 'none'"
      :fill-opacity="
        element.hasOwnProperty('fillOpacity') ? element.fillOpacity : 1
      "
      :stroke="element.hasOwnProperty('stroke') ? `#${element.stroke}` : '#000'"
      :stroke-width="
        element.hasOwnProperty('strokeWidth') ? element.strokeWidth : 1
      " />
    <Handle
      v-if="element.selected"
      v-model:x="element.x"
      v-model:y="element.y"
      :options="options"
  /></g>
</template>
