<template>
  <div id="root">
    <ProgressBar
      :mode="loading ? 'indeterminate' : 'determinate'"
      style="height: 4px"
    />

    <div class="h-[8vh] overflow-y-auto text-left">{{ keys }}</div>

    <!-- -->
    <div class="flex flex-columns gap-2">
      <div class="h-[80vh] overflow-y-auto text-left w-1/4">
        <span>{{ apiURL }}</span>
        <vue-json-pretty
          :data="reluis"
          :showIcon="true"
          :showLength="true"
          :collapsedNodeLength="1"
        />
      </div>

      <div class="h-[80vh] overflow-y-auto text-left w-1/4">
        <Select v-model="key" :options="keys" placeholder="Select a key" />
        <vue-json-pretty
          v-if="key"
          :data="reluis[key]"
          :showIcon="true"
          :showLength="true"
          :collapsedNodeLength="2"
        />
      </div>

      <div class="flex flex-col gap-2 w-1/4">
        <div class="h-[40vh] overflow-y-auto text-left">
          <ol>
            <li v-for="i in paths" class="border-bottom-1">
              <Button
                variant="text"
                size="small"
                icon="pi pi-play"
                @click="getPath(i)"
              />
              {{ i }}
            </li>
          </ol>
        </div>

        <div class="text-left">
          <vue-json-pretty
            v-if="path"
            :data="path"
            :showIcon="true"
            :showLength="true"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2 w-1/4">
        <div class="h-[40vh] overflow-y-auto text-left">
          <ol>
            <li v-for="i in definitions" class="border-bottom-1">
              <Button
                variant="text"
                size="small"
                icon="pi pi-play"
                @click="getDefinition(i)"
              />
              {{ i }}
            </li>
          </ol>
        </div>

        <div class="text-left">
          <vue-json-pretty
            v-if="definition"
            :data="definition"
            :showIcon="true"
            :showLength="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

const apiURL: string = `http://46.37.12.82/reluis/v2/api-docs`;

const loading = ref<boolean>(false);
const reluis = ref();
const keys = ref<string[]>([]);
const key = ref<string>();

const tags = computed(() =>
  keys.value.includes("tags") ? reluis.value.tags : [],
);

const paths = computed(() =>
  keys.value.includes("paths") ? Object.keys(reluis.value.paths) : [],
);
const path = ref();

const definitions = computed(() =>
  keys.value.includes("definitions")
    ? Object.keys(reluis.value.definitions)
    : [],
);
const definition = ref();

onMounted(async () => {
  await fetchReluisApi();

  keys.value = Object.keys(reluis.value);

  //const {base}
});

async function fetchReluisApi() {
  try {
    loading.value = true;

    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    reluis.value = await response.json();

    loading.value = false;
  } catch (error) {
    console.error(error);
  }
}

const getPath = (key: string) => {
  path.value = reluis.value.paths[key];
};

const getDefinition = (key: string) => {
  definition.value = reluis.value.definitions[key];
};
</script>

<style scoped></style>
