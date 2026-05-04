// Types
import type { Element, Point, Rebar, Fiber } from "./Types2";

// Utils
import { Utils } from "./Utils";

//
// classes
//

// Retrofit
class Retrofit {
  data: any;

  constructor() {
    this.data = {};
  }

  // Base
  Base = "/retrofit"; // "/bbs/retrofit"

  // IO
  IO = {
    localStorageName: "retrofit",
    fileExtensions: [".retrofit"],
  };

  // List Of Section Components
  ListOfSectionComponents: string[] = ["Section", "S2k"];

  // default board options
  private boardOptions = {
    camera: { x: 0, y: 0, z: 1 },
    showGrid: true,
    snapGrid: 25,
    pitch: 5,
    toggle: "Select",
  };

  getConstants = () => {
    const uts = new Utils();

    const m1: string = uts.uuid();
    const m2: string = uts.uuid();

    const s1: string = uts.uuid();
    const s2: string = uts.uuid();

    return [
      {
        name: "options",
        value: {
          version: 2,
          delay: 200, // millisecond
        },
      },
      {
        name: "panels", // size in px
        value: [
          {
            id: "sectionPanel",
            collapsed: false,
            x: 0,
            y: 48,
            width: 300,
            height: 520,
          },
          {
            id: "elementPanel",
            collapsed: false,
            x: 0,
            y: 48,
            width: 300,
            height: 520,
          },
        ],
      },
      {
        name: "materials", // Concrete, SteelBar
        value: [
          {
            id: m1,
            name: "Concrete 01",
            component: "Concrete",
            fill: "9E9E9E",
          },
          {
            id: m2,
            name: "Steel 01",
            component: "SteelBar",
            fill: "F44336",
          },
        ],
      },
      {
        name: "elements", // Section, Circle, Rect, Polygon, ...
        value: [
          // section 001
          {
            id: s1,
            materialId: m1,
            name: "Section 01",
            component: "Section",
            fill: "000",
            fillOpacity: 1,
            selected: false,
            showMesh: false,
            dirMesh: "xy",
            boardOptions: this.boardOptions,
          },
          {
            id: uts.uuid(),
            sectionId: s1,
            materialId: m1,
            name: "Region 01",
            component: "Quad",
            fill: "4CAF50",
            fillOpacity: 0.5,
            selected: false,
            points: [
              {
                x: 25,
                y: 25,
              },
              {
                x: 425,
                y: 25,
              },
              {
                x: 425,
                y: 125,
              },
              {
                x: 25,
                y: 125,
              },
            ],
            nRows: 10,
            nCols: 10,
          },
          {
            id: uts.uuid(),
            sectionId: s1,
            materialId: m2,
            name: "Region 02",
            component: "Quad",
            fill: "F44336",
            fillOpacity: 0.5,
            selected: false,
            points: [
              {
                x: 150,
                y: 125,
              },
              {
                x: 300,
                y: 125,
              },
              {
                x: 275,
                y: 400,
              },
              {
                x: 175,
                y: 400,
              },
            ],
            nRows: 10,
            nCols: 10,
          },
          // section 002
          {
            id: s2,
            materialId: m1,
            name: "Section 02",
            component: "Section",
            fill: "000",
            fillOpacity: 1,
            selected: false,
            showMesh: false,
            dirMesh: "xy",
            boardOptions: this.boardOptions,
          },
          {
            id: uts.uuid(),
            sectionId: s2,
            materialId: m1,
            name: "Region 01",
            component: "Quad",
            fill: "03A9F4",
            fillOpacity: 0.5,
            selected: false,
            points: [
              {
                x: 0,
                y: 0,
              },
              {
                x: 300,
                y: 0,
              },
              {
                x: 300,
                y: 400,
              },
              {
                x: 0,
                y: 400,
              },
            ],
            nRows: 10,
            nCols: 10,
          },
        ],
      },
      {
        name: "charts",
        value: [
          {
            id: uts.uuid(),
            sectionId: s1,
            keyX: "c0",
            roundX: 1,
            keyYlist: [{ name: "Mx", fill: "696", roundY: 1 }],
          },
          {
            id: uts.uuid(),
            sectionId: s2,
            keyX: "c0",
            roundX: 1,
            keyYlist: [{ name: "Mx", fill: "696", roundY: 1 }],
          },
        ],
      },
      {
        // al momento non lo uso
        // serve per lo store dei risultati
        name: "results",
        value: [
          {
            id: uts.uuid(),
            sectionId: s1,
            mchi: [],
          },
          {
            id: uts.uuid(),
            sectionId: s2,
            mchi: [],
          },
        ],
      },
    ];
  };

  getSection = (component: string = "Section") => {
    let elements: Element[] = [];

    const uts = new Utils();
    const sectionId: string = uts.uuid();

    elements.push({
      id: sectionId,
      materialId: undefined,
      name: "New Section",
      component: component,
      fill: "000",
      fillOpacity: 1,
      selected: false,
      showMesh: false,
      dirMesh: "xy",
      boardOptions: this.boardOptions,
    });

    // Section
    if (component === "Section")
      elements.push({
        id: uts.uuid(),
        sectionId: sectionId,
        materialId: undefined,
        component: "Quad",
        fill: "03A9F4",
        fillOpacity: 0.5,
        selected: false,
        //
        name: "Region 01",
        points: [
          {
            x: 0,
            y: 0,
          },
          {
            x: 300,
            y: 0,
          },
          {
            x: 300,
            y: 400,
          },
          {
            x: 0,
            y: 400,
          },
        ],
        //
        nRows: 10,
        nCols: 10,
      });

    // S2k
    if (component === "S2k")
      elements.push({
        id: uts.uuid(),
        sectionId: sectionId,
        materialId: undefined,
        component: "S2k",
        fill: "03A9F4",
        fillOpacity: 0.5,
        selected: false,
        //
        //Shape: "Rectangular",
        name: "Rect 01",
        x: 0,
        y: 0,
        //t2: 300,
        //t3: 500,
        //
        //nRows: 10,
        //nCols: 10,
      });

    return elements;
  };

  getElementAdd = ({
    component,
    sectionId,
    materialId,
    snapGrid,
  }: {
    component: string | undefined;
    sectionId: string | undefined;
    materialId: string | undefined;
    snapGrid: number;
  }): Element | undefined => {
    //console.log("getElementAdd", component, sectionId, materialId);
    if (
      component === undefined ||
      sectionId === undefined ||
      materialId === undefined
    )
      return;
    if (!snapGrid) snapGrid = 25;

    const uts: Utils = new Utils();

    const myComponent = component ? component : "Rect";
    const id = uts.uuid();
    const name = id.substring(0, 8);

    let myElement: Element = {
      id: uts.uuid(),
      sectionId: sectionId,
      name: name,
      component: myComponent,
      materialId: materialId,
      //
      fill: "FFF",
      fillOpacity: 0.75,
      selected: false,
      showMesh: false,
      //zIndex: -1, // viene assegnato in "Retrofit.vue > getElementsOfSection()"
    };

    // Circle
    if (myComponent === "Circle")
      Object.assign(myElement, { x: snapGrid, y: snapGrid, r: 8 });

    // Line
    if (myComponent === "Line")
      Object.assign(myElement, {
        x: snapGrid, // = x1
        y: snapGrid, // = y1
        x2: 3 * snapGrid,
        y2: 2 * snapGrid,
      });

    // Rect
    if (myComponent === "Rect") {
      Object.assign(myElement, {
        x: snapGrid,
        y: snapGrid,
        width: 6 * snapGrid,
        height: 12 * snapGrid,
        nRows: 10,
        nCols: 10,
      });
    }

    // Polygon
    if (myComponent === "Polygon") {
      const points = [
        {
          x: snapGrid,
          y: snapGrid,
        },
        {
          x: 5 * snapGrid,
          y: 0,
        },
        {
          x: 5 * snapGrid,
          y: 6 * snapGrid,
        },
        {
          x: 2 * snapGrid,
          y: 5 * snapGrid,
        },
      ];

      Object.assign(myElement, {
        points: points,
        nRows: 10,
        nCols: 10,
      });
    }

    //
    // Reinforced Concrete
    //

    // Quad
    if (myComponent === "Quad") {
      const points = [
        {
          x: snapGrid,
          y: snapGrid,
        },
        {
          x: 5 * snapGrid,
          y: 0,
        },
        {
          x: 5 * snapGrid,
          y: 6 * snapGrid,
        },
        {
          x: 2 * snapGrid,
          y: 5 * snapGrid,
        },
      ];

      Object.assign(myElement, {
        points: points,
        nRows: 10,
        nCols: 10,
      });
    }

    // Circ
    if (myComponent === "Circ") {
      Object.assign(myElement, {
        x: 0,
        y: 0,
        eR: 300,
        iR: 100,
        sA: 0,
        eA: 90,
        nSC: 10,
        nSR: 10,
      });
    }

    // Fiber
    if (myComponent === "Fiber")
      Object.assign(myElement, { x: snapGrid, y: snapGrid, a: 201 });

    // FibersLine
    if (myComponent === "FibersLine")
      Object.assign(myElement, {
        x: snapGrid, // = x1
        y: snapGrid, // = y1
        x2: 3 * snapGrid,
        y2: 2 * snapGrid,
        a: 201,
        nFibers: 2, // minimum 2
      });

    // FibersCirc
    if (myComponent === "FibersCirc")
      Object.assign(myElement, {
        x: snapGrid,
        y: snapGrid,
        r: 4 * snapGrid,
        sA: 0,
        eA: 90,
        a: 201,
        nFibers: 2,
      });

    // Strip
    if (myComponent === "Strip") {
      const points = [
        {
          x: snapGrid,
          y: snapGrid,
        },
        {
          x: 2 * snapGrid,
          y: 4 * snapGrid,
        },
      ];

      Object.assign(myElement, {
        points: points,
        thickness: 0.5,
        direction: "longitudinal", // "transversal"
      });
    }

    //
    // S2k
    //

    // S2k
    if (myComponent === "S2k") {
      Object.assign(myElement, {
        x: snapGrid,
        y: snapGrid,
        nRows: 10,
        nCols: 10,
        // geometry
        Shape: "Rectangular",
        t2: 300,
        t3: 500,
        //
        //tf: 100,
        //tw: 100,
        //FilletRadius: 0,
        //
        //t2b: 500,
        //t2f: 100,
        // longitudinal
        ConcBeamCol: "Beam",
        RebarMatL: undefined,
        TopCover: 25,
        TopRebarNumber: 2,
        TopRebarArea: 201,
        BotCover: 25,
        BotRebarNumber: 4,
        BotRebarArea: 201,
        // transverse
        RebarMatC: undefined,
        BarSizeC: 8 * 0,
        SpacingC: 150,
      });
    }

    //
    return myElement;
  };

  getElementCopy = (myElement: Element | undefined, snapGrid: number = 25) => {
    //console.log("getElementCopy", myElement, elements);
    if (!myElement) return;

    const uts = new Utils();

    const id: string = uts.uuid();
    const name: string = id.substring(0, 8);

    let element = uts.clone(myElement);
    if (!element) return;

    element.id = id;
    element.name = name;
    //element.selected = true;

    // Rect | Circle | Line
    if (["Circle", "Line", "Rect"].includes(element.component)) {
      element.x += snapGrid;
      element.y += snapGrid;
    }
    // Polygon
    if (["Polygon"].includes(element.component))
      for (const point of element.points) {
        Object.assign(point, {
          x: point.x + snapGrid,
          y: point.y + snapGrid,
        });
      }

    //
    // Reinforced Concrete
    //

    // Quad
    if (["Quad"].includes(element.component))
      for (const point of element.points) {
        Object.assign(point, {
          x: point.x + snapGrid,
          y: point.y + snapGrid,
        });
      }

    // Circ
    if (["Circ"].includes(element.component)) element.x += snapGrid;
    element.y += snapGrid;

    // Fiber
    if (["Fiber"].includes(element.component)) {
      element.x += snapGrid;
      element.y += snapGrid;
    }

    // FibersLine
    if (["FibersLine"].includes(element.component)) {
      element.x += snapGrid;
      element.y += snapGrid;
      element.x2 += snapGrid;
      element.y2 += snapGrid;
    }

    // FibersCirc
    if (["FibersCirc"].includes(element.component)) {
      element.x += snapGrid;
      element.y += snapGrid;
    }

    //console.log("getElementCopy", element);
    return element;
  };

  getMaterialCopy = (myMaterial: any | undefined) => {
    //console.log("getMaterialCopy", myMaterial);
    if (!myMaterial) return;

    const uts = new Utils();

    const id: string = uts.uuid();
    const name: string = id.substring(0, 8);

    let material = uts.clone(myMaterial);
    if (!material) return;

    Object.assign(material, { id: id, name: name });
    //material.id = id;
    //material.name = name;

    //console.log("getMaterialCopy", material);
    return material;
  };

  // Point

  /**
   * translate point
   * A counterclockwise translation of a vector.
   * The vector is initially aligned with the x-axis.
   */
  translatePoint = (point: Point, [tx, ty]: number[] = [0, 0]) => {
    const uts = new Utils();

    let translatePoint: Point = uts.clone(point);

    return Object.assign(translatePoint, {
      x: translatePoint.x + tx,
      y: translatePoint.y + ty,
    });
  };

  /**
   * rotate point
   * A counterclockwise rotation of a vector through angle alpha [radians].
   * The vector is initially aligned with the x-axis.
   */
  rotatePoint = (point: Point, alpha: number = 0) => {
    const uts = new Utils();

    let rotatePoint: Point = uts.clone(point);

    return Object.assign(rotatePoint, {
      x: rotatePoint.x * Math.cos(alpha) - rotatePoint.y * Math.sin(alpha),
      y: rotatePoint.x * Math.sin(alpha) + rotatePoint.y * Math.cos(alpha),
    });
  };
}

// Materials
class Materials {
  //elements: Element[];

  constructor() {
    //this.elements = [];
  }

  /*
   * constitutive law
   *
   */
  fe = (material: any) => {
    //console.log("fe", material);
    const { SSCurveOpt }: { SSCurveOpt: string } = material;

    let f: number = 0;

    // Basic
    /*
    if (SSCurveOpt == "BiLineare") {
      const mySSCurveOpt = "BiLineare";
      f = this[mySSCurveOpt](material);
    }
    */

    // Concrete
    if (SSCurveOpt == "ParabolaRettangolo") {
      const mySSCurveOpt = "ParabolaRettangolo";
      f = this[mySSCurveOpt](material);
    }
    if (SSCurveOpt == "Hognestad") {
      const mySSCurveOpt = "Hognestad";
      f = this[mySSCurveOpt](material);
    }
    if (SSCurveOpt == "Mander") {
      const mySSCurveOpt = "Mander";
      f = this[mySSCurveOpt](material);
    }

    // SteelBar
    if (SSCurveOpt == "ElastoPlastico") {
      const mySSCurveOpt = "ElastoPlastico";
      f = this[mySSCurveOpt](material);
    }
    if (SSCurveOpt == "ElastoLineare") {
      const mySSCurveOpt = "ElastoLineare";
      f = this[mySSCurveOpt](material);
    }

    // Tendon
    if (SSCurveOpt == "TendonElastoPlastico") {
      const mySSCurveOpt = "TendonElastoPlastico";
      f = this[mySSCurveOpt](material);
    }
    if (SSCurveOpt == "RamsbergOsgood") {
      const mySSCurveOpt = "RamsbergOsgood";
      f = this[mySSCurveOpt](material);
    }

    // FrpBar
    if (SSCurveOpt == "TensionOnly") {
      const mySSCurveOpt = "TensionOnly";
      f = this[mySSCurveOpt](material);
    }

    //
    return f;
  };

