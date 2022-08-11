<template lang="pug">
el-container
  el-main
    el-space(wrap)
      router-link(v-for="item in pageData" :to="item.href" target="_blank")
        el-card
          template(#header)
            .card-header
              span.text-2xl {{item.title}}
          .description 
            p {{item.text}}
          .bottom
            time.italic {{dayjs(item.update).locale('zh-cn').format('YYYY-MM-DD')}}
</template>

<script setup lang="ts">
import { homeStore } from "@/pinia/modules/pageStore";
const appHomeStore = homeStore();
appHomeStore.title = "wiki";
import dayjs from "dayjs";

let pageData = [
  {
    title: "NFS-stats-2022-07",
    text: "NFS 数据统计",
    update: "2022-07-22T09:43:03.429Z",
    href: "/demo/nfs/nfs-stats-2022-07",
  },
];
pageData = [];

const files = require.context("@/views", true, /\.vue$/);
files.keys().map((item) => {
  const path = item.slice(1).replace(".vue", "").toLowerCase();
  // 获取组件信息
  const comp = files(item).default;
  if (comp.autoIndex === true) {
    pageData.push({
      title: comp.name,
      text: comp.text,
      update: comp.update,
      href: path,
    });
  }
});
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  .time {
    font-size: 12px;
    color: #999;
  }
  .description {
    font-size: 20px;
    align-items: left;
  }
  .bottom {
    margin-top: 13px;
    line-height: 12px;
    display: flex;
    justify-content: space-between;
    align-items: left;
  }
}
</style>
