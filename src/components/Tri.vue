<template>
  <div class="flex flex-col gap-2 p-2 w-full h-full border-1">
    <div class="flex flex-row gap-2">
      <!-- select job -->
      <Select
        v-model="job"
        :options="jobs"
        placeholder="Select a Job"
        class="w-1/6"
        :disabled="loading"
        @change="getDataFromXlsx"
      />

      <!-- actions -->
      <Button
        icon="pi pi-database"
        @click="dialogVisible = true"
        :disabled="loading"
      />

      <!-- loading -->
      <div class="mt-2">
        <i
          :class="`pi pi-spin ${loading ? 'pi-spinner' : null}`"
          style="font-size: 1.5rem"
        />
      </div>

      <div class="mt-2">{{ CurrUnits }}</div>
    </div>

    <div>
      <TriViewer
        v-model="data"
        :loading="loading"
        :options="{ scaleUnits: scaleUnits, xyzLimits: xyzLimits }"
      />
    </div>

    <div class="h-0">
      <Dialog
        v-model:visible="dialogVisible"
        header="Flex Scroll"
        :style="{ width: '75vw' }"
        maximizable
        modal
        :contentStyle="{ height: '420px' }"
      >
        <template #header>
          <!-- select table -->
          <Select
            v-model="table"
            :options="tables"
            optionLabel="label"
            optionValue="key"
            placeholder="Select a Table"
            class="w-1/4"
            :disabled="loading"
          />
        </template>
        <DataTable
          :value="tableData.records"
          :loading="loading"
          size="small"
          tableStyle="min-width: 50rem"
          scrollable
          scrollHeight="380px"
        >
          <Column v-for="key in tableData.keys" :field="key" :header="key" />
        </DataTable>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";

//import VueJsonPretty from "vue-json-pretty";
//import "vue-json-pretty/lib/styles.css";

import ExcelJS from "exceljs";

import TriViewer from "./TriViewer.vue";

//import { inject } from "vue";
//const darkMode = inject("darkMode");

import { MyData } from "../services/Types";

// const
const jobs: string[] = [
  "tavolo",
  "edificio22",
  "edificio33",
  "zappulla02",
  "Modello_3",
  "sample04",
];
const job = ref<string | undefined>();
const data = ref<MyData>({});
const loading = ref<boolean>(false);
const dialogVisible = ref<boolean>(false);
const table = ref<string | undefined>();
const tables = computed((): any[] => {
  return Object.keys(data.value).map((key: string) => {
    return { key: key, label: `${key} (${data.value[key].records.length})` };
  });
});
const tableData = computed(
  (): MyData =>
    table.value
      ? data.value[table.value]
      : { table: "", keys: [], units: [], records: [] },
);
//const getTableData = () => Promise.resolve(table.value ? data.value[table.value] : {});

onMounted(async () => {
  await getDataFromXlsx();
});

//
// get data for dev
const loadXlsx = async (filePath: string): Promise<MyData | undefined> => {
  //console.log("Tri > loadXlsx");
  if (!job.value) return undefined;

  // reset data
  let data: MyData = {};
  let CurrUnits: any;

  // get url content
  const arrayBuffer = await (await fetch(filePath)).arrayBuffer();
  //console.log("Tri > loadXlsx > arrayBuffer", arrayBuffer);

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(arrayBuffer).then(() => {
    // get CurrUnits
    const pc: any = wb.getWorksheet("Program Control");
    if (pc) {
      const keys = pc.getRow(2).values;
      const index = keys.findIndex((k: string) => k == "CurrUnits");
      if (index > -1)
        CurrUnits = pc.getRow(4).values[index].replace(/\s/g, "").split(",");
      //console.log("Tri > loadXlsx > CurrUnits", CurrUnits.value);
    }

    // iterate all over sheets
    wb.eachSheet((ws: any) => {
      // sheet name
      const name: string = "name" in ws ? ws.name : "sheet-01";
      //console.log("loadXlsx > name", name);

      // table name
      const table: string = String(ws.getRow(1).getCell(1).value);
      //console.log("loadXlsx > table", table);

      // keys
      const keys: string[] = ws.getRow(2).values.splice(1);
      //console.log("loadXlsx > keys", keys);

      // units
      const units: string[] = ws.getRow(3).values.splice(1);
      //console.log("loadXlsx > units", units);

      // add property
      data[name] = {
        table: table,
        keys: keys,
        units: units,
        records: [],
      };

      //let records: any = [];
      //let a = [keys];

      // Iterate over all rows that have values in a worksheet
      ws.eachRow((row: any, rowNumber: number) => {
        if (rowNumber > 3) {
          const values: (string | number | boolean | Date | null)[] =
            row.values.splice(1);
          //console.log("loadXlsx > values", values.length, keys.length);
          for (let i = 0; i < keys.length - values.length; i++) {
            values.push(null);
          }
          /*
          console.log(
            "loadXlsx > keys - values",
            name,
            keys.length - values.length,
          );
          */

          // get [key, value]
          const entries = keys.map(
            (value: string | number | boolean | Date | null, i: number) => {
              return [value, values[i]];
            },
          );
          //console.log("loadXlsx > entries", entries);

          const obj = Object.fromEntries(entries);
          //console.log("loadXlsx > obj", obj);

          // array of objects - each row with keys
          data[name].records.push(obj);

          // array with only data
          //data[name].records = data[name].records.concat(values);
        }
      });
      //console.log("loadXlsx > name\n", name, "\n", data.value[name].records);
    });

    // CurrUnits
    //data.value["Settings"].CurrUnits = CurrUnits;

    //return data;
  });

  return data;
};

