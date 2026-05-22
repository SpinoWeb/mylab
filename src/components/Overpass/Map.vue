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
const circleMarkerSelected = {
  color: "crimson",
  fillColor: "crimson",
  fillOpacity: 0.75,
  radius: 8,
};

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
  fields: Field[];
  records: any[];
}
const props = withDefaults(defineProps<Props>(), {
  fields: () => [],
  records: () => [],
});

const fields = toRef(props, "fields");
const records = toRef(props, "records");
const bridges = computed(() => {
  let bridges: any[] = [];
  for (let r = 0; r < records.value.length; r++) {
    const record = records.value[r];

    let obj: any = {};
    for (let j = 0; j < record.length; j++) {
      const value = record[j];
      const field: Field = fields.value[j];
      obj[field.id.trim()] = value;
    }

    //console.log(obj);
    bridges.push(obj);
  }

  //console.log(bridges);
  return bridges;
});

const keysOfItem = computed(() => fields.value.map((x) => x.id));

// define model
watch(bridges, () => setMarkers(), { deep: true });

// ref
const map = ref();
const markers = ref<any[]>([]);

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
  map.value = L.map("mapContainer").setView([37.5, 14.5], 8);
  L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value);
  //use a mix of renderers
  let customPane = map.value.createPane("customPane");
  L.canvas({ pane: "customPane" });
  customPane.style.zIndex = 399; // put just behind the standard overlay pane which is at 400
  //L.marker([37.5, 14.5]).addTo(map.value);

  //console.log(map.value);

  // Listener click
  map.value.on("click", (e: L.LeafletMouseEvent) => {
    corner1.value = e.latlng;
    console.log("Coordinate salvate:", corner1.value.lat, corner1.value.lng);
  });

  // set markers
  await setMarkers();
};

// remove markers
const delMarkers = async () => {
  //console.log("Map > delMarkers");

  for await (const item of markers.value) {
    map.value.removeLayer(item.marker);
  }
};
const setMarkers = async () => {
  //console.log("setMarkers", bridges.value);
  let coords: any[] = [];

  /*
  const clickOnMarker = (e: any) => {
    console.log("setMarkers > clickOnMarker", e);
  };
  */

  await delMarkers();

  const myRainbow: Rainbow = new Rainbow();
  const min: number = 1,
    max: number = 100;
  myRainbow.setNumberRange(min, max);
  myRainbow.setSpectrum("red", "green");

  markers.value = [];
  for await (const bridge of bridges.value) {
    //console.log(bridge);

    const { _id, Latitude, Longitude, LATITUDE, LONGITUDE } = bridge;
    let CURRENT_BCI = bridge.hasOwnProperty("CURRENT BCI")
      ? bridge["CURRENT BCI"]
      : max; // default value
    //console.log(_id, Latitude, Longitude, LATITUDE, LONGITUDE, CURRENT_BCI);

    //
    // set marker
    //
    if ((Latitude && Longitude) || (LATITUDE && LONGITUDE)) {
      let lats = [];
      let lons = [];

      if (Latitude && Longitude) {
        lats = Latitude.split("|").map((x: string) => parseFloat(x));
        lons = Longitude.split("|").map((x: string) => parseFloat(x));
      }

      if (LATITUDE && LONGITUDE) {
        lats = LATITUDE.split("|").map((x: string) => parseFloat(x));
        lons = LONGITUDE.split("|").map((x: string) => parseFloat(x));
      }

      //console.log(_id, lats, lons);
      if (lats.includes(NaN) || lons.includes(NaN)) continue;

      let html: string = "<b>" + _id + "</b>\n";

      html += "<div style='width: 100%; height: 240px; overflow-y: auto'>";
      html += "<table>\n<tbody>";
      for (const key of keysOfItem.value) {
        if (bridge.hasOwnProperty(key) && bridge[key] != null) {
          html += "\n<tr>\n";
          html += `<td class='p-1 border-b border-blue-gray-50'>${key}</td>`;
          html += `<td class='p-1 border-b border-blue-gray-50'>${bridge[key]}</td>`;
          html += "\n</tr>";
        }
      }
      html += "</tbody>\n</table>\n";
      html += "</div>";

      // marker
      const color: string = "#" + myRainbow.colourAt(CURRENT_BCI);
      //const color:string = getColorFromScale(randomIntFromInterval());
      const marker = L.circleMarker(
        [lats[0], lons[0]],
        //circleMarkerUnSelected,
        {
          color: color,
          fillColor: color,
          fillOpacity: 0.5,
          radius: 6,
        },
      ).bindPopup(html);
      //.on('click', clickOnMarker);

      // markers
      markers.value.push({
        id: _id,
        marker: marker,
      });

      // add to map
      map.value.addLayer(marker);

      //
      // coords
      //
      coords.push({
        //id: _id,
        //label: bridge.label,
        lat: lats[0],
        lon: lons[0],
      });
    } else {
      myUtils.debug() ? console.log(_id, bridge) : console.log(_id);
    }
  }

  //
  //
  //console.log("Map > setMarkers > coords", coords);
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
  if (buf.value) saveAs(new Blob([buf.value]), "bridges.xlsx");
};
/*
const updMarkers = () => {
  for (const item of markers.value) {
    //console.log(item);
    map.value.removeLayer(item.marker);

    if (opereSelezionateId.value.includes(item.id)) {
      item.marker.setStyle(circleMarkerSelected);
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
