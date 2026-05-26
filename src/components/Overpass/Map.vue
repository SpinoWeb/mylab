<script setup lang="ts">
import { onMounted, ref, toRef, onBeforeUnmount, watch, computed } from "vue";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LatLngBoundsExpression } from "leaflet";

import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import Rainbow from "rainbowvis.js";
import { myUtils } from "../../services/myUtils";
//import { myUtils } from "../../services/myUtils";

// const
const circleMarkerUnSelected = {
  color: "#696",
  fillColor: "#696",
  fillOpacity: 0.5,
  radius: 6,
};
const circlepolygonselected = {
  color: "crimson",
  fillColor: "crimson",
  fillOpacity: 0.75,
  radius: 8,
};

const color = "crimson";

//
// proprietà dell'opera
// che vengono visualizzate
//
const keysOfItem0 = [
  //"_id",
  "Category",
  "Supporting Ministry",
  "Community",
  "Project",
  "Status",
  "Target Completion Date",
  "Description",
  "Result",
  "Area",
  "Region",
  "Address",
  "Postal Code",
  "Highway / Transit Line",
  "Estimated Total Budget ($)",
  "Municipal Funding",
  "Provincial Funding",
  "Federal Funding",
  "Other Funding",
  "Website",
  "Latitude",
  "Longitude",
];

// props
// 2 opaque types created with the helper
//type int = Opaque<string, 'int'>;
//type text = Opaque<string, 'type'>;

interface Field {
  id: string;
  type: string;
  info?: any;
}

interface Props {
  blds?: any[];
  box?: any;
}
const props = withDefaults(defineProps<Props>(), {
  blds: () => [],
  box: () => {
    return {
      south: 38.157, // 1.lat
      west: 14.828, // 1.lng
      north: 38.158, // 0.lat
      east: 14.829, // 0.lng
    };
  },
});

const blds = toRef(props, "blds");
const box = toRef(props, "box");

const refLat = computed(() => (box.value.south + box.value.north) / 2);
const refLng = computed(() => (box.value.west + box.value.east) / 2);

// define model
watch(blds, () => setPolygons(), { deep: true });

// ref
const map = ref();
const polygons = ref<any[]>([]);

const buf = ref();

const corner1 = ref<L.LatLng | null>();
const corner2 = ref<L.LatLng | null>();

onMounted(async () => {
  await initMap();
});

onBeforeUnmount(() => {
  if (map.value) map.value.remove();
});

const randomIntFromInterval = (min: number = 1, max: number = 100): number => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};
const getColorFromScale = (value: number): string => {
  // Assicura che il valore sia tra 1 e 100
  const normalizedValue = Math.min(Math.max(value, 1), 100);

  // Calcola i canali Red e Green (0-255)
  // Più il valore è alto, meno rosso e più verde avremo
  /*
  const r = Math.round((255 * (100 - normalizedValue)) / 99);
  const g = Math.round((255 * (normalizedValue - 1)) / 99);
  const b = 0;
  */

  // Calcola i canali (1 = tutto rosso, 100 = tutto blu)
  const r = Math.round((255 * (100 - normalizedValue)) / 99);
  const g = 0;
  const b = Math.round((255 * (normalizedValue - 1)) / 99);

  // Converte in formato esadecimale con padding
  const toHex = (c: number) => c.toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

// init map
const initMap = async () => {
  //console.log("initMap");

  //
  // map
  //
  map.value = L.map("mapContainer").setView([refLat.value, refLng.value], 6);
  L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value);
  //use a mix of renderers
  let customPane = map.value.createPane("customPane");
  L.canvas({ pane: "customPane" });
  customPane.style.zIndex = 399; // put just behind the standard overlay pane which is at 400
  L.marker([refLat.value, refLng.value]).addTo(map.value);

  //console.log(map.value);

  // Listener click
  map.value.on("click", (e: L.LeafletMouseEvent) => {
    corner1.value = e.latlng;
    console.log("Coordinate salvate:", corner1.value.lat, corner1.value.lng);
  });

  // set polygons
  await setPolygons();
};

// remove polygons
const delPolygons = async () => {
  //console.log("Map > delPolygons");

  for await (const item of polygons.value) {
    map.value.removeLayer(item.polygon);
  }
};
const setPolygons = async () => {
  //console.log("setPolygons", blds.value);
  let coords: any[] = [];

  /*
  const clickOnMarker = (e: any) => {
    console.log("setPolygons > clickOnMarker", e);
  };
  */

  await delPolygons();

  const myRainbow: Rainbow = new Rainbow();
  const min: number = 1,
    max: number = 100;
  myRainbow.setNumberRange(min, max);
  myRainbow.setSpectrum("red", "green");

  polygons.value = [];
  for await (const bld of blds.value) {
    //console.log(bld);

    const { id, tags, geometry } = bld;

    const latlngs: any[][] = [];
    for (let i = 0; i < geometry.length; i++) {
      const v = geometry[i];
      //console.log(v);
      latlngs.push([v.lat, v.lng]);
    }

    // create a polygon from an array of LatLng points
    const polygon = L.polygon(latlngs, {
      //color: color,
      //weight: 1,
      fillColor: color,
      fillOpacity: 0.5,
    }); //.addTo(map.value);

    // polygons
    polygons.value.push({
      id: id,
      polygon: polygon,
    });

    // add to map
    map.value.addLayer(polygon);

    // zoom the map to the polygon
    map.value.fitBounds(polygon.getBounds());

    // v
    for (let i = 0; i < latlngs.length; i++) {
      const latlng = latlngs[i];
      //console.log(latlng);

      const marker = L.circleMarker(
        [latlng[0], latlng[0]],
        //circleMarkerUnSelected,
        {
          color: color,
          fillColor: color,
          fillOpacity: 0.5,
          radius: 6,
        },
      );

      // add to map
      map.value.addLayer(marker);
    }
  }

  //
  //
  //console.log("Map > setPolygons > coords", coords);
  //await io.saveFile0(coords, ".txt", "pippo");

  //
  //
  const wb = new ExcelJS.Workbook();
  wb.creator = "Nino Spinella";
  //wb.lastModifiedBy = "Her";
  wb.created = new Date();
  //wb.modified = new Date();
  //wb.lastPrinted = new Date(2016, 9, 27);

  const ws = wb.addWorksheet("data");

  ws.columns = [
    { header: "label", key: "label" },
    { header: "lat", key: "lat" },
    { header: "lon", key: "lon" },
  ];

  for (const c of coords) {
    ws.addRow(c);
  }

  buf.value = await wb.xlsx.writeBuffer();
};

const saveXlsx = () => {
  if (buf.value) saveAs(new Blob([buf.value]), "blds.xlsx");
};
/*
const updpolygons = () => {
  for (const item of polygons.value) {
    //console.log(item);
    map.value.removeLayer(item.marker);

    if (opereSelezionateId.value.includes(item.id)) {
      item.marker.setStyle(circlepolygonselected);
      map.value.addLayer(item.marker);
      item.marker.bringToFront();
    } else {
      item.marker.setStyle(circleMarkerUnSelected);
      map.value.addLayer(item.marker);
      item.marker.bringToBack();
    }
  }
};
*/
</script>

<template>
  <div class="container">
    <div id="mapContainer" class="map-container" />
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: 100%;
  min-height: 540px;
}

.map-container {
  position: absolute;
  top: 0;
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 540px;
}

.tbody-wrap {
  margin-top: 1.5rem;
  overflow-y: auto;
  border: 1px solid #21262d;
  border-radius: 10px;
}
</style>
