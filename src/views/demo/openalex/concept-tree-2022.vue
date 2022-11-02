<template lang="pug">
el-main
  el-dialog(v-model="dialogTreeVisible" title="Tree Search" width="60%")
    el-main
      el-row
        el-col(:span="20")
          el-tree(:props="props" :data="treeData" show-checkbox :check-strictly="true",node-key="name",:default-expanded-keys="defaultExpandedKeys")
            template.custom-tree-node(v-slot:="{ node }") {{ node.data.name }}
              el-tag(class="ml-2") {{ en2zhdict[node.data.name]===undefined?'Loading...': en2zhdict[node.data.name] }}
              el-tag(class="ml-2" type="success" v-if="node.data.size>0") {{node.data.size}}

  el-row
    el-col(:span="8") 
      el-form-item(label="Tree搜索:" size="large")
        el-autocomplete(v-model="queryName"
        :fetch-suggestions="querySearchAsync"
        clearable
        placeholder="Search"
        @select="handleSelect")

  el-row
    el-col(:span="24" v-if="treeFlag")
      el-tree(v-if="lazyTreeView" :props="props" lazy :load="loadNode" show-checkbox :check-strictly="true",node-key="name",accordion,)
        template.custom-tree-node(v-slot:="{ node }") {{ node.data.name }}
          el-tag(class="ml-2") {{ en2zhdict[node.data.name]===undefined?'Loading...': en2zhdict[node.data.name] }}
          el-tag(class="ml-2" type="success" v-if="node.data.size>0") {{node.data.size}}
  el-row 
    NoteBook(storagekey="openalex_concept_Tree",:editMode="true")
</template>

