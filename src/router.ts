import { createMemoryHistory, createRouter } from "vue-router";

import Home from "./components/Home.vue";
import Gantt from "./components/Gantt.vue";
import Reluis from "./components/Reluis.vue";
import SerpApi from "./components/SerpApi.vue";
import Tri from "./components/Tri.vue";
import ThatOpen from "./components/ThatOpen_01.vue";
import Fragments from "./components/Fragments.vue";
import IfcLite from "./components/IfcLite.vue";
import Stream from "./components/Stream.vue";
import Ontario from "./components/Ontario.vue";
import Ingv from "./components/Ingv.vue";

const routes: any[] = [
  { name: "home", path: "/", component: Home },
  { name: "gantt", path: "/gantt", component: Gantt },
  { name: "reluis", path: "/reluis", component: Reluis },
  { name: "serpapi", path: "/serpapi", component: SerpApi },
  { name: "tri", path: "/tri", component: Tri },
  { name: "that-open", path: "/that-open", component: ThatOpen },
  { name: "fragments", path: "/fragments", component: Fragments },
  { name: "ifc-lite", path: "/ifc-lite", component: IfcLite },
  { name: "stream", path: "/stream", component: Stream },
  { name: "ontario", path: "/ontario", component: Ontario },
  { name: "ingv", path: "/ingv", component: Ingv },
];

const router: any = createRouter({
  history: createMemoryHistory(),
  routes,
});

export { router };
//export default router;
