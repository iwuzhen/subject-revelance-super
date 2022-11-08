<template lang="pug">
el-container
  el-main
    el-row
      el-tabs(type='border-card' stretch style="width:100%;" v-model="appStore.states.tabPosition")
        el-tab-pane(label='国家间的距离' name='a' lazy) 国家间的距离
          GoogleDistanceCountry
        el-tab-pane(label='国家学科间的距离' name='b' lazy) 国家学科间的距离
          GoogleDistanceCountrySubject
        el-tab-pane(label='国家的论文数' name='c' lazy) 国家的论文数
          CountryWorksCount
        el-tab-pane(label='学科间的距离' name='d' lazy) 国家学科间的距离
          DistanceForceGraph
          
    el-row 
      NoteBook(storagekey="openalex_country_distance",:editMode="true")
</template>

<script lang="ts">
export default {
  name: "country-distance",
  autoIndex: true,
  text: "openalex country google distance",
  update: "2022-10-26T09:43:03.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import NoteBook from "@/components/NoteBook.vue";
import GoogleDistanceCountry from "./components/google-distance-country.vue";
import CountryWorksCount from "./components/country-works-count.vue";
import GoogleDistanceCountrySubject from "./components/google-distance-country-subject.vue";
import DistanceForceGraph from "./components/distance-country-subject-force.vue";

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