<script lang="ts">
export default {
  name: "concept-tree-2022",
  autoIndex: true,
  text: "openalex concept Tree",
  update: "2022-10-13T01:01:01.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import axios from "axios";
import { getTranslate } from "@/utils/translate";
import { reactive, ref, onMounted } from "vue";
import _ from "lodash";
import NoteBook from "@/components/NoteBook.vue";
import type Node from "element-plus/es/components/tree/src/model/node";
import { ElMessage } from "element-plus";

const appHomeStore = homeStore();
appHomeStore.title = "openalex tree browser";

interface Tree {
  id: string;
  sid: string;
  level: number;
  name: string;
  size: number;
  children?: Tree[] | undefined;
  leaf?: boolean;
}

// 创建axios实例
const apiSeveice = axios.create({
  timeout: 120 * 1000,
});
apiSeveice.defaults.baseURL = "https://wiki.nikepai.com/es/v1";

// 获得一级类的数量
const getOpenAlexTopCencepts = async () => {
  let query = {
    _source: [
      "display_name",
      "id",
      "level",
      "international.display_name.zh-hans",
    ],
    size: 100,
    query: {
      match_phrase: {
        level: 0,
      },
    },
  };
  let reponse = await apiSeveice.post(
    "concepts/_search?filter_path=hits.hits._source",
    query
  );
  let ret = reponse.data.hits.hits.map((item: any) => {
    if (item._source?.international?.display_name["zh-hans"] != undefined) {
      en2zhdict[item._source.display_name] =
        item._source?.international?.display_name["zh-hans"];
    }
    return item._source;
  });
  return await promisAllChildCount(ret);
};

// 获得子类的数量
const getOpenAlexCenceptChildCount = async (
  ancestorsId: string,
  level: number
) => {
  let query = {
    query: {
      bool: {
        must: [
          {
            match_phrase: {
              level: level + 1,
            },
          },
          {
            match_phrase: {
              "ancestors.id": ancestorsId,
            },
          },
        ],
      },
    },
  };

  let reponse = await apiSeveice.post("concepts/_count", query);
  return reponse.data;
};

// 批量获取子类的子类个数
const promisAllChildCount = async (nodes: any) => {
  let ps = [];
  for (let node of nodes) {
    let p = new Promise((resolve, reject) => {
      getOpenAlexCenceptChildCount(node.id, node.level).then((res) => {
        resolve(res);
      });
    });
    ps.push(p);
  }
  await Promise.all(ps).then((res) => {
    for (let i in nodes) {
      nodes[i].size = res[i]?.count;
    }
  });
  return nodes;
};

// 获得子类
const getOpenAlexCenceptChildNode = async (
  ancestorsId: string,
  level: number
) => {
  let query = {
    _source: [
      "display_name",
      "id",
      "level",
      "international.display_name.zh-hans",
    ],
    size: 5000,
    query: {
      bool: {
        must: [
          {
            match_phrase: {
              level: level + 1,
            },
          },
          {
            match_phrase: {
              "ancestors.id": ancestorsId,
            },
          },
        ],
      },
    },
  };
  let reponse = await apiSeveice.post(
    "concepts/_search?filter_path=hits.hits._source",
    query
  );
  // return reponse.data.hits.hits.map((item: any) => item._source);
  let ret = reponse.data.hits.hits.map((item: any) => {
    if (item._source?.international?.display_name["zh-hans"] != undefined) {
      en2zhdict[item._source.display_name] =
        item._source?.international?.display_name["zh-hans"];
    }
    return item._source;
  });
  return await promisAllChildCount(ret);
};

// search node by name
const searchOpenAlexCencepts = async (keywork: string) => {
  let query = {
    _source: ["display_name", "id", "level"],
    size: 100,
    query: {
      wildcard: {
        display_name: {
          value: `${keywork}*`,
        },
      },
    },
  };
  let reponse = await apiSeveice.post(
    "concepts/_search?filter_path=hits.hits._source",
    query
  );
  try {
    let ret = reponse.data.hits.hits.map((item: any) => item._source);
    return ret;
  } catch (error) {
    return [];
  }
};

// 获得子类,包含 anceptor 的部分
const getOpenAlexCenceptAncestors = async (cenceptId: string) => {
  let query = {
    _source: [
      "display_name",
      "id",
      "level",
      "ancestors",
      "international.display_name.zh-hans",
    ],
    query: {
      match_phrase: {
        id: cenceptId,
      },
    },
  };

  let reponse = await apiSeveice.post("concepts/_search", query);

  reponse.data.hits.hits.map((item: any) => {
    if (item._source?.international?.display_name["zh-hans"] != undefined) {
      en2zhdict[item._source.display_name] =
        item._source?.international?.display_name["zh-hans"];
    }
  });

  return reponse.data.hits.hits[0]._source.ancestors;
};

const dialogTreeVisible = ref(false);

const defaultExpandedKeys = ref<string[]>([]);

const props = {
  label: "name",
  children: "children",
  isLeaf: "leaf",
};
interface LinkItem {
  value: string;
  id: string;
  level: number;
}
let queryObj = reactive({
  name: "",
  value: "",
  level: 0,
});

const treeFlag = ref(true);
const lazyTreeView = ref(true);
const queryName = ref("");
const treeData = ref<Tree[]>([]);

const querySearchAsync = async (queryStr: string, cb: (arg: any) => void) => {
  let datas = await searchOpenAlexCencepts(queryStr);
  const results = datas.map(
    (item: { display_name: string; id: string; level: number }) => {
      return {
        value: item.display_name,
        id: item.id,
        level: item.level,
      };
    }
  );
  cb(results);
};

// 确定查询的内容
const handleSelect = async (item: LinkItem) => {
  queryObj.value = item.id;
  queryObj.name = item.value;
  queryObj.level = item.level;
  treeData.value = await iteratorToFather(item.id, item.value, item.level);
  // lazyTreeView.value = false;
  dialogTreeVisible.value = true;
  // reloadChange();
};

const reloadChange = () => {
  treeFlag.value = false;
  setTimeout(() => {
    treeFlag.value = true;
    lazyTreeView.value = true;
  }, 5);
};

const initSubject = () => {
  reloadChange();
};

onMounted(() => {
  console.log("start");
});

const iteratorToFather = async (id: string, name: string, level: number) => {
  // treeLazy.value = false;
  console.log("iteratorToFather", id, name);
  // 这里，从下到上构建简单树。
  addTranslateChan(name);

  // 构建子树 todo
  let currentNode = {
    id,
    sid: id,
    name,
    level,
    size: 0,
    leaf: true,
  };
  [currentNode] = await promisAllChildCount([currentNode]);
  currentNode.leaf = currentNode.size === 0 ? true : false;
  let root = [currentNode];
  // 构建父级
  // console.log("responsetmp", ancestors);
  // 从叶子到 root
  let ancestors = await getOpenAlexCenceptAncestors(id);
  let anceptorMap = {};
  ancestors.forEach((element: any) => {
    if (element.level in anceptorMap) {
      anceptorMap[element.level].push(element);
    } else {
      anceptorMap[element.level] = [element];
    }
  });

  let defaultExpandedKeysSet = new Set<string>([]);

  for (let i = level - 1; i > -1; i--) {
    console.log("root", i, root);
    if (anceptorMap[i].length === 1) {
      let node = {
        id: anceptorMap[i][0].id,
        sid: anceptorMap[i][0].id,
        name: anceptorMap[i][0].display_name,
        level: anceptorMap[i][0].level,
        size: 0,
        leaf: false,
        children: root,
      };
      root = await promisAllChildCount([node]);
    } else if (root.length === 1) {
      let tmp_nodes = [];
      for (let subNode of anceptorMap[i]) {
        let node = {
          id: subNode.id,
          sid: subNode.id,
          name: subNode.display_name,
          level: subNode.level,
          size: 0,
          leaf: false,
          children: root,
        };
        tmp_nodes.push(node);
      }
      root = await promisAllChildCount(tmp_nodes);
    } else {
      // 各自找 true parete
      let tmp_nodes_map = {};
      for (let subNode of root) {
        let ancestors = await getOpenAlexCenceptAncestors(subNode.id);
        for (let anc of ancestors) {
          if (anc.level === i) {
            if (anc.id in tmp_nodes_map) {
              tmp_nodes_map[anc.id].children.push(subNode);
            } else {
              tmp_nodes_map[anc.id] = {
                id: anc.id,
                name: anc.display_name,
                level: anc.level,
                size: 0,
                leaf: false,
                children: [subNode],
              };
            }
          }
        }
        root = Object.values(tmp_nodes_map);
        root = await promisAllChildCount(root);
      }
    }
    root.forEach((item) => {
      defaultExpandedKeysSet.add(item.name);
    });
  }

  defaultExpandedKeys.value = Array.from(defaultExpandedKeysSet);
  return root;
};

const loadNode = async (node: Node, resolve: (data: Tree[]) => void) => {
  if (node.level === 0) {
    let datas = await getOpenAlexTopCencepts();
    let root: Tree[] = datas.map(
      (item: {
        id: string;
        level: number;
        display_name: any;
        size?: number;
      }) => {
        addTranslateChan(item.display_name);
        return {
          id: item.id,
          sid: item.id,
          level: item.level,
          name: item.display_name,
          size: item.size,
          leaf: item.size === 0 ? true : false,
        };
      }
    );
    return resolve(root);
  } else if (node.level > 0) {
    let datas = await getOpenAlexCenceptChildNode(
      node.data.sid,
      node.data.level
    );
    let root: Tree[] = datas.map(
      (item: {
        id: string;
        level: number;
        display_name: any;
        size?: number;
      }) => {
        addTranslateChan(item.display_name);
        return {
          id: item.id,
          sid: item.id,
          level: item.level,
          name: item.display_name,
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

<style lang="less" scoped>
.card-header {
  .el-row {
    margin: 0;
    .el-col {
      margin: 0;
      .el-tag {
        margin: 0;
      }
    }
  }
}
.el-select {
  width: 95%;
}
.el-card {
  width: 20rem;
  text-align: end;
  .el-row {
    margin: 0;
    .author {
      margin-right: 10px;
      .name {
        white-space: nowrap;
        font-style: normal;
      }
      .org {
        white-space: nowrap;
        font-style: italic;
      }
    }
  }
  .card-header {
    text-align: end;
    .zh {
      font-style: italic;
    }
  }
  .tag {
    .el-tag {
      margin-left: 5px;
    }
  }
}
.el-popper.is-customized {
  /* Set padding to ensure the height is 32px */
  padding: 6px 12px;
  background: linear-gradient(90deg, rgb(159, 229, 151), rgb(204, 229, 129));
}

.el-popper.is-customized .el-popper__arrow::before {
  background: linear-gradient(45deg, #b2e68d, #bce689);
  right: 0;
}
</style>
