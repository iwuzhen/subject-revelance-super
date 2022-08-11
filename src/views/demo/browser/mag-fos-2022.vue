<template lang="pug">
el-row
  el-col(:span="12") 搜索：
    el-autocomplete(v-model="queryName"
    :fetch-suggestions="querySearchAsync"
    clearable
    placeholder="Please input"
    @select="handleSelect")
  el-col(:span="6")
    el-switch(@change="reloadChange",v-model="queryFlag",size="large",active-text="子查询",inactive-text="父查询")
  el-col(:span="4")
    el-button(type="primary" @click="initSubject") 回到顶级学科
el-row
  el-col(:span="20")
    el-tree(v-if="treeFlag" :props="props" lazy :load="loadNode")
      template.custom-tree-node(v-slot:="{ node }") {{ node.data.name }}
        el-tag(class="ml-2") {{ en2zhdict[node.data.name]===undefined?'Loading...': en2zhdict[node.data.name] }}
        el-tag(class="ml-2" type="success" v-if="node.data.size>0") {{node.data.size}}
</template>

<script lang="ts">
export default {
  name: "MAG-fos-2022",
  autoIndex: true,
  text: "FOS 层级搜索引擎",
  update: "2022-07-21T09:43:03.429Z",
};
</script>

<script setup lang="ts">
import { homeStore } from "@/pinia/modules/pageStore";
import axios from "axios";
import { getTranslate } from "@/utils/translate";
import type Node from "element-plus/es/components/tree/src/model/node";
import { reactive, ref } from "vue";
import _ from "lodash";

const appHomeStore = homeStore();
appHomeStore.title = "MAG FOS browser";

interface Tree {
  id?: number;
  name: string;
  size: number;
  // children?: Tree[];
  leaf?: boolean;
}
interface LinkItem {
  value: string;
  id: number;
}

const OriginCategoriesPath =
  "https://wiki.lmd.knogen.com:10443/api/mag/getOriginCategories";
const ChildCategoriesPath =
  "https://wiki.lmd.knogen.com:10443/api/mag/getChildCategories";
const ParentCategoriesPath =
  "https://wiki.lmd.knogen.com:10443/api/mag/getParentCategories";
const GetFosByNamePath =
  "https://wiki.lmd.knogen.com:10443/api/mag/getFosByName";
const queryFlag = ref(true);
const treeFlag = ref(true);
const queryName = ref("");
let queryObj = reactive({
  name: "",
  value: 0,
});

const querySearchAsync = async (
  queryString: string,
  cb: (arg: any) => void
) => {
  let response = await axios.request({
    url: GetFosByNamePath,
    method: "post",
    data: {
      name: queryString,
    },
  });
  console.log(response.data.data);
  const results = response.data.data.map((item: { name: any; id: any }) => {
    return {
      value: item.name,
      id: item.id,
    };
  });
  cb(results);
};

const handleSelect = (item: LinkItem) => {
  queryObj.value = item.id;
  queryObj.name = item.value;
  reloadChange();
};

const reloadChange = () => {
  treeFlag.value = false;
  setTimeout(() => {
    treeFlag.value = true;
  }, 5);
};

const initSubject = () => {
  queryObj.value = 0;
  reloadChange();
};

const props = {
  label: "name",
  children: "zones",
  isLeaf: "leaf",
};

const loadNode = async (node: Node, resolve: (data: Tree[]) => void) => {
  if (node.level === 0) {
    let response;
    if (queryObj.value > 0) {
      addTranslateChan(queryObj.name);
      return resolve([
        {
          id: queryObj.value,
          name: queryObj.name,
          size: 0,
          leaf: false,
        },
      ]);
    } else {
      response = await axios.get(OriginCategoriesPath);
    }
    let root: Tree[] = response.data.data.map(
      (item: { id: any; name: any; size: number }) => {
        addTranslateChan(item.name);
        return {
          id: item.id,
          name: item.name,
          size: item.size,
          leaf: item.size === 0 ? true : false,
        };
      }
    );
    // console.log("root", root);
    return resolve(root);
  }
  if (node.level > 0) {
    // console.log("node", node);
    let response = await axios.request({
      url: queryFlag.value ? ChildCategoriesPath : ParentCategoriesPath,
      method: "post",
      data: {
        id: node.data.id,
      },
    });
    let root: Tree[] = response.data.data.map(
      (item: { id: any; name: any; size: number }) => {
        addTranslateChan(item.name);
        return {
          id: item.id,
          name: item.name,
          size: item.size,
          leaf: item.size === 0 ? true : false,
        };
      }
    );
    // console.log("root", root);
    return resolve(root);
  }
};

let unTranslateWords = new Set<string>();
const en2zhdict = reactive({});

const translate = _.debounce(async function () {
  console.log("translate");
  const utw: string[] = Array.from(unTranslateWords).filter(
    (rst: string) => en2zhdict[rst] == undefined
  );
  unTranslateWords = new Set();
  const ret = await getTranslate(utw);
  for (const [key, value] of _.zip(utw, ret)) {
    // $set(en2zhdict, key, value);
    if (key) en2zhdict[key] = value;
  }
}, 500);
// 激活翻译函数
const addTranslateChan = (rst: string) => {
  unTranslateWords.add(rst);
  translate();
};
</script>

<style lang="less">
.el-row {
  margin-top: 20px;
}
.el-tag {
  margin-left: 20px;
}
</style>
