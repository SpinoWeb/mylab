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
      <Button
        icon="pi pi-stop"
        @click="sectionEditorDialog = true"
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

    <!-- Tables -->
    <div class="h-0">
      <Dialog
        v-model:visible="dialogVisible"
        header="Tables"
        :style="{ width: '85vw' }"
        maximizable
        modal
        :contentStyle="{ height: '480px' }"
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

    <!-- Section Editor -->
    <div class="h-0">
      <Dialog
        v-model:visible="sectionEditorDialog"
        header="Section Editor"
        modal
        :style="{ width: '85vw' }"
        maximizable
        :contentStyle="{ height: '480px' }"
      >
        <template #header>
          <div class="inline-flex items-center justify-center gap-2">
            <span>{{ clientSize }}</span
            ><span>{{ boardOptions.camera }}</span>
          </div>
        </template>
        <div v-if="dataTri.hasOwnProperty('Sections')" class="w-full h-full">
          <SectionEditor
            v-model:sections="dataTri.Sections"
            v-model:options="boardOptions"
            :scaleUnits="scaleUnits"
            :size="[0.85 * clientSize[0], 0.85 * clientSize[1]]"
          />
        </div>
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
import SectionEditor from "./SectionEditor.vue";

//import { inject } from "vue";
//const darkMode = inject("darkMode");

import { DataTri } from "../services/Types";

// const
const jobs: string[] = [
  "edificio",
  //"edificio11",
  "edificio22",
  "edificio33",
  "Modello_3",
  "roof",
  "sample04",
  "sample",
  "sap_03",
  "sloped",
  "tavolo",
  "tower_01",
  "tower_02",
  "tower_03",
  "zappulla02",
  "zappulla",
];
const job = ref<string | undefined>();
const data = ref<DataTri>({});
const dataTri = ref<DataTri>({});
const loading = ref<boolean>(false);
const dialogVisible = ref<boolean>(false);
const table = ref<string | undefined>();
const tables = computed((): any[] => {
  return Object.keys(data.value).map((key: string) => {
    return { key: key, label: `${key} (${data.value[key].records.length})` };
  });
});
const tableData = computed(
  (): DataTri =>
    table.value
      ? data.value[table.value]
      : { table: "", keys: [], units: [], records: [] },
);
//const getTableData = () => Promise.resolve(table.value ? data.value[table.value] : {});

// Section Editor
const sectionEditorDialog = ref<boolean>(false);
const boardOptions = ref({
  camera: { x: 100, y: 100, z: 1 },
  showGrid: true,
  snapGrid: 25,
  pitch: 5,
  toggle: "Select",
  delay: 200,
  showQuote: false,
});
//
const clientSize = computed(() => [
  document.documentElement.clientWidth,
  document.documentElement.clientHeight,
]);

//
//
//
onMounted(async () => {
  await getDataFromXlsx();
});

const initDataTri = (dataTri: DataTri | undefined = {}) => {
  // undefined
  if (!dataTri) dataTri = {};

  // Grids
  if (!dataTri.hasOwnProperty("Grids")) Object.assign(dataTri, { Grids: [] });

  // Materials
  if (!dataTri.hasOwnProperty("Materials"))
    Object.assign(dataTri, { Materials: [] });

  // Sections
  if (!dataTri.hasOwnProperty("Sections"))
    Object.assign(dataTri, { Sections: [] });

  // Polygons
  if (!dataTri.hasOwnProperty("Polygons"))
    Object.assign(dataTri, { Polygons: [] });

  // Areas
  if (!dataTri.hasOwnProperty("Areas")) Object.assign(dataTri, { Areas: [] });

  // Joints
  if (!dataTri.hasOwnProperty("Joints")) Object.assign(dataTri, { Joints: [] });

  // Frames
  if (!dataTri.hasOwnProperty("Frames")) Object.assign(dataTri, { Frames: [] });

  // Settings
  if (!dataTri.hasOwnProperty("Settings"))
    Object.assign(dataTri, { Settings: [] });

  //
  return dataTri;
};

