//
// mySvg.ts
//

import { Point, Camera, Box } from "./Types";

// defaults
const myCamera: Camera = { x: 0, y: 0, z: 1 };
const myPoint: Point = { x: 0, y: 0 };
const myBox: Box = {
  minX: 0,
  minY: 0,
  maxX: 0,
  maxY: 0,
  width: 0,
  height: 0,
};

// mySvg
export const mySvg = {
  //
  // add
  //
  add(
    a: [number, number] = [0, 0],
    b: [number, number] = [0, 0],
  ): [number, number] {
    return [a[0] + b[0], a[1] + b[1]];
  },

  sub(
    a: [number, number] = [0, 0],
    b: [number, number] = [0, 0],
  ): [number, number] {
    return [a[0] - b[0], a[1] - b[1]];
  },

  screenToCanvas(point: Point = myPoint, camera: Camera = myCamera): Point {
    return {
      x: point.x / camera.z - camera.x,
      y: point.y / camera.z - camera.y,
    };
  },

  canvasToScreen(point: Point = myPoint, camera: Camera = myCamera): Point {
    return {
      x: (point.x + camera.x) * camera.z,
      y: (point.y + camera.y) * camera.z,
    };
  },

  getViewport(camera: Camera = myCamera, box: Box = myBox): Box {
    const topLeft = this.screenToCanvas({ x: box.minX, y: box.minY }, camera);
    const bottomRight = this.screenToCanvas(
      { x: box.maxX, y: box.maxY },
      camera,
    );

    return {
      minX: topLeft.x,
      minY: topLeft.y,
      maxX: bottomRight.x,
      maxY: bottomRight.y,
      height: bottomRight.x - topLeft.x,
      width: bottomRight.y - topLeft.y,
    };
  },

  panCamera(camera: Camera = myCamera, dx: number, dy: number): Camera {
    return {
      x: camera.x - dx / camera.z,
      y: camera.y - dy / camera.z,
      z: camera.z,
    };
  },

  // Shortcuts
  zoomCameraTo(
    camera: Camera = myCamera,
    point: Point = myPoint,
    dz: number = 0,
  ): Camera {
    const zoom = +camera.z - dz * camera.z;

    const p1 = this.screenToCanvas(point, camera);
    const p2 = this.screenToCanvas(point, { ...camera, z: zoom });

    return {
      x: camera.x + (p2.x - p1.x),
      y: camera.y + (p2.y - p1.y),
      z: zoom,
    };
  },

  zoomIn(
    camera: Camera = myCamera,
    center: Point = myPoint,
    dz: number = 1 / 10,
  ): Camera {
    const i = Math.round(camera.z * 100) / Math.round(100 * dz);
    const nextZoom = (i + 1) * dz;

    //const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    //const center = { x: 0, y: 0 };

    return this.zoomCameraTo(camera, center, camera.z - nextZoom);
  },

  zoomOut(
    camera: Camera = myCamera,
    center: Point = myPoint,
    dz: number = 1 / 10,
  ): Camera {
    const i = Math.round(camera.z * 100) / Math.round(100 * dz);
    const nextZoom = (i - 1) * dz;

    //const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    //const center = { x: 0, y: 0 };

    return this.zoomCameraTo(camera, center, camera.z - nextZoom);
  },

  zoomReset(camera: Camera = myCamera, center: Point = myPoint): Camera {
    //const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    return this.zoomCameraTo(camera, center, camera.z - 1);
  },

  /**
   * Simple function that converts a plain SVG string or SVG DOM Node into an image with custom dimensions.
   *
   * @param {Object} settings The configuration object to override the default settings.
   * @see https://ourcodeworld.com/articles/read/1456/how-to-convert-a-plain-svg-string-or-svg-node-to-an-image-png-or-jpeg-in-the-browser-with-javascript
   * @returns {Promise}
   */
  SVGToImage(settings: any) {
    let _settings: any = {
      svg: null,
      // Usually all SVG have transparency, so PNG is the way to go by default
      mimetype: "image/png",
      quality: 0.92,
      width: "auto",
      height: "auto",
      outputFormat: "base64",
    };

    // Override default settings
    for (let key in settings) {
      _settings[key] = settings[key];
    }

    return new Promise(function (resolve, reject) {
      let svgNode;

      // Create SVG Node if a plain string has been provided
      if (typeof _settings.svg == "string") {
        // Create a non-visible node to render the SVG string
        let SVGContainer = document.createElement("div");
        SVGContainer.style.display = "none";
        SVGContainer.innerHTML = _settings.svg;
        svgNode = SVGContainer.firstElementChild;
      } else {
        svgNode = _settings.svg;
      }

      let canvas = document.createElement("canvas");
      let context = canvas.getContext("2d");

      let svgXml = new XMLSerializer().serializeToString(svgNode);
      let svgBase64 = "data:image/svg+xml;base64," + btoa(svgXml);

      const image = new Image();
      //console.log(image);

      image.onload = () => {
        let finalWidth, finalHeight;

        // Calculate width if set to auto and the height is specified (to preserve aspect ratio)
        if (_settings.width === "auto" && _settings.height !== "auto") {
          finalWidth = (image.width / image.height) * _settings.height;
          // Use image original width
        } else if (_settings.width === "auto") {
          finalWidth = image.naturalWidth;
          // Use custom width
        } else {
          finalWidth = _settings.width;
        }

        // Calculate height if set to auto and the width is specified (to preserve aspect ratio)
        if (_settings.height === "auto" && _settings.width !== "auto") {
          finalHeight = (image.height / image.width) * _settings.width;
          // Use image original height
        } else if (_settings.height === "auto") {
          finalHeight = image.naturalHeight;
          // Use custom height
        } else {
          finalHeight = _settings.height;
        }

        // Define the canvas intrinsic size
        canvas.width = finalWidth;
        canvas.height = finalHeight;

        // Render image in the canvas
        //console.log(context);
        context?.drawImage(image, 0, 0, finalWidth, finalHeight);

        if (_settings.outputFormat == "blob") {
          // Fullfil and Return the Blob image
          canvas.toBlob(
            function (blob) {
              resolve(blob);
            },
            _settings.mimetype,
            _settings.quality,
          );
        } else {
          // Fullfil and Return the Base64 image
          resolve(canvas.toDataURL(_settings.mimetype, _settings.quality));
        }
      };

      // Load the SVG in Base64 to the image
      image.src = svgBase64;
    });
  },
};
