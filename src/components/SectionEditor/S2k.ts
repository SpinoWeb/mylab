// S2k.ts

import { Point2D, Section } from "@/components/MyViewer/Types";
import { mdiCylinderOff } from "@mdi/js";

// S2k
export default class S2k {
  //materials: any[];
  constructor() {
    //console.log("S2k", Materials);
    //this.materials = Materials;
  }

  /**
   * Get keys for form
   */
  getKeys = ({ Shape }: { Shape: string }) => {
    //console.log("S2k > getKeys", Shape);
    if (!Shape) return [];

    let keys: string[] = [];

    if (Shape === "Rectangular") keys = ["T2", "T3"];
    if (Shape == "Tee") keys = ["T2", "T3", "Tf", "Tw", "FilletRadius"];
    if (Shape === "I/Wide Flange")
      keys = ["T2", "T3", "Tf", "Tw", "T2b", "Tfb", "FilletRadius"];
    if (Shape == "Box/Tube") keys = ["T2", "T3", "Tf", "Tw"];

    if (Shape === "PC Conc I Girder")
      keys = ["B1", "B2", "T1", "D1", "D2", "D3", "D5", "D6"];

    if (Shape === "Circle") keys = ["T3"];
    if (Shape === "Pipe") keys = ["T3", "Tw"];

    //console.log("S2k > getKeys", keys);
    return keys;
  };

