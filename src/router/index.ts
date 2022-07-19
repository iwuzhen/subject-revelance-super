import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "@/App.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/demo/animation/powler-law-2022",
    name: "powler-law-2022",
    component: () => import("@/views/demo/animations/powler-law-2022.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
