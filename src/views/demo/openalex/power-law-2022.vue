<template lang="pug">
el-container
  el-main
    el-row
      el-tabs(type='border-card' stretch style="width:100%;" v-model="appStore.states.tabPosition")
        el-tab-pane(label='当年幂律' name='a' lazy) 当年幂律
          PowerLawPoint     
        el-tab-pane(label='幂律随时间变化趋势' name='b' lazy) 幂律随时间变化趋势
          PowerLawTide     
    el-row 
      NoteBook(storagekey="openalex_power-law-2022",:editMode="true")
  </template>

<script lang="ts">
const modelName = "openalex-power-law-2022";
export default {
  name: modelName,
  autoIndex: true,
  text: "openalex power law 2022",
  update: "2023-04-11T01:01:01.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import NoteBook from "@/components/NoteBook.vue";
import PowerLawPoint from "./components/power-law-point.vue";
import PowerLawTide from "./components/power-law-tide.vue";

import { useRoute } from "vue-router";

const route = useRoute();

const appHomeStore = homeStore();
appHomeStore.title = "openalex 幂律";

const appStore = dynamicStore(modelName + "tab", {
  tabPosition: "a",
});
if (route.query.tab !== undefined) {
  appStore.states.tabPosition = route.query.tab;
}
</script>