  /**
   * Generate cross-section points of polygons from s2k variables
   * svg coordinates' system
   *
   */
  getPolygons = ({
    section,
    X0,
    Y0,
  }: {
    section: Section;
    X0?: number;
    Y0?: number;
  }) => {
    //console.log("S2k > getPolygons", section);
    if (!section) return [];

    let {
      //SectionName,
      //Material,
      Shape,
      T2,
      T3,
      Tf,
      Tw,
      T2b,
      Tfb,
      FilletRadius,
    }: {
      //SectionName: string;
      //Material: string;
      Shape: string;
      T2?: number;
      T3?: number;
      Tf?: number;
      Tw?: number;
      T2b?: number;
      Tfb?: number;
      FilletRadius?: number;
    } = section;
    //console.log("S2k > getPolygons");

    if (!T2) T2 = 0.3;
    if (!T3) T3 = 0.5;
    if (!Tf) Tf = 0.1;
    if (!Tw) Tw = 0.1;
    if (!T2b) T2b = 0.3;
    if (!Tfb) Tfb = 0.1;
    if (!FilletRadius) FilletRadius = 0;

    // origin
    if (!X0) X0 = 0;
    if (!Y0) Y0 = 0;

    // counter-clockwise
    let polygons: any[] = [];

    if (Shape === "Rectangular") {
      let points: Point2D[] = [];

      points.push({ X: X0, Y: Y0 });
      points.push({ X: X0, Y: Y0 + T3 });
      points.push({ X: X0 + T2, Y: Y0 + T3 });
      points.push({ X: X0 + T2, Y: Y0 });

      //console.log("S2k > getPolygons", points);
      polygons.push({ points: points });
    }

    if (Shape == "Tee") {
      //const hw: number = T3 - Tf;
      let points: Point2D[] = [];

      points.push({ X: X0, Y: Y0 });
      points.push({ X: X0, Y: Y0 + Tf });
      points.push({ X: X0 + (T2 - Tw) / 2 - FilletRadius, Y: Y0 + Tf });
      if (FilletRadius > 0)
        points.push({ X: X0 + (T2 - Tw) / 2, Y: Y0 + Tf + FilletRadius });
      points.push({ X: X0 + (T2 - Tw) / 2, Y: Y0 + T3 });
      points.push({ X: X0 + (T2 + Tw) / 2, Y: Y0 + T3 });
      if (FilletRadius > 0)
        points.push({ X: X0 + (T2 + Tw) / 2, Y: Y0 + Tf + FilletRadius });
      points.push({ X: X0 + (T2 + Tw) / 2 + FilletRadius, Y: Y0 + Tf });
      points.push({ X: X0 + T2, Y: Y0 + Tf });
      points.push({ X: X0 + T2, Y: Y0 });

      //console.log("S2k > getPolygons", points);
      polygons.push({ points: points });
    }

    if (Shape === "I/Wide Flange") {
      //const hw: number = T3 - (Tf + Tfb);
      let points: Point2D[] = [];

      points.push({ X: X0, Y: Y0 });
      points.push({ X: X0, Y: Y0 + Tf });
      points.push({ X: X0 + (T2 - Tw) / 2 - FilletRadius, Y: Y0 + Tf });
      if (FilletRadius > 0)
        points.push({ X: X0 + (T2 - Tw) / 2, Y: Y0 + Tf + FilletRadius });

      points.push({
        X: X0 + (T2 - Tw) / 2,
        Y: Y0 + T3 - Tfb - FilletRadius,
      });
      if (FilletRadius > 0)
        points.push({
          X: X0 + (T2 - Tw) / 2 - FilletRadius,
          Y: Y0 + T3 - Tfb,
        });
      points.push({ X: X0 + (T2 - Tw) / 2 - (T2b - Tw) / 2, Y: Y0 + T3 - Tfb });
      points.push({ X: X0 + (T2 - Tw) / 2 - (T2b - Tw) / 2, Y: Y0 + T3 });
      points.push({ X: X0 + (T2 - Tw) / 2 + (T2b + Tw) / 2, Y: Y0 + T3 }); // 6
      points.push({ X: X0 + (T2 - Tw) / 2 + (T2b + Tw) / 2, Y: Y0 + T3 - Tfb }); // 7

      points.push({ X: X0 + (T2 + Tw) / 2 + FilletRadius, Y: Y0 + T3 - Tfb });
      if (FilletRadius > 0)
        points.push({ X: X0 + (T2 + Tw) / 2, Y: Y0 + T3 - Tfb - FilletRadius });
      points.push({ X: X0 + (T2 + Tw) / 2, Y: Y0 + Tf + FilletRadius });
      if (FilletRadius > 0)
        points.push({ X: X0 + (T2 + Tw) / 2 + FilletRadius, Y: Y0 + Tf });
      points.push({ X: X0 + T2, Y: Y0 + Tf });
      points.push({ X: X0 + T2, Y: Y0 });

      //console.log("S2k > getPolygons", points);
      polygons.push({ points: points });
    }

    if (Shape == "Box/Tube") {
      //const hw: number = T3 - 2 * Tf;
      let points: Point2D[] = [];

      points.push({ X: X0, Y: Y0 });
      points.push({ X: X0, Y: Y0 + T3 });
      points.push({ X: X0 + T2, Y: Y0 + T3 });
      points.push({ X: X0 + T2, Y: Y0 });

      polygons.push({ points: points });

      points = [];
      points.push({ X: X0 + Tw, Y: Y0 + Tf });
      points.push({ X: X0 + Tw, Y: Y0 + T3 - Tf });
      points.push({ X: X0 + T2 - Tw, Y: Y0 + T3 - Tf });
      points.push({ X: X0 + T2 - Tw, Y: Y0 + Tf });

      polygons.push({ points: points, fill: "#FFF", scale: 0 });
    }

    if (Shape === "Circle") {
      let points: Point2D[] = [];

      const Radius: number = T3 / 2;

      for (let q = 0; q < 360; q++) {
        const s: number = Math.sin((q * Math.PI) / 180);
        const c: number = Math.cos((q * Math.PI) / 180);

        points.push({ X: X0 + Radius * (1 + c), Y: Y0 + Radius * (1 + s) });
      }

      polygons.push({ points: points });
    }

    if (Shape === "Pipe") {
      let points: Point2D[] = [];

      const Radius3: number = T3 / 2;
      const Radius2: number = T3 / 2 - Tw;

      // counter-clockwise
      for (let q = 0; q < 360; q++) {
        const s: number = Math.sin((q * Math.PI) / 180);
        const c: number = Math.cos((q * Math.PI) / 180);

        points.push({
          X: X0 + Radius3 + Radius3 * c,
          Y: Y0 + Radius3 + Radius3 * s,
        });
      }
      polygons.push({ points: points });

      points = [];

      // clockwise
      for (let q = 360; q > 0; q--) {
        const s: number = Math.sin((q * Math.PI) / 180);
        const c: number = Math.cos((q * Math.PI) / 180);

        points.push({
          X: X0 + Radius3 + Radius2 * c,
          Y: Y0 + Radius3 + Radius2 * s,
        });
      }
      polygons.push({ points: points, fill: "#FFF", scale: 0 });
    }

    if (Shape === "PC Conc I Girder") {
      let {
        B1,
        B2,
        T1,
        D1,
        D2,
        D3,
        D5,
        D6,
      }: {
        B1?: number;
        B2?: number;
        T1?: number;
        D1?: number;
        D2?: number;
        D3?: number;
        D5?: number;
        D6?: number;
      } = section;

      if (!B1) B1 = 300;
      if (!B2) B2 = 300;
      if (!T1) T1 = 300;
      if (!D1) D1 = 300;
      if (!D2) D2 = 300;
      if (!D3) D3 = 300;
      if (!D5) D5 = 300;
      if (!D6) D6 = 300;

      //const Dw: number = D1 - (D2 + D3 + D5 + D6);
      let points: Point2D[] = [];

      points.push({ X: X0, Y: Y0 });
      points.push({ X: X0, Y: Y0 + D2 });
      points.push({ X: X0 + (B1 - T1) / 2, Y: Y0 + D2 + D3 });
      points.push({ X: X0 + (B1 - T1) / 2, Y: Y0 + D1 - D5 - D6 });
      points.push({ X: X0 + (B1 - T1) / 2 - (B2 - T1) / 2, Y: Y0 + D1 - D5 });
      points.push({ X: X0 + (B1 - T1) / 2 - (B2 - T1) / 2, Y: Y0 + D1 });
      points.push({ X: X0 + (B1 - T1) / 2 + (B2 + T1) / 2, Y: Y0 + D1 });
      points.push({ X: X0 + (B1 - T1) / 2 + (B2 + T1) / 2, Y: Y0 + D1 - D5 });
      points.push({ X: X0 + (B1 + T1) / 2, Y: Y0 + D1 - D5 - D6 });
      points.push({ X: X0 + (B1 + T1) / 2, Y: Y0 + D2 + D3 });
      points.push({ X: X0 + B1, Y: Y0 + D2 });
      points.push({ X: X0 + B1, Y: Y0 });

      polygons.push({ points: points });
    }

    //console.log("S2k > getPolygons", polygons);
    return polygons;
  };

