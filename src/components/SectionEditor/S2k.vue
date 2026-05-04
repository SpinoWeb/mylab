<script setup lang="ts">
import { toRef, onMounted, watch, computed } from "vue";

import Stirrup from "./Stirrup.vue";

import type { Rebar, Point2D } from "../Types";

import { useElement } from "./useElement";
import { S2k } from "../Retrofit/Retrofit";
const s2k: S2k = new S2k();

const emit = defineEmits(["update:modelValue"]);

// props
interface Props {
  modelValue?: any;
  options?: any;
  selected?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => {},
  options: () => {},
});

// toRef
const element = toRef(props, "modelValue");
const options = toRef(props, "options");

// onMounted
onMounted(() => useElement(element.value, options.value)); // composable
watch(element, () => useElement(element.value, options.value)); // composable

// watch params
const params = computed(() => {
  return {
    x: element.value.x,
    y: element.value.y,
    //
    Shape: element.value.Shape,
    t2: element.value.t2,
    t3: element.value.t3,
    //
    tf: element.value.tf,
    tw: element.value.tw,
    FilletRadius: element.value.FilletRadius,
    //
    t2b: element.value.t2b,
    tfb: element.value.tfb,
    //
    RebarMatL: element.value.RebarMatL,
    BarSizeL: element.value.BarSizeL,
    TopCover: element.value.TopCover,
    TopRebarNumber: element.value.TopRebarNumber,
    TopRebarArea: element.value.TopRebarArea,
    BottomCover: element.value.BottomCover,
    BotRebarNumber: element.value.BotRebarNumber,
    BotRebarArea: element.value.BotRebarArea,
    //
    RebarMatC: element.value.RebarMatC,
    BarSizeC: element.value.BarSizeC,
    SpacingC: element.value.SpacingC,
    //
    NumBars2Dir: element.value.NumBars2Dir,
    NumBars3Dir: element.value.NumBars3Dir,
  };
});
watch(params, () =>
  Object.assign(element.value, s2k.getProperties(element.value)),
);

// Polygons
const Polygons = computed(() => s2k.getPolygons(element.value));

// Rebars
const Rebars = computed(() =>
  s2k.getRebars(element.value).map((i: Rebar) =>
    Object.assign(i, {
      r: Math.sqrt(i.a / Math.PI),
      fill: element.value.hasOwnProperty("fillRebarMatL")
        ? element.value.fillRebarMatL
        : "none",
    }),
  ),
);

