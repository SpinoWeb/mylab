<template>
  <div id="root">
    <ProgressBar
      :mode="loading ? 'indeterminate' : 'determinate'"
      style="height: 4px"
    />

    <div class="h-[8vh] overflow-y-auto text-left">{{ keys }}</div>

    <!-- -->
    <div class="flex flex-columns gap-2">
      <div class="h-[80vh] overflow-y-auto text-left w-1/2">
        <span>{{ myQuery }}</span>
        <vue-json-pretty
          :data="result"
          :showIcon="true"
          :showLength="true"
          :collapsedNodeLength="1"
        />
      </div>

      <div class="h-[80vh] overflow-y-auto text-left w-1/2">
        <Select v-model="key" :options="keys" placeholder="Select a key" />
        <vue-json-pretty
          v-if="key"
          :data="result[key]"
          :showIcon="true"
          :showLength="true"
          :collapsedNodeLength="2"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

const myQuery: string = "coffee";

const loading = ref<boolean>(false);
const result = ref();
const keys = ref<string[]>([]);
const key = ref<string>();

onMounted(async () => {
  await fetchSerpApiCompressed();

  keys.value = Object.keys(result.value);

  //const {base}
});

async function fetchSerpApiCompressed(query: string = myQuery) {
  const API_KEY =
    "a73e88a5d69b47ef424b780c0e78f55592de4b5f10e14807a5787742bd75537f";
  const url = `https://serpapi.com/search.json?engine=google&q=${query}&api_key=${API_KEY}`;
  try {
    loading.value = true;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    result.value = await response.json();
    //console.log(result);

    loading.value = false;
  } catch (error) {
    console.error(error);
  }
}
</script>

<style scoped></style>
