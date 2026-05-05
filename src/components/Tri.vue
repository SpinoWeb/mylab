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
        label="s2k"
        icon="pi pi-database"
        @click="tableDataVisible = true"
        :disabled="loading"
      />
      <Button
        label="tri"
        icon="pi pi-database"
        @click="triDataVisible = true"
        :disabled="loading"
      />
      <Button
        icon="pi pi-eject"
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
        v-model="dataTri"
        :loading="loading"
        :options="{ scaleUnits: scaleUnits, xyzLimits: xyzLimits }"
      />
    </div>

    <!-- Tables S2k (tableData) -->
    <div class="h-0">
      <Dialog
        v-model:visible="tableDataVisible"
        header="Tables"
        :style="{ width: '85vw' }"
        maximizable
        modal
        :contentStyle="{ minHeight: '480px', height: '85vh' }"
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
          maximizable
        >
          <Column v-for="key in tableData.keys" :field="key" :header="key" />
        </DataTable>
      </Dialog>
    </div>

    <!-- Tables tri (triData) -->
    <div class="h-0">
      <Dialog
        v-model:visible="triDataVisible"
        header="Tables"
        :style="{ width: '50vw' }"
        maximizable
        modal
        :contentStyle="{ minHeight: '480px', height: '85vh' }"
      >
        <template #header>
          <!-- select table -->
          <Select
            v-model="triTable"
            :options="triTables"
            optionLabel="label"
            optionValue="key"
            placeholder="Select a Table"
            class="w-1/4"
            :disabled="loading"
          />
        </template>
        <vue-json-pretty
          :data="triData"
          :collapsedNodeLength="2"
          :showLength="true"
          :showIcon="true"
          :theme="darkMode ? 'dark' : 'light'"
        />
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
        :contentStyle="{ minHeight: '480px', height: '85vh' }"
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
            v-model:polygons="dataTri.Polygons"
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

import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

import ExcelJS from "exceljs";

import TriViewer from "./TriViewer.vue";
import SectionEditor from "./SectionEditor.vue";

import { inject } from "vue";
const darkMode = inject("darkMode");

import {
  DataTri,
  Point2D,
  Material,
  Section,
  Polygon,
} from "../services/Types";

