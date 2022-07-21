<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="4")
        router-link(to='/') Home
      el-col(:span="4")
        router-link(to='/demo/animation/power-law-2022') power-law-2022
      el-col(:span="4")
        router-link(to='/demo/browser/mag-fos-2022') mag-fos-2022
</template>

<script setup lang="ts">
import { homeStore } from "@/pinia/modules/pageStore";
const appHomeStore = homeStore();
appHomeStore.title = "Home";
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
