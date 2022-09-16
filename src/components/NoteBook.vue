<template lang="pug">
el-container
  el-main
    el-row(v-if="editMode", justify="end")
      Transition(name="fade" mode="out-in")
        //- el-button(:type="viewStatus===false?'primary':'success'",@click="viewStatus=!viewStatus",style="margin-top: -40px;") {{viewStatus===false?'编辑Note':'展示Note'}}
        el-button(type="primary",v-if="!viewStatus", @click="viewStatus=!viewStatus",style="margin-top: -40px;") 编辑 Note
        el-button(type="success",v-else,@click="viewStatus=!viewStatus",style="margin-top: -40px;") 展示 Note
    el-row.md-editor(v-loading="loading")
      md-editor(v-model="text",v-if="viewStatus",:htmlPreview="false",:toolbarsExclude="toolbarsExclude",@change="onChange",@save="saveNoteBook",editorId="edit",:previewOnly="!father.editMode")
      md-editor(v-model="text",v-else,:htmlPreview="false",editorId="view",:previewOnly="true")
</template>

<script lang="ts">
export default {
  name: "NoteBook",
};
</script>

<script lang="ts" setup>
import { ref, defineProps, onMounted, onUnmounted } from "vue";
import MdEditor, { ToolbarNames } from "md-editor-v3";
import { ElMessage } from "element-plus";
import { getNote, setNote } from "@/utils/requests";

const toolbarsExclude: ToolbarNames[] = ["github", "htmlPreview", "image"];
let noteID = "";

const saveNoteBook = async (data: string) => {
  try {
    const rep = await setNote(father.storagekey, noteID, data);
    noteID = rep.id;
    ElMessage({
      message: "保存成功",
      type: "success",
    });
  } catch (error) {
    ElMessage({
      message: `保存失败,修改的页面并非最新版本,请刷新后重新修改: ${error}`,
      type: "warning",
    });
  }
  modified.value = true;
};

const text = ref("");
const viewStatus = ref(false);
const loading = ref(true);
const modified = ref(false);

const onChange = (txt: string) => {
  text.value = txt;
  modified.value = true;
};

const getNoteBook = async () => {
  let dataObj = await getNote(father.storagekey);
  console.log(dataObj);
  text.value = dataObj.data;
  noteID = dataObj.id;
  loading.value = false;
};

onMounted(() => {
  getNoteBook();
  window.onbeforeunload = (e) => {
    if (!modified.value) {
      return;
    }
    // 通知浏览器不要执行与事件关联的默认动作
    e.preventDefault();
    // Chrome 需要 returnValue 被设置成空字符串
    e.returnValue = "";
  };
});

onUnmounted(() => {
  // 取消对事件的监听
  window.onbeforeunload = null;
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

.md-editor {
  text-align: left;
}
</style>
