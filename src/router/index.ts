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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
