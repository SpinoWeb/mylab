import { ref, watch } from "vue";

// Types
import type { Element, Listener, Point } from "../Types";

import { Utils } from "../../../service/Utils";
import { SvgJs } from "../../../service/Svg";
const u: Utils = new Utils();
const svg: SvgJs = new SvgJs();

// by convention, composable function names start with "use"
const useElement = (
  element: Element | undefined,
  options: any = { showGrid: true, snapGrid: 25, camera: { x: 0, y: 0, z: 1 } },
) => {
  //console.log("useElement", element, options);
  //console.log("useElement", element?.name);
  if (!element) return;

  // state encapsulated and managed by the composable
  const handleIsDragging = ref<any | undefined>();
  //const myElement: Element = u.clone(element);

  const id: string | undefined = element.hasOwnProperty("id")
    ? element.id
    : undefined;
  if (!id) return;

  watch(
    () => element.selected,
    (n) => (n ? addEventListener(id) : removeEventListener(id)),
  );

  // onPointerDown
  const onPointerDown = (event: any) => {
    // PointerEvent || any ???
    //console.log("useElement > onPointerDown", event.currentTarget.id);
    if (!event) return;
    event.stopPropagation();

    //event.currentTarget.setPointerCapture(event.pointerId);
    //const id: string = event.currentTarget?.id;

    //
    Object.assign(element, { isSelected: true });

    //
    const client: number[] = [event.clientX, event.clientY];

    const myElement: any = u.clone(element);
    let x: number = myElement.x;
    let y: number = myElement.y;
    if (options.showGrid) {
      x = Math.floor(x / options.snapGrid) * options.snapGrid;
      y = Math.floor(y / options.snapGrid) * options.snapGrid;
    } else {
      x = Math.floor(x);
      y = Math.floor(y);
    }

    handleIsDragging.value = {
      component: myElement.component,
      //
      offset: client,
      // Rect, Circle, Line
      // Circ, Fiber, FibersLine, FibersCirc
      x: x,
      y: y,
    };

    // Line
    // FibersLine
    if (["Line", "FibersLine"].includes(myElement.component))
      Object.assign(handleIsDragging.value, {
        x2: myElement.x2,
        y2: myElement.y2,
      });

    // Poly
    // Polygon | Quad
    if (["Polygon", "Quad"].includes(myElement.component))
      Object.assign(handleIsDragging.value, {
        points: myElement.points,
      });

    //console.log("useElement > onPointerDown", handleIsDragging.value);
  };

  // onPointerMove
  const onPointerMove = (event: any) => {
    //console.log("useElement > onPointerMove", event);
    if (!event) return;
    event.stopPropagation();

    if (!handleIsDragging.value) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const point: number[] = [event.clientX, event.clientY];
    //console.log("useElement > onPointerMove > point", point);

    //
    // update
    //

    // drag handle
    let [dx, dy]: number[] = svg
      .sub(point, handleIsDragging.value.offset)
      .map((n: number) => n / options.camera.z);
    if (options.showGrid) {
      dx = Math.floor(dx / options.snapGrid) * options.snapGrid;
      dy = Math.floor(dy / options.snapGrid) * options.snapGrid;
    } else {
      dx = Math.floor(dx);
      dy = Math.floor(dy);
    }
    //console.log("useElement > onPointerMove > dx, dy", dx, dy);

    // Rect, Circle, Line
    // Circ, Fiber, FibersLine
    Object.assign(element, {
      x: handleIsDragging.value.x + dx,
      y: handleIsDragging.value.y + dy,
    });

    // Line
    // FibersLine
    if (["Line", "FibersLine"].includes(handleIsDragging.value.component))
      Object.assign(element, {
        x2: handleIsDragging.value.x2 + dx,
        y2: handleIsDragging.value.y2 + dy,
      });

    // Polygon | Quad
    if (["Polygon", "Quad"].includes(handleIsDragging.value.component)) {
      let points: Point[] = [];
      for (let i = 0; i < handleIsDragging.value.points.length; i++) {
        let point: Point = { x: 0, y: 0 };

        point.x = handleIsDragging.value.points[i].x + dx;
        point.y = handleIsDragging.value.points[i].y + dy;

        points.push(point);
      }
      if (points.length > 0) Object.assign(element, { points: points });
    }

    //return element;
  };

  // onPointerUp
  const onPointerUp = (event: any) => {
    //console.log("useElement > onPointerUp", event);
    if (!event) return;
    //event.preventDefault();
    event.stopPropagation();

    event.currentTarget.releasePointerCapture(event.pointerId);
    handleIsDragging.value = undefined;

    //
    //Object.assign(element, { isSelected: false });
  };

  // event list & related methods
  const eventsList: Listener[] = [
    { type: "pointerdown", listener: onPointerDown, useCapture: false },
    { type: "pointermove", listener: onPointerMove, useCapture: false },
    { type: "pointerup", listener: onPointerUp, useCapture: false },
  ];
  const addEventListener = (id: string | undefined) => {
    //console.log("useElement > addEventListener", id);
    if (!id) return;

    const myElement: HTMLElement | null = document.getElementById(id);
    if (!myElement) return;

    for (const e of eventsList) {
      myElement?.addEventListener(e.type, e.listener, e.useCapture);
    }
  };
  const removeEventListener = (id: string | undefined) => {
    //console.log("useElement > removeEventListener", id);
    if (!id) return;

    const myElement: HTMLElement | null = document.getElementById(id);
    if (!myElement) return;

    for (const e of eventsList) {
      myElement?.removeEventListener(e.type, e.listener, e.useCapture);
    }
  };

  // expose managed state as return value
  return;
};

// export
export { useElement };
