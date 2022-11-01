<template lang="pug">
el-container
  el-main
    el-row
      el-tabs(type='border-card' stretch style="width:100%;" v-model="appStore.states.tabPosition")
        el-tab-pane(label='国家间的距离' name='a' lazy) 国家间的距离
          GoogleDistanceCountry
        el-tab-pane(label='国家学科间的距离' name='b' lazy) 国家学科间的距离
          GoogleDistanceCountrySuject
        el-tab-pane(label='国家的论文数' name='c' lazy) 国家的论文数
          CountryWorksCount
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
import _ from "lodash";
import { onMounted } from "vue";
import NoteBook from "@/components/NoteBook.vue";
import GoogleDistanceCountry from "./components/google-distance-country.vue";
import CountryWorksCount from "./components/country-works-count.vue";
import GoogleDistanceCountrySuject from "./components/google-distance-country-subject.vue";
import { useRoute } from "vue-router";

const route = useRoute();

const CountryCodes = [
  "US",
  "CN",
  "GB",
  "DE",
  "JP",
  "FR",
  "IN",
  "CA",
  "BR",
  "IT",
  "AU",
  "ES",
  "KR",
  "RU",
  "NL",
  "ID",
  "PL",
  "IR",
  "SE",
  "CH",
  "TR",
  "TW",
  "BE",
  "MX",
  "IL",
  "DK",
  "AT",
  "FI",
  "ZA",
  "PT",
];
const WorksTypes = [
  "UNKNOW",
  "book",
  "book-chapter",
  "book-part",
  "book-section",
  "book-series",
  "book-set",
  "book-track",
  "component",
  "dataset",
  "dissertation",
  "grant",
  "journal",
  "journal-article",
  "journal-issue",
  "journal-volume",
  "monograph",
  "other",
  "peer-review",
  "posted-content",
  "proceedings",
  "proceedings-article",
  "proceedings-series",
  "reference-book",
  "reference-entry",
  "report",
  "report-series",
  "standar",
];

const appHomeStore = homeStore();
appHomeStore.title = "openalex country google distance";

const appStore = dynamicStore("openalex-country-distance-tab", {
  tabPosition: "a",
});
if (route.query.tab !== undefined) {
  console.log("route.query.tab", route.query.tab);
  appStore.states.tabPosition = route.query.tab;
}
</script>

<style lang="less">
// .el-col {
//   margin: 20px 10px;
// }
.echart {
  width: 95vw;
  height: 600px;
}
.radius {
  // height: 40px;
  // width: 70%;
  border: 1px solid var(--el-border-color);
  border-radius: 20px;
  padding: 5px;
}
</style>