//
// get data for dev
const loadXlsx = async (filePath: string): Promise<DataTri | undefined> => {
  //console.log("Tri > loadXlsx");
  if (!job.value) return undefined;

  // reset data
  let data: DataTri = {};

  // get url content
  const arrayBuffer = await (await fetch(filePath)).arrayBuffer();
  //console.log("Tri > loadXlsx > arrayBuffer", arrayBuffer);

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(arrayBuffer).then(() => {
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
      //
      if (!response) return;
      dataTri.value = dataToTri(response);
    });
    loading.value = false;
  } catch (error) {
    console.error("getDataFromXlsx > error:", error);
  }
};
const dataToTri = (data: DataTri = {}): DataTri => {
  //console.log(Object.keys(data));

  const props = [
    "Active Degrees of Freedom",
    "Analysis Options",
    "Auto Wave 3 - Char - General",
    "Case - Modal 1 - General",
    "Case - Static 1 - Load Assigns",
    "Connectivity - Frame",
    "Connectivity - Link",
    "Coordinate Systems",
    "Database Format Types",
    "Frame Auto Mesh",
    "Frame Design Procedures",
    "Frame Load Transfer Options",
    "Frame Loads - Distributed",
    "Frame Loads - Gravity",
    "Frame Output Station Assigns",
    "Frame Props 01 - General",
    "Frame Props 02 - Concrete Col",
    "Frame Props 03 - Concrete Beam",
    "Frame Props 13 - Time Dependent",
    "Frame Section Assignments",
    "Function - Plot Functions",
    "Grid Lines",
    "Groups 1 - Definitions",
    "Joint Coordinates",
    "Joint Pattern Definitions",
    "Joint Restraint Assignments",
    "Link Property Assignments",
    "Link Props 01 - General",
    "Link Props 02 - Linear",
    "Load Case Definitions",
    "Load Pattern Definitions",
    "Mass Source",
    "MatProp 01 - General",
    "MatProp 02 - Basic Mech Props",
    "MatProp 03a - Steel Data",
    "MatProp 03b - Concrete Data",
    "MatProp 03e - Rebar Data",
    "MatProp 03f - Tendon Data",
    "MatProp 03j - Von Mises Data",
    "MatProp 06 - Damping Parameters",
    "MatProp 09 - Acceptance",
    "Options - Colors - Display",
    "Options - Colors - Output",
    "Over - Conc - ACI 318-14",
    "Pref - Alum - AA 2015",
    "Pref - Cold - AISI-16",
    "Pref - Conc - ACI 318-14",
    "Pref Steel - AISC 360-16",
    "Preferences - Dimensional",
    "Program Control",
    "Project Information",
    "Rebar Sizes",
    "SD 01 - General",
    "SD 16 - Shape Polygon",
    "SD 17 - Shape Reinf Single",
    "SD 18 - Shape Reinf Line",
    "SD 30 - Fiber General",
    "Solid Property Definitions",
  ];

  // init
  let dataToTri: DataTri = initDataTri();

  //
  // Grids
  //
  dataToTri.Grids = data.hasOwnProperty("Grid Lines")
    ? data["Grid Lines"].records
    : [];

  //
  // Materials
  //
  //if (!data.hasOwnProperty("MatProp 01 - General")) continue;
  for (let i = 0; i < data["MatProp 01 - General"].records.length; i++) {
    //
    const MatProp01 = data["MatProp 01 - General"].records[i];

    const a: string[] = [
      "MatProp 02 - Basic Mech Props",
      "MatProp 03a - Steel Data",
      "MatProp 03b - Concrete Data",
      "MatProp 03e - Rebar Data",
      "MatProp 03f - Tendon Data",
    ];

    for (let j = 0; j < a.length; j++) {
      const property = a[j];
      if (!data.hasOwnProperty(property)) continue;

      const MatProp02 = data[property].records.find(
        (k: any) => k.Material === MatProp01.Material,
      );
      if (MatProp02) Object.assign(MatProp01, MatProp02);
    }

    //
    //console.log(MatProp01);
    dataToTri.Materials.push(MatProp01);
  }

  //
  // Sections
  //
  for (let i = 0; i < data["Frame Props 01 - General"].records.length; i++) {
    //
    const Section01 = data["Frame Props 01 - General"].records[i];

    //
    const a: string[] = [
      //"Frame Props 01 - General",
      "Frame Props 02 - Concrete Col",
      "Frame Props 03 - Concrete Beam",
      "Frame Props 08 - PCC I Girder",
      "Frame Props 13 - Time Dependent",
      "Frame Props 14 - Tendon Data",
      "Frame Props 15 - Tendon Loc",
      "Frame Props 16 - Tendon Loads",
      //
      "SD 01 - General",
      //"SD 16 - Shape Polygon",
      //"SD 17 - Shape Reinf Single",
      //"SD 18 - Shape Reinf Line",
      //"SD 30 - Fiber General",
    ];

    for (let j = 0; j < a.length; j++) {
      const property = a[j];
      if (!data.hasOwnProperty(property)) continue;

      const Section02 = data[property].records.find(
        (k: any) => k.SectionName === Section01.SectionName,
      );
      if (Section02) Object.assign(Section01, Section02);
    }

    //console.log(Joint01);
    dataToTri.Sections.push(Section01);
  }

  //
  // Polygons
  //
  const polygons = data.hasOwnProperty("SD 16 - Shape Polygon")
    ? data["SD 16 - Shape Polygon"].records
    : [];
  const SectionNameList: string[] = dataToTri.Sections.map(
    (x: any) => x.SectionName,
  );
  for (let i = 0; i < SectionNameList.length; i++) {
    const SectionName: string = SectionNameList[i];

    //
    const polygonsOfSection = polygons.filter(
      (x: any) => x.SectionName === SectionName,
    );
    //console.log(SectionName, polygonsOfSection);

    let ShapeNameList: string[] = polygonsOfSection.map(
      (x: any) => x.ShapeName,
    );
    ShapeNameList = [...new Set(ShapeNameList)];
    //console.log(SectionName, ShapeNameList);

    //
    for (let j = 0; j < ShapeNameList.length; j++) {
      const ShapeName: string = ShapeNameList[j];

      const vertexOfPolygon = polygonsOfSection.filter(
        (x: any) => x.ShapeName === ShapeName,
      );
      //console.log(SectionName, ShapeName, vertexOfPolygon);
    }
  }

  dataToTri.Polygons = data.hasOwnProperty("SD 16 - Shape Polygon")
    ? data["SD 16 - Shape Polygon"].records
    : [];

  //
  // Joints
  //
  for (let i = 0; i < data["Joint Coordinates"].records.length; i++) {
    //
    const Joint01 = data["Joint Coordinates"].records[i];

    const a: string[] = [
      "Joint Pattern Definitions",
      "Joint Restraint Assignments",
    ];

    for (let j = 0; j < a.length; j++) {
      const property = a[j];
      if (!data.hasOwnProperty(property)) continue;

      const Joint02 = data[property].records.find(
        (k: any) => k.Joint === Joint01.Joint,
      );
      if (Joint02) Object.assign(Joint01, Joint02);
    }

    //
    //console.log(Joint01);
    dataToTri.Joints.push(Joint01);
  }

  //
  // Frames
  //
  for (let i = 0; i < data["Connectivity - Frame"].records.length; i++) {
    //
    const Frame01 = data["Connectivity - Frame"].records[i];

    //
    const a: string[] = [
      //"Connectivity - Frame",
      "Frame Auto Mesh",
      "Frame Design Procedures",
      "Frame Insertion Point Assigns",
      "Frame Load Transfer Options",
      "Frame Output Station Assigns",
      "Frame Section Assignments",
    ];

    for (let j = 0; j < a.length; j++) {
      const property = a[j];
      if (!data.hasOwnProperty(property)) continue;

      const Frame02 = data[property].records.find(
        (k: any) => k.Frame === Frame01.Frame,
      );
      if (Frame02) Object.assign(Frame01, Frame02);
    }

    //console.log(Joint01);
    dataToTri.Frames.push(Frame01);
  }

  //
  // Areas
  //

  //
  // Settings
  //
  const a: string[] = [
    "Program Control",
    "Options - Colors - Display",
    "Options - Colors - Output",
  ];

  for (let i = 0; i < a.length; i++) {
    const property = a[i];
    if (!data.hasOwnProperty(property)) continue;
    for (let j = 0; j < data[property].records.length; j++) {
      const record = data[property].records[j];
      //console.log(i, j, record);
      dataToTri.Settings.push(record);
    }
  }

  console.log("dataToTri", dataToTri);
  return dataToTri;
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
