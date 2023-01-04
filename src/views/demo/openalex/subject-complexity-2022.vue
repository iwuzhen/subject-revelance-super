<template lang="pug">
el-container
  el-main
    el-row
      el-tabs(type='border-card' stretch style="width:100%;" v-model="appStore.states.tabPosition")
        el-tab-pane(label='世界学科的复杂度比较' name='a' lazy) 世界学科的复杂度比较
          SubjectComplexityBasic2022(:typeMode="0")
        el-tab-pane(label='国家内的学科复杂度比较' name='b' lazy) 国家内的不同学科复杂度比较
          SubjectComplexityBasic2022(:typeMode="1")
        el-tab-pane(label='学科的国家间的复杂度比较' name='c' lazy) 同一个学科的国家间的复杂度比较
          SubjectComplexityBasic2022(:typeMode="2")
    el-row 
      NoteBook(storagekey="openalex-subject-complexity",:editMode="true")
</template>

<script lang="ts">
export default {
  name: "subject-complexity-2022",
  autoIndex: true,
  text: "openalex 学科复杂度",
  update: "2023-01-03T01:01:01.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import axios from "axios";
import NoteBook from "@/components/NoteBook.vue";
import SubjectComplexityBasic2022 from "./components/subject-complexity-basic-2022.vue";
import _ from "lodash";

import { useRoute } from "vue-router";
import { onMounted } from "vue";

const route = useRoute();

const appHomeStore = homeStore();
appHomeStore.title = "openalex subject complexity";

const appStore = dynamicStore("openalex-subject-complexity", {
  tabPosition: "a",
});
if (route.query.tab !== undefined) {
  appStore.states.tabPosition = route.query.tab;
}

const apiService = axios.create({
  timeout: 120 * 1000,
});
apiService.defaults.baseURL = "https://wiki.nikepai.com/";

onMounted(async () => {
  let query = {
    topN: 10000, //[0,20000]
    level: 0, //[0:一级大类]
    type: 0, //[0:按年统计 1:按国家按年统计]
    countries: "US,RU,CN,ZH", //100多个国家列表
    linksin_yz: 100, //[100,1000,10000]
    year: "2000", //[1980,2022],空字符串表示查询所有
  };
  let response = await apiService.post("api/openAlex/tjXuekeFzx", query);
  console.log(response.data);
});

const updateChart = _.debounce(async () => {
  console.log(1);
});
</script>
