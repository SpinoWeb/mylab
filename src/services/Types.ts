export interface MySheetData {
  table: string;
  keys: string[];
  units: string[];
  records: any[]; //(string | number | boolean | Date | null)[][];
  numberOfRecord?: number;
}

export interface MyData {
  [key: string]: any; // MySheetData; // Permette qualsiasi stringa come chiave
}

export interface Point2D {
  X: number;
  Y: number;
}
export interface Point3D extends Point2D {
  Z: number;
}