  /*
   * Basic
   * BiLineare
   */
  BiLineare = (material: any = { e: 0, de: 0, fy: 1, ey: 2, fu: 1, eu: 4 }) => {
    //console.log("BiLineare", material);
    const {
      e,
      de,
      fy,
      ey,
      fu,
      eu,
    }: {
      e: number;
      de: number;
      fy: number;
      ey: number;
      fu: number;
      eu: number;
    } = material;
    //console.log("BiLineare", e, de);

    const ep: number = e + (de ? de : 0);
    //console.log("BiLineare", ep);

    if (Math.abs(e) > eu) return 0;

    const epey: number = Math.abs(ep) / ey;
    //console.log("BiLineare > epey", ep, ey, epey);

    //const E: number = fy / ey;
    const Eh: number = (fu - fy) / (eu - ey);

    const f: number = epey <= 1 ? epey * fy : fy + (Math.abs(ep) - ey) * Eh;

    //console.log("BiLineare > f", epey, f);
    return f * Math.sign(ep);
  };

  /*
   * Concrete
   *
   */
  ParabolaRettangolo = (material: any) => {
    const {
      eps,
      fcd,
      ec2,
      ecu,
    }: { eps: number; fcd: number; ec2: number; ecu: number } = material;
    const e: number = eps < 0 ? -eps : 0;

    const f: number =
      e <= ec2
        ? fcd * ((2 * e) / ec2 - (e / ec2) * (e / ec2))
        : e <= ecu
          ? fcd
          : 0;

    return f <= 0 ? 0 : -f;
  };

  Hognestad = (material: any) => {
    const { eps, fcd, ec2 }: { eps: number; fcd: number; ec2: number } =
      material;
    const e: number = eps < 0 ? -eps : 0;

    const f: number =
      e <= 2 * ec2 ? fcd * ((2 * e) / ec2 - (e / ec2) * (e / ec2)) : 0;

    return f <= 0 ? 0 : -f;
  };

  Mander = (material: any) => {
    const {
      eps,
      fcd,
      ec2,
      Ec,
    }: { eps: number; fcd: number; ec2: number; Ec: number } = material;
    const e: number = eps < 0 ? -eps : 0;

    const Esec: number = fcd / ec2; // GPa
    const r: number = Ec / (Ec - Esec);

    const x: number = e / ec2;
    const f: number = (fcd * x * r) / (r - 1 + Math.pow(x, r));

    return f <= 0 ? 0 : -f;
  };

  /*
   * Steel
   *
   */
  ElastoPlastico = (material: any) => {
    //console.log("ElastoPlastico", material);
    const {
      eps,
      des,
      fyd,
      Es,
      esu,
    }: {
      eps: number;
      des: number;
      fyd: number;
      Es: number;
      esu: number;
    } = material;

    return this.BiLineare({
      e: eps,
      de: des,
      fy: fyd,
      ey: fyd / Es,
      fu: fyd,
      eu: esu,
    });
  };

  ElastoLineare = (material: any) => {
    //console.log("ElastoLineare", material);
    const {
      eps,
      des,
      fyd,
      Es,
      fud,
      esu,
    }: {
      eps: number;
      des: number;
      fyd: number;
      Es: number;
      fud: number;
      esu: number;
    } = material;

    return this.BiLineare({
      e: eps,
      de: des,
      fy: fyd,
      ey: fyd / Es,
      fu: fud,
      eu: esu,
    });
  };

  //
  TendonElastoPlastico = (material: any) => {
    const {
      eps,
      sspf,
      Es,
      epu,
      dep, // >= 0
    }: { eps: number; sspf: number; Es: number; epu: number; dep: number } =
      material;
    return this.BiLineare({
      e: eps,
      de: dep,
      fy: sspf,
      ey: sspf / Es,
      fu: sspf,
      eu: epu,
    });
  };

  RamsbergOsgood = (material: any) => {
    const {
      eps,
      sspf,
      Es,
      fptk,
      epu,
      dep,
    }: {
      eps: number;
      sspf: number;
      Es: number;
      fptk: number;
      epu: number;
      dep: number;
    } = material;

    const ep: number = eps + (dep ? dep : 0);

    if (ep < 0 || eps > epu) return 0;

    const epy: number = sspf / Es; // = mm/m
    const Eh: number = (fptk - sspf) / (epu - epy); // GPa

    const s0: number = fptk - Eh * epu;

    const A: number = Eh / Es;
    const B: number = (Es * (1 - A)) / s0;
    const C: number = 8;

    const f: number =
      ep < 0
        ? 0
        : Es * ep * (A + (1 - A) / Math.pow(1 + Math.pow(B * ep, C), 1 / C));

    return f;
  };

  //
  TensionOnly = (material: any) => {
    const {
      eps,
      ffd,
      Ef,
      efu,
    }: { eps: number; ffd: number; Ef: number; efu: number } = material;

    if (eps < 0 || eps > efu) return 0;

    const f: number = Math.min(eps * Ef, ffd);

    return f;
  };
}

// MaterialProperties
class MaterialProperties {
  //elements: Element[];

  constructor() {
    //this.elements = [];
  }

  /*
   *
   *
   */
  getConcreteProperties = (obj: any = { fck: 25, acc: 0.85, gc: 1.5 }) => {
    const { fck, acc, gc } = obj;

    const fcd: number = (fck * acc) / gc;
    const fcm: number = fck + 8;
    const Ec: number = 22 * Math.pow(fcm / 10, 0.3);

    return { fcd: fcd, Ec: Ec, fcm: fcm };
  };

  /*
   *
   *
   */
  getSteelBarProperties = (
    obj: any = { fyk: 450, k: 1, gs: 1.15, Es: 210 },
  ) => {
    const { fyk, k, gs, Es } = obj;

    const fyd: number = fyk / gs;
    const eyd: number = fyd / Es;
    const fud: number = k * fyd;

    return { fyd: fyd, eyd: eyd, fud: fud };
  };

  /*
   *
   *
   */
  getTendonProperties = (
    obj: any = { fp1k: 1670, fptk: 1860, Es: 190, eta: 1 / 1.3, epu: 40 },
  ) => {
    const { fp1k, fptk, Es, eta, epu } = obj;

    const sspi: number = Math.min(0.85 * fp1k, 0.75 * fptk);
    const sspf: number = sspi * eta;

    return { sspf: sspf, epu: epu };
  };

  /*
   *
   *
   */
  getFrpBarProperties = (
    obj: any = { ffk: 500, gf: 1.15, Ef: 50, efu: 10 },
  ) => {
    const { ffk, gf, Ef, efu } = obj;

    const ffd: number = ffk / gf;
    //const efu: number = ffd / Ef;

    return { ffd: ffd, Ef: Ef, efu: efu };
  };

  /*
   *
   *
   */
  getMaterialProperties = (material: any) => {
    const { component } = material;

    if (component === "Concrete") return this.getConcreteProperties(material);
    if (component === "SteelBar") return this.getSteelBarProperties(material);
    if (component === "Tendon") return this.getTendonProperties(material);
    if (component === "FrpBar") return this.getFrpBarProperties(material);
    return;
  };

  /*
   *
   *
   */
  getStrainsSignificant = (materials: any[] = []) => {
    const euList: number[] = [0];

    for (const material of materials) {
      //const material: any = materials.value.find((i: any) => i.id === materialId);
      //console.log(material);
      if (material?.component === "Concrete") {
        // compression
        euList.push(-material?.ec2);
        euList.push(-material?.ecu);
      }
      if (material?.component === "SteelBar") {
        // tension

        // eyd
        //euList.push(-material?.eyd);
        euList.push(material?.eyd);
        // esu
        //euList.push(-material?.esu);
        euList.push(material?.esu);
      }
      if (material?.component === "Tendon") {
        // tension

        // epu
        //euList.push(0);
        euList.push(material?.epu);
      }
      if (material?.component === "FrpBar") {
        // tension

        // esu
        //euList.push(0);
        euList.push(material?.efu);
      }
    }

    //console.log("getStrainsSignificant", euList.sort((a, b) => a - b));
    return euList.sort((a, b) => a - b);
  };
}

// SectionProperties
class SectionProperties {
  elements: Element[];

  constructor() {
    this.elements = [];
  }

  /*
   *
   *
   */
  getCircleProperties = (obj: any = { x: 0, y: 0, r: 1 }) => {
    const { x, y, r } = obj;

    const area: number = Math.PI * r * r;

    return {
      centroid: { x: x, y: y },
      area: area,
      ix_origin: area * y * y,
      iy_origin: area * x * x,
      ixy_origin: area * x * y,
      ix: 0,
      iy: 0,
      ixy: 0,
      // limits
      xMin: x - r,
      xMax: x + r,
      yMin: y - r,
      yMax: y + r,
    };
  };

  /*
   *
   *
   */
  getLineProperties = (obj: any = { x: 0, y: 0, x2: 0, y2: 0 }) => {
    //console.log("getLineProperties", obj);
    const { x, y, x2, y2 } = obj;

    //const area: number = Math.PI * r * r;

    return {
      centroid: { x: (x + x2) / 2, y: (y + y2) / 2 },
      area: 0,
      ix_origin: 0,
      iy_origin: 0,
      ixy_origin: 0,
      ix: 0,
      iy: 0,
      ixy: 0,
      // limits
      xMin: x,
      xMax: x2,
      yMin: y,
      yMax: y2,
    };
  };

