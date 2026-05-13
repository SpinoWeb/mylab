import { createMemoryHistory, createRouter } from "vue-router";

import Home from "./components/Home.vue";
import Gantt from "./components/Gantt.vue";
import Reluis from "./components/Reluis.vue";
import SerpApi from "./components/SerpApi.vue";
import Tri from "./components/Tri.vue";
import ThatOpen from "./components/ThatOpen.vue";
import Fragments from "./components/Fragments.vue";
import IfcLite from "./components/IfcLite.vue";

const routes: any[] = [
  { name: "home", path: "/", component: Home },
  { name: "gantt", path: "/gantt", component: Gantt },
  { name: "reluis", path: "/reluis", component: Reluis },
  { name: "serpapi", path: "/serpapi", component: SerpApi },
  { name: "tri", path: "/tri", component: Tri },
  { name: "that-open", path: "/that-open", component: ThatOpen },
  { name: "fragments", path: "/fragments", component: Fragments },
  { name: "ifc-lite", path: "/ifc-lite", component: IfcLite },
];

const router: any = createRouter({
  history: createMemoryHistory(),
  routes,
});

export { router };
//export default router;
