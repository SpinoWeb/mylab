<template>
  <div class="w-full h-full flex flex-row gap-2">
    <div class="flex flex-col gap-2 w-1/5 p-2 border-1 rounded-sm">
      <div class="flex flex-row gap-2">
        <Select
          v-model="year"
          :options="years"
          placeholder="Select an year"
          class="w-3/4"
          @change="resetData"
        />
        <Button label="get" @click="streamData" :disabled="isLoading" />
      </div>
      <div class="flex flex-row gap-2">
        <Select
          v-model="start_month"
          :options="months"
          placeholder="Select start_month"
          class="w-1/2"
          @change="resetData"
        />
        <Select
          v-model="end_month"
          :options="months"
          placeholder="Select end_month"
          class="w-1/2"
          @change="resetData"
        />
      </div>

      <div class="flex flex-row gap-2">
        <Select
          v-model="type"
          :options="types"
          placeholder="Select type"
          class="w-1/2"
          @change="resetData"
        />
      </div>

      <div class="flex flex-col gap-2 text-left">
        <div>{{ myMeta }}</div>
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
            class="w-3/4"
          />
        </div>

        <Button label="+" @click="addColY" :disabled="!year || isLoading" />
        <div v-for="(i, ydex) in colYlist" class="flex flex-row gap-2">
          <label class="mt-2">Y</label>
          <Select
            v-model.number="colYlist[ydex]"
            :options="listOfCols"
            placeholder="Y"
            class="w-3/4"
          />
          <Button label="+" @click="addColY" :disabled="!year || isLoading" />
          <Button
            label="x"
            @click="delColY(ydex)"
            :disabled="!year || isLoading || colYlist.length < 2"
          />
        </div>
      </div>

      <!-- query -->
      <Button
        label="query"
        @click="queryData"
        :disabled="
          !year ||
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

    <div class="flex flex-col gap-2 w-4/5 border-1 rounded-sm">
      <div class="w-full">
        <Chart
          :options="chartOptions"
          :class="`highcharts-${darkMode ? 'dark' : 'light'}`"
        />
      </div>

      <div class="h-[30vh] overflow-y-auto p-2 border-top-1">
        <DataTable
          :value="myData"
          size="small"
          stripedRows
          tableStyle="min-width: 50rem"
        >
          <Column v-for="c in listOfCols" :field="c" :header="c"></Column>
        </DataTable>
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

const isLoading = ref<boolean>(false);
const years = ref([2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]);
const year = ref(years.value[0]);
const months = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
const start_month = ref(months.value[0]);
const end_month = ref(months.value[1]);
const types = ref(["F", "P"]);
const type = ref(types.value[0]);

const myMeta = ref<any>();
const myData = ref<any[]>([]);
const series = ref<any[]>([]);

const rows = computed((): number => myData.value.length);

const colX = ref<string | undefined>();
const colY = ref<string | undefined>();
const listOfCols = computed((): string[] =>
  myData.value.length > 0 ? Object.keys(myData.value[0]) : [],
);
const colYlist = ref<string[]>(
  listOfCols.value.length > 0 ? [listOfCols.value[0]] : [],
);

const rowFrom = ref<number | undefined>();
const rowTo = ref<number | undefined>();
const listOfRows = computed(() => Array.from(Array(rows.value), (x, i) => i));

// https://medium.com/@AlexanderObregon/parsing-large-files-in-the-browser-using-javascript-streams-api-78cb88f30d23
const streamData = async () => {
  console.log("streamData");

  isLoading.value = true;

  myData.value = [];
  // https://webservices.ingv.it/swagger-ui/dist/
  // https://webservices.ingv.it/swagger-ui/dist/?url=https%3A%2F%2Fwebservices.ingv.it%2Fingvws%2Fsqlx%2F1%2Fswagger.json
  const url: string = `http://webservices.ingv.it/ingvws/sqlx/exPDFhour/1/?year=${year.value}&start_month=${start_month.value}&end_month=${end_month.value}&start_hour=14:00:00&end_hour=16:00:00&net=IV&sta=ACER&cha=HHZ&loc=--&type=${type.value}&limit=8000&format=json`;

  const response = await fetch(url);
  //console.log(response);

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

    //console.log(value);

    buffer += decoder.decode(value || new Uint8Array(), { stream: true });

    /*
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
    */
  }
  //console.log("buffer", JSON.parse(buffer));

  myMeta.value = JSON.parse(buffer).meta;
  myData.value = JSON.parse(buffer).data;

  // ultima riga
  /*
  if (buffer?.trim()) {
    const cols = parseLine(buffer).map((x: string) => parseFloat(x));
    //console.log("cols", cols);
    myData.value.push(cols);
  }
  */

  // init
  rowFrom.value = 0;
  rowTo.value = rows.value - 1;

  //
  console.log("--- file completato ---");
  isLoading.value = false;
};

// ----------------------
// resetData
// ----------------------
const resetData = () => {
  myMeta.value = undefined;
  myData.value = [];

  rowFrom.value = 0;
  rowTo.value = undefined;

  colX.value = listOfCols.value.length > 0 ? listOfCols.value[0] : undefined;
  colY.value = listOfCols.value.length > 0 ? listOfCols.value[0] : undefined;

  series.value = [];
};

// ----------------------
// chartData
// ----------------------
const _chartData = (colX: string, colY: string) => {
  return myData.value.map((record): [number, number] => [
    parseFloat(record[colX]),
    parseFloat(record[colY]),
  ]);
};

const _getQuery = async (
  colX: string,
  colY: string,
): Promise<[number, number][]> => {
  if (rowFrom.value === undefined || rowTo.value === undefined) return [];

  return Promise.resolve(
    _chartData(colX, colY).slice(
      rowFrom.value ? rowFrom.value : 0,
      rowTo.value ? rowTo.value : 0,
    ),
  );
};

// ----------------------
// queryData
// ----------------------
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

    const data: [number, number][] = await _getQuery(colX.value, colY);
    //console.log(data);

    series.value.push({
      data: data
        .map((i) => Object.assign({}, { x: i[0], y: i[1] }))
        .sort((a, b) => a.x - b.x),
      name: `${year.value} ${colY}`,
      color: myUtils.randomHexColor(),
    });
  }

  isLoading.value = false;
};

// ----------------------
// colY
// ----------------------
const addColY = () => {
  const colY = listOfCols.value.length > 0 ? listOfCols.value[0] : null;
  if (colY) colYlist.value.push(colY);
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
    layout: "horizontal",
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
