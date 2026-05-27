<script setup lang="ts">
import { onMounted, ref, toRef, onBeforeUnmount, watch, computed } from "vue";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

// const
const color = "crimson";
const circleMarkerUnSelected = {
  color: "#696",
  fillColor: "#696",
  fillOpacity: 0.3,
  radius: 4,
};
const circleMarkerSelected = {
  color: color,
  fillColor: color,
  fillOpacity: 0.5,
  radius: 6,
};

interface Props {
  records?: any[];
  box?: any;
}
const props = withDefaults(defineProps<Props>(), {
  records: () => [],
  box: () => {
    return {
      north: 38.161, // 0.lat
      east: 14.833, // 0.lng
      south: 38.144, // 1.lat
      west: 14.822, // 1.lng
    };
  },
});

const records = toRef(props, "records");
const box = toRef(props, "box");

const refLat = computed(() => (box.value.south + box.value.north) / 2);
const refLng = computed(() => (box.value.west + box.value.east) / 2);

watch(records, async () => await setObjects(), { deep: true });

// ref
const map = ref();
const objs = ref<any[]>([]);
const myBox = ref();

onMounted(async () => {
  await initMap();
});
onBeforeUnmount(() => {
  if (map.value) map.value.remove();
});

// init map
const initMap = async () => {
  //console.log("initMap");

  //
  // map
  //
  map.value = L.map("mapContainer").setView([refLat.value, refLng.value], 7);
  L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value);
  //use a mix of renderers
  let customPane = map.value.createPane("customPane");
  L.canvas({ pane: "customPane" });
  customPane.style.zIndex = 399; // put just behind the standard overlay pane which is at 400
  //L.marker([refLat.value, refLng.value]).addTo(map.value);

  //console.log(map.value);

  // Listener click
  /*
  map.value.on("click", (e: L.LeafletMouseEvent) => {
    corner1.value = e.latlng;
    console.log("Coordinate salvate:", corner1.value.lat, corner1.value.lng);
  });
  */

  // set box
  await setBox();

  // set objs
  await setObjects();

  //console.log(records.value);
};

// set box
const setBox = async () => {
  if (myBox.value) map.value.removeLayer(myBox.value.obj);

  myBox.value = await setPolyline({
    geometry: [
      { lat: box.value.north, lng: box.value.east },
      { lat: box.value.north, lng: box.value.west },
      { lat: box.value.south, lng: box.value.west },
      { lat: box.value.south, lng: box.value.east },
      //
      { lat: box.value.north, lng: box.value.east },
    ],
  });
  //console.log(myBox);
  // add to map
  map.value.addLayer(myBox.value.obj);
  // zoom the map to the polyline
  //map.value.fitBounds(myBox.value.polyline.getBounds());
};

// remove objs
const delObjects = async () => {
  //console.log("Map > delObjects");

  for await (const item of objs.value) {
    //console.log("Map > delObjects", item);
    if (item) map.value.removeLayer(item.obj);
  }
};
// set records
const setObjects = async () => {
  //console.log("setObjects", records.value);

  await delObjects();

  objs.value = [];
  for await (const record of records.value) {
    //console.log(record);

    const { id, tags, geometry } = record;
    const isBridge: boolean =
      tags.hasOwnProperty("bridge") && tags.bridge == "yes";

    if (!isBridge) continue;

    // get nodes
    const latlngs: any[][] = [];
    for (let i = 0; i < geometry.length; i++) {
      const v = geometry[i];
      //console.log(v);
      latlngs.push([v.lat, v.lng]);
    }

    // get obj, markers
    const { obj, markers } = await setPolyline({
      geometry,
      id,
      tags,
    });

    // objs push
    objs.value.push({
      id: `${id}-obj`,
      obj: obj,
    });
    // add obj to map
    map.value.addLayer(obj);

    // markers
    for (let i = 0; i < markers.length; i++) {
      const obj = markers[i];

      // objs push
      objs.value.push({
        id: `${id}-marker`,
        obj: obj,
      });
      // add obj to map
      map.value.addLayer(obj);
    }

    //map.value.addLayer(centroidMarker);
  }
};

// set polyline
const setPolyline = async ({
  geometry,
  id,
  tags,
  //
  color,
  fillColor,
  fillOpacity,
}: {
  geometry: any[]; // {lat, lng}
  id?: string;
  tags?: any;
  //
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
}) => {
  //console.log("setPolygon");
  if (!id) id = "xxxx";
  if (!tags) tags = {};
  //
  if (!color) color = "crimson";
  if (!fillColor) fillColor = "#696";
  if (!fillOpacity) fillOpacity = 0.2;

  const latlngs: any[][] = [];
  for (let i = 0; i < geometry.length; i++) {
    const v = geometry[i];
    //console.log(v);
    latlngs.push([v.lat, v.lng]);
  }

  // create a polyline from an array of LatLng points
  const polyline: L.Polyline<any> = L.polyline(latlngs, {
    //color: color,
    //weight: 1,
    //fillColor: color,
    //fillOpacity: fillOpacity,
  });

  // markers
  const markers: any[] = [];
  for (let i = 0; i < latlngs.length; i++) {
    const latlng = latlngs[i];
    //console.log(latlng);

    const marker = L.circleMarker(
      [latlng[0], latlng[1]],
      circleMarkerUnSelected,
    );

    markers.push(marker);
  }

  return { obj: polyline, markers: markers };
};
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