  /**
   * get polygon limits
   *
   */
  getPolygonLimits = (points: Point2D[] = []) => {
    //console.log("getPolygonLimits > points", points);

    const x: number[] = points.map((p: Point2D) => p.X);
    //console.log("getPolygonLimits > x", x);
    const y: number[] = points.map((p: Point2D) => p.Y);
    //console.log("getPolygonLimits > y", y);

    const xMin: number = Math.min.apply(Math, x);
    const yMin: number = Math.min.apply(Math, y);
    //console.log("getPolygonLimits > yMin", yMin);
    const xMax: number = Math.max.apply(Math, x);
    const yMax: number = Math.max.apply(Math, y);
    //console.log("getPolygonLimits > yMax", yMax);

    return { xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax };
  };

  /*
   * get polygon properties
   *
   */
  getPolygonProperties = (points: Point2D[] = []) => {
    //console.log("S2k > getPolygonProperties", points);

    // --- Calculation Logic ---

    //let centroid = { x:0, y: 0 };
    let area: number = 0.0,
      cX: number = 0.0,
      cY: number = 0.0,
      ix_origin: number = 0.0,
      iy_origin: number = 0.0,
      ixy_origin: number = 0.0;

    try {
      const n: number = points.length;

      for (let i = 0; i < n; i++) {
        const p1: Point2D = points[i];
        const p2: Point2D = points[(i + 1) % n];
        const crossProduct: number = p1.X * p2.Y - p2.X * p1.Y;
        area += crossProduct;
        cX += (p1.X + p2.X) * crossProduct;
        cY += (p1.Y + p2.Y) * crossProduct;
        ix_origin += (p1.Y * p1.Y + p1.Y * p2.Y + p2.Y * p2.Y) * crossProduct;
        iy_origin += (p1.X * p1.X + p1.X * p2.X + p2.X * p2.X) * crossProduct;
        ixy_origin +=
          (p1.X * p2.Y + 2 * p1.X * p1.Y + 2 * p2.X * p2.Y + p2.X * p1.Y) *
          crossProduct;
      }
      //area *= 0.5;
      /*
        if (Math.abs(area) < 1e-10) {
          //this.showError(     "L'area calcolata è zero o quasi zero. Controllare i punti."        );
          return;
        }
        */

      //
      // qui serve il < 0 perchè alcuni poligoni arrivano in senso anti-orario
      // bisogna capire quali
      //
      if (area < 0) {
        area *= -0.5;

        cX /= -6.0 * area;
        cY /= -6.0 * area;
        ix_origin /= -12.0;
        iy_origin /= -12.0;
        ixy_origin /= -24.0;
      } else {
        area *= 0.5;

        cX /= 6.0 * area;
        cY /= 6.0 * area;
        ix_origin /= 12.0;
        iy_origin /= 12.0;
        ixy_origin /= 24.0;
      }

      const ix: number = ix_origin - area * cY * cY;
      const iy: number = iy_origin - area * cX * cX;
      const ixy: number = ixy_origin - area * cX * cY;
      const avg_i: number = (ix + iy) / 2.0;
      const diff_i: number = (ix - iy) / 2.0;
      const R: number = Math.sqrt(diff_i * diff_i + ixy * ixy);
      const i1: number = avg_i + R;
      const i2: number = avg_i - R;
      let theta_p_rad: number = 0.5 * Math.atan2(-2 * ixy, ix - iy);
      let theta_p_deg: number = theta_p_rad * (180 / Math.PI);
      const rx: number = Math.sqrt(Math.abs(ix / area));
      const ry: number = Math.sqrt(Math.abs(iy / area));
      // --- End Calculation Logic ---

      //console.log("Retrofit > getPolygonProperties", cx, cy);

      // limits
      const {
        xMin,
        xMax,
        yMin,
        yMax,
      }: { xMin: number; xMax: number; yMin: number; yMax: number } =
        this.getPolygonLimits(points);
      //console.log("Retrofit > getPolygonProperties", xMin, xMax, yMin, yMax );

      return {
        centroid: { X: cX, Y: cY },
        area: area,
        //cx: cx,
        //cy: cy,
        ix_origin: ix_origin,
        iy_origin: iy_origin,
        ixy_origin: ixy_origin,
        ix: ix,
        iy: iy,
        ixy: ixy,
        // limits
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax,
      };
    } catch (err) {
      // catch
      console.error("S2k > getPolygonProperties > err:", err);
      return {};
    } finally {
      // finally
    }
  };

