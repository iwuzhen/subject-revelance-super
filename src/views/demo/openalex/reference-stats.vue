<template lang="pug">
el-container
  el-main
    el-row
      el-tabs(type='border-card' stretch style="width:100%;" v-model="appStore.states.tabPosition")
        el-tab-pane(label='国家间的自恋度' name='a' lazy) 国家间的自恋度
          ReferenceCountry     
        el-tab-pane(label='学科间的自恋度' name='b' lazy) 学科间的自恋度
          ReferenceCountrySubject     

          
    el-row 
      NoteBook(storagekey="openalex_reference_country_stats",:editMode="true")
  </template>

<script lang="ts">
export default {
  name: "openalex-stats-2022",
  autoIndex: true,
  text: "openalex reference stats 自恋度",
  update: "2022-11-02T01:01:01.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import NoteBook from "@/components/NoteBook.vue";
import ReferenceCountry from "./components/reference-stats-country.vue";
import ReferenceCountrySubject from "./components/reference-stats-country-subject.vue";

import { useRoute } from "vue-router";

const route = useRoute();

const appHomeStore = homeStore();
appHomeStore.title = "openalex country google distance";

const appStore = dynamicStore("openalex-country-distance-tab", {
  tabPosition: "a",
});
if (route.query.tab !== undefined) {
  appStore.states.tabPosition = route.query.tab;
}
</script>
