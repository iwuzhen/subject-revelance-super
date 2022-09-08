<template lang="pug">
el-container
  el-main
    el-row(v-if="editMode", justify="end")
      Transition(name="fade" mode="out-in")
        //- el-button(:type="viewStatus===false?'primary':'success'",@click="viewStatus=!viewStatus",style="margin-top: -40px;") {{viewStatus===false?'编辑Note':'展示Note'}}
        el-button(type="primary",v-if="!viewStatus", @click="viewStatus=!viewStatus",style="margin-top: -40px;") 编辑Note
        el-button(type="success",v-else,@click="viewStatus=!viewStatus",style="margin-top: -40px;") 展示Note
    el-row(v-loading="loading")
      md-editor(v-model="text",v-if="viewStatus",:htmlPreview="false",:toolbarsExclude="toolbarsExclude",:onSave="saveNoteBook",editorId="edit",:previewOnly="!father.editMode")
      md-editor(v-model="text",v-else,:htmlPreview="false",editorId="view",:previewOnly="true")
</template>

<script lang="ts">
export default {
  name: "NoteBook",
};
</script>

<script lang="ts" setup>
import { ref, defineProps, onMounted } from "vue";
import MdEditor from "md-editor-v3";
import { ElMessage } from "element-plus";
import { apiSeveice } from "@/utils/requests";

console.log(MdEditor.defToolbars);

const toolbarsExclude = [
  "github",
  "htmlPreview",
  "pageFullscreen",
  "fullscreen",
  "image",
];

const saveNoteBook = async (data: string) => {
  await apiSeveice.put(`v/1.0/fresh/notebok/${father.storagekey}`, {
    data: data,
  });
  ElMessage("保存成功");
};

const text = ref("");
const viewStatus = ref(false);
const loading = ref(true);

const getNoteBook = () => {
  apiSeveice
    .get(`v/1.0/fresh/notebok/${father.storagekey}`)
    .then((Response) => {
      text.value = Response.data.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  getNoteBook();
});

const father = defineProps({
  storagekey: {
    type: String,
    default: "",
  },
  editMode: {
    type: Boolean,
    default: true,
  },
});
// const text = ref("# Hello Editor " + father.storagekey);
</script>

<style lang="less">
button {
  position: absolute;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease-out;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
