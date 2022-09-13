<template lang="pug">
el-container
  el-main
    NoteBook(storagekey="wikiIndexNote",:editMode="true")
</template>

<script setup lang="ts">
import { homeStore } from "@/pinia/modules/pageStore";
import NoteBook from "@/components/NoteBook.vue";
const appHomeStore = homeStore();
appHomeStore.title = "Index";
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
    font-size: 16px;
    width: 180px;
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