  /**
   * get polygon/polyline limits
   *
   */
  getPolygonLimits = (points: Point[] = []) => {
    //const uts = new Utils();

    const x: number[] = points.map((p: Point) => p.x);
    //console.log("getPolygonLimits > x", x);
    const y: number[] = points.map((p: Point) => p.y);
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
   *
   *
   */
  getPolygonProperties = (points: Point[] = []) => {
    //console.log("SectionProperties > getPolygonProperties", points);

    // --- Calculation Logic ---

    //let centroid = { x:0, y: 0 };
    let area: number = 0.0,
      cx: number = 0.0,
      cy: number = 0.0,
      ix_origin: number = 0.0,
      iy_origin: number = 0.0,
      ixy_origin: number = 0.0;

    try {
      const n: number = points.length;

      for (let i = 0; i < n; i++) {
        const p1: Point = points[i];
        const p2: Point = points[(i + 1) % n];
        const crossProduct: number = p1.x * p2.y - p2.x * p1.y;
        area += crossProduct;
        cx += (p1.x + p2.x) * crossProduct;
        cy += (p1.y + p2.y) * crossProduct;
        ix_origin += (p1.y * p1.y + p1.y * p2.y + p2.y * p2.y) * crossProduct;
        iy_origin += (p1.x * p1.x + p1.x * p2.x + p2.x * p2.x) * crossProduct;
        ixy_origin +=
          (p1.x * p2.y + 2 * p1.x * p1.y + 2 * p2.x * p2.y + p2.x * p1.y) *
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

        cx /= -6.0 * area;
        cy /= -6.0 * area;
        ix_origin /= -12.0;
        iy_origin /= -12.0;
        ixy_origin /= -24.0;
      } else {
        area *= 0.5;

        cx /= 6.0 * area;
        cy /= 6.0 * area;
        ix_origin /= 12.0;
        iy_origin /= 12.0;
        ixy_origin /= 24.0;
      }

      const ix: number = ix_origin - area * cy * cy;
      const iy: number = iy_origin - area * cx * cx;
      const ixy: number = ixy_origin - area * cx * cy;
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
      const { xMin, xMax, yMin, yMax } = this.getPolygonLimits(points);
      //console.log("Retrofit > getPolygonProperties", xMin, xMax, yMin, yMax );

      return {
        centroid: { x: cx, y: cy },
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
      console.error("getProperties > err:", err);
      return {};
    } finally {
      // finally
    }
  };

  /*
   *
   *
   */
  getQuadProperties = (points: Point[] = []) =>
    this.getPolygonProperties(points);

  /*
   *
   *
   */
  getPolylineProperties = (points: Point[] = []) => {
    //console.log("SectionProperties > getPolylineProperties", points);

    if (points.length === 0) {
      throw new Error("L'array dei punti non può essere vuoto.");
    }

    // --- Calculation Logic ---

    //let centroid = { x:0, y: 0 };
    let area: number = 0.0,
      cx: number = 0.0,
      cy: number = 0.0,
      ix_origin: number = 0.0,
      iy_origin: number = 0.0,
      ixy_origin: number = 0.0;

    try {
      const n: number = points.length;

      // Calcolo del baricentro (media aritmetica delle coordinate)
      const sum = points.reduce(
        (acc, p) => {
          acc.x += p.x;
          acc.y += p.y;
          return acc;
        },
        { x: 0, y: 0 },
      );
      cx = sum.x / n;
      cy = sum.y / n;

      // Calcolo dei momenti di inerzia rispetto al baricentro
      // (I_x = Σ(y_i - y_c)^2, I_y = Σ(x_i - x_c)^2, I_p = I_x + I_y)
      for (const p of points) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        ix_origin += dy * dy;
        iy_origin += dx * dx;
      }
      ixy_origin = ix_origin + iy_origin;

      //
      const ix: number = ix_origin - area * cy * cy;
      const iy: number = iy_origin - area * cx * cx;
      const ixy: number = ixy_origin - area * cx * cy;
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

      //console.log("Retrofit > getPolylineProperties", cx, cy);

      // limits
      const { xMin, xMax, yMin, yMax } = this.getPolygonLimits(points);
      //console.log("Retrofit > getPolylineProperties", xMin, xMax, yMin, yMax );

      return {
        centroid: { x: cx, y: cy },
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
      console.error("getPolylineProperties > err:", err);
      return {};
    } finally {
      // finally
    }
  };

  /*
   * lo strip non è "pieno"
   * per cui non posso calcolare le proprietà
   * come se fosse un poligono
   */
  getStripProperties = (points: Point[] = []) =>
    this.getPolylineProperties(points);

  /*
   *
   *
   */
  getCircPoints = (
    obj: any = {
      x: 0,
      y: 0,
      eR: 300,
      iR: 100,
      sA: 0,
      eA: 90,
      nSC: 10,
      nSR: 10,
    },
  ) => {
    //console.log("getCircPoints", obj);
    const { x, y, eR, iR, nSC } = obj;
    let { sA, eA } = obj;

    sA = (sA * Math.PI) / 180;
    eA = (eA * Math.PI) / 180;
    let points: Point[] = [];

    // counter-clockwise

    const dAng: number = nSC > 0 ? (eA - sA) / nSC : 0;
    //const dR: number = (nSR > 0) ? (eR - iR) / nSR : 0.;

    // angles
    let angles: number[] = [];
    for (let j = 0; j <= nSC; j++) {
      angles.push(sA + j * dAng);
    }

    // points
    angles
      .sort((a: number, b: number) => {
        return b - a;
      })
      .forEach((angle) => {
        const xi: number = x + iR * Math.cos(angle);
        const yi: number = y - iR * Math.sin(angle);
        points.push({ x: xi, y: yi });
      });
    // se iR == 0, il Point è uno solo = [x, y]

    angles
      .sort((a: number, b: number) => {
        return a - b;
      })
      .forEach((angle) => {
        const xi: number = x + eR * Math.cos(angle);
        const yi: number = y - eR * Math.sin(angle);
        points.push({ x: xi, y: yi });
      });

    //console.log("getCircPoints", points);

    // clockwise
    return points.reverse();
  };

  /*
   *
   *
   */
  getCircProperties = (
    obj: any = {
      x: 0,
      y: 0,
      eR: 300,
      iR: 100,
      sA: 0,
      eA: 90,
      nSC: 10,
      nSR: 10,
    },
  ) => this.getPolygonProperties(this.getCircPoints(obj));

  /*
   *
   *
   */
  getRectPoints = (obj: any = { x: 0, y: 0, width: 100, height: 100 }) => {
    const { x, y, width, height } = obj;

    // clockwise
    return [
      {
        x: x,
        y: y,
      },
      {
        x: x + width,
        y: y,
      },
      {
        x: x + width,
        y: y + height,
      },
      {
        x: x,
        y: y + height,
      },
    ];
  };

  /*
   *
   *
   */
  getRectProperties = (obj: any = { x: 0, y: 0, width: 100, height: 100 }) =>
    this.getPolygonProperties(this.getRectPoints(obj));

  /*
   *
   *
   */
  getFiberProperties = (obj: any = { x: 0, y: 0, a: 201 }) => {
    //console.log("getFiberProperties", obj);
    const { x, y, a }: { x: number; y: number; a: number } = obj;

    return {
      centroid: { x: x, y: y },
      area: a,
      ix_origin: a * y * y,
      iy_origin: a * x * x,
      ixy_origin: a * x * y,
      ix: 0,
      iy: 0,
      ixy: 0,
      // limits
      xMin: x,
      xMax: x,
      yMin: y,
      yMax: y,
    };
  };

  /*
   *
   *
   */
  getFibersLineProperties = (
    obj: any = { x: 0, y: 0, x2: 0, y2: 0, a: 201, nFibers: 2 },
  ) => {
    //console.log("getFibersLineProperties", obj);
    const {
      x,
      y,
      x2,
      y2,
      a,
      nFibers,
    }: {
      x: number;
      y: number;
      x2: number;
      y2: number;
      a: number;
      nFibers: number;
    } = obj;

    return {
      centroid: { x: (x + x2) / 2, y: (y + y2) / 2 },
      area: a * nFibers,
      ix_origin: 0,
      iy_origin: 0,
      ixy_origin: 0,
      ix: 0,
      iy: 0,
      ixy: 0,
      // limits
      xMin: x,
      xMax: x2,
      yMin: y,
      yMax: y2,
    };
  };

  /*
   *
   *
   */
  getFibersCircProperties = (
    obj: any = {
      x: 0,
      y: 0,
      r: 100,
      sA: 0,
      eA: 90,
      a: 201,
      nFibers: 2,
    },
  ) => {
    //console.log("getFibersCircProperties", obj);
    const {
      x,
      y,
      r,
      a,
      nFibers,
    }: {
      x: number;
      y: number;
      r: number;
      a: number;
      nFibers: number;
    } = obj;

    let { sA, eA }: { sA: number; eA: number } = obj;

    sA = (sA * Math.PI) / 180;
    eA = (eA * Math.PI) / 180;

    const area: number = a * nFibers;
    //const radius: number = Math.sqrt(a / Math.PI);
    const dAng: number = nFibers > 1 ? (eA - sA) / (nFibers - 1) : 0;

    let cx: number = 0.0,
      cy: number = 0.0,
      ix_origin: number = 0.0,
      iy_origin: number = 0.0,
      ixy_origin: number = 0.0;

    for (let j = 0; j < nFibers; j++) {
      const xj: number = x + r * Math.cos(sA + j * dAng);
      const yj: number = y - r * Math.sin(sA + j * dAng);

      cx += xj;
      cy += yj;

      ix_origin += a * yj * yj;
      iy_origin += a * xj * xj;
      ixy_origin += a * yj * xj;
    }

    cx /= nFibers;
    cy /= nFibers;

    return {
      centroid: { x: cx, y: cy },
      area: area,
      ix_origin: ix_origin,
      iy_origin: iy_origin,
      ixy_origin: ixy_origin,
      ix: ix_origin - area * cy * cy,
      iy: iy_origin - area * cx * cx,
      ixy: ixy_origin - area * cx * cy,
      // limits
      xMin: x - r,
      xMax: x + r,
      yMin: y - r,
      yMax: y + r,
    };
  };

  /*
   *
   *
   */
  getS2kPoints = (obj: any = { x: 0, y: 0, t2: 100, t3: 100 }) => {
    const { x, y, t2, t3 } = obj;

    // clockwise
    return [
      {
        x: x,
        y: y,
      },
      {
        x: x + t2,
        y: y,
      },
      {
        x: x + t2,
        y: y + t3,
      },
      {
        x: x,
        y: y + t3,
      },
    ];
  };

  /*
   *
   *
   */
  getS2kProperties = (obj: any = { x: 0, y: 0, t2: 100, t3: 100 }) =>
    this.getPolygonProperties(this.getS2kPoints(obj));

  /*
   *
   *
   */
  getElementFill = (materialId: string = "", materialOptions: any[] = []) => {
    if (!materialId) return "000";

    const material: any = materialOptions.find((i: any) => i.id === materialId);
    if (!material) return "000";
    if (material.hasOwnProperty("fill")) return material.fill;

    return "000";
  };

  /*
   *
   *
   */
  getElementProperties = (element: Element) => {
    //console.log("getElementProperties", element);
    const { component } = element;

    if (component === "Circle") return this.getCircleProperties(element);
    if (component === "Line") return this.getLineProperties(element);
    if (component === "Rect") return this.getRectProperties(element);
    if (component === "Polygon")
      return this.getPolygonProperties(
        element.hasOwnProperty("points") ? element.points : [],
      );

    //
    // Reinforced Concrete
    //
    if (component === "Quad")
      return this.getQuadProperties(
        element.hasOwnProperty("points") ? element.points : [],
      );
    if (component === "Circ") return this.getCircProperties(element);
    if (component === "Fiber") return this.getFiberProperties(element);
    if (component === "FibersLine")
      return this.getFibersLineProperties(element);
    if (component === "FibersCirc")
      return this.getFibersCircProperties(element);
    if (component === "Strip")
      return this.getStripProperties(
        element.hasOwnProperty("points") ? element.points : [],
      );

    //
    // S2k
    //
    // questo è un trick perchè calcola le properties all'inizio su una sezione
    // rettangolare.
    //
    // Retrofit.vue > PrepareData() esegue l'update delle element properties
    // successivamente vengono aggiornate nel watch dei params per
    // ciascun componente
    //
    if (component === "S2k") return this.getS2kProperties(element);

    return;
  };

  /*
   *
   *
   */
  getSectionProperties = (elements: any[] = []) => {
    //const keys = ['area']

    // --- Calculation Logic ---
    let centroid: Point = { x: 0, y: 0 },
      area: number = 0.0,
      cx: number = 0.0,
      cy: number = 0.0,
      ix_origin: number = 0.0,
      iy_origin: number = 0.0,
      ixy_origin: number = 0.0;

    try {
      // first element, init limits
      let { xMin, xMax, yMin, yMax } =
        elements.length > 0
          ? elements[0]
          : { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };

      for (const element of elements) {
        //console.log("getSectionProperties > element", element.centroid);
        area += element.hasOwnProperty("area") ? element.area : 0;
        cx +=
          element.hasOwnProperty("area") && element.centroid.hasOwnProperty("x")
            ? element.area * element.centroid.x
            : 0;
        cy +=
          element.hasOwnProperty("area") && element.centroid.hasOwnProperty("y")
            ? element.area * element.centroid.y
            : 0;
        ix_origin += element.hasOwnProperty("ix_origin")
          ? element.ix_origin
          : 0;
        //element.area * element.centroid.y * element.centroid.y;
        iy_origin += element.hasOwnProperty("iy_origin")
          ? element.iy_origin
          : 0;
        //element.area * element.centroid.x * element.centroid.x;
        ixy_origin += element.hasOwnProperty("ixy_origin")
          ? element.ixy_origin
          : 0;
        //element.area * element.centroid.y * element.centroid.x;

        // limits
        if (element.xMin < xMin) xMin = element.xMin;
        if (element.xMax > xMax) xMax = element.xMax;
        if (element.yMin < yMin) yMin = element.yMin;
        if (element.yMax > yMax) yMax = element.yMax;
      }

      cx /= area;
      cy /= area;
      centroid = { x: cx, y: cy };

      return {
        centroid: centroid,
        area: area,
        //cx: cx,
        //cy: cy,
        ix_origin: ix_origin,
        iy_origin: iy_origin,
        ixy_origin: ixy_origin,
        ix: ix_origin - area * cy * cy,
        iy: iy_origin - area * cx * cx,
        ixy: ixy_origin - area * cy * cx,
        // limits
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax,
      };
    } catch (err) {
      // catch
      console.error("SectionProperties > getSectionProperties > err:", err);
      return {};
    } finally {
      // finally
    }
  };
}

// SectionMesh
class SectionMesh {
  // use classes
  private rtf: Retrofit = new Retrofit();

  materials: any[];
  constructor(Materials: any[] = []) {
    //console.log("SectionMesh", Materials);
    this.materials = Materials;
  }

  /**
   * Generate fibers
   * nFibers: Numero di fibre (> 1)
   */
  getFibersLine(x: number, y: number, x2: number, y2: number, nFibers: number) {
    let fibers: number[][] = [];

    const dx: number = nFibers > 1 ? (x2 - x) / (nFibers - 1) : 0;
    const dy: number = nFibers > 1 ? (y2 - y) / (nFibers - 1) : 0;

    for (let j = 0; j < nFibers; j++) {
      const cx: number = x + j * dx;
      const cy: number = y + j * dy;

      fibers.push([cx, cy]);
    }

    //console.log("getFibersLine", fibers);
    return fibers;
  }

  /**
   * Generate fibers
   * nFibers: Numero di fibre (> 1)
   */
  getFibersCirc(
    x: number,
    y: number,
    r: number,
    sA: number,
    eA: number,
    //a: number,
    nFibers: number,
  ) {
    let fibers: number[][] = [];

    sA = (sA * Math.PI) / 180;
    eA = (eA * Math.PI) / 180;

    //const radius: number = Math.sqrt(a / Math.PI);
    const dAng: number = nFibers > 1 ? (eA - sA) / (nFibers - 1) : 0;

    for (let j = 0; j < nFibers; j++) {
      const cx: number = x + r * Math.cos(sA + j * dAng);
      const cy: number = y - r * Math.sin(sA + j * dAng);

      fibers.push([cx, cy]);
    }

    return fibers;
  }

  /**
   * Generate fibers
   * for a Strip (i.e. external FRP)
   */
  getFibersStrip(
    points: Point[],
    //thickness: number,
    //direction: string = "Longitudinal"
  ) {
    let fibers: number[][] = [];

    for (let j: number = 0; j < points.length - 1; j++) {
      const len: number = Math.hypot(
        points[j + 1].x - points[j].x,
        points[j + 1].y - points[j].y,
      );

      fibers.push([
        points[j].x / 2 + points[j + 1].x / 2,
        points[j].y / 2 + points[j + 1].y / 2,
        len,
      ]);
    }

    //console.log("getFibersStrip", fibers);
    return fibers;
  }

  /**
   * Get fibers of a element
   * component: Fiber | FibersLine | FibersCirc | Strip
   */
  getFibers = (element: any | undefined) => {
    //console.log("SectionMesh > getFibers", element);
    if (!element) return [];

    const {
      component, // Fiber | FibersLine | FibersCirc | Strip
      //materialId,
      //
      x,
      y,
      x2,
      y2,
      //
      r,
      sA,
      eA,
      //
      a,
      nFibers,
      // Strip
      points,
      thickness,
    }: {
      component: string;
      materialId: string;
      //
      x: number;
      y: number;
      x2: number;
      y2: number;
      //
      r: number;
      sA: number;
      eA: number;
      //
      a: number;
      nFibers: number;
      // Strip
      points: Point[];
      thickness: number;
    } = element;

    const uts: Utils = new Utils();

    // get materialId | material
    const material = uts.clone(
      this.materials.find((i: any) => i.id === element.materialId),
    ); // clone to avoid the change of the main materials array

    let fibers: any[] = [];

    // Fiber
    if (component === "Fiber") fibers = [[x, y]];

    // FibersLine
    if (component === "FibersLine")
      fibers = this.getFibersLine(x, y, x2, y2, nFibers);

    // FibersCirc
    if (component === "FibersCirc")
      fibers = this.getFibersCirc(x, y, r, sA, eA, nFibers);

    // Strip
    if (component === "Strip") fibers = this.getFibersStrip(points);

    //
    // return fibers for calculation
    let myFibers: any[] = [];
    for (let i = 0; i < fibers.length; i++) {
      const fiber = fibers[i];

      const myFiber = {
        x: fiber[0],
        y: fiber[1],
        a: component !== "Strip" ? a : fiber[2] * thickness,
      };

      material
        ? Object.assign(myFiber, { material: material })
        : Object.assign(myFiber, { materialId: element.materialId });

      myFibers.push(myFiber);
    }

    //console.log("SectionMesh > getFibers", myFibers);
    return myFibers;
  };

  /**
   * Generate meshes of quad (four points)
   * nRC: Numero di righe e colonne della griglia
   */
  getQuadMeshes(points: Point[] = [], nRC: number[] = [1, 1]) {
    //console.log("SectionProperties > getQuadMeshes", points, nRC);
    if (!points || points.length !== 4) return [];

    let mesh: any[] = [];

    // counter-clockwise
    const myPoints: any = points.map((i: Point) => [i.x, i.y]).flat();
    //console.log("SectionProperties > getQuadMeshes", myPoints);

    // counter-clockwise
    const [xi, yi, xj, yj, xk, yk, xl, yl]: [
      xi: number,
      yi: number,
      xj: number,
      yj: number,
      xk: number,
      yk: number,
      xl: number,
      yl: number,
    ] = myPoints;
    /*
    console.log(
      "SectionProperties > getQuadMeshes",
      xi,
      yi,
      xj,
      yj,
      xl,
      yl,
      xk,
      yk
    );
    */

    // Numero di righe e colonne della griglia
    const [nRows, nCols] = nRC;

    // Array per memorizzare i quadrilateri interni
    let internalQuadrilaterals: Array<Point[]> = [];

    let gridNodes: Array<Point[]> = [];

    // Genera i nodi della griglia
    for (let i = 0; i <= nRows; i++) {
      gridNodes[i] = [];
      for (let j = 0; j <= nCols; j++) {
        // Calcola i parametri di interpolazione
        let u = i / nRows;
        let v = j / nCols;

        // Calcola la posizione del nodo con interpolazione bilineare
        let x =
          (1 - u) * (1 - v) * xi +
          u * (1 - v) * xj +
          u * v * xk +
          (1 - u) * v * xl;
        let y =
          (1 - u) * (1 - v) * yi +
          u * (1 - v) * yj +
          u * v * yk +
          (1 - u) * v * yl;

        gridNodes[i][j] = { x: x, y: y };
      }
    }

    // Raggruppa le coordinate dei nodi per formare i quadrilateri interni
    for (let i = 0; i < nRows; i++) {
      for (let j = 0; j < nCols; j++) {
        let p1 = gridNodes[i][j];
        let p2 = gridNodes[i][j + 1];
        let p3 = gridNodes[i + 1][j + 1];
        let p4 = gridNodes[i + 1][j];
        //console.log("SectionProperties > getQuadMeshes: ", [p1, p2, p3, p4]);
        internalQuadrilaterals.push([p1, p2, p3, p4]); // non serve

        /*
        mesh.push({
          ShapeName: ShapeName,
          points: [p4, p3, p2, p1], // counter-clockwise
          props: this.getPolygonProperties([p4, p3, p2, p1]), // counter-clockwise
        });
        */
        //mesh.push([p1, p2, p3, p4]); // counter-clockwise
        mesh.push([p4, p3, p2, p1]); // clockwise
      }
    }

    //const polygons: any = this.getQuads(Section);
    //console.log("s2k > getQuadMeshes", polygons);

    /*
      for (const Polygon of polygons) {
        //console.log("s2k > getQuadMeshes", Polygon);
  
        const { ShapeName, points } = Polygon;
        // { ShapeName: string; points: Point[] }
  
        const [xi, yi, xj, yj, xk, yk, xl, yl]: [
          xi: number,
          yi: number,
          xj: number,
          yj: number,
          xk: number,
          yk: number,
          xl: number,
          yl: number
        ] = points.map((i: Point) => [i.x, i.y]).flat();
        //console.log("s2k > getQuadMeshes", xi, yi, xj, yj, xl, yl, xk, yk);
  
        // Numero di righe e colonne della griglia
        let nRows: number = 10;
        let nCols: number = 10;
  
        // Array per memorizzare i quadrilateri interni
        let internalQuadrilaterals = [];
  
        let gridNodes: Array<Array<Point>> = [];
  
        // Genera i nodi della griglia
        for (let i = 0; i <= nRows; i++) {
          gridNodes[i] = [];
          for (let j = 0; j <= nCols; j++) {
            // Calcola i parametri di interpolazione
            let u = i / nRows;
            let v = j / nCols;
  
            // Calcola la posizione del nodo con interpolazione bilineare
            let x =
              (1 - u) * (1 - v) * xi +
              u * (1 - v) * xj +
              u * v * xk +
              (1 - u) * v * xl;
            let y =
              (1 - u) * (1 - v) * yi +
              u * (1 - v) * yj +
              u * v * yk +
              (1 - u) * v * yl;
  
            gridNodes[i][j] = { x:x, y: y };
          }
        }
  
        // Raggruppa le coordinate dei nodi per formare i quadrilateri interni
        for (let i = 0; i < nRows; i++) {
          for (let j = 0; j < nCols; j++) {
            let p1 = gridNodes[i][j];
            let p2 = gridNodes[i][j + 1];
            let p3 = gridNodes[i + 1][j + 1];
            let p4 = gridNodes[i + 1][j];
            //console.log("s2k > getQuadMeshes: ", [p1, p2, p3, p4]);
            internalQuadrilaterals.push([p1, p2, p3, p4]); // non serve
  
            mesh.push({
              ShapeName: ShapeName,
              points: [p4, p3, p2, p1], // counter-clockwise
              props: this.getPolygonProperties([p4, p3, p2, p1]), // counter-clockwise
            });
          }
        }
  
        //console.log("s2k > getQuadMeshes: ", gridNodes, internalQuadrilaterals);
      }
      */

    //console.log("getQuadMeshes: ", mesh);
    return mesh;
  }

  /**
   * Generate meshes of quads
   * nSC: numSubdivCirc
   */
  getCircMeshes(
    obj: any = {
      x: 0,
      y: 0,
      eR: 300,
      iR: 100,
      sA: 0,
      eA: 90,
      nSC: 10,
      nSR: 10,
    },
  ) {
    //console.log("SectionMesh > getCircMeshes", obj);

    const { x, y, eR, iR, nSC, nSR } = obj;
    let { sA, eA } = obj;

    sA = (sA * Math.PI) / 180;
    eA = (eA * Math.PI) / 180;

    let mesh: any[] = [];

    const dAng: number = nSC > 0 ? (eA - sA) / nSC : 0;
    const dR: number = nSR > 0 ? (eR - iR) / nSR : 0;

    let vjj: Array<number[]> = [];
    for (let j = 0; j <= nSR; j++) {
      const iRj: number = iR + j * dR;

      const vj = vjj;
      vjj = [];
      for (let k = 0; k <= nSC; k++) {
        const angle: number = sA + k * dAng;

        const x1: number = x + iRj * Math.cos(angle);
        const y1: number = y - iRj * Math.sin(angle);

        vjj.push([x1, y1]);

        //let Sx = 0, Sy = 0;
        if (j > 0 && k > 0) {
          const v1 = vj[k]; //Sx = Sx + v1[0]; Sy = Sy + v1[1];
          const v2 = vj[k - 1]; //Sx = Sx + v2[0]; Sy = Sy + v2[1];
          const v3 = vjj[k - 1]; //Sx = Sx + v3[0]; Sy = Sy + v3[1];
          const v4 = vjj[k]; //Sx = Sx + v4[0]; Sy = Sy + v4[1];

          const vertex: Point[] = [
            { x: v1[0], y: v1[1] },
            { x: v2[0], y: v2[1] },
            { x: v3[0], y: v3[1] },
            { x: v4[0], y: v4[1] },
          ];

          mesh.push(vertex);
        }
      }
    }

    //console.log("getCircMeshes > mesh: ", mesh);
    return mesh;
  }

  /*
   * Generate mesh
   *
   */
  getSectionMesh = (elements: any[] = []) => {
    //console.log("getSectionMesh", elements);

    let sectionMesh: any = [];

    const uts: Utils = new Utils();
    const sps: any = new SectionProperties();

    try {
      //console.log("getSectionMesh", elements);
      for (const element of elements) {
        //console.log("getSectionMesh", element);

        // get component
        const component: string | undefined = Object.keys(element).includes(
          "component",
        )
          ? element["component"]
          : undefined;
        //console.log("getSectionMesh > component", component);
        if (!component) return [];

        // only components for meshing // S2k has its class
        if (!["Rect", "Polygon", "Quad", "Circ"].includes(component)) continue;

        // points of Polygon | Quad
        let points: any | undefined = Object.keys(element).includes("points")
          ? element["points"]
          : undefined;
        //console.log("getSectionMesh > points", points);
        //if (!points) continue;

        // points of Rect
        if (component === "Rect") points = sps.getRectPoints(element);

        //const [nRows, nCols]: [nRows: number, nCols: number] = element;
        const nRows: number = Object.keys(element).includes("nRows")
          ? element["nRows"]
          : 3;
        const nCols: number = Object.keys(element).includes("nCols")
          ? element["nCols"]
          : 3;
        //console.log("getSectionMesh > [nRows, nCols]", [nRows, nCols]);

        // quads
        let quads = this.getQuadMeshes(points, [nRows, nCols]);

        //
        // Circ
        if (component === "Circ") quads = this.getCircMeshes(element);
        //console.log("getSectionMesh > quads", quads);

        // get materialId | material
        const material = uts.clone(
          this.materials.find((i: any) => i.id === element.materialId),
        ); // clone to avoid the change of the main materials array

        //
        // get the mesh
        for (const q in quads) {
          const quad: Point[] = quads[q];
          //console.log("getSectionMesh > quad", quad);

          const { centroid, area } = sps.getQuadProperties(quad);

          let mesh = {
            id: `${element["id"]}_quad-${q}`,
            name: q,
            points: quad,
            centroid: centroid,
            area: Math.abs(area), // da controllare dove viene calcolata l'area se è positiva
          };

          material
            ? Object.assign(mesh, { material: material })
            : Object.assign(mesh, { materialId: element.materialId });

          sectionMesh.push(mesh);
        }
      }

      //console.log("getSectionMesh > sectionMesh:", sectionMesh);
      return sectionMesh;
    } catch (err) {
      console.error("SectionMesh > getSectionMesh > err:", err);
      return [];
    }
  };

  /**
   * Generate mesh
   * i.e. for centroidal coordinates' system
   */
  getSectionMeshForCalculation = (
    elements: any[] = [],
    [tx, ty]: number[] = [0, 0], // - centroid
    alpha: number = 0, // Math.PI / 2
  ) => {
    //console.log("getSectionMeshForCalculation", elements);

    const uts = new Utils();
    let sectionMesh: any[] = uts.clone(this.getSectionMesh(elements));
    //console.log("S2k > getSectionMeshForCalculation", sectionMesh);

    for (const i of sectionMesh) {
      //console.log("S2k > getSectionMeshForCalculation", i.points);

      Object.assign(i, {
        points: i.points.map((p: Point) =>
          this.rtf.translatePoint(p, [tx, ty]),
        ),
        centroid: this.rtf.translatePoint(i.centroid, [tx, ty]),
      });

      Object.assign(i, {
        points: i.points.map((p: Point) => this.rtf.rotatePoint(p, alpha)),
        centroid: this.rtf.rotatePoint(i.centroid, alpha),
      });
    }

    //console.log("S2k > getSectionMeshForCalculation", S2kMesh);
    return sectionMesh;
  };

  /**
   * get mesh limits
   *
   */
  getSectionMeshLimits = (SectionMesh: any) => {
    const uts = new Utils();
    const mesh: any[] = uts.clone(SectionMesh);

    const x: number[] = mesh
      .map((i: any) => i.points)
      .flat()
      .map((p: Point) => p.x);

    const y: number[] = mesh
      .map((i: any) => i.points)
      .flat()
      .map((p: Point) => p.y);
    //console.log("getSectionMeshLimits > y", y);

    const xmin: number = Math.min.apply(Math, x);
    const ymin: number = Math.min.apply(Math, y);
    //console.log("getS2kMeshLimits > ymin", ymin);
    const xmax: number = Math.max.apply(Math, x);
    const ymax: number = Math.max.apply(Math, y);
    //console.log("getS2kMeshLimits > ymax", ymax);

    return { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
  };
}

// S2k
class S2k {
  // use classes
  private rtf: Retrofit = new Retrofit();
  private sps: SectionProperties = new SectionProperties();
  private smh: SectionMesh = new SectionMesh();

  materials: any[];
  constructor(Materials: any[] = []) {
    //console.log("S2k", Materials);
    this.materials = Materials;
  }

  /**
   * Generate cross-section points of polygons from s2k variables
   * svg coordinates' system
   * PC beam da sistemare
   */
  getPolygons = (element: any | undefined) => {
    console.log("S2k > getPolygons", element);
    if (!element) return [];

    const {
      x,
      y,
      Shape,
      t2,
      t3,
      tw,
      tf,
      t2b,
      tfb,
      FilletRadius,
      //
      T2,
      T3,
    }: {
      x: number;
      y: number;
      Shape: string;
      t2: number;
      t3: number;
      tw: number;
      tf: number;
      t2b: number;
      tfb: number;
      FilletRadius: number;
      //
      T2: number;
      T3: number;
    } = element;
    //console.log("S2k > getPolygons", { x, y });

    // origin
    const x0: number = x,
      y0: number = y;

    // counter-clockwise
    let polygons: any[] = [];

    if (Shape === "Rectangular") {
      let points: Point[] = [];

      points.push({ x: x0, y: y0 });
      points.push({ x: x0, y: y0 + t3 });
      points.push({ x: x0 + t2, y: y0 + t3 });
      points.push({ x: x0 + t2, y: y0 });

      //console.log("S2k > getPolygons", points);
      polygons.push({ points: points });
    }

    if (Shape == "Tee") {
      //const hw: number = t3 - tf;
      let points: Point[] = [];

      points.push({ x: x0, y: y0 });
      points.push({ x: x0, y: y0 + tf });
      points.push({ x: x0 + (t2 - tw) / 2 - FilletRadius, y: y0 + tf });
      if (FilletRadius > 0)
        points.push({ x: x0 + (t2 - tw) / 2, y: y0 + tf + FilletRadius });
      points.push({ x: x0 + (t2 - tw) / 2, y: y0 + t3 });
      points.push({ x: x0 + (t2 + tw) / 2, y: y0 + t3 });
      if (FilletRadius > 0)
        points.push({ x: x0 + (t2 + tw) / 2, y: y0 + tf + FilletRadius });
      points.push({ x: x0 + (t2 + tw) / 2 + FilletRadius, y: y0 + tf });
      points.push({ x: x0 + t2, y: y0 + tf });
      points.push({ x: x0 + t2, y: y0 });

      //console.log("S2k > getPolygons", points);
      polygons.push({ points: points });
    }

    if (Shape == "I/Wide Flange") {
      //const hw: number = t3 - (tf + tfb);
      let points: Point[] = [];

      points.push({ x: x0, y: y0 });
      points.push({ x: x0, y: y0 + tf });
      points.push({ x: x0 + (t2 - tw) / 2 - FilletRadius, y: y0 + tf });
      if (FilletRadius > 0)
        points.push({ x: x0 + (t2 - tw) / 2, y: y0 + tf + FilletRadius });

      points.push({
        x: x0 + (t2 - tw) / 2,
        y: y0 + t3 - tfb - FilletRadius,
      });
      if (FilletRadius > 0)
        points.push({
          x: x0 + (t2 - tw) / 2 - FilletRadius,
          y: y0 + t3 - tfb,
        });
      points.push({ x: x0 + (t2 - tw) / 2 - (t2b - tw) / 2, y: y0 + t3 - tfb });
      points.push({ x: x0 + (t2 - tw) / 2 - (t2b - tw) / 2, y: y0 + t3 });
      points.push({ x: x0 + (t2 - tw) / 2 + (t2b + tw) / 2, y: y0 + t3 }); // 6
      points.push({ x: x0 + (t2 - tw) / 2 + (t2b + tw) / 2, y: y0 + t3 - tfb }); // 7

      points.push({ x: x0 + (t2 + tw) / 2 + FilletRadius, y: y0 + t3 - tfb });
      if (FilletRadius > 0)
        points.push({ x: x0 + (t2 + tw) / 2, y: y0 + t3 - tfb - FilletRadius });
      points.push({ x: x0 + (t2 + tw) / 2, y: y0 + tf + FilletRadius });
      if (FilletRadius > 0)
        points.push({ x: x0 + (t2 + tw) / 2 + FilletRadius, y: y0 + tf });
      points.push({ x: x0 + t2, y: y0 + tf });
      points.push({ x: x0 + t2, y: y0 });

      //console.log("S2k > getPolygons", points);
      polygons.push({ points: points });
    }

    if (Shape == "Box/Tube") {
      //const hw: number = t3 - 2 * tf;
      let points: Point[] = [];

      points.push({ x: x0, y: y0 });
      points.push({ x: x0, y: y0 + t3 });
      points.push({ x: x0 + t2, y: y0 + t3 });
      points.push({ x: x0 + t2, y: y0 });

      polygons.push({ points: points });

      points = [];
      points.push({ x: x0 + tw, y: y0 + tf });
      points.push({ x: x0 + tw, y: y0 + t3 - tf });
      points.push({ x: x0 + t2 - tw, y: y0 + t3 - tf });
      points.push({ x: x0 + t2 - tw, y: y0 + tf });

      polygons.push({ points: points, fill: "FFF" });
    }

    if (Shape == "PC Conc I Girder") {
      const {
        B1,
        B2,
        T1,
        D1,
        D2,
        D3,
        D5,
        D6,
      }: {
        B1: number;
        B2: number;
        T1: number;
        D1: number;
        D2: number;
        D3: number;
        D5: number;
        D6: number;
      } = element;

      //const Dw: number = +D1 - (D2 + D3 + D5 + D6);
      let points: Point[] = [];

      points.push({ x: x0, y: y0 });
      points.push({ x: x0, y: y0 + D2 });
      points.push({ x: x0 + (B1 - T1) / 2, y: y0 + D2 + D3 });
      points.push({ x: x0 + (B1 - T1) / 2, y: y0 + D1 - D5 - D6 });
      points.push({ x: x0 + (B1 - T1) / 2 - (B2 - T1) / 2, y: y0 + D1 - D5 });
      points.push({ x: x0 + (B1 - T1) / 2 - (B2 - T1) / 2, y: y0 + D1 });
      points.push({ x: x0 + (B1 - T1) / 2 + (B2 + T1) / 2, y: y0 + D1 });
      points.push({ x: x0 + (B1 - T1) / 2 + (B2 + T1) / 2, y: y0 + D1 - D5 });
      points.push({ x: x0 + (B1 + T1) / 2, y: y0 + D1 - D5 - D6 });
      points.push({ x: x0 + (B1 + T1) / 2, y: y0 + D2 + D3 });
      points.push({ x: x0 + B1, y: y0 + D2 });
      points.push({ x: x0 + B1, y: y0 });

      polygons.push({ points: points });
    }

    if (Shape === "Circle") {
      let points: Point[] = [];

      const Radius: number = t3 / 2;

      for (let q = 0; q < 360; q++) {
        const s: number = Math.sin((q * Math.PI) / 180);
        const c: number = Math.cos((q * Math.PI) / 180);

        points.push({ x: x0 + Radius * (1 + c), y: y0 + Radius * (1 + s) });
      }

      polygons.push({ points: points });
    }

    if (Shape === "Pipe") {
      let points: Point[] = [];

      const Radius3: number = t3 / 2;
      const Radius2: number = t3 / 2 - tw;

      // counter-clockwise
      for (let q = 0; q < 360; q++) {
        const s: number = Math.sin((q * Math.PI) / 180);
        const c: number = Math.cos((q * Math.PI) / 180);

        points.push({
          x: x0 + Radius3 + Radius3 * c,
          y: y0 + Radius3 + Radius3 * s,
        });
      }
      polygons.push({ points: points });

      points = [];

      // clockwise
      for (let q = 360; q > 0; q--) {
        const s: number = Math.sin((q * Math.PI) / 180);
        const c: number = Math.cos((q * Math.PI) / 180);

        points.push({
          x: x0 + Radius3 + Radius2 * c,
          y: y0 + Radius3 + Radius2 * s,
        });
      }
      polygons.push({ points: points, fill: "FFF" });
    }

    //console.log("S2k > getPolygons", polygons);
    return polygons;
  };

  /**
   * Generate rebars' list from s2k variables
   * svg coordinates' system
   * PC beam da sistemare
   */
  getRebars = (element: any | undefined) => {
    //console.log("S2k > getRebars", element);
    if (!element) return [];

    const {
      x,
      y,
      //
      Shape,
      ConcBeam,
      ConcCol,
      ConcBeamCol,
      t2,
      t3,
      tw,
      tf,
      t2b,
      //tfb,
      B1,
      B2,
      D1,
      BarSizeC,
      BarSizeL,
      Cover,
      TopCover,
      BotCover,
      TopRebarArea,
      BotRebarArea,
      RebarMatL,
    }: {
      x: number;
      y: number;
      //
      Shape: string;
      ConcBeam: string;
      ConcCol: string;
      ConcBeamCol: string;
      t2: number;
      t3: number;
      tw: number;
      tf: number;
      t2b: number;
      //tfb: number,
      B1: number;
      B2: number;
      D1: number;
      BarSizeC: number;
      BarSizeL: number;
      Cover: number;
      TopCover: number;
      BotCover: number;
      TopRebarArea: number;
      BotRebarArea: number;
      RebarMatL: string;
    } = element;
    //console.log("s2k > getRebars > ConcBeamCol", ConcBeamCol);

    //
    if (Shape === "PC Conc I Girder") return [];

    //const h: number = "PC Conc I Girder" === Shape ? D1 : t3;
    //console.log("s2k > getRebars", h);

    const x0: number = x,
      y0: number = y;

    let rebars: Rebar[] = [],
      dx: number = 0,
      dy: number = 0;

    // Beam
    if (ConcBeam === "Yes" || ConcBeamCol === "Beam") {
      // side cover
      const Cover: number = Math.min(TopCover, BotCover);

      const TopRebarRadius: number = Math.sqrt(TopRebarArea / Math.PI);
      const TopRebarNumber: number = element.hasOwnProperty("TopRebarNumber")
        ? element.TopRebarNumber > 1
          ? element.TopRebarNumber
          : 2
        : 2;
      const BotRebarRadius: number = Math.sqrt(BotRebarArea / Math.PI);
      const BotRebarNumber: number = element.hasOwnProperty("BotRebarNumber")
        ? element.BotRebarNumber > 1
          ? element.BotRebarNumber
          : 2
        : 2;

      // return [x, y][]
      const TopRebarsCoords = this.smh.getFibersLine(
        x + Cover + BarSizeC + TopRebarRadius, // x
        y + BotCover + BarSizeC + TopRebarRadius, // y
        x + t2 - (Cover + BarSizeC + TopRebarRadius), // x2
        y + BotCover + BarSizeC + TopRebarRadius, // y2
        TopRebarNumber, // nFibers
      );
      //console.log("TopRebarsCoords", TopRebarsCoords);
      TopRebarsCoords.forEach((i) =>
        rebars.push({
          x: i[0],
          y: i[1],
          a: TopRebarArea,
        }),
      );

      // Rectangular
      if (Shape === "Rectangular") {
        // return [x, y][]
        const BotRebarsCoords = this.smh.getFibersLine(
          x + Cover + BarSizeC + BotRebarRadius, // x
          y + t3 - (BotCover + BarSizeC + BotRebarRadius), // y
          x + t2 - (Cover + BarSizeC + BotRebarRadius), // x2
          y + t3 - (BotCover + BarSizeC + BotRebarRadius), // y2
          BotRebarNumber, // nFibers
        );
        //console.log("BotRebarsCoords", BotRebarsCoords);
        BotRebarsCoords.forEach((i) =>
          rebars.push({
            x: i[0],
            y: i[1],
            a: BotRebarArea,
          }),
        );
      }

      // Tee
      if (Shape === "Tee") {
        dx =
          BotRebarNumber > 1
            ? (tw - 2 * Cover - 2 * BotRebarRadius - 2 * BarSizeC) /
              (BotRebarNumber - 1)
            : 0;
        for (let i = 0; i < +BotRebarNumber; i++) {
          rebars.push({
            x: x0 + (t2 - tw) / 2 + Cover + BarSizeC + BotRebarRadius + i * dx,
            y: y0 + t3 - (BotCover + BarSizeC + BotRebarRadius),
            a: BotRebarArea,
            //r: BotRebarRadius,
          });
        }
      }

      // I/Wide Flange
      if (Shape === "I/Wide Flange") {
        dx =
          BotRebarNumber > 1
            ? (t2b - 2 * Cover - 2 * BotRebarRadius - 2 * BarSizeC) /
              (BotRebarNumber - 1)
            : 0;
        for (let i = 0; i < BotRebarNumber; i++) {
          rebars.push({
            x: x0 + (t2 - t2b) / 2 + Cover + BarSizeC + BotRebarRadius + i * dx,
            y: y0 + t3 - (BotCover + BarSizeC + BotRebarRadius),
            a: BotRebarArea,
          });
        }
      }

      // PC Conc I Girder
      if (Shape == "PC Conc I Girder") {
        rebars = [];

        // top
        dx =
          TopRebarNumber > 1
            ? (B1 - 2 * Cover - 2 * BarSizeC - 2 * TopRebarRadius) /
              (TopRebarNumber - 1)
            : 0;
        for (let i = 0; i < TopRebarNumber; i++) {
          rebars.push({
            x: x0 + Cover + BarSizeC + TopRebarRadius + i * dx,
            y: y0 + D1 - (TopCover + BarSizeC + TopRebarRadius),
            a: TopRebarArea,
            //r: TopRebarRadius,
          });
        }

        // bottom
        dx =
          BotRebarNumber > 1
            ? (B2 - 2 * Cover - 2 * BotRebarRadius - 2 * BarSizeC) /
              (BotRebarNumber - 1)
            : 0;
        for (let i = 0; i < BotRebarNumber; i++) {
          rebars.push({
            x: x0 + (B1 - B2) / 2 + Cover + BarSizeC + BotRebarRadius + i * dx,
            y: y0 + BotCover + BarSizeC + BotRebarRadius,
            a: BotRebarArea,
            //r: BotRebarRadius,
          });
        }
      }
    }

    // Column
    if (ConcCol === "Yes" || ConcBeamCol === "Column") {
      const Area: number = (Math.PI * BarSizeL * BarSizeL) / 4;
      const Radius: number = BarSizeL / 2;
      const NumBars2Dir: number = element.hasOwnProperty("NumBars2Dir")
        ? element.NumBars2Dir === 1
          ? 2
          : element.NumBars2Dir
        : 2;
      const NumBars3Dir: number = element.hasOwnProperty("NumBars3Dir")
        ? element.NumBars3Dir === 1
          ? 2
          : element.NumBars3Dir
        : 2;
      //console.log(NumBars2Dir, NumBars3Dir);

      dy =
        NumBars3Dir > 1
          ? (t3 - 2 * Cover - 2 * Radius - 2 * BarSizeC) / (NumBars3Dir - 1)
          : 0;

      // return [x, y][]
      const TopRebarsCoords = this.smh.getFibersLine(
        x + Cover + BarSizeC + Radius, // x
        y + Cover + BarSizeC + Radius, // y
        x + t2 - (Cover + BarSizeC + Radius), // x2
        y + Cover + BarSizeC + Radius, // y2
        NumBars2Dir, // nFibers
      );
      TopRebarsCoords.forEach((i) =>
        rebars.push({
          x: i[0],
          y: i[1],
          a: Area,
        }),
      );

      const BotRebarsCoords = this.smh.getFibersLine(
        x + Cover + BarSizeC + Radius, // x
        y + t3 - (Cover + BarSizeC + Radius), // y
        x + t2 - (Cover + BarSizeC + Radius), // x2
        y + t3 - (Cover + BarSizeC + Radius), // y2
        NumBars2Dir, // nFibers
      );
      BotRebarsCoords.forEach((i) =>
        rebars.push({
          x: i[0],
          y: i[1],
          a: Area,
        }),
      );

      const LeftRebarsCoords = this.smh.getFibersLine(
        x + Cover + BarSizeC + Radius, // x
        y + Cover + BarSizeC + Radius + dy, // y
        x + Cover + BarSizeC + Radius, // x2
        y + t3 - (Cover + BarSizeC + Radius + dy), // y2
        NumBars3Dir - 2, // nFibers
      );
      LeftRebarsCoords.forEach((i) =>
        rebars.push({
          x: i[0],
          y: i[1],
          a: Area,
        }),
      );

      const RigthRebarsCoords = this.smh.getFibersLine(
        x + t2 - (Cover + BarSizeC + Radius), // x
        y + Cover + BarSizeC + Radius + dy, // y
        x + t2 - (Cover + BarSizeC + Radius), // x2
        y + t3 - (Cover + BarSizeC + Radius + dy), // y2
        NumBars3Dir - 2, // nFibers
      );
      RigthRebarsCoords.forEach((i) =>
        rebars.push({
          x: i[0],
          y: i[1],
          a: Area,
        }),
      );

      // Box/Tube
      if (Shape === "Box/Tube") {
        rebars = [];

        // top left
        rebars.push({
          x: x0 + Cover + BarSizeC + Radius,
          y: y0 + Cover + BarSizeC + Radius,
          a: Area,
          //r: Radius,
        });

        rebars.push({
          x: x0 + tw - (Cover + BarSizeC + Radius),
          y: y0 + Cover + BarSizeC + Radius,
          a: Area,
          //r: Radius,
        });

        rebars.push({
          x: x0 + Cover + BarSizeC + Radius,
          y: y0 + tf - (Cover + BarSizeC + Radius),
          a: Area,
          //r: Radius,
        });

        rebars.push({
          x: x0 + tw - (Cover + BarSizeC + Radius),
          y: y0 + tf - (Cover + BarSizeC + Radius),
          a: Area,
          //r: Radius,
        });

        // bottom left
        rebars.push({
          x: x0 + Cover + BarSizeC + Radius,
          y: y0 + t3 - (Cover + BarSizeC + Radius),
          a: Area,
          //r: Radius,
        });

        rebars.push({
          x: x0 + tw - (Cover + BarSizeC + Radius),
          y: y0 + t3 - (Cover + BarSizeC + Radius),
          a: Area,
          //r: Radius,
        });

        rebars.push({
          x: x0 + Cover + BarSizeC + Radius,
          y: y0 + t3 - tf + (Cover + BarSizeC + Radius),
          a: Area,
          //r: Radius,
        });

        rebars.push({
          x: x0 + tw - (Cover + BarSizeC + Radius),
          y: y0 + t3 - tf + (Cover + BarSizeC + Radius),
          a: Area,
          //r: Radius,
        });

        // top right
        rebars.push({
          x: x0 + t2 - (Cover + BarSizeC + Radius),
          y: y0 + Cover + BarSizeC + Radius,
          a: Area,
          //r: Radius,
        });

        rebars.push({
          x: x0 + t2 - tw + (Cover + BarSizeC + Radius),
          y: y0 + Cover + BarSizeC + Radius,
          a: Area,
          //r: Radius,
        });

        rebars.push({
          x: x0 + t2 - (Cover + BarSizeC + Radius),
          y: y0 + tf - (Cover + BarSizeC + Radius),
          a: Area,
          //r: Radius,
        });

        rebars.push({
          x: x0 + t2 - tw + (Cover + BarSizeC + Radius),
          y: y0 + tf - (Cover + BarSizeC + Radius),
          a: Area,
          //r: Radius,
        });

        // bottom right
        rebars.push({
          x: x0 + t2 - (Cover + BarSizeC + Radius),
          y: y0 + t3 - (Cover + BarSizeC + Radius),
          a: Area,
          //r: Radius,
        });

        rebars.push({
          x: x0 + t2 - tw + (Cover + BarSizeC + Radius),
          y: y0 + t3 - (Cover + BarSizeC + Radius),
          a: Area,
          //r: Radius,
        });

        rebars.push({
          x: x0 + t2 - (Cover + BarSizeC + Radius),
          y: y0 + t3 - tf + (Cover + BarSizeC + Radius),
          a: Area,
          //r: Radius,
        });

        rebars.push({
          x: x0 + t2 - tw + (Cover + BarSizeC + Radius),
          y: y0 + t3 - tf + (Cover + BarSizeC + Radius),
          a: Area,
          //r: Radius,
        });

        // x
        dx = NumBars2Dir > 1 ? (t2 - 2 * tw) / (NumBars2Dir - 1) : 0;
        for (let i = 0; i < NumBars2Dir; i++) {
          rebars.push({
            x: x0 + tw + i * dx,
            y: y0 + Cover + BarSizeC + Radius,
            a: Area,
            //r: Radius,
          });
          rebars.push({
            x: x0 + tw + i * dx,
            y: y0 + tf - (Cover + BarSizeC + Radius),
            a: Area,
            //r: Radius,
          });
          rebars.push({
            x: x0 + tw + i * dx,
            y: y0 + t3 - tf + (Cover + BarSizeC + Radius),
            a: Area,
            //r: Radius,
          });
          rebars.push({
            x: x0 + tw + i * dx,
            y: y0 + t3 - (Cover + BarSizeC + Radius),
            a: Area,
            //r: Radius,
          });
        }

        // Y
        dy = NumBars3Dir > 1 ? (t3 - 2 * tf) / (NumBars3Dir - 1) : 0;
        for (let i = 0; i < NumBars3Dir; i++) {
          rebars.push({
            x: x0 + Cover + BarSizeC + Radius,
            y: y0 + tf + i * dy,
            a: Area,
            //r: Radius,
          });
          rebars.push({
            x: x0 + tw - (Cover + BarSizeC + Radius),
            y: y0 + tf + i * dy,
            a: Area,
            //r: Radius,
          });
          rebars.push({
            x: x0 + t2 - (Cover + BarSizeC + Radius),
            y: y0 + tf + i * dy,
            a: Area,
            //r: Radius,
          });
          rebars.push({
            x: x0 + t2 - tw + (Cover + BarSizeC + Radius),
            y: y0 + tf + i * dy,
            a: Area,
            //r: Radius,
          });
        }
      }

      if (Shape === "Circle") {
        rebars = [];

        const Radius3: number = t3 / 2;

        // external
        let q: number = 0,
          dq: number = NumBars3Dir > 0 ? 360 / NumBars3Dir : 360;
        //console.log(NumBars3Dir, dq);

        while (q < 360 && NumBars3Dir > 0) {
          //console.log(q);
          const s: number = Math.sin((q * Math.PI) / 180);
          const c: number = Math.cos((q * Math.PI) / 180);

          rebars.push({
            x: x0 + Radius3 + (Radius3 - Cover - BarSizeC - Radius) * c,
            y: y0 + Radius3 + (Radius3 - Cover - BarSizeC - Radius) * s,
            a: Area,
            //r: Radius,
          });

          q += dq;
        }

        // internal
        q = 0;
        dq = NumBars2Dir > 0 ? 360 / NumBars2Dir : 360;

        while (q < 360 && NumBars2Dir > 0) {
          const s: number = Math.sin((q * Math.PI) / 180);
          const c: number = Math.cos((q * Math.PI) / 180);

          rebars.push({
            x: x0 + Radius3 + (Cover + BarSizeC + Radius) * c,
            y: y0 + Radius3 + (Cover + BarSizeC + Radius) * s,
            a: Area,
            //r: Radius,
          });

          q += dq;
        }
      }

      if (Shape === "Pipe") {
        rebars = [];

        const Radius3: number = t3 / 2;
        const Radius2: number = t3 / 2 - tw;

        // external
        let q = 0,
          dq = NumBars3Dir > 0 ? 360 / NumBars3Dir : 360;
        //console.log(NumBars3Dir, dq);

        while (q < 360 && NumBars3Dir > 0) {
          //console.log(q);
          const s: number = Math.sin((q * Math.PI) / 180);
          const c: number = Math.cos((q * Math.PI) / 180);

          rebars.push({
            x: x0 + Radius3 + (Radius3 - Cover - BarSizeC - Radius) * c,
            y: y0 + Radius3 + (Radius3 - Cover - BarSizeC - Radius) * s,
            a: Area,
            //r: Radius,
          });

          q += dq;
        }

        // internal
        q = 0;
        dq = NumBars2Dir > 0 ? 360 / NumBars2Dir : 360;

        while (q < 360 && NumBars2Dir > 0) {
          const s: number = Math.sin((q * Math.PI) / 180);
          const c: number = Math.cos((q * Math.PI) / 180);

          rebars.push({
            x: x0 + Radius3 + (Radius2 + Cover + BarSizeC + Radius) * c,
            y: y0 + Radius3 + (Radius2 + Cover + BarSizeC + Radius) * s,
            a: Area,
            //r: Radius,
          });

          q += dq;
        }
      }
    }

    // add materialId | material
    const uts: Utils = new Utils();
    rebars.map((i: Rebar) => {
      const material = uts.clone(
        this.materials.find((i: any) => i.id === RebarMatL),
      ); // clone to avoid the change of the main materials array
      material
        ? Object.assign(i, { material: material })
        : Object.assign(i, { materialId: RebarMatL });
    });

    //console.log("S2k > getRebars > rebars", rebars);
    return rebars;
  };

  /**
   * Get S2k cross-section properties
   * svg coordinates' system
   */
  getProperties = (element: any | undefined) => {
    //console.log("S2k > getProperties", element);

    const polygons = this.getPolygons(element);
    //console.log("S2k > getProperties > polygons", polygons);

    let polygonsProperties: any[] = [];
    for (const polygon of polygons) {
      // clockwise points
      polygonsProperties.push(
        this.sps.getPolygonProperties(polygon.points.reverse()),
      );
    }

    //console.log("S2k > getProperties", polygonsProperties);
    return this.sps.getSectionProperties(polygonsProperties);
  };

  /**
   * Generate quads to transform a default s2k cross-section in a SD Section
   * svg coordinates' system
   * circle and pipe cross-sections are not included
   * PC beam da sistemare
   */
  getQuads = (element: any | undefined) => {
    //console.log("S2k > getQuads", element);
    if (!element) return [];

    const {
      x,
      y,
      Shape,
      ConcBeam,
      ConcCol,
      ConcBeamCol,
      t2,
      t3,
      tw,
      tf,
      t2b,
      tfb,
      B1,
      B2,
      T1,
      D1,
      D2,
      D3,
      D5,
      D6,
      FilletRadius,
      //
      Cover,
      TopCover,
      BotCover,
    }: {
      x: number;
      y: number;
      Shape: string;
      ConcBeam: string;
      ConcCol: string;
      ConcBeamCol: string;
      t2: number;
      t3: number;
      tw: number;
      tf: number;
      t2b: number;
      tfb: number;
      B1: number;
      B2: number;
      T1: number;
      D1: number;
      D2: number;
      D3: number;
      D5: number;
      D6: number;
      FilletRadius: number;
      //
      Cover: number;
      TopCover: number;
      BotCover: number;
    } = element;
    //console.log("S2k > getQuads", Shape);

    const meshSize: number =
      ConcBeamCol === "Beam" || ConcBeam === "Yes"
        ? Math.min(TopCover, BotCover)
        : Cover;

    let polygons: any[] = [];

    // origin in s2k system
    const x0: number = 0,
      y0: number = 0;

    // Rectangular, Tee, I/Wide Flange, Box/Tube

    // Rectangular
    if (Shape === "Rectangular")
      polygons.push({
        ShapeName: "New Shape",
        nRC:
          ConcBeamCol === "Beam" || ConcBeam === "Yes"
            ? [2 * Math.round(t3 / meshSize), 1]
            : [Math.round(t3 / meshSize), Math.round(t2 / meshSize)],
        points: [
          { x: x0, y: y0 },
          { x: x0, y: y0 + t3 },
          { x: x0 + t2, y: y0 + t3 },
          { x: x0 + t2, y: y0 },
        ],
      });

    // Tee
    if (Shape === "Tee") {
      const hw: number = t3 - tf;

      polygons.push({
        ShapeName: "Top flange",
        //nRC: [Math.round(tf / meshSize), Math.round(t2 / meshSize)],
        nRC: [2 * Math.round(tf / meshSize), 1],
        points: [
          { x: x0, y: y0 },
          { x: x0, y: y0 + tf },
          { x: x0 + t2, y: y0 + tf },
          { x: x0 + t2, y: y0 },
        ],
      });

      if (FilletRadius > 0)
        polygons.push({
          ShapeName: "Top",
          //nRC: [Math.round(FilletRadius / meshSize), Math.round(tw / meshSize)],
          nRC: [2 * Math.round(FilletRadius / meshSize), 1],
          points: [
            { x: x0 + (t2 - tw) / 2 - FilletRadius, y: y0 + tf },
            { x: x0 + (t2 - tw) / 2, y: y0 + tf + FilletRadius },
            { x: x0 + (t2 + tw) / 2, y: y0 + tf + FilletRadius },
            { x: x0 + (t2 + tw) / 2 + FilletRadius, y: y0 + tf },
          ],
        });

      polygons.push({
        ShapeName: "Web",
        //nRC: [Math.round(hw / meshSize), Math.round(tw / meshSize)],
        nRC: [2 * Math.round(hw / meshSize), 1],
        points: [
          { x: x0 + (t2 - tw) / 2, y: y0 + t3 },
          { x: x0 + (t2 - tw) / 2, y: y0 + tf + FilletRadius },
          { x: x0 + (t2 + tw) / 2, y: y0 + tf + FilletRadius },
          { x: x0 + (t2 + tw) / 2, y: y0 + t3 },
        ],
      });
    }

    // I/Wide Flange
    if (Shape === "I/Wide Flange") {
      const hw: number = t3 - (tf + tfb);
      const dx: number = t2b > t2 ? (t2b - t2) / 2 : 0;
      const dxb: number = t2 > t2b ? (t2 - t2b) / 2 : 0;

      polygons.push({
        ShapeName: "Top flange",
        //nRC: [Math.round(tf / meshSize), Math.round(t2 / meshSize)],
        nRC: [2 * Math.round(tf / meshSize), 1],
        points: [
          { x: x0 + dx, y: 0 },
          {
            x: x0 + dx,
            y: tf,
          },
          {
            x: x0 + dx + t2,
            y: tf,
          },
          {
            x: x0 + dx + t2,
            y: 0,
          },
        ],
      });

      if (FilletRadius > 0)
        polygons.push({
          ShapeName: "Top",
          //nRC: [Math.round(FilletRadius / meshSize), Math.round(tw / meshSize)],
          nRC: [2 * Math.round(FilletRadius / meshSize), 1],
          points: [
            { x: x0 + dx + (t2 - tw) / 2 - FilletRadius, y: tf },
            {
              x: x0 + dx + (t2 - tw) / 2,
              y: tf + FilletRadius,
            },
            {
              x: x0 + dx + (t2 + tw) / 2,
              y: tf + FilletRadius,
            },
            {
              x: x0 + dx + (t2 + tw) / 2 + FilletRadius,
              y: tf,
            },
          ],
        });

      polygons.push({
        ShapeName: "Web",
        //nRC: [Math.round(hw / meshSize), Math.round(tw / meshSize)],
        nRC: [2 * Math.round(hw / meshSize), 1],
        points: [
          { x: x0 + dx + (t2 - tw) / 2, y: tf + FilletRadius },
          { x: x0 + dxb + (t2b - tw) / 2, y: tf + hw - FilletRadius },
          { x: x0 + dxb + (t2b + tw) / 2, y: tf + hw - FilletRadius },
          { x: x0 + dx + (t2 + tw) / 2, y: tf + FilletRadius },
        ],
      });

      if (FilletRadius > 0)
        polygons.push({
          ShapeName: "Bottom",
          //nRC: [Math.round(FilletRadius / meshSize), Math.round(tw / meshSize)],
          nRC: [2 * Math.round(FilletRadius / meshSize), 1],
          points: [
            { x: x0 + dxb + (t2b - tw) / 2, y: t3 - tfb - FilletRadius },
            { x: x0 + dxb + (t2b - tw) / 2 - FilletRadius, y: t3 - tfb },
            { x: x0 + dxb + (t2b + tw) / 2 + FilletRadius, y: t3 - tfb },
            { x: x0 + dxb + (t2b + tw) / 2, y: t3 - tfb - FilletRadius },
          ],
        });

      polygons.push({
        ShapeName: "Bottom flange",
        //nRC: [Math.round(tfb / meshSize), Math.round(t2b / meshSize)],
        nRC: [2 * Math.round(tfb / meshSize), 1],
        points: [
          { x: x0 + dxb, y: y0 + t3 - tfb },
          { x: x0 + dxb, y: y0 + t3 },
          { x: x0 + dxb + t2b, y: y0 + t3 },
          { x: x0 + dxb + t2b, y: y0 + t3 - tfb },
        ],
      });
    }

    // Box/Tube
    if (Shape === "Box/Tube") {
      const hw: number = t3 - 2 * tf;

      polygons.push({
        ShapeName: "Top flange",
        nRC: [Math.round(tf / meshSize), Math.round(t2 / meshSize)],
        points: [
          { x: x0, y: y0 },
          { x: x0, y: y0 + tf },
          { x: x0 + t2, y: y0 + tf },
          { x: x0 + t2, y: y0 },
        ],
      });
      polygons.push({
        ShapeName: "Left web",
        nRC: [Math.round(hw / meshSize), Math.round(tw / meshSize)],
        points: [
          { x: x0, y: y0 + tf },
          { x: x0, y: y0 + t3 - tf },
          { x: x0 + tw, y: y0 + t3 - tf },
          { x: x0 + tw, y: y0 + tf },
        ],
      });
      polygons.push({
        ShapeName: "Rigth web",
        nRC: [Math.round(hw / meshSize), Math.round(tw / meshSize)],
        points: [
          { x: x0 + t2 - tw, y: y0 + tf },
          { x: x0 + t2 - tw, y: y0 + t3 - tf },
          { x: x0 + t2, y: y0 + t3 - tf },
          { x: x0 + t2, y: y0 + tf },
        ],
      });
      polygons.push({
        ShapeName: "Bottom flange",
        nRC: [Math.round(tf / meshSize), Math.round(t2 / meshSize)],
        points: [
          { x: x0, y: y0 + t3 - tf },
          { x: x0, y: y0 + t3 },
          { x: x0 + t2, y: y0 + t3 },
          { x: x0 + t2, y: y0 + t3 - tf },
        ],
      });

      /*
      const mypolygons = [
        [
          { x:0, y: t3 },
          { x:0, y: t3 - tf },
          { x:t2, y: t3 - tf },
          { x:t2, y: t3 },
        ],
        [
          { x:0, y: t3 - tf },
          { x:0, y: tf },
          { x:tw, y: tf },
          { x:tw, y: t3 - tf },
        ],
        [
          { x:t2 - tw, y: t3 - tf },
          { x:t2 - tw, y: tf },
          { x:t2, y: tf },
          { x:t2, y: t3 - tf },
        ],
        [
          { x:0, y: tf },
          { x:0, y: 0 },
          { x:t2, y: 0 },
          { x:t2, y: tf },
        ],
      ];
      */
    }

    // PC Conc I Girder
    if (Shape === "PC Conc I Girder") {
      //const Dw: number = D1 - (D2 + D3 + D5 + D6);
      const dx1: number = B2 > B1 ? (B2 - B1) / 2 : 0;
      const dx2: number = B1 > B2 ? (B1 - B2) / 2 : 0;

      polygons.push({
        ShapeName: "Bottom flange",
        points: [
          { x: x0 + dx2, y: y0 + D5 },
          { x: x0 + dx2, y: y0 },
          { x: x0 + dx2 + B2, y: y0 },
          { x: x0 + dx2 + B2, y: y0 + D5 },
        ],
      });
      polygons.push({
        ShapeName: "Bottom",
        points: [
          { x: x0 + dx2 + (B2 - T1) / 2, y: y0 + D5 + D6 },
          { x: x0 + dx2, y: y0 + D5 },
          { x: x0 + dx2 + B2, y: y0 + D5 },
          { x: x0 + dx2 + (B2 + T1) / 2, y: y0 + D5 + D6 },
        ],
      });
      polygons.push({
        ShapeName: "web",
        points: [
          { x: x0 + dx1 + (B1 - T1) / 2, y: y0 + D1 - D2 - D3 },
          { x: x0 + dx2 + (B2 - T1) / 2, y: y0 + D5 + D6 },
          { x: x0 + dx2 + (B2 + T1) / 2, y: y0 + D5 + D6 },
          { x: x0 + dx1 + (B1 + T1) / 2, y: y0 + D1 - D2 - D3 },
        ],
      });
      polygons.push({
        ShapeName: "Top",
        points: [
          { x: x0 + dx1, y: y0 + D1 - D2 },
          { x: x0 + dx1 + (B1 - T1) / 2, y: y0 + D1 - D2 - D3 },
          { x: x0 + dx1 + (B1 + T1) / 2, y: y0 + D1 - D2 - D3 },
          { x: x0 + dx1 + B1, y: y0 + D1 - D2 },
        ],
      });
      polygons.push({
        ShapeName: "Top flange",
        points: [
          { x: x0 + dx1, y: y0 + D1 },
          { x: x0 + dx1, y: y0 + D1 - D2 },
          { x: x0 + dx1 + B1, y: y0 + D1 - D2 },
          { x: x0 + dx1 + B1, y: y0 + D1 },
        ],
      });

      /*
      let mypolygons = [
        [
          { x:0, y: D1 },
          { x:0, y: D1 - D2 },
          { x:B1, y: D1 - D2 },
          { x:B1, y: D1 },
        ],
        [
          { x:(+B1 - T1) / 2, y: +D5 + D6 + Dw },
          { x:(+B1 - T1) / 2, y: +D5 + D6 },
          { x:(+B1 + T1) / 2, y: +D5 + D6 },
          { x:(+B1 + T1) / 2, y: +D5 + D6 + Dw },
        ],
        [
          { x:(+B1 - T1) / 2 - (+B2 - T1) / 2, y: +D5 },
          { x:(+B1 - T1) / 2 - (+B2 - T1) / 2, y: 0 },
          { x:(+B1 - T1) / 2 + (+B2 + T1) / 2, y: 0 },
          { x:(+B1 - T1) / 2 + (+B2 + T1) / 2, y: +D5 },
        ],
      ];
      mypolygons = [
        [
          { x:0, y: D1 - D2 },
          { x:(B1 - T1) / 2, y: D1 - D2 - D3 },
          { x:(B1 + T1) / 2, y: D1 - D2 - D3 },
          { x:B1, y: D1 - D2 },
        ],
        [
          { x:(B1 - T1) / 2, y: D5 + D6 },
          { x:(B1 - T1) / 2 - (B2 - T1) / 2, y: D5 },
          { x:(B1 - T1) / 2 + (B2 + T1) / 2, y: D5 },
          { x:(B1 + T1) / 2, y: D5 + D6 },
        ],
      ];
      */
    }

    // Circle, Pipe
    //if (["Circle", "Pipe"].includes(Shape)) {}

    //
    // traslation to (x, y)
    //
    for (const polygon of polygons) {
      //console.log("S2k > getQuads", quad);
      Object.assign(polygon, {
        points: polygon.points.map((p: Point) =>
          Object.assign(p, { x: x + p.x, y: y + p.y }),
        ),
      });
    }

    //console.log("S2k > polygons", polygons);
    return polygons;
  };

  /**
   * Generate mesh
   * svg coordinates' system
   */
  getMesh = (elements: any[] = []) => {
    //console.log("S2k > getS2kMesh", elements);

    //const { x, y, eR, iR, nSC, nSR } = obj;
    //let { sA, eA } = obj;

    const uts: Utils = new Utils();

    let S2kMesh: any[] = [];

    for (const element of elements) {
      //console.log("S2k > getS2kMesh", element);
      const { Shape, materialId }: { Shape: string; materialId: string } =
        element;

      // add materialId | material
      const material = uts.clone(
        this.materials.find((i: any) => i.id === materialId),
      ); // clone to avoid the change of the main materials array

      //
      // Circle | Pipe
      if (["Circle", "Pipe"].includes(Shape)) {
        const pointsOfQuads = this.smh.getCircMeshes({
          x: element.x + element.t3 / 2,
          y: element.y + element.t3 / 2,
          eR: element.t3 / 2,
          iR: Shape === "Circle" ? 0 : element.t3 / 2 - element.tw, // Pipe
          sA: 0,
          eA: 360,
          nSC: 36, // slices of 10°
          nSR:
            Shape === "Circle"
              ? Math.round(element.t3 / 2 / element.Cover)
              : Math.round((element.t3 / 2 - element.tw) / element.Cover), // Pipe
        });
        //console.log("S2k > getS2kMesh", pointsOfQuads);

        for (const p in pointsOfQuads) {
          const points = pointsOfQuads[p];
          const { centroid, area } = this.sps.getQuadProperties(points);
          //console.log("S2k > getS2kMesh", centroid, area);

          let mesh = {
            id: `${element.id}_0-${p}`,
            name: `0-${p}`,
            //materialId: materialId,
            area: Math.abs(area ? area : 0),
            centroid: centroid,
            points: points,
          };

          material
            ? Object.assign(mesh, { material: material })
            : Object.assign(mesh, { materialId: materialId });

          S2kMesh.push(mesh);
        } // end for points
      } else {
        //
        // other shapes
        //
        const quads = this.getQuads(element);
        //console.log("S2k > getS2kMesh", quads);

        for (const q in quads) {
          const quad = quads[q];

          const pointsOfQuads = this.smh.getQuadMeshes(
            quad.points,
            quad.hasOwnProperty("nRC") ? quad.nRC : [1, 1],
          );

          for (const p in pointsOfQuads) {
            const points = pointsOfQuads[p];
            const { centroid, area } = this.sps.getQuadProperties(points);
            //console.log("S2k > getS2kMesh", centroid, area);

            let mesh = {
              id: `${element.id}_${q}-${p}`,
              name: `${q}-${p}`,
              //materialId: materialId,
              area: Math.abs(area ? area : 0),
              centroid: centroid,
              points: points,
            };

            material
              ? Object.assign(mesh, { material: material })
              : Object.assign(mesh, { materialId: materialId });

            S2kMesh.push(mesh);
          } // end for points
        } // end for q
      } // end if
    }

    //console.log("S2k > getS2kMesh", S2kMesh);
    return S2kMesh;
  };

  /**
   * Generate mesh
   * i.e. for centroidal s2k coordinates' system
   */
  getMeshForCalculation = (
    elements: any[] = [],
    [tx, ty]: number[] = [0, 0],
    alpha: number = Math.PI,
  ) => {
    //console.log("S2k > getMeshForCalculation", elements);

    const uts = new Utils();

    let S2kMesh: any[] = uts.clone(this.getMesh(elements));
    //console.log("S2k > getMeshForCalculation", S2kMesh);

    for (const i of S2kMesh) {
      //console.log("S2k > getMeshForCalculation", i.points);

      Object.assign(i, {
        points: i.points.map((p: Point) =>
          this.rtf.translatePoint(p, [tx, ty]),
        ),
        centroid: this.rtf.translatePoint(i.centroid, [tx, ty]),
      });

      Object.assign(i, {
        points: i.points.map((p: Point) => this.rtf.rotatePoint(p, alpha)),
        centroid: this.rtf.rotatePoint(i.centroid, alpha),
      });
    }

    //console.log("S2k > getMeshForCalculation", S2kMesh);
    return S2kMesh;
  };

  /**
   * get mesh limits
   *
   */
  getMeshLimits = (S2kMesh: any) => {
    const uts = new Utils();
    const mesh: any[] = uts.clone(S2kMesh);

    const x: number[] = mesh
      .map((i: any) => i.points)
      .flat()
      .map((p: Point) => p.x);

    const y: number[] = mesh
      .map((i: any) => i.points)
      .flat()
      .map((p: Point) => p.y);
    //console.log("getMeshLimits > y", y);

    const xmin: number = Math.min.apply(Math, x);
    const ymin: number = Math.min.apply(Math, y);
    //console.log("getMeshLimits > ymin", ymin);
    const xmax: number = Math.max.apply(Math, x);
    const ymax: number = Math.max.apply(Math, y);
    //console.log("getMeshLimits > ymax", ymax);

    return { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
  };
}

// RcCalculation
class RcCalculation {
  // use classes
  private rtf: Retrofit = new Retrofit();
  private mts: Materials = new Materials();
  private mps: MaterialProperties = new MaterialProperties();

  section: any;
  elements: any[];
  materials: any[];
  private smh: SectionMesh;
  private s2k: S2k;

  constructor(Section: any, Elements: any[], Materials: any[] = []) {
    this.section = Section;
    this.elements = Elements;
    this.materials = Materials;

    // use classes
    this.smh = new SectionMesh(this.materials);
    this.s2k = new S2k(this.materials);
  }

  /**
   * get list of materials used in elements of section
   *
   */
  getMaterialsUsed = () => {
    const materialIdList: any[] = [];

    for (const element of this.elements) {
      if (element.hasOwnProperty("materialId"))
        materialIdList.push(element.materialId);
      if (element.component === "S2k") materialIdList.push(element.RebarMatL); // S2k
    }
    //console.log("getMaterialsUsed", materialIdList);

    return materialIdList
      .reduce((acc, item) => {
        if (!acc.includes(item)) acc.push(item);
        return acc;
      }, []) // remove duplicate
      .map((i: any) => this.materials.find((j: any) => j.id === i)); // get material
  };

  /**
   * get mesh of section in 0xy system
   * Oxy system
   *
   */
  getMesh = (alpha: number = Math.PI) => {
    if (!this.section) return [];
    //console.log("getMesh", section.value);
    if (!this.elements) return [];
    //console.log("getMesh", elementsOfSection.value);

    const txy: number[] = Object.values(this.section.centroid).map(
      (i: any) => -i,
    );
    //console.log("getMesh > txy", txy);

    if (this.section.component === "S2k") {
      return this.s2k.getMeshForCalculation(
        this.elements,
        txy, // translate centroid in the Oxy
        alpha, // rotate section (mirror by default)
      );
      //const yLimits = s2k.getMeshLimits(MeshForCalculation);
      //console.log("yLimits", yLimits, yLimits.ymax - yLimits.ymin);
    } else {
      return this.smh.getSectionMeshForCalculation(
        this.elements,
        txy, // translate centroid in the Oxy
        alpha, // rotate section (mirror by default)
      );
      //const yLimits = smh.getSectionMeshLimits(SectionMeshForCalculation);
      //console.log("yLimits", yLimits, yLimits.ymax - yLimits.ymin);
    }

    return [];
  };

  /**
   * get fibers of section for 0xy system
   * Oxy system
   *
   */
  getFibers = (alpha: number = Math.PI) => {
    if (!this.section) return [];
    //console.log("getFibers", section);
    if (!this.elements) return [];
    //console.log("getFibers", elements);

    let fibers: Fiber[] = [];

    const txy: number[] = Object.values(this.section.centroid).map(
      (i: any) => -i,
    );

    for (const element of this.elements) {
      //console.log("getFibers", element); // FibersLine | FibersCirc
      let myFibers =
        this.section.component === "S2k"
          ? this.s2k.getRebars(element)
          : this.smh.getFibers(element);

      for (const fiber of myFibers) {
        let p: Point = this.rtf.translatePoint({ x: fiber.x, y: fiber.y }, txy);
        p = this.rtf.rotatePoint(p, alpha);

        Object.assign(fiber, { x: p.x, y: p.y });
      }

      fibers = fibers.concat(myFibers);
    }

    //console.log("getFibers");
    return fibers;
  };

  /**
   * get mesh limits
   *
   */
  getMeshLimits = (alpha: number = Math.PI) => {
    const mesh: any[] = this.getMesh(alpha);

    const x: number[] = mesh
      .map((i: any) => i.points)
      .flat()
      .map((p: Point) => p.x);

    const y: number[] = mesh
      .map((i: any) => i.points)
      .flat()
      .map((p: Point) => p.y);
    //console.log("getSectionMeshLimits > y", y);

    const xmin: number = Math.min.apply(Math, x);
    const ymin: number = Math.min.apply(Math, y);
    //console.log("getS2kMeshLimits > ymin", ymin);
    const xmax: number = Math.max.apply(Math, x);
    const ymax: number = Math.max.apply(Math, y);
    //console.log("getS2kMeshLimits > ymax", ymax);

    return { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
  };

  /**
   * Get Nc, Mc
   * Oxy system
   *
   */
  getNcMc = (alpha: number = Math.PI, e0: number = 1e-3, c0: number = 1e-5) => {
    //console.log("RcCalculation > getNcMc", obj);

    const mesh: any[] = this.getMesh(alpha);
    //console.log("RcCalculation > getNcMc", mesh);
    //console.log("RcCalculation > getNcMc", { e0, c0 });

    // Nc, Mc
    let Nc: number = 0,
      Mcx: number = 0,
      Mcy: number = 0;
    if (!mesh) return { Nc: Nc, Mcx: Mcx, Mcy: Mcy };

    for (const element of mesh) {
      const {
        material,
        centroid,
        area,
      }: { material: any; centroid: Point; area: number } = element;
      //console.log("RcCalculation > getNcMc > element", material);

      const ec: number = e0 - c0 * centroid.y;
      //console.log("RcCalculation > getNcMc > ec", ec);
      const sc: number = this.mts.fe(Object.assign(material, { eps: ec }));
      //console.log("RcCalculation > x, y, area, ec, sc", x, y, area, ec, sc);
      const Nci: number = sc * area;
      //if (ec < 0) console.log("RcCalculation > Nci", area, Nci);

      Nc += Nci;
      Mcx += Nci * centroid.y;
      Mcy += Nci * centroid.x;
    }

    //console.log("RcCalculation > NcMc > Nc, Mc", Nc, Mc);
    return { Nc: Nc, Mcx: Mcx, Mcy: Mcy };
  };

  /**
   * Get Ns, Ms
   * Oxy system
   *
   */
  getNsMs = (alpha: number = Math.PI, e0: number = 1e-3, c0: number = 1e-5) => {
    //console.log("RcCalculation > getNsMs", obj);

    const rebars: any[] = this.getFibers(alpha);
    //console.log("RcCalculation > getNsMs", rebars);
    //console.log("RcCalculation > getNsMs", { e0, c0 });

    let Ns: number = 0,
      Msx: number = 0,
      Msy: number = 0;
    if (!rebars) return { Ns: Ns, Msx: Msx, Msy: Msy };

    for (const rebar of rebars) {
      const {
        material,
        x,
        y,
        a,
      }: { material: any; x: number; y: number; a: number } = rebar;

      // x
      const es: number = e0 - c0 * y;
      //console.log("RcCalculation > getNsMs", Object.assign(RebarMaterial, { es: esx }));
      const ss: number = this.mts.fe(Object.assign(material, { eps: es }));
      //console.log("RcCalculation > x, y, a, esx, ssx", x, y, a, esx, ssx);
      const Nsi: number = ss * a;

      Ns += Nsi;
      Msx += Nsi * y;
      Msy += Nsi * x;
    }
    //console.log("RcCalculation > Ns, Msx, Msy", Ns, Msx, Msy);
    return { Ns: Ns, Msx: Msx, Msy: Msy };
  };

  /**
   * Get N
   * e0, c0, N0
   *
   */
  getSumN = (alpha: number = Math.PI, e0: number = 1e-3, c0: number = 1e-5) => {
    //console.log("RcCalculation > getSumN", obj);

    const NcMc = this.getNcMc(alpha, e0, c0);
    const { Nc }: { Nc: number } = NcMc ? NcMc : { Nc: 0 };

    const NsMs = this.getNsMs(alpha, e0, c0);
    const { Ns }: { Ns: number } = NsMs ? NsMs : { Ns: 0 };

    //console.log("getSumN", Nc, Ns, this.section.Ne);
    return Nc + Ns - (this.section.Ne ? this.section.Ne : 0);
  };

  /**
   * Get Nmin, Nmax, nmin = Nmax / Nmin
   * It should be not dependent by alpha
   */
  getNMinMax = (alpha: number = Math.PI) => {
    //console.log("getNMinMax", alpha);
    const sumNlist: number[] = [];

    //console.log("getNMinMax", this.getMaterialsUsed());
    const strainsSignificant: number[] = this.mps.getStrainsSignificant(
      this.getMaterialsUsed(),
    );
    //console.log("getNMinMax > strainsSignificant", strainsSignificant);

    for (let i = 0; i < strainsSignificant.length; i++) {
      const e0: number = strainsSignificant[i];

      const sumN: number | undefined =
        this.getSumN(alpha, e0, 0) + (this.section.Ne ? this.section.Ne : 0);

      //console.log("getNMinMax > sumN", e0, sumN);
      sumNlist.push(sumN ? sumN : 0);
    }
    //console.log("getNMinMax > Nmin, Nmax", sumNlist);

    const Nmin: number = Math.min.apply(Math, sumNlist);
    const Nmax: number = Math.max.apply(Math, sumNlist);
    //console.log("getNMinMax > Nmin, Nmax", Nmin, Nmax);

    return {
      Nmin: Nmin, // compression
      Nmax: Nmax, // tension
      nmin: Nmax / Nmin,
      /*
    nmin:
      Math.floor(Nmax / Nmin / 0.05) * 0.05 < Nmax / Nmin
        ? Math.floor(Nmax / Nmin / 0.05) * 0.05 + 0.05
        : Math.floor(Nmax / Nmin / 0.05) * 0.05,
        */
      //nmax: 1
    };
  };

  /**
   * secant method
   *
   */
  secant_method = async (
    alpha: number = Math.PI,
    c0: number = 1e-5,
    x0: number,
    x1: number,
    tol: number = 1e-4,
    max_iteration: number = 100,
  ) => {
    let i: number = 0;
    for (i = 0; i < max_iteration; i++) {
      //console.log("RcCalculation > secant_method > i", i);

      const fx0: number = this.getSumN(alpha, x0, c0);
      const fx1: number = this.getSumN(alpha, x1, c0);

      // stop if converged on root
      if (Math.abs(fx1 - fx0) < tol) {
        //console.log("RcCalculation > secant_method > i", i);
        return { root: x1, iterations: i };
      }

      // otherwise keep iterating
      let x_next: number = x0;

      try {
        x_next = x1 - (fx1 * (x1 - x0)) / (fx1 - fx0);
      } catch (err) {
        console.error("RcCalculation > secant_method > err", err);
        return x0;
      } finally {
        x0 = x1;
        x1 = x_next;
      }
    }

    //console.log("RcCalculation > secant_method > i", i);
    return { root: x1, iterations: i };
  };

  /**
   * Get e0 for longitudinal equilibrium
   *
   */
  getRoot = async (
    alpha: number = Math.PI,
    c0: number = 1e-5,
    x0: number = 0,
    x1: number = 1e-3,
    tol: number = 1e-4,
    max_iteration: number = 100,
  ) => {
    return new Promise((resolve) =>
      resolve(this.secant_method(alpha, c0, x0, x1, tol, max_iteration)),
    );
  };

  /**
   * bisection method
   *
   */
  bisection_method = async (
    alpha: number = Math.PI,
    c0: number = 1e-5,
    xa: number,
    xb: number,
    tol: number = 1e-4,
    max_iteration: number = 100,
  ) => {
    let xc: number = (xa + xb) / 2;
    //let fxc: number = f(Object.assign(myObj, { e0: xc }));

    let i: number = 0;
    for (i = 0; i < max_iteration; i++) {
      //console.log("RcCalculation > bisection_method > i", i);

      xc = (xa + xb) / 2;
      const fxc: number = this.getSumN(alpha, xc, c0);

      // stop if converged on root
      if (Math.abs(fxc) < tol) {
        //console.log("RcCalculation > bisection_method > i", i);
        return { root: xc, iterations: i };
      }

      // otherwise keep iterating

      try {
        //const fxa: number = this.getSumN(alpha, xa, c0);
        const fxb: number = this.getSumN(alpha, xb, c0);

        if (fxb * fxc > 0) {
          xb = xc;
        } else {
          xa = xc;
        }
      } catch (err) {
        console.error("RcCalculation > bisection_method > err", err);
        return xc;
      }
    }

    //console.log("RcCalculation > bisection_method > i", i);
    return { root: xc, iterations: i };
  };

  /**
   * Get e0 at c0 = 0 for longitudinal equilibrium
   *
   */
  getInitialRoot = async (
    alpha: number = Math.PI,
    c0: number = 1e-5,
    xa: number = -2,
    xb: number = 2,
    tol: number = 1e-4,
    max_iteration: number = 100,
  ) => {
    return new Promise((resolve) =>
      resolve(this.bisection_method(alpha, c0, xa, xb, tol, max_iteration)),
    );
  };

  /**
   * fake function
   *
   */
  fakeFunc = (
    alpha: number = Math.PI,
    c0: number = 1e-5,
    x0: number = 0,
    x1: number = 1e-3,
    tol: number = 1e-4,
    max_iteration: number = 100,
  ) =>
    new Promise((resolve, reject) => {
      //loading.value = true;

      const timeout = setTimeout(() => {
        resolve(
          this.getRoot(
            alpha,
            c0,
            x0, // x0
            x1, // x1
            tol,
            max_iteration,
          ),
        );
        clearTimeout(timeout);

        //loading.value = false;
      }, 10); // delay in ms
    });

  /**
   * Get moment - curvature
   *
   */
  getMomentCurvature = async (
    alpha: number = Math.PI,
    tol: number = 1e-4,
    max_iteration: number = 100,
  ) => {
    const uts = new Utils();

    //
    // get mesh limits
    //
    const { ymin, ymax }: { ymin: number; ymax: number } =
      this.getMeshLimits(alpha);

    //
    // get the initial conditions
    //
    let e0: number = await this.getInitialRoot(
      alpha,
      0,
      this.section.Ne > 0 ? -1e-3 : -3.5, // xa = ecu // dipende dal legame costitutivo !?!
      this.section.Ne > 0 ? 2 : 1e-3, // xb = esu // dipende dal legame costitutivo !?!
    ).then((value: any) => (value ? value.root : 1e-3));
    //console.log("getMomentCurvature > e0", e0);

    //
    // get list of curvatures
    //
    const c0Delta: number =
      (this.section.c0Stop - this.section.c0Start) / this.section.c0Step;
    const cList: number[] = uts.arrayRange(
      this.section.c0Start,
      this.section.c0Stop,
      c0Delta,
    );

    //
    // init
    //
    let res: any[] = [];
    let iterations: number = 0;
    let flag: boolean = true;

    //
    // loop
    //
    for (const i in cList) {
      const c0: number = cList[i];
      //console.log(i, e0);

      await this.getRoot(
        alpha,
        c0,
        e0, // x0
        e0 - 1e-3, // x1
        tol,
        max_iteration,
      ).then((value: any) => {
        //console.log("getMomentCurvature", i, e0, value);

        e0 = value ? value.root : 0;
        iterations = value ? value.iterations : 0;

        // check
        const sumN: number | undefined = this.getSumN(alpha, e0, c0);
        //console.log(c0, e0, sumN);
        if (sumN && Math.sign(sumN) * sumN > tol) {
          flag = false;
          //console.log("getMomentCurvature > sumN", e0, sumN);
        }

        // et, eb
        const et: number = e0 - c0 * ymax;
        const eb: number = e0 - c0 * ymin;

        const NcMc = this.getNcMc(alpha, e0, c0);
        const Nc: number = NcMc ? NcMc.Nc / 1e3 : 0; // kN
        const Mcx: number = NcMc ? -NcMc.Mcx / 1e6 : 0; // kNm
        const Mcy: number = NcMc ? -NcMc.Mcy / 1e6 : 0; // kNm

        const NsMs = this.getNsMs(alpha, e0, c0);
        const Ns: number = NsMs ? NsMs.Ns / 1e3 : 0; // kN
        const Msx: number = NsMs ? -NsMs.Msx / 1e6 : 0; // kNm
        const Msy: number = NsMs ? -NsMs.Msy / 1e6 : 0; // kNm

        const Mx: number = Mcx + Msx; // kNm
        const My: number = Mcy + Msy; // kNm

        //console.log(i, res.value[+i - 1]);
        if (flag && res.length > 1 && Mx < 0.1 * res[+i - 1].Mx) {
          flag = false;
          //console.log("getMomentCurvature > sumN", e0, Mx);
        }

        // save
        if (flag)
          res.push({
            i: iterations,
            e0: e0,
            c0: c0,
            et: et,
            eb: eb,
            xn: -et / c0,
            Nc: Nc,
            Ns: Ns,
            Mx: Mx,
            My: My,
            sumN: sumN,
          });

        //console.log("getMomentCurvature > res", i, res);
      });

      if (!flag) break;
    }

    //
    // return
    //
    return res;
  };

  /**
   * Get moment - curvature
   *
   */
  getNMx = async (
    alpha: number = Math.PI,
    tol: number = 1e-4,
    max_iteration: number = 100,
  ) => {
    const uts = new Utils();

    //
    // axial load limits
    //
    const { nmin, Nmin }: { nmin: number; Nmin: number } =
      this.getNMinMax(alpha);

    //
    // get list of axial loads
    //
    //console.log(this.getNMinMax(alpha));
    const nStart: number = uts.clone(nmin),
      nStop: number = 1,
      nStep: number = 10;
    const nDelta: number = (nStop - nStart) / nStep;
    const nList: number[] = uts.arrayRange(nStart, nStop, nDelta);
    if (nList[nList.length - 1] < nStop - nDelta / 2) nList.push(nStop);
    //console.log("getNMx > nList", nList);

    //
    // init
    //
    let res: any[] = [];

    //
    // loop
    //
    for (const i in nList) {
      const ne: number = nList[i];
      const Ne: number = uts.clone(ne * Nmin);
      //console.log(i, ne, Ne);

      this.section.ne = ne;
      this.section.Ne = Ne;

      await this.getMomentCurvature(alpha, tol, max_iteration).then(
        (response) => {
          // Mx
          const Mx: number = response
            .map((i: any) => i.Mx)
            .reduce((a, b) => Math.max(a, b), -Infinity);

          // My
          const My: number = response
            .map((i: any) => i.My)
            .reduce((a, b) => Math.max(a, b), -Infinity);
          //console.log(alpha, Mx, My);

          // devi riportare i valori indietro con alpha
          //x: rotatePoint.x * Math.cos(alpha) - rotatePoint.y * Math.sin(alpha),
          //y: rotatePoint.x * Math.sin(alpha) + rotatePoint.y * Math.cos(alpha),

          //const Mxx: number = Mx * Math.cos(alpha) - My * Math.sin(alpha);
          //const Myy: number = Mx * Math.sin(alpha) + My * Math.cos(alpha);

          res.push({ Ne: Ne / 1e3, Mx: Mx, My: My });
        },
      );
    }

    //
    // return
    //
    return res;
  };
}

// export
export {
  Retrofit,
  Materials,
  MaterialProperties,
  SectionProperties,
  SectionMesh,
  S2k,
  RcCalculation,
};
