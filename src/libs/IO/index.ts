// IO
// use
// https://www.npmjs.com/package/browser-fs-access
import {
  fileOpen,
  //directoryOpen,
  fileSave,
  //supported,
} from "browser-fs-access";

// class IO
class IO {
  //data: any;
  //handle: FileSystemFileHandle;
  fileName: string;
  extensions: any;
  mimeTypes: any;

  constructor() {
    //this.data = {};
    //this.handle;
    this.fileName = "new-file";
    this.extensions = [".ca"];
    this.mimeTypes = ["application/json"];
  }

  // open file
  openFile0 = async () => {
    //console.log("IO > openFile");

    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = this.extensions.join(", ");
      input.addEventListener("change", () => {
        //console.log("IO > openFile > input", input);
        if (input.files) resolve(input.files[0]);
      });
      input.click();
    });
  };

  // open file
  // return data and handle
  openFile = async (
    extensions: Array<string> = this.extensions,
    mimeTypes: Array<string> = this.mimeTypes
  ) => {
    //console.log("IO > openFile", extensions, mimeTypes);

    const blob = await fileOpen({
      extensions: extensions,
      mimeTypes: mimeTypes,
    });
    //console.log("IO > openFile > blob", blob);

    return {
      data: JSON.parse(await blob.text()), // get data object from file
      handle: "handle" in blob ? blob.handle : null, // store handle
    };
  };

  // save file
  // return the handle
  saveFile = async (
    data: any = {},
    handle: FileSystemFileHandle,
    extensions: Array<string> = this.extensions,
    mimeTypes: Array<string> = this.mimeTypes,
    fileName: string = this.fileName
  ) => {
    //console.log("IO > saveFile");

    const json =
      //process.env.NODE_ENV === "development"
      import.meta.env.DEV
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);
    //console.log("IO > saveFile > json", json);

    const blob = new Blob([json]);
    //console.log("IO > saveFile > blob", blob);

    (window as any).handle = await fileSave(
      blob,
      {
        fileName: fileName,
        extensions: extensions,
        mimeTypes: mimeTypes,
      },
      handle || null
    );
    //console.log("IO > saveFile > window", window);

    return "handle" in window ? window.handle : null;
  };

  // salva senza consentire di modificare il
  // nome e la posizione del file
  saveFile0 = async (
    data: any = {},
    extension: string = ".ca",
    fileName: string = this.fileName
  ) => {
    const blob = new Blob([data]);

    const a = document.createElement("a");
    a.download = fileName + extension;
    a.href = URL.createObjectURL(blob);
    a.addEventListener("click", (e) => {
      setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
    });
    a.click();
  };
}
// export
export { IO };
