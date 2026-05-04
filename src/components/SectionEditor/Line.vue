<script setup lang="ts">
import { toRef, ref, onMounted, watch, computed } from "vue";

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
  selected: false,
});

// toRef
const element = toRef(props, "modelValue");
const options = toRef(props, "options");

// onMounted
onMounted(() =>
  Object.assign(element.value, sps.getLineProperties(element.value))
);

// watch
const params = computed(() => {
  return {
    x: element.value.x,
    y: element.value.y,
    x2: element.value.x2,
    y2: element.value.y2,
  };
});
watch(params, (n) => Object.assign(element.value, sps.getLineProperties(n)));

// composable
useElement(element.value, options.value);
</script>

<template>
  <g :id="element.id">
    <line
      :x1="element.x"
      :y1="element.y"
      :x2="element.x2"
      :y2="element.y2"
      :stroke="element.hasOwnProperty('stroke') ? `#${element.stroke}` : '#000'"
      :stroke-width="
        element.hasOwnProperty('strokeWidth') ? element.strokeWidth : 3
      "
      :fill="element.hasOwnProperty('fill') ? `#${element.fill}` : 'none'"
      :fill-opacity="
        element.hasOwnProperty('fillOpacity') ? element.fillOpacity : 1
      "
    />
    <g v-if="element.selected">
      <Handle v-model:x="element.x" v-model:y="element.y" :options="options" />
      <Handle
        v-model:x="element.x2"
        v-model:y="element.y2"
        :options="options"
      />
    </g>
  </g>
</template>
