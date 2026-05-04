// import class
import { SvgJs } from "../../libs/Svg";

// types
interface Listener {
  type: string;
  listener: any; // Function
  useCapture?: boolean;
}

// class
class Board {
  onSvgClick = (
    event: any,
    payload: null | {
      item: null | any;
      selectedItems: [];
      cursor: string;
    } = null
  ) => {
    //console.log("Board > onSvgClick", event);
    if (!event) return;
    //event.stopPropagation();

    return {
      item: null,
      selectedItems: [],
      cursor: "default",
    };
  };

  handleWheel = (
    event: WheelEvent,
    Width: number,
    Height: number,
    Camera: any
  ) => {
    //console.log("Board > handleWheel", event);
    //event.preventDefault();

    const svg: any = new SvgJs();

    const { clientX, clientY, deltaX, deltaY, ctrlKey } = event;
    //console.log("Board > handleWheel", { clientX, clientY, deltaX, deltaY, ctrlKey });

    if (ctrlKey) {
      event.preventDefault();

      //const center = { x: 0, y: 0 };
      const center = {
        x: Width / 2,
        y: Height / 3,
      };

      const dz = 1 / 10; // = default in svg

      Camera =
        deltaY < 0
          ? svg.zoomIn(Camera, center, dz)
          : svg.zoomOut(Camera, center, dz);
      //Camera = svg.zoomCamera({ x: clientX, y: clientY }, deltaY / 100);

      //console.log("Board > handleWheel > camera", Camera);
    }

    return Camera;
  };

  // event svg Default
  eventsListSvgDefault: Array<Listener> = [
    //{ type: "load", listener: onSvgLoad, useCapture: false },
    { type: "click", listener: this.onSvgClick, useCapture: false },
    { type: "wheel", listener: this.handleWheel, useCapture: false },
  ];
}

// export
export { Board };
