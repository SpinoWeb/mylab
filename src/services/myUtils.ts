//
// myUtils.ts
//

export const myUtils = {
  //
  colors() {
    return {
      primary: "#6200EE",
      secondary: "#03DAC6",
      error: "#B00020",
      info: "#2196F3",
      success: "#4CAF50",
      warning: "#FB8C00",
    };
  },

  randomHexColor() {
    let letters: string = "0123456789ABCDEF";
    let color: string = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  },

  //
  // chech debug / development mode
  //
  debug() {
    //return process.env.NODE_ENV === "development" ? true : false;
    return import.meta.env.DEV;
  },

  //
  // clone object / array
  //
  deepClone(obj: any = {}) {
    return JSON.parse(JSON.stringify(obj));
  },

  //
  // generate uuid of custom number of chars
  //
  uuid(len: number = -1) {
    //console.log("Utils > uuid", len);
    const numberOfChars = len ? (len > 0 && len <= 36 ? len : 36) : 36;
    //console.log("Utils > uuid", len, numberOfChars);
    // c13b68cc-64cd-4a23-9f04-bf5325347466

    let dt = new Date().getTime();
    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = ((dt + Math.random() * 16) % 16) | 0;
        dt = Math.floor(dt / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
      },
    );

    //console.log("Mixin > _create_UUID > uuid", uuid);
    return uuid.substring(0, numberOfChars);
  },
};
