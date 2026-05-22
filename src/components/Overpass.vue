<template>
  <div class="w-[96vw] h-[88vh] flex overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-96 shrink-0 border-r overflow-auto flex flex-col gap-2">
      <div class="flex flex-row gap-2">
        <Select
          v-model="myFile"
          :options="myFiles"
          optionLabel="name"
          placeholder="Select a file"
          class="w-3/4"
          @change="resetData"
        />
        <Button label="fetch" @click="fetchData" :disabled="isLoading" />
      </div>

      <div class="flex flex-row gap-2">
        <div>fields: {{ fields.length }}</div>
        <div>records: {{ records.length }}</div>
      </div>

      <div>
        <ol>
          <li v-for="(field, fdex) in fields" class="text-left">
            {{ fdex }} : {{ field.id }}
            <ul class="flex flex-col gap-1 border-top-1">
              <li
                v-for="(value, key) in field.info"
                :key="key"
                class="w-5/6 flex flex-row gap-1"
              >
                <div>&nbsp;</div>
                <div>{{ key }}:</div>
                <div>{{ value }}</div>
              </li>
            </ul>
          </li>
        </ol>
      </div>

      <!--
      <div>
        <VueJsonPretty
          :data="records"
          :showIcon="true"
          :showLength="true"
          :theme="darkMode ? 'dark' : 'light'"
        />
      </div>
      -->
    </aside>

    <!-- Main -->
    <main class="flex-1 overflow-auto min-w-0">
      <div class="p-2 min-w-max">
        <!-- Contenuto molto largo -->
        <div class="w-full min-h-[600px] rounded p-2 flex flex-col border-1">
          <Map :fields="fields" :records="records" />
          <!--  
          <table>
            <thead>
              <tr>
                <th v-for="field in fields" class="border-right-1">
                  {{ field.id }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in records">
                <td
                  v-for="i in record"
                  class="text-left whitespace-pre hyphens-auto border-right-1"
                >
                  {{ i }}
                </td>
              </tr>
            </tbody>
          </table>
          -->
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import Map from "./Overpass/Map.vue";

import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

//import Highcharts from "highcharts";
import { Chart } from "highcharts-vue";
//import "highcharts/modules/boost";

//import { myUtils } from "../services/myUtils";

//import { inject } from "vue";
//const darkMode = inject("darkMode");

const myFiles = ref([
  {
    name: "ontario-builds-roads-and-bridges_2026-05-17",
    code: "ontario-builds-roads-and-bridges_2026-05-17",
  },
  {
    name: "bridges-conditions_2026-05-17",
    code: "bridges-conditions_2026-05-17",
  },
]);
const myFile = ref(myFiles.value[0]);
const isLoading = ref<boolean>(false);

const fields = ref<any[]>([]);
const records = ref<any[]>([]);
//const series = ref<any[]>([]);

const fetchData = async () => {
  //console.log("fetchData");

  isLoading.value = true;

  const box = { south: 0, west: 0, north: 0, east: 0 };

  const south = box.south;
  const west = box.west;
  const north = box.north;
  const east = box.east;
  const query = `[out:json][timeout:25];(way["building"]( ${south},${west},${north},${east} );relation["building"]( ${south},${west},${north},${east} ););out body geom;`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const data = await response.json();
    console.log(data);

    const blds = data.elements.map((element: any) => ({
      id: element.id,
      tags: element.tags,
      geometry: element.geometry
        ? element.geometry.map((pt: any) => ({ lat: pt.lat, lng: pt.lon }))
        : undefined,
    }));
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    isLoading.value = false;
  }
};

// ----------------------
// resetData
// ----------------------
const resetData = () => {
  fields.value = [];
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
