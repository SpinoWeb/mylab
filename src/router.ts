import { createMemoryHistory, createRouter } from "vue-router";

import Home from "./components/Home.vue";
import Gantt from "./components/Gantt.vue";
import Reluis from "./components/Reluis.vue";

const routes: any[] = [
  { name: "home", path: "/", component: Home },
  { name: "gantt", path: "/gantt", component: Gantt },
  { name: "reluis", path: "/reluis", component: Reluis },
];

const router: any = createRouter({
  history: createMemoryHistory(),
  routes,
});

export { router };
//export default router;