  /*
   * get polygons properties
   *
   */
  getPolygonsProperties = (polygons: any[] = []) => {
    // --- Calculation Logic ---
    let area: number = 0,
      centroid: Point2D = { X: 0, Y: 0 },
      cX: number = 0,
      cY: number = 0,
      ix_origin: number = 0,
      iy_origin: number = 0,
      ixy_origin: number = 0;

    try {
      // init limits
      let {
        xMin,
        xMax,
        yMin,
        yMax,
      }: { xMin: number; xMax: number; yMin: number; yMax: number } = {
        xMin: Number.MAX_VALUE,
        xMax: -Number.MAX_VALUE,
        yMin: Number.MAX_VALUE,
        yMax: -Number.MAX_VALUE,
      };

      for (const polygon of polygons) {
        const scale: number = polygon.hasOwnProperty("scale")
          ? polygon.scale
          : 1;
        const props: any | undefined = this.getPolygonProperties(
          polygon.points,
        );
        //console.log("getPolygonsProperties > props", props.centroid);
        if (props === undefined) continue;

        area += scale * props.hasOwnProperty("area") ? props.area : 0;
        cX +=
          props.hasOwnProperty("area") && props.centroid.hasOwnProperty("X")
            ? scale * props.area * props.centroid.X
            : 0;
        cY +=
          props.hasOwnProperty("area") && props.centroid.hasOwnProperty("Y")
            ? scale * props.area * props.centroid.Y
            : 0;
        ix_origin +=
          scale * props.hasOwnProperty("ix_origin") ? props.ix_origin : 0;
        //props.area * props.centroid.y * props.centroid.y;
        iy_origin +=
          scale * props.hasOwnProperty("iy_origin") ? props.iy_origin : 0;
        //props.area * props.centroid.x * props.centroid.x;
        ixy_origin +=
          scale * props.hasOwnProperty("ixy_origin") ? props.ixy_origin : 0;
        //props.area * props.centroid.y * props.centroid.x;

        // limits
        if (props.xMin < xMin) xMin = props.xMin;
        if (props.xMax > xMax) xMax = props.xMax;
        if (props.yMin < yMin) yMin = props.yMin;
        if (props.yMax > yMax) yMax = props.yMax;
      }

      cX /= area;
      cY /= area;
      centroid = { X: cX, Y: cY };

      return {
        area: area,
        centroid: centroid,
        //cX: cX,
        //cX: cX,
        ix_origin: ix_origin,
        iy_origin: iy_origin,
        ixy_origin: ixy_origin,
        ix: ix_origin - area * cY * cY,
        iy: iy_origin - area * cX * cX,
        ixy: ixy_origin - area * cY * cX,
        // limits
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax,
      };
    } catch (err) {
      console.error("S2k > getPolygonsProperties > err:", err);
      return { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
    }
  };

  /**
   * Generate quotes of polygons from s2k variables
   * svg coordinates' system
   *
   */
  getQuotes = ({
    section,
    X0,
    Y0,
    delta,
  }: {
    section: Section;
    X0?: number;
    Y0?: number;
    delta?: number;
  }) => {
    //console.log("S2k > getQuotes", section);
    if (!section) return [];

    let {
      Shape,
      T2,
      T3,
      Tf,
      Tw,
      T2b,
      Tfb,
      FilletRadius,
    }: {
      Shape: string;
      T2?: number;
      T3?: number;
      Tf?: number;
      Tw?: number;
      T2b?: number;
      Tfb?: number;
      FilletRadius?: number;
    } = section;
    //console.log("S2k > getPolygons");

    if (!T2) T2 = 0.3;
    if (!T3) T3 = 0.5;
    if (!Tf) Tf = 0.1;
    if (!Tw) Tw = 0.1;
    if (!T2b) T2b = 0.3;
    if (!Tfb) Tfb = 0.1;
    if (!FilletRadius) FilletRadius = 0;

    // origin
    if (!X0) X0 = 0;
    if (!Y0) Y0 = 0;

    // delta
    if (!delta) delta = 0;

    // counter-clockwise
    let quotes: any[] = [];

    if (Shape === "Rectangular") {
      quotes.push({
        X: X0 + T2 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `T2 = ${T2} m`,
      });
      quotes.push({
        X: X0 - delta,
        Y: Y0 + T3 / 2,
        angle: -90,
        txt: `T3 = ${T3} m`,
      });
    }

    if (Shape == "Tee") {
      quotes.push({
        X: X0 + T2 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `T2 = ${T2} m`,
      });
      quotes.push({
        X: X0 - delta,
        Y: Y0 + T3 / 2,
        angle: -90,
        txt: `T3 = ${T3} m`,
      });

      quotes.push({
        X: X0 + T2 / 2,
        Y: Y0 + T3 + (3 * delta) / 2,
        angle: 0,
        txt: `Tw = ${Tw} m`,
      });
      quotes.push({
        X: X0 + T2 + (3 * delta) / 2,
        Y: Y0 + Tf / 2,
        angle: -90,
        txt: `Tf = ${Tf} m`,
      });
    }

    if (Shape === "I/Wide Flange") {
      quotes.push({
        X: X0 + Math.max(T2, T2b) / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `T2 = ${T2} m`,
      });
      quotes.push({
        X: X0 - delta,
        Y: Y0 + T3 / 2,
        angle: -90,
        txt: `T3 = ${T3} m`,
      });
      quotes.push({
        X: X0 + Math.max(T2, T2b) + (3 * delta) / 2,
        Y: Y0 + Tf / 2,
        angle: -90,
        txt: `Tf = ${Tf} m`,
      });

      quotes.push({
        X: X0 + Math.max(T2, T2b) / 2,
        Y: Y0 + T3 / 2,
        angle: 0,
        txt: `Tw = ${Tw} m`,
      });

      quotes.push({
        X: X0 + Math.max(T2, T2b) / 2,
        Y: Y0 + T3 + (3 * delta) / 2,
        angle: 0,
        txt: `T2b = ${T2b} m`,
      });
      quotes.push({
        X: X0 + Math.max(T2, T2b) + (3 * delta) / 2,
        Y: Y0 + T3 - Tfb / 2,
        angle: -90,
        txt: `Tfb = ${Tfb} m`,
      });
    }

    if (Shape == "Box/Tube") {
      quotes.push({
        X: X0 + T2 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `T2 = ${T2} m`,
      });
      quotes.push({
        X: X0 - delta,
        Y: Y0 + T3 / 2,
        angle: -90,
        txt: `T3 = ${T3} m`,
      });
      quotes.push({
        X: X0 + T2 + (3 * delta) / 2,
        Y: Y0 + Tf / 2,
        angle: -90,
        txt: `Tf = ${Tf} m`,
      });
      quotes.push({
        X: X0 + T2 - Tw / 2,
        Y: Y0 + T3 + (3 * delta) / 2,
        angle: 0,
        txt: `Tw = ${Tw} m`,
      });
    }

    if (Shape === "Circle") {
      quotes.push({
        X: X0 + T3 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `T3 = ${T3} m`,
      });
    }

    if (Shape === "Pipe") {
      quotes.push({
        X: X0 + T3 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `T3 = ${T3} m`,
      });
      quotes.push({
        X: X0 + T3 + (3 * delta) / 2,
        Y: Y0 + Tw / 2,
        angle: -90,
        txt: `Tw = ${Tw} m`,
      });
    }

    if (Shape === "PC Conc I Girder") {
      let {
        B1,
        B2,
        T1,
        D1,
        D2,
        D3,
        D5,
        D6,
      }: {
        B1?: number;
        B2?: number;
        T1?: number;
        D1?: number;
        D2?: number;
        D3?: number;
        D5?: number;
        D6?: number;
      } = section;

      if (!B1) B1 = 0.3;
      if (!B2) B2 = 0.3;
      if (!T1) T1 = 0.3;
      if (!D1) D1 = 0.3;
      if (!D2) D2 = 0.3;
      if (!D3) D3 = 0.3;
      if (!D5) D5 = 0.3;
      if (!D6) D6 = 0.3;

      //const Dw: number = D1 - (D2 + D3 + D5 + D6);
      let points: Point2D[] = [];

      points.push({ X: X0, Y: Y0 });
      points.push({ X: X0, Y: Y0 + D2 });
      points.push({ X: X0 + (B1 - T1) / 2, Y: Y0 + D2 + D3 });
      points.push({ X: X0 + (B1 - T1) / 2, Y: Y0 + D1 - D5 - D6 });
      points.push({ X: X0 + (B1 - T1) / 2 - (B2 - T1) / 2, Y: Y0 + D1 - D5 });
      points.push({ X: X0 + (B1 - T1) / 2 - (B2 - T1) / 2, Y: Y0 + D1 });
      points.push({ X: X0 + (B1 - T1) / 2 + (B2 + T1) / 2, Y: Y0 + D1 });
      points.push({ X: X0 + (B1 - T1) / 2 + (B2 + T1) / 2, Y: Y0 + D1 - D5 });
      points.push({ X: X0 + (B1 + T1) / 2, Y: Y0 + D1 - D5 - D6 });
      points.push({ X: X0 + (B1 + T1) / 2, Y: Y0 + D2 + D3 });
      points.push({ X: X0 + B1, Y: Y0 + D2 });
      points.push({ X: X0 + B1, Y: Y0 });

      //polygons.push({ points: points });

      quotes.push({
        X: X0 + B1 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `B1 = ${B1} m`,
      });
      quotes.push({
        X: X0 + B1 / 2,
        Y: Y0 + D1 / 2,
        angle: 0,
        txt: `T1 = ${T1} m`,
      });
      quotes.push({
        X: X0 + B1 / 2,
        Y: Y0 + D1 + (3 * delta) / 2,
        angle: 0,
        txt: `B2 = ${B2} m`,
      });

      quotes.push({
        X: X0 - delta,
        Y: Y0 + D1 / 2,
        angle: -90,
        txt: `D1 = ${D1} m`,
      });
      quotes.push({
        X: X0 + B1 + (3 * delta) / 2,
        Y: Y0 + D2 / 2,
        angle: -90,
        txt: `D2 = ${D2} m`,
      });
      quotes.push({
        X: X0 + B1 + (3 * delta) / 2,
        Y: Y0 + D1 - D5 / 2,
        angle: -90,
        txt: `D5 = ${D5} m`,
      });
    }

    //console.log("S2k > getQuotes", quotes);
    return quotes;
  };
}
