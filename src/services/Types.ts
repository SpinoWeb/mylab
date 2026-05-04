export interface MySheetData {
  table: string;
  keys: string[];
  units: string[];
  records: any[]; //(string | number | boolean | Date | null)[][];
  numberOfRecord?: number;
}

export interface DataTri {
  [key: string]: any; // MySheetData; // Permette qualsiasi stringa come chiave
}

export interface Point2D {
  X: number;
  Y: number;
}
export interface Point3D extends Point2D {
  Z: number;
}

// Cylindrical
export interface PointCylindrical {
  X: number;
  T: number;
  Z: number;
}

//
// Svg.ts
//

// Listener
export interface Listener {
  type: string;
  listener: any; // Function
  useCapture?: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface Camera {
  x: number;
  y: number;
  z: number;
}

export interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

//
// S2k
//

// Grid
export type Grid = {
  //AllVisible: boolean | undefined;
  AxisDir: string;
  BubbleLoc?: string;
  BubbleSize?: number;
  //CoordSys: string;
  GridID?: string;
  //LineColor: string;
  //LineType: string;
  //Visible: boolean;
  XRYZCoord: number;
};

// Material
export type Material = {
  Material: string;
  Type: string | number; // "Concrete" | 2
  Fc: number;
  E1: number;
  //
  U12?: number;
  A1?: number;
};

// Section
export type Section = {
  SectionName: string;
  Material: string;
  Shape: string;
  //
  t3?: number;
  t2?: number;
  tf?: number;
  tw?: number;
  t2b?: number;
  tfb?: number;
  FilletRadius?: number;
  //
  B1?: number;
  B2?: number;
  T1?: number;
  D1?: number;
  D2?: number;
  D3?: number;
  D5?: number;
  D6?: number;
};

// Polygon
export type Polygon = {
  SectionName: string;
  ShapeName: string;
  ShapeMat: string;
  XYR?: Point2D[];
  X: number;
  Y: number;
  //
  FillColor?: string;
};

// Area
export type Area = {
  Area: string;
  MatProp: string;
  ShellType: string | number; // "Shell-Thin" | 1
  Thickness: number;
  //
  Bending?: number;
};

// Joint
export type Joint = {
  Joint: string;
  //XorR?: number;
  X: number;
  Y: number;
  Z: number;
  XYZ?: Point3D;
  //
  CoordSys?: string;
  Restraint?: string;
};

// Frame
export type Frame = {
  Frame: string;
  JointI: string;
  JointJ: string;
  SectionName: string;
  //AnalSect?:string;
  //Material?: string;
  //Shape?: string;
};

// Load
export type Load = {
  LoadPat: string;
};
