<template>
  <div class="w-[96vw] h-[88vh] flex overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-96 shrink-0 border-r overflow-auto flex flex-col gap-2">
      <div class="flex flex-row gap-4 px-2">
        <label class="mt-1">north</label>
        <InputText v-model.number="box.north" class="w-1/3" />
        <label class="mt-1">east</label>
        <InputText v-model.number="box.east" class="w-1/3" />
      </div>
      <div class="flex flex-row gap-4 px-2">
        <label class="mt-1">south</label>
        <InputText v-model.number="box.south" class="w-1/3" />
        <label class="mt-1">west</label>
        <InputText v-model.number="box.west" class="w-1/3" />
      </div>
      <div class="flex flex-row gap-4 px-2">
        <label class="mt-1">Motorway</label>
        <Select
          v-model="motorway"
          :options="['A18', 'A20']"
          @change="resetData"
          class="w-1/3"
        />
      </div>

      <div class="flex flex-row gap-2">
        <Button label="fetch" @click="fetchData" :disabled="isLoading" />
        <Button label="reset" @click="resetData" :disabled="isLoading" />
        <span>isBig: {{ isBig }}</span>
      </div>

      <div class="flex flex-row gap-2">
        <div>records: {{ records.length }}</div>
      </div>

      <div class="flex flex-col gap-2">
        <span v-for="i in bridges" class="text-left border-bottom-1">{{
          i
        }}</span>
      </div>

      <div>
        <VueJsonPretty
          :data="records"
          :showIcon="true"
          :showLength="true"
          :deep="2"
          theme="dark"
        />
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 overflow-auto min-w-0">
      <div class="p-2 min-w-max">
        <!-- Contenuto molto largo -->
        <div class="w-full min-h-[600px] rounded p-2 flex flex-col border-1">
          <Map :records="records" :box="box" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

import Map from "./Overpass/Map.vue";

import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

//import Highcharts from "highcharts";
//import { Chart } from "highcharts-vue";
//import "highcharts/modules/boost";

//import { myUtils } from "../services/myUtils";

//import { inject } from "vue";
//const darkMode = inject("darkMode");

const isLoading = ref<boolean>(false);

const records = ref<any[]>([]);

interface Box {
  north: number;
  east: number;
  south: number;
  west: number;
}
const box = ref<Box>({
  north: 39, // 0.lat
  east: 16, // 0.lng
  south: 36.5, // 1.lat
  west: 11.5, // 1.lng
});
const motorway = ref<string>("A18");

const checkIsBig = () => {
  const a: number = box.value.north - box.value.south;
  const b: number = box.value.east - box.value.west;

  //console.log("checkIsBig", a + b);
  return a + b > 0.1;
};
const isBig = computed(() => checkIsBig());

const bridges = computed(() => {
  return records.value.map((x) =>
    x.hasOwnProperty("tags")
      ? x.tags.hasOwnProperty("bridge:name")
        ? x.tags["bridge:name"]
        : x.tags.hasOwnProperty("name")
          ? x.tags.name
          : Object.keys(x.tags)
      : Object.keys(x),
  );
});

//
// https://openstreetmap-online.fandom.com/wiki/Key:bridge
//
const fetchData = async () => {
  //console.log("fetchData");

  isLoading.value = true;

  checkIsBig();

  const south = box.value.south;
  const west = box.value.west;
  const north = box.value.north;
  const east = box.value.east;

  // way[highway][bridge=yes](area.searchArea); // Select all bridges
  //const query = `[out:json][timeout:25];(way["bridge"]( ${south},${west},${north},${east} );relation["building"]( ${south},${west},${north},${east} ););out body geom;`;
  //const query = `[out:json][timeout:25];(way[highway][bridge=yes](${south},${west},${north},${east}););out body geom;`;
  //const query = `[out:json][timeout:25];way["highway"="motorway"]["ref"="A20"]["bridge"];out geom;`;
  const query = `[out:json][timeout:25];way["highway"="motorway"]["ref"="${motorway.value}"]["bridge"](${south},${west},${north},${east});out body geom;`;
  // ["man_made"="bridge"]
  console.log(query);

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const data = await response.json();
    console.log("data", data);

    records.value = data.elements.map((element: any) => ({
      id: element.id,
      tags: element.tags,
      bounds: element.bounds,
      geometry: element.geometry
        ? element.geometry.map((pt: any) => ({ lat: pt.lat, lng: pt.lon }))
        : undefined,
    }));

    /*
    records.value = data.elements.map((element: any) =>
      Object.assign(element, {
        geometry: element.geometry
          ? element.geometry.map((pt: any) => ({ lat: pt.lat, lng: pt.lon }))
          : undefined,
      }),
    );
    */

    //console.log("records", records.value.length);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    isLoading.value = false;
    //console.log("finally");
  }
};

// ----------------------
// resetData
// ----------------------
const resetData = () => {
  records.value = [];
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;700&display=swap");

.container {
  position: relative;
  display: flex;
  flex-grow: inherit;
  gap: 2;
  width: 100%;
  max-width: calc(100vw - 4rem);
  height: fit-content;
  margin: 0 auto;
  padding: 0 auto;
}

/* Table */
.table-wrap {
  margin-top: 1.5rem;
  overflow-x: auto;
  border: 1px solid #21262d;
  border-radius: 10px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
thead {
  position: sticky;
  top: 0;
}
th {
  padding: 0.65rem 1rem;
  /* text-align: left; */
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid;
}
th.hl {
  font-weight: bold;
  background-color: #ff7b72;
}
td {
  padding: 0.55rem 1rem;
  border-bottom: 0px solid;
  font-family: "IBM Plex Mono", monospace;
  white-space: nowrap;
}
td.hl {
  font-weight: bold;
  background-color: #696;
}
tr:last-child td {
  border-bottom: none;
}
/* tbody tr:hover {  background: #161b22;} */

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.25rem;
  font-size: 0.875rem;
  color: #8b949e;
}
.pagination button {
  background: #21262d;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-family: "IBM Plex Mono", monospace;
  transition: background 0.15s;
}
.pagination button:hover:not(:disabled) {
  background: #30363d;
  color: #58a6ff;
}
.pagination button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
