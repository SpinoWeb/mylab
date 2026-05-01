import * as THREE from "three";
//import { v4 as uuidv4 } from "uuid";

import { Point3D } from "../services/Types";

export const myTri = {
  //
  // setColor
  //
  setColor(colorHex: string = "#B00020"): THREE.Color {
    let color: THREE.Color = new THREE.Color();
    color.set(colorHex);
    return color;
  },

  //
  // addLine
  //
  addLine({
    name,
    vertex,
    scale,
    color,
    linewidth,
    visible,
    dashed,
  }: {
    name?: string;
    vertex?: Point3D[];
    scale?: Point3D;
    color?: string;
    linewidth?: number;
    visible?: boolean;
    dashed?: boolean;
  }): THREE.Line | undefined {
    //console.log("addLine");
    if (!name) name = "new line";
    if (!vertex)
      vertex = [
        { X: 0, Y: 0, Z: 0 },
        { X: 1, Y: 1, Z: 1 },
      ];
    if (!scale) scale = { X: 1, Y: 1, Z: 1 };
    const myColor: THREE.Color = color ? this.setColor(color) : this.setColor();
    if (!linewidth) linewidth = 1;
    if (!visible) visible = true;
    if (!dashed) dashed = false;

    //
    //const id: string = uuidv4();

    // set material
    const material: THREE.LineBasicMaterial = dashed
      ? // dashed
        new THREE.LineDashedMaterial({
          color: myColor,
          linewidth: linewidth,
          scale: 10,
          dashSize: 3,
          gapSize: 1,
        })
      : // solid
        new THREE.LineBasicMaterial({
          color: myColor,
          linewidth: linewidth,
        });

    // set points
    const points: THREE.Vector3[] = vertex.map(
      (i: Point3D) => new THREE.Vector3(i.X, i.Y, i.Z),
    );
    //console.log("addLine", points);

    // set geometry
    const geometry: THREE.BufferGeometry =
      new THREE.BufferGeometry().setFromPoints(points);

    // set line
    const line: THREE.Line = new THREE.Line(geometry, material);
    line.scale.set(scale.X, scale.Y, scale.Z);
    //console.log("addLine", line);

    // assign line name, visible
    Object.assign(line, {
      //id: id,
      name: name,
      visible: visible,
    });

    line.computeLineDistances();

    return line;
  },

  //
  // setAxesHelper
  //
  setAxesHelper({
    name,
    visible,
  }: {
    name?: string;
    visible?: boolean;
  }): THREE.AxesHelper {
    //console.log("setAxesHelper");
    if (!name) name = "_AxesHelper";
    if (!visible) visible = true;

    let axes: THREE.AxesHelper = new THREE.AxesHelper();
    Object.assign(axes, { name: name, visible: visible });
    return axes;
  },

  //
  // clear scene
  //
  clear(scene: THREE.Scene): THREE.Scene {
    //console.log("clear");
    scene.clear(); // ???

    function removeObjWithChildren(obj: any) {
      //console.log("removeObjWithChildren", obj);

      if (obj.children.length > 0) {
        for (let x = obj.children.length - 1; x >= 0; x--) {
          removeObjWithChildren(obj.children[x]);
        }
      }
      //
      if (obj.isMesh) {
        // geometry
        obj.geometry.dispose();
        // material
        if (Array.isArray(obj.material)) {
          for (let i = 0; i < obj.material.length; i++) {
            obj.material[i].dispose();
          }
        } else {
          obj.material.dispose();
        }
      }
      //
      if (obj.parent) {
        obj.parent.remove(obj);
      }
    }
    //
    scene.traverse(function (obj) {
      removeObjWithChildren(obj);
    });
    //console.log("clear",  scene);

    return scene;
  },
};
