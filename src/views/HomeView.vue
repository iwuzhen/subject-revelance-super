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

const pageData = [
  {
    title: "NFS-stats-2022-07",
    text: "NFS 数据统计",
    update: "2022-07-22T09:43:03.429Z",
    href: "/demo/nfs/nfs-stats-2022-07",
  },
  {
    title: "power-law-2022",
    text: "wikipedia 幂律动画图",
    update: "2022-07-21T09:43:03.429Z",
    href: "/demo/animation/power-law-2022",
  },
  {
    title: "MAG-FOS-2022",
    text: "FOS 层级搜索引擎",
    update: "2022-07-21T09:43:03.429Z",
    href: "/demo/browser/mag-fos-2022",
  },
];
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
