import { createApp } from "vue";
import "./style.css";
import "primeicons/primeicons.css";
import App from "./App.vue";

import "/node_modules/primeflex/primeflex.css";

// HighCharts
import "./highcharts.css";
import "./dashboards.css"; // HighCharts light or dark mode

import "primeicons/primeicons.css";
import PrimeVue from "primevue/config";
//import Aura from "@primevue/themes/aura";
import { Noir } from "./presets/Noir";

//import ConfirmationService from "primevue/confirmationservice";
import { router } from "./router";

//import AppState from "./plugins/appState";
//import ThemeSwitcher from "./components/ThemeSwitcher.vue";

//import ToastService from "primevue/toastservice";

import mdiVue from "mdi-vue/v3";
import * as mdijs from "@mdi/js";
// `App` according to the vue 3 documentation

createApp(App)
  //.use(ToastService)
  .use(mdiVue, { icons: mdijs })
  .use(PrimeVue, {
    //unstyled: true,

    /*
    theme: {
      preset: Aura,
      options: {
        prefix: "p",
        darkModeSelector: "system",
        //darkModeSelector: ".darkmode",
        //darkModeSelector: false || "none",
        //darkModeSelector: ".p-dark",
        cssLayer: false,
      },
    },
    */

    theme: {
      preset: Noir,
      options: {
        prefix: "p",
        darkModeSelector: ".p-dark",
        cssLayer: false,
      },
    },
  })
  //.use(ConfirmationService)
  .use(router)
  //.use(AppState)
  //.component("ThemeSwitcher", ThemeSwitcher)
  .mount("#app");
