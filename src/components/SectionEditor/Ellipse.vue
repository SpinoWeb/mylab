<script setup lang="ts">
import { toRef, onMounted, onUnmounted } from "vue";

const emit = defineEmits(["update:modelValue"]);

// const

// props
interface Props {
  modelValue?: any;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => {
    return {};
  },
});

// toRef
const element = toRef(props, "modelValue");

// ref

// mounted
onMounted(() => {
  //console.log("Ellipse > onMounted", element.value);
});

// unmounted
onUnmounted(() => {
  //console.log("Ellipse > onUnmounted");
});

// computed

// methods
</script>

<template>
  <ellipse
    :cx="element.cx"
    :cy="element.cy"
    :rx="element.rx"
    :ry="element.ry"
    :fill="element.hasOwnProperty('fill') ? element.fill : '#FF8282'"
    :stroke="element.hasOwnProperty('stroke') ? element.stroke : '#000'"
    :stroke-width="
      element.hasOwnProperty('strokeWidth') ? element.strokeWidth : 1
    "
  />
</template>

<style scoped></style>
