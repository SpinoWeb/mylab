<template>
  <div class="w-full h-full flex flex-row gap-2">
    <div class="flex flex-col gap-2 w-1/6">
      <div class="flex flex-row gap-2">
        <Select
          v-model="myFile"
          :options="myFiles"
          optionLabel="name"
          placeholder="Select a file"
          class="w-3/4"
          @change="resetData"
        />
        <Button
          label="get"
          @click="streamData"
          :disabled="!myFile || isLoading"
        />
      </div>

      <div class="flex flex-row gap-2 justify-end">
        <div>n</div>
        <Button label="random" @click="getRandomData()" :disabled="isLoading" />
      </div>

      <div class="flex flex-row gap-2 justify-end">
        <div>{{ rows }} x {{ cols }} = {{ rows * cols }}</div>
        <Button label="reset" @click="resetData" :disabled="isLoading" />
      </div>

      <!-- from, to-->
      <div class="flex flex-row gap-2">
        <Select
          v-model.number="rowFrom"
          :options="listOfRows"
          placeholder="from"
          class="w-1/2"
        />
        <Select
          v-model.number="rowTo"
          :options="listOfRows"
          placeholder="to"
          class="w-1/2"
        />
      </div>

      <!-- axes -->
      <div class="flex flex-col gap-2">
        <div class="flex flex-row gap-2">
          <label class="mt-2">X</label>
          <Select
            v-model.number="colX"
            :options="listOfCols"
            placeholder="X"
            class="w-1/2"
          />
        </div>

        <div v-for="(i, ydex) in colYlist" class="flex flex-row gap-2">
          <label class="mt-2">Y</label>
          <Select
            v-model.number="colYlist[ydex]"
            :options="listOfCols"
            placeholder="Y"
            class="w-1/2"
          />
          <Button label="+" @click="addColY" :disabled="!myFile || isLoading" />
          <Button
            label="x"
            @click="delColY(ydex)"
            :disabled="!myFile || isLoading || colYlist.length < 2"
          />
        </div>
      </div>

      <!-- query -->
      <Button
        label="query"
        @click="queryData"
        :disabled="
          !myFile ||
          isLoading ||
          rowFrom == undefined ||
          rowTo == undefined ||
          colX == undefined ||
          colYlist.length < 1
        "
      />

      <div>{{ rowFrom }} : {{ rowTo }}</div>
      <div>{{ colX }} : {{ colYlist }}</div>
    </div>

    <div class="flex flex-col gap-2 w-5/6 border-1">
      <div class="w-full">
        <Chart
          :options="chartOptions"
          :class="`highcharts-${darkMode ? 'dark' : 'light'}`"
        />
      </div>

      <div class="h-[30vh] overflow-y-auto border-top-1">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th
                v-for="c in cols"
                :class="c - 1 == colX || colYlist.includes(c - 1) ? 'hl' : null"
              >
                {{ c - 1 }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rdex) in myData">
              <td>{{ rdex }}</td>
              <td
                v-for="(col, cdex) in row"
                :class="
                  cdex == colX ||
                  colYlist.includes(
                    typeof cdex === 'string' ? parseInt(cdex) : cdex,
                  )
                    ? 'hl'
                    : null
                "
              >
                {{ col.toFixed(3) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

//import Highcharts from "highcharts";
import { Chart } from "highcharts-vue";
//import "highcharts/modules/boost";

import { myUtils } from "../services/myUtils";

import { inject } from "vue";
const darkMode = inject("darkMode");

const myFiles = ref([
  { name: "data_500_5", code: "data_500_5" },
  { name: "data_1500_5", code: "data_1500_5" },
  { name: "data_10000_10", code: "data_10000_10" },
  { name: "data_20000_10", code: "data_20000_10" },
  { name: "data_50000_5", code: "data_50000_5" },
  { name: "data_100000_10", code: "data_100000_10" },
]);
const myFile = ref(myFiles.value[0]);
const isLoading = ref<boolean>(false);

const myData = ref<any[]>([]);
const series = ref<any[]>([]);

const rows = computed((): number => myData.value.length);
const cols = computed((): number =>
  myData.value.length > 0 ? myData.value[0].length : 0,
);

const colX = ref<number | undefined>();
const colY = ref<number | undefined>();
const colYlist = ref<number[]>([0]);
const listOfCols = computed(() => Array.from(Array(cols.value), (x, i) => i));

const rowFrom = ref<number | undefined>();
const rowTo = ref<number | undefined>();
const listOfRows = computed(() => Array.from(Array(rows.value), (x, i) => i));

// https://medium.com/@AlexanderObregon/parsing-large-files-in-the-browser-using-javascript-streams-api-78cb88f30d23
const streamData = async () => {
  console.log("streamData");

  isLoading.value = true;

  myData.value = [];

  const url: string = `./txt/${myFile.value.code}.dat`;

  const response = await fetch(url);

  if (!response.body) {
    console.error("Streaming non supportato");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer: string | undefined = "";
  let done = false;

  while (!done) {
    const { value, done: streamDone } = await reader.read();
    done = streamDone;

    buffer += decoder.decode(value || new Uint8Array(), { stream: true });

    const lines: string[] | undefined = buffer?.split(/\r?\n/);
    if (!lines) break;

    buffer = lines?.pop();

    for (const line of lines) {
      if (line.trim()) {
        const cols = parseLine(line).map((x: string) => parseFloat(x));
        //console.log("cols", cols);
        myData.value.push(cols);
      }
    }
  }

  // ultima riga
  if (buffer?.trim()) {
    const cols = parseLine(buffer).map((x: string) => parseFloat(x));
    //console.log("cols", cols);
    myData.value.push(cols);
  }

  // init
  rowFrom.value = 0;
  rowTo.value = rows.value - 1;

  //
  console.log("--- file completato ---");
  isLoading.value = false;
};

function parseLine(line: string) {
  // normalizza spazi multipli e tab
  return line
    .trim()
    .split(/[\t, ]+/) // tab, virgola o spazi multipli
    .filter(Boolean);
}

// ----------------------
// getRandomData
// ----------------------
const _getRandomData = async (n: number): Promise<number[][]> => {
  const arr = [];
  let i,
    x,
    a: number = 1,
    b: number = 1,
    c: number = 1,
    spike;

  for (
    i = 0, x = Date.UTC(new Date().getUTCFullYear(), 0, 1) - n * 36e5;
    i < n;
    i = i + 1, x = x + 36e5
  ) {
    if (i % 100 === 0) {
      a = 2 * Math.random();
    }
    if (i % 1000 === 0) {
      b = 2 * Math.random();
    }
    if (i % 10000 === 0) {
      c = 2 * Math.random();
    }
    if (i % 50000 === 0) {
      spike = 10;
    } else {
      spike = 0;
    }
    arr.push([
      x,
      2 * Math.sin(i / 100) + a + b + c + spike + Math.random(),
      2 * Math.cos(i / 100) + a + b + c + spike + Math.random(),
    ]);
  }

  //
  return Promise.resolve(arr);
};
const getRandomData = async (n: number = 100000) => {
  isLoading.value = true;

  myData.value = await _getRandomData(n);

  // init
  rowFrom.value = 0;
  rowTo.value = rows.value - 1;

  isLoading.value = false;
};
//const n = 500000, data = getRandomData(n);

// ----------------------
// resetData
// ----------------------
const resetData = () => {
  myData.value = [];

  rowFrom.value = 0;
  rowTo.value = undefined;

  colX.value = 0;
  colY.value = undefined;

  series.value = [];
};

// ----------------------
// queryData
// ----------------------
const getCol = (matrix: any[], col: number) => {
  let column = [];
  for (let i = 0; i < matrix.length; i++) {
    column.push(matrix[i][col]);
  }
  return column;
};
const _getCols = (colY: number = 0): [number, number][] => {
  if (colX.value === undefined) return [];

  return myData.value.map((x, i: number) => [
    myData.value[i][colX.value ? colX.value : 0], // Get X column
    myData.value[i][colY ? colY : 0], // Get Y column
  ]);
};
const _getQuery = async (colY: number = 0): Promise<[number, number][]> => {
  if (rowFrom.value === undefined || rowTo.value === undefined) return [];

  return Promise.resolve(
    _getCols(colY).slice(
      rowFrom.value ? rowFrom.value : 0,
      rowTo.value ? rowTo.value : 0,
    ),
  );
};
const queryData = async () => {
  isLoading.value = true;
  series.value = [];

  if (
    rowFrom.value === undefined ||
    rowTo.value === undefined ||
    colX.value === undefined
  )
    return;

  // query
  for (let i = 0; i < colYlist.value.length; i++) {
    const colY = colYlist.value[i];

    const data: [number, number][] = await _getQuery(colY);
    //console.log(data);

    series.value.push({
      data: data
        .map((i) => Object.assign({}, { x: i[0], y: i[1] }))
        .sort((a, b) => a.x - b.x),
      lineWidth: 0.1,
      name: myFile.value.name,
      color: myUtils.randomHexColor(),
    });
  }

  isLoading.value = false;
};

// ----------------------
// colY
// ----------------------
const addColY = () => {
  colYlist.value.push(0);
};
const delColY = (index: number) => {
  colYlist.value.splice(index, 1);
};

// ----------------------
// chartOptions
// ----------------------
const chartOptions = computed(() => {
  // legend
  const legend: any = {
    enabled: true,
    layout: "vertical",
    align: "left",
    verticalAlign: "top",
    x: 50,
    y: 0,
    floating: true,
  };

  return {
    chart: {
      type: "line",
      //styledMode: true,
      zooming: { type: "x" }, // Valid values: 'x', 'y', 'xy', null
    },
    credits: { enabled: false },

    title: {
      //text: "points",
      text: undefined,
    },
    subtitle: {
      //text: `${data.length} points`,
      text: undefined,
    },

    tooltip: {
      valueDecimals: 3,
    },

    xAxis: { title: { text: "x" } },
    yAxis: { title: { text: "y" } },

    scrollbar: { enabled: true },

    legend: legend,
    series: series.value,
  };
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;700&display=swap");

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.reader-root {
  font-family: "IBM Plex Sans", sans-serif;
  background: #0d1117;
  color: #e6edf3;
  min-height: 100vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.reader-header {
  margin-bottom: 2rem;
}
.reader-header h1 {
  font-family: "IBM Plex Mono", monospace;
  font-size: 1.75rem;
  color: #58a6ff;
  letter-spacing: -0.03em;
}
.subtitle {
  font-size: 0.8rem;
  color: #8b949e;
  margin-top: 0.25rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Dropzone */
.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border: 2px dashed #30363d;
  border-radius: 12px;
  padding: 3rem 2rem;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  color: #8b949e;
  font-size: 0.95rem;
}
.dropzone:hover {
  border-color: #58a6ff;
  background: #161b22;
  color: #e6edf3;
}
.dropzone.loading {
  opacity: 0.6;
  pointer-events: none;
}
.dropzone input {
  display: none;
}

/* Progress */
.progress-wrap {
  position: relative;
  background: #161b22;
  border-radius: 6px;
  height: 8px;
  margin-top: 1rem;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #238636, #58a6ff);
  transition: width 0.15s;
  border-radius: 6px;
}
.progress-label {
  position: absolute;
  right: 0;
  top: -1.5rem;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.75rem;
  color: #8b949e;
}

/* Error */
.error-box {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #3d1a1a;
  border: 1px solid #da3633;
  border-radius: 8px;
  color: #ff7b72;
  font-size: 0.9rem;
}

/* Stats */
.stats-bar {
  display: flex;
  gap: 2rem;
  margin-top: 1.25rem;
  padding: 0.75rem 1rem;
  background: #161b22;
  border-radius: 8px;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.85rem;
  color: #8b949e;
}
.stats-bar span {
  color: #3fb950;
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
