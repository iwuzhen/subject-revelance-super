<template lang="pug">
el-container
  el-header
    h1 {{appHomeStore.title}}
    //- i.fa-brands.fa-wikipedia-w
  el-main
    router-view
  el-footer footer
</template>

<script setup lang="ts">
import { homeStore } from "@/pinia/modules/pageStore";
const appHomeStore = homeStore();
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  a {
    text-decoration: none;
  }
  .router-link-active {
    text-decoration: none;
  }
}
</style>
