<template lang="pug">
el-container
  el-main
    el-row
      el-tabs(type='border-card' stretch style="width:100%;" v-model="appStore.states.tabPosition")
        el-tab-pane(label='学科google距离' name='a' lazy) 学科google距离
          GoogleDistanceSubject
        el-tab-pane(label='学科google中间数据距离' name='b' lazy) 学科google中间数据距离
        GoogleDistanceSubjectMiddleData

    el-row 
      NoteBook(storagekey="openalex_subject_distance",:editMode="true")
</template>

<script lang="ts">
const modelName = "openalex-subject-google-distance";
export default {
  name: modelName,
  autoIndex: true,
  text: "openalex subject google distance",
  update: "2023-04-12T09:43:03.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import NoteBook from "@/components/NoteBook.vue";
import GoogleDistanceSubject from "./components/google-distance-subject.vue";
import GoogleDistanceSubjectMiddleData from "./components/google-distance-subject-middledata.vue";

import { useRoute } from "vue-router";

const route = useRoute();

const appHomeStore = homeStore();
appHomeStore.title = "openalex subject google distance";

const appStore = dynamicStore(modelName + "tab", {
  tabPosition: "a",
});
if (route.query.tab !== undefined) {
  appStore.states.tabPosition = route.query.tab;
}
</script>
