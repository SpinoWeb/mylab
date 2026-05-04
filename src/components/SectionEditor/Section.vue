<script setup lang="ts">
import { toRef } from "vue";

// props
interface Props {
  modelValue?: any;
  options?: any;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => {},
  options: () => {},
});

// toRef
const element = toRef(props, "modelValue");
const options = toRef(props, "options");
</script>

<template>
  <g>
    <circle
      v-if="element.hasOwnProperty('centroid')"
      :cx="element.centroid.x"
      :cy="element.centroid.y"
      r="4"
      stroke="#000"
      :fill="element.hasOwnProperty('fill') ? `#${element.fill}` : 'none'"
    />
  </g>
</template>