// Stirrups
const Stirrups = computed(() => {
  //console.log("S2k > MyStirrup");

  const strokeRebarMatC: string = element.value.hasOwnProperty(
    "strokeRebarMatC",
  )
    ? element.value.strokeRebarMatC
    : "000";
  //console.log("MyStirrup > strokeRebarMatC", strokeRebarMatC);

  //const stroke: string = "000";
  const strokeWidth: number = element.value.hasOwnProperty("BarSizeC")
    ? element.value.BarSizeC
    : 1;

  const t2: number = element.value.t2;
  const t3: number = element.value.t3;
  //console.log("MyStirrup", t2, t3);
  const tw: number = "tw" in element.value ? element.value.tw : 0;
  const tf: number = "tf" in element.value ? element.value.tf : 0;
  //
  const BarSizeC: number = element.value.hasOwnProperty("BarSizeC")
    ? element.value.BarSizeC
    : 1;

  const TopRebarRadius: number = Math.sqrt(
    element.value.TopRebarArea / Math.PI,
  );
  const BotRebarRadius: number = Math.sqrt(
    element.value.BotRebarArea / Math.PI,
  );

  const TopCover: number = element.value.TopCover;
  const BotCover: number = element.value.BotCover;
  const Cover: number =
    element.value.ConcBeamCol === "Beam"
      ? Math.min(TopCover, BotCover)
      : element.value.Cover;
  const Radius: number =
    element.value.ConcBeamCol === "Beam"
      ? Math.max(TopRebarRadius, BotRebarRadius)
      : element.value.BarSizeL;

  //
  let MyStirrups: any[] = [];

  // Beam
  if (element.value.ConcBeamCol === "Beam") {
    // Rectangular
    if (element.value.Shape === "Rectangular")
      MyStirrups.push({
        x: element.value.x,
        y: element.value.y,
        //
        x0: Cover + BarSizeC + Radius - BarSizeC / 2,
        y0: TopCover + BarSizeC - BarSizeC / 2, // Beam or Column
        h: t2 - 2 * Cover - 2 * BarSizeC - 2 * Radius + BarSizeC,
        v: t3 - TopCover - BotCover - 2 * BarSizeC - 2 * Radius + BarSizeC, // Beam or Column
        rt: Radius,
        rb: Radius,
        //
        stroke: strokeRebarMatC,
        strokeWidth: strokeWidth,
      });

    // Tee
    if (["Tee", "I/Wide Flange"].includes(element.value.Shape))
      MyStirrups.push({
        x: element.value.x,
        y: element.value.y,
        //
        x0: (t2 - tw) / 2 + Cover + BarSizeC + Radius - BarSizeC / 2,
        y0: TopCover + BarSizeC - BarSizeC / 2, // Beam or Column
        h: tw - 2 * Cover - 2 * BarSizeC - 2 * Radius + BarSizeC,
        v: t3 - TopCover - BotCover - 2 * BarSizeC - 2 * Radius + BarSizeC, // Beam or Column
        rt: Radius,
        rb: Radius,
        //
        stroke: strokeRebarMatC,
        strokeWidth: strokeWidth,
      });
  }

  // Column
  if (element.value.ConcBeamCol === "Column") {
    // Rectangular
    if (element.value.Shape === "Rectangular")
      MyStirrups.push({
        x: element.value.x,
        y: element.value.y,
        //
        x0: Cover + BarSizeC + Radius - BarSizeC / 2,
        y0: Cover + BarSizeC - BarSizeC / 2, // Beam or Column
        h: t2 - 2 * Cover - 2 * BarSizeC - 2 * Radius + BarSizeC,
        v: t3 - 2 * Cover - 2 * BarSizeC - 2 * Radius + BarSizeC, // Beam or Column
        rt: Radius,
        rb: Radius,
        //
        stroke: strokeRebarMatC,
        strokeWidth: strokeWidth,
      });

    // Box/Tube
    if (element.value.Shape === "Box/Tube") {
      // top
      MyStirrups.push({
        x: element.value.x,
        y: element.value.y,
        //
        x0: Cover + BarSizeC + Radius - BarSizeC / 2,
        y0: Cover + BarSizeC - BarSizeC / 2, // Beam or Column
        h: t2 - 2 * Cover - 2 * BarSizeC - 2 * Radius + BarSizeC,
        v: tf - 2 * Cover - 2 * BarSizeC - 2 * Radius + BarSizeC, // Beam or Column
        rt: Radius,
        rb: Radius,
        //
        stroke: strokeRebarMatC,
        strokeWidth: strokeWidth,
      });

      // bottom
      MyStirrups.push({
        x: element.value.x,
        y: element.value.y,
        //
        x0: Cover + BarSizeC + Radius - BarSizeC / 2,
        y0: t3 - tf + Cover + BarSizeC - BarSizeC / 2, // Beam or Column
        h: t2 - 2 * Cover - 2 * BarSizeC - 2 * Radius + BarSizeC,
        v: tf - 2 * Cover - 2 * BarSizeC - 2 * Radius + BarSizeC, // Beam or Column
        rt: Radius,
        rb: Radius,
        //
        stroke: strokeRebarMatC,
        strokeWidth: strokeWidth,
      });

      // left
      MyStirrups.push({
        x: element.value.x,
        y: element.value.y,
        //
        x0: Cover + BarSizeC + Radius - BarSizeC / 2,
        y0: Cover + BarSizeC - BarSizeC / 2, // Beam or Column
        h: tw - 2 * Cover - 2 * BarSizeC - 2 * Radius + BarSizeC,
        v: t3 - 2 * Cover - 2 * BarSizeC - 2 * Radius + BarSizeC, // Beam or Column
        rt: Radius,
        rb: Radius,
        //
        stroke: strokeRebarMatC,
        strokeWidth: strokeWidth,
      });

      // right
      MyStirrups.push({
        x: element.value.x,
        y: element.value.y,
        //
        x0: t2 - tw + Cover + BarSizeC + Radius - BarSizeC / 2,
        y0: Cover + BarSizeC - BarSizeC / 2, // Beam or Column
        h: tw - 2 * Cover - 2 * BarSizeC - 2 * Radius + BarSizeC,
        v: t3 - 2 * Cover - 2 * BarSizeC - 2 * Radius + BarSizeC, // Beam or Column
        rt: Radius,
        rb: Radius,
        //
        stroke: strokeRebarMatC,
        strokeWidth: strokeWidth,
      });
    }

    // Circle
    if (element.value.Shape === "Circle")
      MyStirrups.push({
        shape: "circular",
        x: element.value.x,
        y: element.value.y,
        //
        x0: Cover + BarSizeC / 2,
        y0: t3 / 2,
        rh: t3 / 2 - Cover - BarSizeC / 2,
        rv: t3 / 2 - Cover - BarSizeC / 2,
        //
        stroke: strokeRebarMatC,
        strokeWidth: strokeWidth,
      });

    // Pipe
    if (element.value.Shape === "Pipe") {
      MyStirrups.push({
        shape: "circular",
        x: element.value.x,
        y: element.value.y,
        //
        x0: Cover + BarSizeC / 2,
        y0: t3 / 2,
        rh: t3 / 2 - Cover - BarSizeC / 2,
        rv: t3 / 2 - Cover - BarSizeC / 2,
        //
        stroke: strokeRebarMatC,
        strokeWidth: strokeWidth,
      });

      MyStirrups.push({
        shape: "circular",
        x: element.value.x,
        y: element.value.y,
        //
        x0: tw - Cover - BarSizeC,
        y0: t3 / 2,
        rh: t3 / 2 - tw + Cover + BarSizeC,
        rv: t3 / 2 - tw + Cover + BarSizeC,
        //
        stroke: strokeRebarMatC,
        strokeWidth: strokeWidth,
      });
    }
  }

  //console.log("S2k > MyStirrup", MyStirrup);
  return MyStirrups;
});
</script>