const getDataFromXlsx = async () => {
  loading.value = true;
  const filePath: string = "./xlsx/" + job.value + ".xlsx";

  try {
    await loadXlsx(filePath).then((response) => {
      //console.log(response);
      data.value = response !== undefined ? response : {};
      table.value = undefined;
    });

    loading.value = false;
  } catch (error) {
    console.error("getDataFromXlsx > error:", error);
  }
};

//
const CurrUnits = computed(() => {
  //const defaultCurrUnits: [string, string, string] = ["kN", "m", "C"];
  const defaultCurrUnits: string = "kN, m, C";

  const CurrUnits = data.value?.["Program Control"]
    ? "CurrUnits" in data.value?.["Program Control"].records[0]
      ? data.value?.["Program Control"].records[0].CurrUnits
      : defaultCurrUnits
    : defaultCurrUnits;

  //console.log(CurrUnits);
  return CurrUnits.trim().split(",");
});
const scaleUnits = computed((): [number, number, number] => {
  if (!CurrUnits.value) return [1, 1, 1];
  //console.log(`CurrUnits: ${CurrUnits.value}`);

  const [Force, Length, Temperature]: [string, string, string] =
    CurrUnits.value;
  //console.log(`Length: ${Length}`);

  // Force
  let scaleForce: number = 1;
  switch (Force.trim()) {
    case "N":
      scaleForce = 1 / 1000;
      break;

    default: // kN
      scaleForce = 1;
      break;
  }

  // Length
  let scaleLength: number = 1;
  switch (Length.trim()) {
    case "mm":
      scaleLength = 1 / 1000;
      break;

    case "cm":
      scaleLength = 1 / 100;
      break;

    default: // m
      scaleLength = 1;
      break;
  }

  //console.log(`scaleUnits: ${scaleLength}`);
  return [scaleForce, scaleLength, 1];
});
const xyzLimits = computed(() => {
  if (!data.value.hasOwnProperty("Joint Coordinates"))
    return {
      Xmin: 0,
      Xmax: 0,
      Xlen: 0,
      Ymin: 0,
      Ymax: 0,
      Ylen: 0,
      Zmin: 0,
      Zmax: 0,
      Zlen: 0,
    };

  // else

  const JointCoordinates = data.value["Joint Coordinates"].records;
  //console.log("MyViewer > limits", JointCoordinates);

  const Xmin: number =
    JointCoordinates.length > 0
      ? Math.min.apply(
          Math,
          JointCoordinates.map((j: any) => j.XorR),
        )
      : 0;
  const Xmax: number =
    JointCoordinates.length > 0
      ? Math.max.apply(
          Math,
          JointCoordinates.map((j: any) => j.XorR),
        )
      : 0;

  const Ymin: number =
    JointCoordinates.length > 0
      ? Math.min.apply(
          Math,
          JointCoordinates.map((j: any) => j.Y),
        )
      : 0;
  const Ymax: number =
    JointCoordinates.length > 0
      ? Math.max.apply(
          Math,
          JointCoordinates.map((j: any) => j.Y),
        )
      : 0;

  const Zmin: number =
    JointCoordinates.length > 0
      ? Math.min.apply(
          Math,
          JointCoordinates.map((j: any) => j.Z),
        )
      : 0;
  const Zmax: number =
    JointCoordinates.length > 0
      ? Math.max.apply(
          Math,
          JointCoordinates.map((j: any) => j.Z),
        )
      : 0;

  //console.log("Tri > limits", Xmin, Xmax, Zmin, Zmax);
  return {
    Xmin: Xmin,
    Xmax: Xmax,
    Xlen: Math.abs(Xmax - Xmin),
    Ymin: Ymin,
    Ymax: Ymax,
    Ylen: Math.abs(Ymax - Ymin),
    Zmin: Zmin,
    Zmax: Zmax,
    Zlen: Math.abs(Zmax - Zmin),
  };
});
</script>

<style scoped></style>
