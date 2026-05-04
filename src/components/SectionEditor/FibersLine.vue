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
//onMounted(() => Object.assign(element.value, sps.getFibersLineProperties(element.value)));
onMounted(() => useElement(element.value, options.value)); // composable
watch(element, () => useElement(element.value, options.value)); // composable
// composable
//useElement(element.value, options.value);

// watch params to update properties
const params = computed(() => {
  return {
    x: element.value.x,
    y: element.value.y,
    x2: element.value.x2,
    y2: element.value.y2,
    a: element.value.a,
    nFibers: element.value.nFibers,
  };
});
watch(params, (n) =>
  Object.assign(element.value, sps.getFibersLineProperties(n))
);

// radius
const radius = computed(() =>
  element.value.hasOwnProperty("a") ? Math.sqrt(element.value.a / Math.PI) : 1
);

// fibers
const fibers = computed(() => {
  const {
    x,
    y,
    x2,
    y2,
    nFibers,
  }: {
    x: number;
    y: number;
    x2: number;
    y2: number;
    nFibers: number;
  } = element.value;

  return smh.getFibersLine(x, y, x2, y2, nFibers);
});
</script>

<template>
  <g :id="element.id">
    <line
      v-if="element.selected"
      :x1="element.x"
      :y1="element.y"
      :x2="element.x2"
      :y2="element.y2"
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
      <Handle
        v-model:x="element.x2"
        v-model:y="element.y2"
        :options="options"
      />
    </g>
  </g>
</template>
