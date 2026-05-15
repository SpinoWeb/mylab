<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const pushRouter = (path: string | undefined = "/") =>
  router.push(path ? path : "/");

// darkMode
const darkMode = ref<boolean>(true);
watch(darkMode, (n) => toggleDarkMode(n));
const toggleDarkMode = (darkMode: boolean = true) => {
  //console.log("toggleDarkMode", darkMode);
  //document.documentElement.classList.toggle("p-dark");

  darkMode
    ? document.documentElement.classList.add("p-dark")
    : document.documentElement.classList.remove("p-dark");

  // localStorage
  localStorage.setItem(
    "my-lab-darkmode",
    JSON.stringify({ darkMode: darkMode }),
  );
};

onMounted(() => {
  //
  // get data from local storage
  //
  const localStorageData: any = localStorage.getItem("my-lab");
  //console.log("onMounted > localStorageData", localStorageData);
  const bbs = localStorageData ? JSON.parse(localStorageData) : {};

  darkMode.value = bbs.hasOwnProperty("darkMode") ? bbs.darkMode : true;
  toggleDarkMode(darkMode.value);

  //
  pushRouter();
});

// provide globalData
import { provide } from "vue";
provide("darkMode", darkMode);

// tests
const tests = ref([
  { route: "/gantt", icon: "pi pi-chart-bar", label: "Gantt" },
  { route: "/reluis", icon: "pi pi-chart-bar", label: "Reluis" },
  { route: "/serpapi", icon: "pi pi-chart-bar", label: "SerpApi" },
  { route: "/tri", icon: "pi pi-box", label: "Tri" },
  { route: "/that-open", icon: "pi pi-apple", label: "ThatOpen" },
  { route: "/fragments", icon: "pi pi-android", label: "Fragments" },
  { route: "/ifc-lite", icon: "pi pi-amazon", label: "IfcLite" },
  { route: "/stream", icon: "pi pi-box", label: "Stream" },
]);
</script>

<template>
  <div class="layout">
    <header>
      <!-- header -->
      <div style="float: left">
        <Button
          icon="pi pi-home"
          variant="text"
          aria-label="Home"
          @click="pushRouter('/')"
        />
        <Button
          v-for="i in tests"
          :icon="i.icon"
          variant="text"
          :label="i.label"
          @click="pushRouter(i.route)"
        />
        {{ $route.fullPath }}
      </div>
      <div style="float: right">
        <Button
          :icon="darkMode ? 'pi pi-sun' : 'pi pi-moon'"
          variant="text"
          aria-label="darkMode"
          @click="darkMode = !darkMode"
        />
      </div>
    </header>
    <RouterView />
    <footer>my lab</footer>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.layout {
  display: grid;
  gap: 0.25rem;
  grid-template-rows: 4rem auto 3rem;
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "main"
    "footer";
  height: 100vh;
}

@media (min-width: 480px) {
  .layout {
    display: grid;
    grid-template-rows: 3rem auto 2rem;
    grid-template-columns: auto;
    grid-template-areas:
      "header"
      "main"
      "footer";
  }
}

header {
  grid-area: header;
  border: 1px solid;
  border-radius: 4px;
  margin-top: 2px;
}

footer {
  grid-area: footer;
  border: 0px solid;
}

main {
  grid-area: main;
  border: 0px solid;
  border-radius: 4px;
}
</style>