<template>
  <g :id="element.id">
    <!-- Concrete -->
    <polygon
      v-for="(i, index) in Polygons"
      :key="index"
      :points="i.points.map((j: Point2D) => `${j.X},${j.Y}`).join(' ')"
      :fill="
        i.hasOwnProperty('fill')
          ? `#${i.fill}`
          : element.hasOwnProperty('fill')
            ? `#${element.fill}`
            : '#000'
      "
      :fill-opacity="
        element.hasOwnProperty('fillOpacity') ? element.fillOpacity : 1
      "
      :stroke="element.hasOwnProperty('stroke') ? `#${element.stroke}` : '#000'"
      :stroke-width="
        element.hasOwnProperty('strokeWidth') ? element.strokeWidth : 1
      "
    />

    <!-- Stirrups -->
    <Stirrup
      v-for="(i, index) in Stirrups"
      v-model="Stirrups[index]"
      :options="options"
    />

    <!-- Rebars -->
    <circle
      v-for="i in Rebars"
      :cx="i.x"
      :cy="i.y"
      :r="i.r"
      :fill="i.hasOwnProperty('fill') ? `#${i.fill}` : '#000'"
      :stroke="i.hasOwnProperty('stroke') ? `#${i.stroke}` : '#000'"
      :stroke-width="i.hasOwnProperty('strokeWidth') ? i.strokeWidth : 1"
    />

    <!-- Centroid -->
    <circle
      v-if="element.selected && element.hasOwnProperty('centroid')"
      :cx="element.centroid.x"
      :cy="element.centroid.y"
      r="3"
      stroke="#000"
      :fill="element.hasOwnProperty('fill') ? `#${element.fill}` : 'none'"
    />

    <!-- Handle -->
    <!--
    <Handle
      v-if="element.selected"
      v-model:x="se_x"
      v-model:y="se_y"
      :options="options"
    />
    -->
  </g>
</template>
