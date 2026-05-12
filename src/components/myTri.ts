import * as THREE from "three";
//import { v4 as uuidv4 } from "uuid";

import { Point3D } from "../services/Types";

export const myTri = {
  //
  // for label
  //
  createTexture(
    text: string,
    size: number = 11,
    resolution: number = 100,
    fillStyleCanvas: string = "#0D0D0D",
    fillStyleText: string = "#FFF",
  ): THREE.Texture {
    const fontHeightPx: number = resolution * size * devicePixelRatio;

    const canvas: HTMLCanvasElement = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = `${fontHeightPx}px Arial`;

      canvas.width = ctx.measureText(text).width;
      canvas.height = fontHeightPx;

      ctx.fillStyle = fillStyleCanvas;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = fillStyleText;
      const toMargin = 0.9;
      ctx.font = `${fontHeightPx * toMargin}px Arial`;
      const toCenterTextV = 0.08 * canvas.height;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2 + toCenterTextV);
    }

    const texture: THREE.Texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    return texture;
  },

  //
  // setColor
  //
  setColor(colorHex: string = "#B00020"): THREE.Color {
    let color: THREE.Color = new THREE.Color();
    color.set(colorHex);
    return color;
  },

  //
  // getPoint
  //
  getPoint({
    name,
    vertex,
    scale,
    color,
    size,
    visible,
  }: {
    name?: string;
    vertex?: Point3D;
    scale?: Point3D;
    color?: string;
    size?: number;
    visible?: boolean;
  }): THREE.Points {
    //console.log("getPoint");
    if (!name) name = "new Point";
    if (!vertex) vertex = { X: 0, Y: 0, Z: 0 };
    if (!scale) scale = { X: 1, Y: 1, Z: 1 };
    const myColor: THREE.Color = color ? this.setColor(color) : this.setColor();
    if (!size) size = 1;
    if (!visible) visible = true;

    //
    //const id: string = uuidv4();

    // point
    const point: THREE.Points = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ size: size, color: myColor }),
    );

    // position
    point.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([vertex.X, vertex.Y, vertex.Z], 3),
    );
    point.scale.set(scale.X, scale.Y, scale.Z);

    // name, visible, userData, layers
    Object.assign(point, {
      name: name,
      visible: visible,
      /*
    userData: {
      id: id,
      type: "Joint", // point
      originalColor: color,
      label: Joint, // `${ Joint}`
    },
    */
    });

    return point;
  },

  //
  // getLine
  //
  getLine({
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
  }): THREE.Line {
    //console.log("getLine");
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
          scale: 1 / 100,
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
    //console.log("getLine", line);

    // assign to line: name, visible
    Object.assign(line, {
      //id: id,
      name: name,
      visible: visible,
    });

    line.computeLineDistances();

    return line;
  },

  //
  // getLabel
  //
  getLabel({
    name,
    text,
    vertex,
    scale,
    color,
  }: {
    name?: string;
    text?: string;
    vertex?: Point3D;
    scale?: Point3D;
    color?: string;
  }): THREE.Sprite {
    if (!name) name = "new label";
    if (!text) text = "new text";
    if (!vertex) vertex = { X: 0, Y: 0, Z: 0 };
    if (!scale) scale = { X: 1, Y: 1, Z: 1 };
    if (!color) color = "#EEE";

    const size: number = 0.5;
    const resolution: number = 100;
    //console.log("getLabel", size, resolution);

    //
    const material: THREE.SpriteMaterial = new THREE.SpriteMaterial();
    //let map: THREE.Texture = this.createTexture(text, size, resolution);
    material.map = this.createTexture(text, size, resolution);
    material.depthTest = false;
    material.color = this.setColor(color);
    //console.log("getLabel > material", material.map);

    const label: THREE.Sprite = new THREE.Sprite(material);
    label.renderOrder = 99;
    label.position.set(
      vertex.X * scale.X,
      vertex.Y * scale.Y,
      vertex.Z * scale.Z,
    );

    label.scale.set(
      material.map.image?.width / resolution / devicePixelRatio,
      size,
      1,
    );

    // name
    Object.assign(label, { name: name });

    return label;
  },

  //
  // getGroup
  //
  getGroup({
    name,
    visible,
  }: {
    name?: string;
    visible?: boolean;
  }): THREE.Group {
    if (!name) name = "New Group";
    if (!visible) visible = true;

    return Object.assign(new THREE.Group(), { name: name, visible: visible });
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
  // setObjectVisible
  //
  setObjectVisible({
    scene,
    name,
    visible,
  }: {
    scene: THREE.Scene;
    name: string | undefined;
    visible: boolean | undefined;
  }): THREE.Scene {
    //console.log("setObjectVisible", scene, name, visible);
    if (!name) return scene;

    const object: THREE.Object3D | undefined = scene.getObjectByName(name);
    if (object) {
      object.visible = visible !== undefined ? visible : !object.visible;
      //console.log("setObjectVisible", name, object.visible);
    }

    return scene;
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
