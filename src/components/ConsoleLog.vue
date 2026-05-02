<template>
  <div
    id="console-olog"
    class="absolute bottom-2 right-2 w-1/4 h-[160px] overflow-y-auto text-left p-2 z-99"
  >
    <!-- toolbar -->
    <div class="flex flex-row gap-2 border-bottom-1">
      <i class="pi pi-times m-1 icon" :disabled="loading" @click="clear" />
    </div>

    <!-- loading -->
    <ProgressBar
      :mode="loading ? 'indeterminate' : 'determinate'"
      style="height: 2px"
    />

    <!-- olog -->
    <div v-for="o in olog" class="flex flex-row gap-2">
      <span v-html="o" class="w-full text-sm" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef, ref } from "vue";

// props
interface Props {
  modelValue?: any;
  options?: any;
  loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  options: () => {},
  loading: false,
});

// toRef
const loading = toRef(props, "loading");
//const options = toRef(props, "options");

// ref
const olog = ref<string[]>([]);

const clear = () => (olog.value = []);

//
// add custom property to window.console
//
Object.assign(window.console, {
  //log: (str: string) => olog.value.unshift(str),
  olog: (str: string) => olog.value.unshift(str),
});
</script>

<style scoped>
.icon {
  cursor: pointer;
}
</style>
