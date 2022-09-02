import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Homw",
    component: HomeView,
  },
];

// 自动读取views文件夹下的所有vue文件
const files = require.context("@/views", true, /\.vue$/);
files.keys().map((item) => {
  const path = item.slice(1).replace(".vue", "").toLowerCase();
  // 获取组件信息
  const comp = files(item).default;
  console.log(comp);
  routes.push({
    path,
    name: comp.name,
    component: () => import(`../views${item.slice(1)}`),
  });
});

const router = createRouter({
  history: createWebHistory("/v2/"),
  routes,
});

export default router;
