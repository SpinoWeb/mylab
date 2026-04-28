<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

const pushRouter = (path: string | undefined = "/") => {
  const myPath = path ? path : "/";
  router.push(myPath);
};

const tests = ref([
  { route: "/gantt", icon: "pi pi-chart-bar", label: "Gantt" },
  { route: "/reluis", icon: "pi pi-chart-bar", label: "Reluis" },
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
