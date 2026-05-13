<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

const pushRouter = (path: string | undefined = "/") =>
  router.push(path ? path : "/");

const tests = ref([
  { route: "/gantt", icon: "pi pi-chart-bar", label: "Gantt" },
  { route: "/reluis", icon: "pi pi-chart-bar", label: "Reluis" },
  { route: "/serpapi", icon: "pi pi-chart-bar", label: "SerpApi" },
  { route: "/tri", icon: "pi pi-box", label: "Tri" },
  { route: "/that-open", icon: "pi pi-apple", label: "ThatOpen" },
  { route: "/fragments", icon: "pi pi-android", label: "Fragments" },
  { route: "/ifc-lite", icon: "pi pi-amazon", label: "IfcLite" },
]);
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <div v-for="i in tests">
      <Button
        :icon="i.icon"
        variant="text"
        :label="i.label"
        @click="pushRouter(i.route)"
      />
    </div>
  </div>
</template>

<style scoped></style>
