// myS2k.ts

import { myUtils } from "./myUtils";

import { Point2D, Section, Material, Polygon } from "./Types";

type Punto = {
  X: number;
  Y: number;
};
type MomentiInerzia = {
  // Rispetto all'origine del sistema di riferimento
  origine: {
    Ix: number;
    Iy: number;
    Ixy: number;
    J: number; // momento polare
  };

  // Rispetto al baricentro
  baricentro: {
    Ix: number;
    Iy: number;
    Ixy: number;
    J: number; // momento polare
  };
};
type ProprietaPoligono = {
  area: number;
  perimetro: number;
  centroide: Punto;
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  numeroVertici: number;
  orientamento: "antiorario" | "orario";
  inerzia: MomentiInerzia;

  //
  //
  //
  centroid: Punto;
  //area: area,
  ix_origin: number;
  iy_origin: number;
  ixy_origin: number;
  ix: number;
  iy: number;
  ixy: number;
  // limits
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

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
    if (Shape === "Tee") keys = ["t2", "t3", "tf", "tw", "FilletRadius"];
    if (Shape === "I/Wide Flange")
      keys = ["t2", "t3", "tf", "tw", "t2b", "tfb", "FilletRadius"];
    if (Shape === "Box/Tube") keys = ["t2", "t3", "tf", "tw"];

    if (Shape === "PC Conc I Girder")
      keys = ["B1", "B2", "T1", "D1", "D2", "D3", "D5", "D6"];

    if (Shape === "Circle") keys = ["t3"];
    if (Shape === "Pipe") keys = ["t3", "tw"];

    //console.log("S2k > getKeys", keys);
    return keys;
  },

  /**
   * Generate cross-section points of polygons of a SD Section
   * to calculate the cross-section properties
   * [svg coordinates' system]
   *
   */
  // [s2k coordinates' system]
  getSDSectionPolygons({
    Section,
    Polygons,
    //Materials,
  }: {
    Section: Section;
    Polygons: Polygon[];
    //Materials: Material[];
  }) {
    //console.log("myS2k > getSDSectionPolygons", Section, Materials, Polygons);
    if (!Section) return [];
    //if (Materials.length < 1) return [];
    if (Polygons.length < 1) return [];

    const s2kPolygons: Polygon[] = Polygons.filter(
      (p: Polygon) => p.SectionName === Section.SectionName,
    );
    //console.log("myS2k > getSDSectionPolygons > s2kPolygons", s2kPolygons);

    return s2kPolygons;
  },
  // [svg coordinates' system]
  getSDSectionPolygonsSvg({
    Section,
    Polygons,
    //Materials,
    X0,
    Y0,
  }: {
    Section: Section;
    Polygons: Polygon[];
    //Materials: Material[];
    X0?: number;
    Y0?: number;
  }) {
    //console.log("myS2k > getSDSectionPolygons", Section, Materials, Polygons);
    if (!Section) return [];
    //if (Materials.length < 1) return [];
    if (Polygons.length < 1) return [];

    // origin
    if (!X0) X0 = 0;
    if (!Y0) Y0 = 0;

    // get s2k polygons
    const s2kPolygons: Polygon[] = this.getSDSectionPolygons({
      Section,
      Polygons,
    });
    //console.log("myS2k > getSDSectionPolygons > s2kPolygons", s2kPolygons);

    // get yMax
    let { yMax }: { yMax: number } = { yMax: -Number.MAX_VALUE };
    for (const polygon of s2kPolygons) {
      const limits = this.getPolygonLimits(polygon.points);
      if (limits.yMax > yMax) yMax = limits.yMax;
    }
    //console.log("myS2k > getSDSectionPolygons > yMax", yMax);

    // transform s2k to svg
    const svgPolygons: Polygon[] = [];
    for (const polygon of s2kPolygons) {
      const svgPolygon: Polygon = myUtils.deepClone(polygon);

      const points = svgPolygon.points?.map((p: Point2D) => {
        return { X: X0 + p.X, Y: Y0 + yMax - p.Y };
      });
      //console.log("myS2k > getSDSectionPolygons > svgPolygon", svgPolygon);

      svgPolygons.push(Object.assign(svgPolygon, { points: points }));
    }

    //console.log("myS2k > getSDSectionPolygons > svgPolygons", svgPolygons);
    return svgPolygons;
  },

  /**
   * Generate cross-section points of polygons from s2k variables
   *
   */
  // [s2k coordinates' system]
  getPolygons({ section }: { section: Section }) {
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

    // counter-clockwise
    let polygons: any[] = [];

    if (Shape === "Rectangular") {
      // counter-clockwise order
      let points: Point2D[] = [];

      points.push({ X: 0, Y: 0 });
      points.push({ X: t2, Y: 0 });
      points.push({ X: t2, Y: t3 });
      points.push({ X: 0, Y: t3 });

      //console.log("myS2k > getPolygons", points);
      polygons.push({ points: points });
    }

    if (Shape === "Tee") {
      // counter-clockwise order
      let points: Point2D[] = [];

      points.push({ X: 0, Y: t3 }); // A
      points.push({ X: 0, Y: t3 - tf }); // B
      points.push({ X: (t2 - tw) / 2 - FilletRadius, Y: t3 - tf }); // C
      if (FilletRadius > 0)
        points.push({ X: (t2 - tw) / 2, Y: t3 - tf - FilletRadius }); // D
      points.push({ X: (t2 - tw) / 2, Y: 0 }); // E
      points.push({ X: (t2 + tw) / 2, Y: 0 }); // F
      if (FilletRadius > 0)
        points.push({ X: (t2 + tw) / 2, Y: t3 - tf - FilletRadius }); // G
      points.push({ X: (t2 + tw) / 2 + FilletRadius, Y: t3 - tf }); // H
      points.push({ X: t2, Y: t3 - tf }); // I
      points.push({ X: t2, Y: t3 }); // J

      //console.log("S2k > getPolygons", points);
      polygons.push({ points: points });
    }

    if (Shape === "I/Wide Flange") {
      // counter-clockwise order
      let points: Point2D[] = [];

      points.push({ X: 0, Y: t3 }); // A
      points.push({ X: 0, Y: t3 - tf }); // B
      points.push({ X: (t2 - tw) / 2 - FilletRadius, Y: t3 - tf }); // C
      if (FilletRadius > 0)
        points.push({ X: (t2 - tw) / 2, Y: t3 - tf - FilletRadius }); // D
      points.push({ X: (t2 - tw) / 2, Y: tfb + FilletRadius }); // E
      if (FilletRadius > 0)
        points.push({ X: (t2 - tw) / 2 - FilletRadius, Y: tfb }); // F
      points.push({ X: (t2 - tw) / 2 - (t2b - tw) / 2, Y: tfb }); // G
      points.push({ X: (t2 - tw) / 2 - (t2b - tw) / 2, Y: 0 }); // H
      points.push({ X: (t2 - tw) / 2 + (t2b + tw) / 2, Y: 0 }); // I
      points.push({ X: (t2 - tw) / 2 + (t2b + tw) / 2, Y: tfb }); // J
      points.push({ X: (t2 + tw) / 2 + FilletRadius, Y: tfb }); // K
      if (FilletRadius > 0)
        points.push({ X: (t2 + tw) / 2, Y: tfb + FilletRadius }); // L
      points.push({ X: (t2 + tw) / 2, Y: t3 - tf - FilletRadius }); // M
      if (FilletRadius > 0)
        points.push({ X: (t2 + tw) / 2 + FilletRadius, Y: t3 - tf }); // N
      points.push({ X: t2, Y: t3 - tf }); // O
      points.push({ X: t2, Y: t3 }); // P

      //console.log("S2k > getPolygons", points);
      polygons.push({ points: points });
    }

    if (Shape === "Box/Tube") {
      // counter-clockwise order
      let points: Point2D[] = [];

      points.push({ X: 0, Y: t3 }); // A
      points.push({ X: 0, Y: 0 }); // B
      points.push({ X: t2, Y: 0 }); // C
      points.push({ X: t2, Y: t3 }); // D

      polygons.push({ points: points });

      // clockwise order
      points = []; // void
      points.push({ X: tw, Y: t3 - tf }); // E
      points.push({ X: tw, Y: tf }); // F
      points.push({ X: t2 - tw, Y: tf }); // G
      points.push({ X: t2 - tw, Y: t3 - tf }); // H

      polygons.push({ points: points, scale: 0, fill: "#FFF" });
    }

    if (Shape === "Circle") {
      // counter-clockwise order
      let points: Point2D[] = [];

      const Radius: number = t3 / 2;

      for (let q = 0; q < 360; q++) {
        const s: number = Math.sin((q * Math.PI) / 180);
        const c: number = Math.cos((q * Math.PI) / 180);

        points.push({ X: Radius * (1 + c), Y: Radius * (1 + s) });
      }

      polygons.push({ points: points });
    }

    if (Shape === "Pipe") {
      const Radius3: number = t3 / 2;
      const Radius2: number = t3 / 2 - tw;

      // counter-clockwise order
      let points: Point2D[] = [];

      for (let q = 0; q < 360; q++) {
        const s: number = Math.sin((q * Math.PI) / 180);
        const c: number = Math.cos((q * Math.PI) / 180);

        points.push({
          X: Radius3 + Radius3 * c,
          Y: Radius3 + Radius3 * s,
        });
      }
      polygons.push({ points: points });

      // clockwise order
      points = [];

      for (let q = 360; q > 0; q--) {
        const s: number = Math.sin((q * Math.PI) / 180);
        const c: number = Math.cos((q * Math.PI) / 180);

        points.push({
          X: Radius3 + Radius2 * c,
          Y: Radius3 + Radius2 * s,
        });
      }
      polygons.push({ points: points, scale: 0, fill: "#FFF" });
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

      // counter-clockwise order
      let points: Point2D[] = [];

      points.push({ X: 0, Y: D1 }); // A
      points.push({ X: 0, Y: D1 - D2 }); // B
      points.push({ X: (B1 - T1) / 2, Y: D1 - D2 - D3 }); // C
      points.push({ X: (B1 - T1) / 2, Y: D5 + D6 }); // D
      points.push({ X: (B1 - T1) / 2 - (B2 - T1) / 2, Y: D5 }); // E
      points.push({ X: (B1 - T1) / 2 - (B2 - T1) / 2, Y: 0 }); // F
      points.push({ X: (B1 - T1) / 2 + (B2 + T1) / 2, Y: 0 }); // G
      points.push({ X: (B1 - T1) / 2 + (B2 + T1) / 2, Y: D5 }); // H
      points.push({ X: (B1 + T1) / 2, Y: D5 + D6 }); // I
      points.push({ X: (B1 + T1) / 2, Y: D1 - D2 - D3 }); // J
      points.push({ X: B1, Y: D1 - D2 }); // K
      points.push({ X: B1, Y: D1 }); // L

      polygons.push({ points: points });
    }

    //console.log("myS2k > getPolygons", polygons);
    return polygons;
  },
  // [svg coordinates' system]
  getPolygonsSvg({
    section,
    X0,
    Y0,
  }: {
    section: Section;
    X0?: number;
    Y0?: number;
  }) {
    //console.log("getPolygonsSvg", section);
    if (!section) return [];

    // origin
    if (!X0) X0 = 0;
    if (!Y0) Y0 = 0;

    // get s2k polygons
    const s2kPolygons: Polygon[] = this.getPolygons({ section });

    // get yMax
    let { yMax }: { yMax: number } = { yMax: -Number.MAX_VALUE };
    for (const polygon of s2kPolygons) {
      const limits = this.getPolygonLimits(polygon.points);
      if (limits.yMax > yMax) yMax = limits.yMax;
    }
    //console.log("myS2k > getPolygonsSvg > yMax", yMax);

    // transform s2k to svg
    const svgPolygons: Polygon[] = [];
    for (const polygon of s2kPolygons) {
      const svgPolygon: Polygon = myUtils.deepClone(polygon);

      const points = svgPolygon.points?.map((p: Point2D) => {
        return { X: X0 + p.X, Y: Y0 + yMax - p.Y };
      });
      //console.log("myS2k > getSDSectionPolygons > svgPolygon", svgPolygon);

      svgPolygons.push(Object.assign(svgPolygon, { points: points }));
    }

    //console.log("myS2k > getPolygonsSvg", polygons);
    return svgPolygons;
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
    //console.log("myS2k > getPolygonProperties", points);

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

        //console.log(area);
      }
      //area *= 0.5;
      /*
        if (Math.abs(area) < 1e-10) {
          //this.showError(     "L'area calcolata è zero o quasi zero. Controllare i punti."        );
          return;
        }
        */

      // counter-clockwise => area > 0
      // clockwise => area < 0
      area *= 0.5;
      cX /= 6 * area;
      cY /= 6 * area;
      ix_origin /= 12;
      iy_origin /= 12;
      ixy_origin /= 24;
      //console.log(area);

      const ix: number = ix_origin - area * cY * cY;
      const iy: number = iy_origin - area * cX * cX;
      const ixy: number = ixy_origin - area * cX * cY;
      const avg_i: number = (ix + iy) / 2;
      const diff_i: number = (ix - iy) / 2;
      const R: number = Math.sqrt(diff_i * diff_i + ixy * ixy);
      const i1: number = avg_i + R;
      const i2: number = avg_i - R;
      let theta_p_rad: number = 0.5 * Math.atan2(-2 * ixy, ix - iy);
      let theta_p_deg: number = theta_p_rad * (180 / Math.PI);
      const rx: number = Math.sqrt(Math.abs(ix / area));
      const ry: number = Math.sqrt(Math.abs(iy / area));
      // --- End Calculation Logic ---

      //console.log("getPolygonProperties", cx, cy);

      // limits
      const {
        xMin,
        xMax,
        yMin,
        yMax,
      }: { xMin: number; xMax: number; yMin: number; yMax: number } =
        this.getPolygonLimits(points);
      //console.log("getPolygonProperties", xMin, xMax, yMin, yMax );

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
      console.error("myS2k > getPolygonProperties > err:", err);
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
        //console.log("getPolygonsProperties", polygon);
        let scale: number = polygon.hasOwnProperty("scale") ? polygon.scale : 1;
        if (
          polygon.hasOwnProperty("ShapeMat") &&
          polygon.ShapeMat === "Opening"
        ) {
          scale = 0;
        }

        const props: any | undefined = this.getPolygonProperties(
          polygon.points,
        );
        //console.log("props", scale, props.area, props.centroid);
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

      cX /= Math.abs(area) > 0 ? area : 1;
      cY /= Math.abs(area) > 0 ? area : 1;
      centroid = { X: cX, Y: cY };
      //console.log(polygons.length, centroid);

      return {
        area: area,
        centroid: centroid,
        //cX: cX,
        //cX: cX,
        ix_origin: ix_origin,
        iy_origin: iy_origin,
        ixy_origin: ixy_origin,
        //
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
      return { xMin: 0, xMax: 0, yMin: 0, yMax: 0, centroid: { X: 0, Y: 0 } };
    }
  },

  /**
   * Generate quotes of polygons from s2k variables
   * [svg coordinates' system]
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
        X: t2 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `t2 = ${t2} m`,
      });
      quotes.push({
        X: X0 - delta,
        Y: t3 / 2,
        angle: -90,
        txt: `t3 = ${t3} m`,
      });
    }

    if (Shape == "Tee") {
      quotes.push({
        X: t2 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `t2 = ${t2} m`,
      });
      quotes.push({
        X: X0 - delta,
        Y: t3 / 2,
        angle: -90,
        txt: `t3 = ${t3} m`,
      });

      quotes.push({
        X: t2 / 2,
        Y: t3 + (3 * delta) / 2,
        angle: 0,
        txt: `tw = ${tw} m`,
      });
      quotes.push({
        X: t2 + (3 * delta) / 2,
        Y: tf / 2,
        angle: -90,
        txt: `tf = ${tf} m`,
      });
    }

    if (Shape === "I/Wide Flange") {
      quotes.push({
        X: Math.max(t2, t2b) / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `t2 = ${t2} m`,
      });
      quotes.push({
        X: X0 - delta,
        Y: t3 / 2,
        angle: -90,
        txt: `t3 = ${t3} m`,
      });
      quotes.push({
        X: Math.max(t2, t2b) + (3 * delta) / 2,
        Y: tf / 2,
        angle: -90,
        txt: `tf = ${tf} m`,
      });

      quotes.push({
        X: Math.max(t2, t2b) / 2,
        Y: t3 / 2,
        angle: 0,
        txt: `tw = ${tw} m`,
      });

      quotes.push({
        X: Math.max(t2, t2b) / 2,
        Y: t3 + (3 * delta) / 2,
        angle: 0,
        txt: `t2b = ${t2b} m`,
      });
      quotes.push({
        X: Math.max(t2, t2b) + (3 * delta) / 2,
        Y: t3 - tfb / 2,
        angle: -90,
        txt: `tfb = ${tfb} m`,
      });
    }

    if (Shape == "Box/Tube") {
      quotes.push({
        X: t2 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `t2 = ${t2} m`,
      });
      quotes.push({
        X: X0 - delta,
        Y: t3 / 2,
        angle: -90,
        txt: `t3 = ${t3} m`,
      });
      quotes.push({
        X: t2 + (3 * delta) / 2,
        Y: tf / 2,
        angle: -90,
        txt: `tf = ${tf} m`,
      });
      quotes.push({
        X: t2 - tw / 2,
        Y: t3 + (3 * delta) / 2,
        angle: 0,
        txt: `tw = ${tw} m`,
      });
    }

    if (Shape === "Circle") {
      quotes.push({
        X: t3 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `t3 = ${t3} m`,
      });
    }

    if (Shape === "Pipe") {
      quotes.push({
        X: t3 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `t3 = ${t3} m`,
      });
      quotes.push({
        X: t3 + (3 * delta) / 2,
        Y: tw / 2,
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
      points.push({ X: X0, Y: D2 });
      points.push({ X: (B1 - T1) / 2, Y: D2 + D3 });
      points.push({ X: (B1 - T1) / 2, Y: D1 - D5 - D6 });
      points.push({ X: (B1 - T1) / 2 - (B2 - T1) / 2, Y: D1 - D5 });
      points.push({ X: (B1 - T1) / 2 - (B2 - T1) / 2, Y: D1 });
      points.push({ X: (B1 - T1) / 2 + (B2 + T1) / 2, Y: D1 });
      points.push({ X: (B1 - T1) / 2 + (B2 + T1) / 2, Y: D1 - D5 });
      points.push({ X: (B1 + T1) / 2, Y: D1 - D5 - D6 });
      points.push({ X: (B1 + T1) / 2, Y: D2 + D3 });
      points.push({ X: B1, Y: D2 });
      points.push({ X: B1, Y: Y0 });

      //polygons.push({ points: points });

      quotes.push({
        X: B1 / 2,
        Y: Y0 - delta,
        angle: 0,
        txt: `B1 = ${B1} m`,
      });
      quotes.push({
        X: B1 / 2,
        Y: D1 / 2,
        angle: 0,
        txt: `T1 = ${T1} m`,
      });
      quotes.push({
        X: B1 / 2,
        Y: D1 + (3 * delta) / 2,
        angle: 0,
        txt: `B2 = ${B2} m`,
      });

      quotes.push({
        X: X0 - delta,
        Y: D1 / 2,
        angle: -90,
        txt: `D1 = ${D1} m`,
      });
      quotes.push({
        X: B1 + (3 * delta) / 2,
        Y: D2 / 2,
        angle: -90,
        txt: `D2 = ${D2} m`,
      });
      quotes.push({
        X: B1 + (3 * delta) / 2,
        Y: D1 - D5 / 2,
        angle: -90,
        txt: `D5 = ${D5} m`,
      });
    }

    //console.log("S2k > getQuotes", quotes);
    return quotes;
  },

  /*
   * get polygon properties
   *
   */
  getPolygonProperties_01(vertici: Punto[]): ProprietaPoligono {
    if (vertici.length < 3) {
      throw new Error("Un poligono deve avere almeno 3 vertici.");
    }
    console.log(vertici);

    const n = vertici.length;

    let areaDoppia = 0;
    let perimetro = 0;

    let cx = 0;
    let cy = 0;

    // Momenti rispetto all'origine
    let Ix0 = 0;
    let Iy0 = 0;
    let Ixy0 = 0;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < n; i++) {
      const p1 = vertici[i];
      const p2 = vertici[(i + 1) % n];

      const x1 = p1.X;
      const y1 = p1.Y;

      const x2 = p2.X;
      const y2 = p2.Y;

      // Termine shoelace
      const cross = x1 * y2 - x2 * y1;
      //console.log(cross);

      areaDoppia += cross;

      // Centroide
      cx += (x1 + x2) * cross;
      cy += (y1 + y2) * cross;

      // Perimetro
      const dx = x2 - x1;
      const dy = y2 - y1;
      perimetro += Math.sqrt(dx * dx + dy * dy);

      // Bounding box
      minX = Math.min(minX, x1);
      minY = Math.min(minY, y1);
      maxX = Math.max(maxX, x1);
      maxY = Math.max(maxY, y1);

      // Momenti di inerzia rispetto all'origine
      Ix0 += (y1 * y1 + y1 * y2 + y2 * y2) * cross;
      Iy0 += (x1 * x1 + x1 * x2 + x2 * x2) * cross;
      Ixy0 += (x1 * y2 + 2 * x1 * y1 + 2 * x2 * y2 + x2 * y1) * cross;
    }

    const areaSegnata = areaDoppia / 2;
    const area = Math.abs(areaSegnata);

    // Centroide finale
    cx = cx / (3 * areaDoppia);
    cy = cy / (3 * areaDoppia);

    // Normalizzazione momenti rispetto all'origine
    Ix0 = Ix0 / 12;
    Iy0 = Iy0 / 12;
    Ixy0 = Ixy0 / 24;

    // Uso valore assoluto per evitare segni negativi
    Ix0 = Math.abs(Ix0);
    Iy0 = Math.abs(Iy0);
    Ixy0 = Math.abs(Ixy0);

    // Teorema di Huygens-Steiner
    const IxG = Ix0 - area * cy * cy;
    const IyG = Iy0 - area * cx * cx;
    const IxyG = Ixy0 - area * cx * cy;

    return {
      area,
      perimetro,
      centroide: {
        X: cx,
        Y: cy,
      },
      boundingBox: {
        minX,
        minY,
        maxX,
        maxY,
      },
      numeroVertici: n,
      orientamento: areaSegnata > 0 ? "antiorario" : "orario",
      inerzia: {
        origine: {
          Ix: Ix0,
          Iy: Iy0,
          Ixy: Ixy0,
          J: Ix0 + Iy0,
        },

        baricentro: {
          Ix: IxG,
          Iy: IyG,
          Ixy: IxyG,
          J: IxG + IyG,
        },
      },

      //
      //
      //
      centroid: { X: cx, Y: cy },
      //area: area,
      ix_origin: Ix0,
      iy_origin: Iy0,
      ixy_origin: Ixy0,
      ix: IxG,
      iy: IyG,
      ixy: IxyG,
      // limits
      xMin: minX,
      xMax: maxX,
      yMin: minY,
      yMax: maxY,
    };
  },
};
