// myS2k.ts

import { Point2D, Section } from "./Types";

// S2k
export const myS2k = {
  /**
   * Get keys for form
   */
  getKeys({ Shape }: { Shape: string }) {
    //console.log("getKeys", Shape);
    if (!Shape) return [];

    let keys: string[] = [];

    if (Shape === "Rectangular") keys = ["t2", "t3"];
    if (Shape == "Tee") keys = ["t2", "t3", "tf", "tw", "FilletRadius"];
    if (Shape === "I/Wide Flange")
      keys = ["t2", "t3", "tf", "tw", "t2b", "tfb", "FilletRadius"];
    if (Shape == "Box/Tube") keys = ["t2", "t3", "tf", "tw"];

    if (Shape === "PC Conc I Girder")
      keys = ["B1", "B2", "T1", "D1", "D2", "D3", "D5", "D6"];

    if (Shape === "Circle") keys = ["t3"];
    if (Shape === "Pipe") keys = ["t3", "tw"];

    //console.log("S2k > getKeys", keys);
    return keys;
  },

  /**
   * Generate cross-section points of polygons from s2k variables
   * svg coordinates' system
   *
   */
  getPolygons({
    section,
    X0,
    Y0,
  }: {
    section: Section;
    X0?: number;
    Y0?: number;
  }) {
    //console.log("getPolygons", section);
    if (!section) return [];

    let {
      //SectionName,
      //Material,
      Shape,
      t2,
      t3,
      tf,
      tw,
      t2b,
      tfb,
      FilletRadius,
    }: {
      //SectionName: string;
      //Material: string;
      Shape: string;
      t2?: number;
      t3?: number;
      tf?: number;
      tw?: number;
      t2b?: number;
      tfb?: number;
      FilletRadius?: number;
    } = section;
    //console.log("S2k > getPolygons");

    if (!t2) t2 = 0.3;
    if (!t3) t3 = 0.5;
    if (!tf) tf = 0.1;
    if (!tw) tw = 0.1;
    if (!t2b) t2b = 0.3;
    if (!tfb) tfb = 0.1;
    if (!FilletRadius) FilletRadius = 0;

    // origin
    if (!X0) X0 = 0;
    if (!Y0) Y0 = 0;

    // counter-clockwise
    let polygons: any[] = [];

    if (Shape === "Rectangular") {
      let points: Point2D[] = [];

      points.push({ X: X0, Y: Y0 });
      points.push({ X: X0, Y: Y0 + t3 });
      points.push({ X: X0 + t2, Y: Y0 + t3 });
      points.push({ X: X0 + t2, Y: Y0 });

      //console.log("S2k > getPolygons", points);
      polygons.push({ points: points });
    }

    if (Shape == "Tee") {
      //const hw: number = t3 - tf;
      let points: Point2D[] = [];

      points.push({ X: X0, Y: Y0 });
      points.push({ X: X0, Y: Y0 + tf });
      points.push({ X: X0 + (t2 - tw) / 2 - FilletRadius, Y: Y0 + tf });
      if (FilletRadius > 0)
        points.push({ X: X0 + (t2 - tw) / 2, Y: Y0 + tf + FilletRadius });
      points.push({ X: X0 + (t2 - tw) / 2, Y: Y0 + t3 });
      points.push({ X: X0 + (t2 + tw) / 2, Y: Y0 + t3 });
      if (FilletRadius > 0)
        points.push({ X: X0 + (t2 + tw) / 2, Y: Y0 + tf + FilletRadius });
      points.push({ X: X0 + (t2 + tw) / 2 + FilletRadius, Y: Y0 + tf });
      points.push({ X: X0 + t2, Y: Y0 + tf });
      points.push({ X: X0 + t2, Y: Y0 });

      //console.log("S2k > getPolygons", points);
      polygons.push({ points: points });
    }

    if (Shape === "I/Wide Flange") {
      //const hw: number = t3 - (tf + tfb);
      let points: Point2D[] = [];

      points.push({ X: X0, Y: Y0 });
      points.push({ X: X0, Y: Y0 + tf });
      points.push({ X: X0 + (t2 - tw) / 2 - FilletRadius, Y: Y0 + tf });
      if (FilletRadius > 0)
        points.push({ X: X0 + (t2 - tw) / 2, Y: Y0 + tf + FilletRadius });

      points.push({
        X: X0 + (t2 - tw) / 2,
        Y: Y0 + t3 - tfb - FilletRadius,
      });
      if (FilletRadius > 0)
        points.push({
          X: X0 + (t2 - tw) / 2 - FilletRadius,
          Y: Y0 + t3 - tfb,
        });
      points.push({ X: X0 + (t2 - tw) / 2 - (t2b - tw) / 2, Y: Y0 + t3 - tfb });
      points.push({ X: X0 + (t2 - tw) / 2 - (t2b - tw) / 2, Y: Y0 + t3 });
      points.push({ X: X0 + (t2 - tw) / 2 + (t2b + tw) / 2, Y: Y0 + t3 }); // 6
      points.push({ X: X0 + (t2 - tw) / 2 + (t2b + tw) / 2, Y: Y0 + t3 - tfb }); // 7

      points.push({ X: X0 + (t2 + tw) / 2 + FilletRadius, Y: Y0 + t3 - tfb });
      if (FilletRadius > 0)
        points.push({ X: X0 + (t2 + tw) / 2, Y: Y0 + t3 - tfb - FilletRadius });
      points.push({ X: X0 + (t2 + tw) / 2, Y: Y0 + tf + FilletRadius });
      if (FilletRadius > 0)
        points.push({ X: X0 + (t2 + tw) / 2 + FilletRadius, Y: Y0 + tf });
      points.push({ X: X0 + t2, Y: Y0 + tf });
      points.push({ X: X0 + t2, Y: Y0 });

      //console.log("S2k > getPolygons", points);
      polygons.push({ points: points });
    }

    if (Shape == "Box/Tube") {
      //const hw: number = t3 - 2 * tf;
      let points: Point2D[] = [];

      points.push({ X: X0, Y: Y0 });
      points.push({ X: X0, Y: Y0 + t3 });
      points.push({ X: X0 + t2, Y: Y0 + t3 });
      points.push({ X: X0 + t2, Y: Y0 });

      polygons.push({ points: points });

      points = [];
      points.push({ X: X0 + tw, Y: Y0 + tf });
      points.push({ X: X0 + tw, Y: Y0 + t3 - tf });
      points.push({ X: X0 + t2 - tw, Y: Y0 + t3 - tf });
      points.push({ X: X0 + t2 - tw, Y: Y0 + tf });

      polygons.push({ points: points, fill: "#FFF", scale: 0 });
    }

    if (Shape === "Circle") {
      let points: Point2D[] = [];

      const Radius: number = t3 / 2;

      for (let q = 0; q < 360; q++) {
        const s: number = Math.sin((q * Math.PI) / 180);
        const c: number = Math.cos((q * Math.PI) / 180);

        points.push({ X: X0 + Radius * (1 + c), Y: Y0 + Radius * (1 + s) });
      }

      polygons.push({ points: points });
    }

    if (Shape === "Pipe") {
      let points: Point2D[] = [];

      const Radius3: number = t3 / 2;
      const Radius2: number = t3 / 2 - tw;

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
  },

  /**
   * get polygon limits
   *
   */
  getPolygonLimits(points: Point2D[] = []) {
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
  },

  /*
   * get polygon properties
   *
   */
  getPolygonProperties(points: Point2D[] = []) {
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
  },

  /*
   * get polygons properties
   *
   */
  getPolygonsProperties(polygons: any[] = []) {
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
      console.error("myS2k > getPolygonsProperties > err:", err);
      return { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
    }
  },

  /**
   * Generate quotes of polygons from s2k variables
   * svg coordinates' system
   *
   */
  getQuotes({
    section,
    X0,
    Y0,
    delta,
  }: {
    section: Section;
    X0?: number;
    Y0?: number;
    delta?: number;
  }) {
    //console.log("S2k > getQuotes", section);
    if (!section) return [];

    let {
      Shape,
      t2,
      t3,
      tf,
      tw,
      t2b,
      tfb,
      FilletRadius,
    }: {
      Shape: string;
      t2?: number;
      t3?: number;
      tf?: number;
      tw?: number;
      t2b?: number;
      tfb?: number;
      FilletRadius?: number;
    } = section;
    //console.log("S2k > getPolygons");

    if (!t2) t2 = 0.3;
    if (!t3) t3 = 0.5;
    if (!tf) tf = 0.1;
    if (!tw) tw = 0.1;
    if (!t2b) t2b = 0.3;
    if (!tfb) tfb = 0.1;
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
        X: X0 + t2 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `t2 = ${t2} m`,
      });
      quotes.push({
        X: X0 - delta,
        Y: Y0 + t3 / 2,
        angle: -90,
        txt: `t3 = ${t3} m`,
      });
    }

    if (Shape == "Tee") {
      quotes.push({
        X: X0 + t2 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `t2 = ${t2} m`,
      });
      quotes.push({
        X: X0 - delta,
        Y: Y0 + t3 / 2,
        angle: -90,
        txt: `t3 = ${t3} m`,
      });

      quotes.push({
        X: X0 + t2 / 2,
        Y: Y0 + t3 + (3 * delta) / 2,
        angle: 0,
        txt: `tw = ${tw} m`,
      });
      quotes.push({
        X: X0 + t2 + (3 * delta) / 2,
        Y: Y0 + tf / 2,
        angle: -90,
        txt: `tf = ${tf} m`,
      });
    }

    if (Shape === "I/Wide Flange") {
      quotes.push({
        X: X0 + Math.max(t2, t2b) / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `t2 = ${t2} m`,
      });
      quotes.push({
        X: X0 - delta,
        Y: Y0 + t3 / 2,
        angle: -90,
        txt: `t3 = ${t3} m`,
      });
      quotes.push({
        X: X0 + Math.max(t2, t2b) + (3 * delta) / 2,
        Y: Y0 + tf / 2,
        angle: -90,
        txt: `tf = ${tf} m`,
      });

      quotes.push({
        X: X0 + Math.max(t2, t2b) / 2,
        Y: Y0 + t3 / 2,
        angle: 0,
        txt: `tw = ${tw} m`,
      });

      quotes.push({
        X: X0 + Math.max(t2, t2b) / 2,
        Y: Y0 + t3 + (3 * delta) / 2,
        angle: 0,
        txt: `t2b = ${t2b} m`,
      });
      quotes.push({
        X: X0 + Math.max(t2, t2b) + (3 * delta) / 2,
        Y: Y0 + t3 - tfb / 2,
        angle: -90,
        txt: `tfb = ${tfb} m`,
      });
    }

    if (Shape == "Box/Tube") {
      quotes.push({
        X: X0 + t2 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `t2 = ${t2} m`,
      });
      quotes.push({
        X: X0 - delta,
        Y: Y0 + t3 / 2,
        angle: -90,
        txt: `t3 = ${t3} m`,
      });
      quotes.push({
        X: X0 + t2 + (3 * delta) / 2,
        Y: Y0 + tf / 2,
        angle: -90,
        txt: `tf = ${tf} m`,
      });
      quotes.push({
        X: X0 + t2 - tw / 2,
        Y: Y0 + t3 + (3 * delta) / 2,
        angle: 0,
        txt: `tw = ${tw} m`,
      });
    }

    if (Shape === "Circle") {
      quotes.push({
        X: X0 + t3 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `t3 = ${t3} m`,
      });
    }

    if (Shape === "Pipe") {
      quotes.push({
        X: X0 + t3 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `t3 = ${t3} m`,
      });
      quotes.push({
        X: X0 + t3 + (3 * delta) / 2,
        Y: Y0 + tw / 2,
        angle: -90,
        txt: `tw = ${tw} m`,
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
  },
};
