import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Homw",
    component: HomeView,
  },
  {
    path: "/demo/animation/power-law-2022",
    name: "power-law-2022",
    component: () => import("@/views/demo/animations/power-law-2022.vue"),
  },
  {
    path: "/demo/browser/mag-fos-2022",
    name: "mag-fos-2022",
    component: () => import("@/views/demo/browser/mag-fos-2022.vue"),
  },
  {
    path: "/demo/nfs/nfs-stats-2022-07",
    name: "nfs-stats-2022-07",
    component: () => import("@/views/demo/nfs/nfs-stats-2022-07.vue"),
  },
];

const router = createRouter({
  history: createWebHistory("/v2/"),
  routes,
});

export default router;
