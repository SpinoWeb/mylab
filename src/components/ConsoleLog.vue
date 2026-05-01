<template>
  <div
    id="my-console-log"
    class="absolute bottom-2 right-2 w-1/4 h-[160px] overflow-y-auto text-left p-2 z-99"
  >
    <!-- toolbar -->
    <div class="flex flex-row border-bottom-1">
      <mdicon name="close" class="icon" :disabled="loading" @click="clear" />
    </div>

    <!-- loading -->
    <ProgressBar
      :mode="loading ? 'indeterminate' : 'determinate'"
      style="height: 2px"
    />

    <!-- log -->
    <div v-for="i in list" class="flex flex-row gap-2">
      <span v-html="i" class="w-full text-sm" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef, ref, computed } from "vue";

import { inject } from "vue";
const darkMode = inject("darkMode");

// props
interface Props {
  modelValue?: any;
  loading?: boolean;
  options?: any;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  loading: false,
  options: () => {
    return {
      bottom: 4,
      right: 4,
      width: 288,
      height: 160,
    };
  },
});

// toRef
const loading = toRef(props, "loading");
const options = toRef(props, "options");

// ref
const list = ref<string[]>([]);

const style = computed(
  () =>
    `position: absolute; bottom: ${options.value.bottom}px; right: ${options.value.right}px;
     width: ${options.value.width}px; height: ${options.value.height}px;
     overflow-y: auto; scrollbar-color: white black; scrollbar-width: thin;
     padding: 4px;
     text-align: left; color: ${darkMode ? "#424242" : "#EEE"}; font-size: 0.85rem; font-family: monospace;
     display: flex; flex-direction: column; gap: 0.25rem`,
);

const clear = () => (list.value = []);

Object.assign(window.console, {
  log: function (str: string) {
    /*
    let node = document.createElement("div");
    node.classList.add("log");
    //node.setAttribute("class", "log");
    node.textContent = str;
    document?.getElementById("my-console-log")?.prepend(node); // .appendChild(node)
    */
    list.value.unshift(str);
  },
});
</script>

<style scoped>
.log {
  width: 100%;
  text-align: left;
}

.icon {
  cursor: pointer;
}
</style>