// const
const jobs: string[] = [
  "adeguato",
  "belpasso_30",
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
const tableDataVisible = ref<boolean>(false);
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
const triDataVisible = ref<boolean>(false);
const triTable = ref<string | undefined>();
const triTables = computed((): any[] => {
  return Object.keys(dataTri.value).map((key: string) => {
    return { key: key, label: `${key} (${dataTri.value[key].length})` };
  });
});
const triData = computed(
  (): DataTri => (triTable.value ? dataTri.value[triTable.value] : []),
);

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

  // Links
  if (!dataTri.hasOwnProperty("Links")) Object.assign(dataTri, { Links: [] });

  // TendonSections
  if (!dataTri.hasOwnProperty("TendonSections"))
    Object.assign(dataTri, { TendonSections: [] });

  // Tendons
  if (!dataTri.hasOwnProperty("Tendons"))
    Object.assign(dataTri, { Tendons: [] });

  // TendonSegments
  //if (!dataTri.hasOwnProperty("TendonSegments")) Object.assign(dataTri, { TendonSegments: [] });

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
    "Bridge Response",
    "Case - Modal 1 - General",
    "Case - Modal 2 - Loads - Eigen",
    "Case - Modal 3 - Loads - Ritz",
    "Case - Moving 1 - Lane Assigns",
    "Case - Moving 2 - Lanes Loaded",
    "Case - Moving 3 - Lane Factors",
    "Case - RS 1 - General",
    "Case - RS 2 - Load Assignments",
    "Case - Static 1 - Load Assigns",
    "Combination Definitions",
    "Connectivity - Frame",
    "Connectivity - Link",
    "Connectivity - Tendon",
    "Constraint Definitions - Body",
    "Coordinate Systems",
    "Database Format Types",
    "Frame Auto Mesh",
    "Frame Design Procedures",
    "Frame Load Transfer Options",
    "Frame Loads - Distributed",
    "Frame Loads - Point",
    "Frame Loads - Temperature",
    "Frame Local Axes 1 - Typical",
    "Frame Local Axes 2 - Advanced",
    "Frame Output Station Assigns",
    "Frame Props 01 - General",
    "Frame Props 02 - Concrete Col",
    "Frame Props 05 - Nonprismatic",
    "Frame Props 13 - Time Dependent",
    "Frame Section Assignments",
    "Func - Resp Spec - Ita NTC 2018",
    "Function - Plot Functions",
    "Function - PSD - User",
    "Function - Resp Spect - User",
    "Function - Steady State - User",
    "Function - Time History - User",
    "Grid Lines",
    "Groups 1 - Definitions",
    "Groups 2 - Assignments",
    "Joint Constraint Assignments",
    "Joint Coordinates",
    "Joint Loads - Force",
    "Joint Local Axes 1 - Typical",
    "Joint Local Axes 2 - Advanced",
    "Joint Pattern Definitions",
    "Joint Restraint Assignments",
    "Lane Centerline Points",
    "Lane Definition Data",
    "Link Local Axes 1 - Typical",
    "Link Local Axes 2 - Advanced",
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
    "MatProp 04 - User Stress-Strain",
    "MatProp 06 - Damping Parameters",
    "Options - Colors - Display",
    "Options - Colors - Output",
    "Pref - Alum - AA-ASD 2000",
    "Pref - Cold - AISI-ASD96",
    "Pref - Conc - Chinese 2010",
    "Pref Steel - AISC 360-16",
    "Preferences - Dimensional",
    "Program Control",
    "Project Information",
    "Rebar Sizes",
    "SD 01 - General",
    "SD 16 - Shape Polygon",
    "SD 17 - Shape Reinf Single",
    "SD 18 - Shape Reinf Line",
    "SD 21 - Shape Reference Line",
    "SD 22 - Shape Reference Circle",
    "SD 30 - Fiber General",
    "Solid Property Definitions",
    "Tendon Data 1 - General",
    "Tendon Data 2 - Segments",
    "Tendon Loads - Force Or Stress",
    "Tendon Section Assignments",
    "Tendon Section Definitions",
    "Vehicles 2 - Gen Vehicles 1",
    "Vehicles 3 - Gen Vehicles 2",
    "Vehicles 4 - Vehicle Classes",
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
    (x: Section) => x.SectionName,
  );
  for (let i = 0; i < SectionNameList.length; i++) {
    const SectionName: string = SectionNameList[i];

    // a vertex for each row
    const polygonsOfSection = polygons.filter(
      (x: Polygon) => x.SectionName === SectionName,
    );
    //console.log(SectionName, polygonsOfSection);

    // list of ShapeName
    let ShapeNameList: string[] = polygonsOfSection.map(
      (x: Polygon) => x.ShapeName,
    );
    ShapeNameList = [...new Set(ShapeNameList)];
    //console.log(SectionName, ShapeNameList);

    // loop on ShapeName
    for (let j = 0; j < ShapeNameList.length; j++) {
      const ShapeName: string = ShapeNameList[j];

      // filter to get vertex of a shape / polygon
      const vertexOfPolygon = polygonsOfSection.filter(
        (x: Polygon) => x.ShapeName === ShapeName,
      );
      //console.log(SectionName, ShapeName, vertexOfPolygon);

      // loop on polygon's vertex
      let polygon: Polygon = vertexOfPolygon[0]; // get first vertex / first row
      let points: Point2D[] = [
        { X: polygon.X ? polygon.X : 0, Y: polygon.Y ? polygon.Y : 0 },
      ]; // get first

      // get Material
      //
      const index: number = dataToTri.Materials.findIndex(
        (m: Material) => m.Material === polygon.ShapeMat,
      );
      const Material = index > -1 ? dataToTri.Materials[index] : {};
      //console.log("Material", Material);
      Object.assign(polygon, {
        FillColor: "Color" in Material ? Material.Color : undefined,
        ShapeMatE1: "E1" in Material ? Material.E1 : undefined, // 1
      });

      // loop on remain polygon's vertex / rows
      for (let k = 1; k < vertexOfPolygon.length; k++) {
        const vertex: Polygon = vertexOfPolygon[k];
        //console.log(SectionName, ShapeName, vertex);

        // append vertex
        points.push({ X: vertex.X ? vertex.X : 0, Y: vertex.Y ? vertex.Y : 0 });

        // update ShapeMat, FillColor
        if (vertex.ShapeMat !== null) {
          polygon.ShapeMat = vertex.ShapeMat;

          // get Material
          //
          const index: number = dataToTri.Materials.findIndex(
            (m: Material) => m.Material === polygon.ShapeMat,
          );
          const Material = index > -1 ? dataToTri.Materials[index] : {};
          //console.log("Material", Material);
          Object.assign(polygon, {
            FillColor: "Color" in Material ? Material.Color : undefined,
            ShapeMatE1: "E1" in Material ? Material.E1 : undefined, // 1
          });
        }
      }

      // ShapeName > polygon
      Object.assign(polygon, { points: points });

      // delete X and Y
      if (polygon.X) delete polygon.X;
      if (polygon.Y) delete polygon.Y;

      //
      dataToTri.Polygons.push(polygon);
    }
  }

  //dataToTri.Polygons = polygons;

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
  // Links
  //
  if (data.hasOwnProperty("Connectivity - Link")) {
    for (let i = 0; i < data["Connectivity - Link"].records.length; i++) {
      //
      const Link01 = data["Connectivity - Link"].records[i];

      //
      const a: string[] = [
        //"Connectivity - Link",
        "Link Local Axes 1 - Typical",
        "Link Local Axes 2 - Advanced",
        "Link Property Assignments",
        "Link Props 01 - General",
        "Link Props 02 - Linear",
      ];

      for (let j = 0; j < a.length; j++) {
        const property = a[j];
        if (!data.hasOwnProperty(property)) continue;

        const Link02 = data[property].records.find(
          (k: any) => k.Link === Link01.Tendon,
        );
        if (Link02) Object.assign(Link01, Link02);
      }

      //console.log(Link01);
      dataToTri.Links.push(Link01);
    }
  }

  //
  // TendonSections
  //
  dataToTri.TendonSections = data.hasOwnProperty("Tendon Section Definitions")
    ? data["Tendon Section Definitions"].records
    : [];

  //
  // Tendons
  //
  if (data.hasOwnProperty("Connectivity - Tendon")) {
    const TendonSegments = data.hasOwnProperty("Tendon Data 2 - Segments")
      ? data["Tendon Data 2 - Segments"].records
      : [];
    for (let i = 0; i < data["Connectivity - Tendon"].records.length; i++) {
      //
      const Tendon01 = data["Connectivity - Tendon"].records[i];

      //
      const a: string[] = [
        //"Connectivity - Tendon",
        "Tendon Data 1 - General",
        //"Tendon Data 2 - Segments",
        "Tendon Loads - Force Or Stress",
        "Tendon Section Assignments",
        //"Tendon Section Definitions",
      ];

      for (let j = 0; j < a.length; j++) {
        const property = a[j];
        if (!data.hasOwnProperty(property)) continue;

        const Tendon02 = data[property].records.find(
          (k: any) => k.Tendon === Tendon01.Tendon,
        );
        if (Tendon02) Object.assign(Tendon01, Tendon02);
      }

      // segments
      //
      // filter to get segments
      const segments = TendonSegments.filter(
        (x: any) => x.Tendon == Tendon01.Tendon,
      );
      //console.log(segments);
      const points = segments.map((x: any) => {
        return { X: x.XGlobal, Y: x.YGlobal, Z: x.ZGlobal };
      });
      Object.assign(Tendon01, { points: points });

      //console.log(Tendon01);
      dataToTri.Tendons.push(Tendon01);
    }
  }

  //
  // TendonSegments
  //
  /*
  const TendonList: string[] = dataToTri.Tendons.map((x: any) => x.Tendon);
  for (let i = 0; i < TendonList.length; i++) {
    const Tendon = TendonList[i];

    // filter to get segments
    const segments = TendonSegments.filter((x: any) => x.Tendon == Tendon);
    //console.log(segments);
    const points = segments.map((x: any) => {
      return { X: x.XGlobal, Y: x.YGlobal, Z: x.ZGlobal };
    });

    //console.log(points);
    dataToTri.TendonSegments.push({ Tendon: Tendon, points: points });
  }
  */

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
