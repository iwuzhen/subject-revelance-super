<template lang="pug">
el-dialog(v-model="dialogTableVisible" title="Paper information" width="90%")
  el-space(wrap)
    el-card(v-for="item in paperItem" :to="item.href" target="_blank")
      template(#header)
        .card-header
          el-row(justify="space-between")
            el-col(:span="1")
              el-tooltip(content="linksin" effect="light" placement="top")
                el-tag(effect="dark" type="success") {{item.linksin}}
            el-col(:span="18")
              .text-3xl {{item.title}}
          el-row
            el-col(:span="24")
              span.zh {{ en2zhdict[item.title]===undefined?'Loading...': en2zhdict[item.title] }}
      el-row(v-if="item.publisher !==''")
        div publisher: {{item.publisher}}

      el-row(v-if="item.venue?.name !==''")
        div venue: {{item.venue?.name}}
  
      el-row
        .author( v-for="author in item.authors" :key="author.name" )
          .name {{author.name}}
          .org  {{author.org}}
      .tag
        time.italic {{item.year}}

      .tag
        el-tag( v-for="tag in item.fos"  :key="tag.name"  :disable-transitions="false" ) {{tag.name}}

el-dialog(v-model="dialogTreeVisible" title="Tree Search" width="60%")
  el-main
    el-row
      el-col(:span="20")
        el-tree(:props="props" :data="treeData" show-checkbox :check-strictly="true" @check-change="handleCheckChange",node-key="name",:default-expanded-keys="defaultExpandedKeys",:default-checked-keys="appStore.states.subjectSelect")
          template.custom-tree-node(v-slot:="{ node }") {{ node.data.name }}
            el-tag(class="ml-2") {{ en2zhdict[node.data.name]===undefined?'Loading...': en2zhdict[node.data.name] }}
            el-tag(class="ml-2" type="success" v-if="node.data.size>0") {{node.data.size}}

el-row
  el-col(:span="6")
    el-form-item(label="type:" size="large")
      el-select(v-model="appStore.states.typeSelect",placeholder="图表选择",style="width: 100%",size='large',@change='updateChart')
        el-option(v-for="item in typeOpt",:key="item",:label="item",:value="item")

  el-col(:span="6")
    el-form-item(label="最小值过滤:" size="large")
      el-input-number(v-model="appStore.states.yz" :step="1" :min="1",@change='updateChart')

  el-col(:span="10")
    el-form-item(label="选中的学科 :" size="large")
      el-tag(
        v-for="tag in appStore.states.subjectSelect"
        :key="tag"
        class="mx-1"
        closable
        :disable-transitions="false"
        @close="handleClose(tag)"
      )  {{ tag }}

      //- el-select(v-model="appStore.states.subjectSelect",allow-create,multiple,filterable,size='large',@change='updateChart',clearable)
        el-option(v-for="item in subjectOpt",:key="item",:label="item",:value="item")    
el-divider
el-row
  el-col(:span="8") 
    el-form-item(label="Tree搜索:" size="large")
      el-autocomplete(v-model="queryName"
      :fetch-suggestions="querySearchAsync"
      clearable
      placeholder="Search"
      @select="handleSelect")
  //- el-col(:span="6")
  //-   el-switch(@change="reloadChange",v-model="queryFlag",size="large",active-text="子查询",inactive-text="父查询")
  //- el-col(:span="4")
  //-   el-button(type="primary" @click="initSubject") 回到顶级学科

el-row
  el-col(:span="24" v-if="treeFlag")
    el-tree(v-if="lazyTreeView" :props="props" lazy :load="loadNode" show-checkbox :check-strictly="true" @check-change="handleCheckChange",node-key="name",accordion,:default-checked-keys="appStore.states.subjectSelect")
      template.custom-tree-node(v-slot:="{ node }") {{ node.data.name }}
        el-tag(class="ml-2") {{ en2zhdict[node.data.name]===undefined?'Loading...': en2zhdict[node.data.name] }}
        el-tag(class="ml-2" type="success" v-if="node.data.size>0") {{node.data.size}}
el-divider
el-row(v-loading="paperLoading")
  el-col(:span="4") 快捷文章搜索
  el-col(:span="6" v-if="treeFlag")
    el-select(v-model="paperQuerySubject", placeholder="选择要查询的学科",clearable,style="width: 100%",size='large',@change='querySubjectChange')
      el-option(v-for="item in appStore.states.subjectSelect",:key="item",:label="item",:value="item")
  el-col(:span="6" v-if="treeFlag")
    el-select(v-model="paperQueryYear", placeholder="选择学科年份",clearable,style="width: 100%",size='large',@change='queryYearChange')
      el-option(v-for="item in paperQueryOpt",:key="item",:label="item",:value="item")

el-row
  el-alert(title="点击 chart 中的点可以查询其中的文章" type="info" ) 
  el-col(:span="24")
    #echart1.echart
</template>

<script lang="ts">
export default {
  name: "fos-trend-2022",
  autoIndex: true,
  text: "FOS 数量分布",
  update: "2022-09-15T01:01:01.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import axios from "axios";
import { getTranslate } from "@/utils/translate";
import type Node from "element-plus/es/components/tree/src/model/node";
import { reactive, ref, onMounted } from "vue";
import _ from "lodash";
import * as echarts from "echarts";
import { extendEchartsOpts } from "@/utils/model";
import { ElMessage } from "element-plus";

const appHomeStore = homeStore();
appHomeStore.title = "MAG FOS trend";
let dataset: any;
const paperLoading = ref(false);

const appStore = dynamicStore("fos-trend-2022", {
  subjectSelect: ["Mathematics", "Physics"],
  typeSelect: "article",
  yz: 1,
});

const paperQuerySubject = ref("");
const paperQueryYear = ref<number>();
const paperQueryOpt = ref<number[]>([]);
const querySubjectChange = () => {
  console.log(dataset);
  paperQueryOpt.value = [];
  paperQueryYear.value = undefined;
  let i = dataset[0].indexOf(paperQuerySubject.value.toLowerCase());
  if (i < 1) return;
  for (let row of dataset.slice(1)) {
    if (row[i] !== "-" && row[i] <= 500) {
      paperQueryOpt.value.push(row[0]);
    }
  }
};
const queryYearChange = () => {
  if (!paperQuerySubject.value || !paperQueryYear.value) return;
  getPaperDetail(paperQuerySubject.value.toLowerCase(), paperQueryYear.value);
};

interface Tree {
  id?: number;
  name: string;
  size: number;
  children?: Tree[] | undefined;
  leaf?: boolean;
}

// 查询mag论文的linksin
// https://wiki.lmd.knogen.com:10443/api/mag/getLinksinByIds
// {
//     "ids":"2041523977,1994099903,118329571",//论文的id
//     "type":"article" //[article,patent,book]
// }

const handleClose = (tag: string) => {
  appStore.states.subjectSelect.splice(
    appStore.states.subjectSelect.indexOf(tag),
    1
  );
  updateChart();
};

const OriginCategoriesPath =
  "https://wiki.lmd.knogen.com:10443/api/mag/getOriginCategories";
const ChildCategoriesPath =
  "https://wiki.lmd.knogen.com:10443/api/mag/getChildCategories";
const ParentCategoriesPath =
  "https://wiki.lmd.knogen.com:10443/api/mag/getParentCategories";
const GetFosByNamePath =
  "https://wiki.lmd.knogen.com:10443/api/mag/getFosByName";
const queryFlag = ref(true);
const dialogTableVisible = ref(false);
const dialogTreeVisible = ref(false);

const defaultExpandedKeys = ref<string[]>([]);

const props = {
  label: "name",
  children: "children",
  isLeaf: "leaf",
};
interface LinkItem {
  value: string;
  id: number;
}
let queryObj = reactive({
  name: "",
  value: 0,
});

const treeFlag = ref(true);
const lazyTreeView = ref(true);
const queryName = ref("");
const treeData = ref<Tree[]>([]);

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
  const results = response.data.data.map((item: { name: any; id: any }) => {
    return {
      value: item.name,
      id: item.id,
    };
  });
  cb(results);
};

// 确定查询的内容
const handleSelect = async (item: LinkItem) => {
  queryObj.value = item.id;
  queryObj.name = item.value;
  treeData.value = await iteratorToFather(item.id, item.value);
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
  queryObj.value = 0;
  reloadChange();
};

const subjectOpt: string[] = [];
const typeOpt = ["book", "patent", "article"];

let myChartObjs: echarts.ECharts[] = [];
onMounted(() => {
  let elem = document.getElementById("echart1");
  if (elem) {
    myChartObjs.push(echarts.init(elem));
  }

  updateChart();

  window.onresize = _.debounce(() => {
    myChartObjs.forEach((element) => {
      element.resize();
    });
  }, 500);

  myChartObjs[0].on("click", "series.line", function (params: any) {
    console.log(params);
    if (params.value[params.encode.y[0]] > 500) {
      ElMessage({
        message: `超过500篇的文章查询没有成功`,
        type: "warning",
      });
      return;
    }

    getPaperDetail(params.seriesName.toLowerCase(), params.data[0]);
  });
});

// FOS某各类在year中发表的论文列表
// https://wiki.lmd.knogen.com:10443/api/mag/getMagInfoByFos
// {
//     "cat":"mechanics",//单选
//     "year":1851, //年份
//     "type":"article" //[article,book,patent]
// }
// 查询mag论文的linksin
// https://wiki.lmd.knogen.com:10443/api/mag/getLinksinByIds
// {
//     "ids":"2041523977,1994099903,118329571",//论文的id
//     "type":"article" //[article,patent,book]
// }
let paperItem = ref<any[]>([]);
// query form paper
const getPaperDetail = async (name: string, year: number) => {
  paperLoading.value = true;
  let url = "https://wiki.lmd.knogen.com:10443/api/mag/getMagInfoByFos";
  let response = await axios.request({
    url,
    method: "post",
    data: {
      type: appStore.states.typeSelect,
      cat: name,
      year: year,
      isGetLinksin: 1,
      paixu: 2,
    },
  });
  let IDS = [];
  for (let item of response.data.data) {
    IDS.push(item.id);
    addTranslateChan(item.title);
  }
  console.log(response.data.data);
  paperItem.value = response.data.data;
  dialogTableVisible.value = true;
  paperLoading.value = false;
};

const updateChart = _.debounce(async () => {
  let url = "https://wiki.lmd.knogen.com:10443/api/mag/getFosCountByYear";

  let response = await axios.request({
    url,
    method: "post",
    data: {
      type: appStore.states.typeSelect,
      cats: appStore.states.subjectSelect
        .map((name: string) => name.toLowerCase())
        .join(","),
      yz: appStore.states.yz,
    },
  });
  // build dataset
  let dataObj = response.data.data;
  dataset = [["year", ...Object.keys(dataObj)]];
  let dataFlag = false;
  let fosFirstYear = {};
  for (let year = 1800; year <= 2020; year++) {
    let row: any[] = [year];
    for (let key of dataset[0].slice(1)) {
      row.push(dataObj[key][year] || "-");
      if (dataObj[key][year]) {
        if (!fosFirstYear[key]) fosFirstYear[key] = [year, dataObj[key][year]];
        dataFlag = true;
      }
    }
    if (dataFlag) dataset.push(row);
  }
  // console.log(dataset);
  // sort dataset title by last row value
  const fuseData = _.zip(
    appStore.states.subjectSelect,
    dataset.slice(-1)[0].slice(1)
  );
  console.log("fosFirstYear", fosFirstYear);
  fuseData.sort(
    (x, y) => (y[1] as unknown as number) - (x[1] as unknown as number)
  );
  const [legend, ys] = _.unzip(fuseData);

  let option = extendEchartsOpts({
    title: {
      left: "center",
      top: "1%",
      textAlign: "center",
      textStyle: {
        fontSize: 20,
      },
      text: "MAG FOS trend",
    },
    xAxis: {
      name: "year",
      type: "value",
      max: 2020,
      min: "dataMin",
    },
    legend: {
      show: true,
    },
    yAxis: [
      {
        // position: "left",
        name: "paper count",
        type: "value",
      },
    ],
    dataset: [
      {
        source: dataset,
      },
    ],
    tooltip: {
      formatter: function (params: any) {
        let showHtm = ` ${params[0].name}<br>`;
        for (let i = 0; i < params.length; i++) {
          let dataID: number = params[i].encode.y[0];
          if (params[i].data === undefined) {
            continue;
          }
          const _text = params[i].seriesName;
          let _data = params[i].data[dataID];
          const _marker = params[i].marker;
          if (_text.includes("占比")) {
            _data = _.round(_data * 100, 4) + "%";
          }
          showHtm += `${_marker}${_text}:${_data}<br>`;
        }
        return showHtm;
      },
    },
    series: legend
      .filter((item: any) => {
        return fosFirstYear[item.toLowerCase()]?.length > 0;
      })
      .map((item: any) => {
        return {
          datasetIndex: 0,
          type: "line",
          name: item,
          markPoint: {
            data: [
              {
                // type: "min",
                name: "Min",
                xAxis: fosFirstYear[item.toLowerCase()][0],
                value: fosFirstYear[item.toLowerCase()][1],
                yAxis: fosFirstYear[item.toLowerCase()][1],
              },
            ],
          },
          encode: {
            x: "year",
            y: item.toLowerCase(),
          },
        };
      }),
  });
  // myChartObjs[0].clear();
  myChartObjs[0].setOption(option, true);
}, 1000);

const handleCheckChange = (
  data: Tree,
  checked: boolean,
  indeterminate: boolean
) => {
  if (checked && !appStore.states.subjectSelect.includes(data.name)) {
    appStore.states.subjectSelect.push(data.name);
  } else {
    _.pull(appStore.states.subjectSelect, data.name);
  }
  // console.log(data, checked, indeterminate);
  updateChart();
};

const iteratorToFather = async (id: number, name: string) => {
  // treeLazy.value = false;
  console.log("iteratorToFather", id, name);
  // 这里，从下到上构建简单树。
  addTranslateChan(name);
  let responseParent = await axios.request({
    // url: queryFlag.value ? ChildCategoriesPath : ParentCategoriesPath,
    url: "https://wiki.lmd.knogen.com:10443/api/mag/getParentTree",
    method: "post",
    data: {
      id,
      name,
    },
  });
  console.log("responsetmp", responseParent);
  let response = await axios.request({
    // url: queryFlag.value ? ChildCategoriesPath : ParentCategoriesPath,
    url: ChildCategoriesPath,
    method: "post",
    data: {
      id,
    },
  });
  let children: Tree[] = response.data.data.map(
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
  let defaultExpandedKeysSet = new Set<string>([]);
  const deepTree = (nodes: any): Tree[] => {
    let root: Tree[] = [];
    for (let node of nodes) {
      let childs: Tree[] = [];
      if (node.childList) {
        childs = deepTree(node.childList);
      }
      addTranslateChan(node.displayName);
      if (node.displayName === name) {
        childs = children;
      } else {
        defaultExpandedKeysSet.add(node.displayName);
      }
      let leaf: Tree = {
        id: node.fieldOfStudyId,
        name: node.displayName,
        size: node.size,
        leaf: node.childList?.length === 0 ? true : false,
        children: childs,
      };
      root.push(leaf);
    }
    return root;
  };

  let rootTree = deepTree(responseParent.data.data);
  defaultExpandedKeys.value = Array.from(defaultExpandedKeysSet);
  // let root: Tree[] = [];
  // let leafQueue: Tree[] = [
  //   {
  //     id,
  //     name,
  //     size: children.length,
  //     leaf: children.length === 0 ? true : false,
  //     children: children,
  //   },
  // ];
  // let flag = true;
  // let defaultExpandedKeysSet = new Set<string>([]);
  // let rootTree: Tree[] = [];
  // while (flag) {
  //   flag = false;
  //   let nodeMap = new Map<string, Tree>();
  //   console.log("leafQueue", leafQueue);
  //   for (let currentLeaf of leafQueue) {
  //     let response = await axios.request({
  //       url: ParentCategoriesPath,
  //       method: "post",
  //       data: {
  //         id: currentLeaf?.id,
  //       },
  //     });
  //     if (response.data.data.length === 0) {
  //       rootTree.push(currentLeaf);
  //     } else {
  //       response.data.data.forEach(
  //         (item: { id: number; name: string; size: number }) => {
  //           addTranslateChan(item.name);
  //           flag = true;
  //           defaultExpandedKeysSet.add(item.name);
  //           if (item.name in nodeMap) {
  //             nodeMap[item.name].children?.push(currentLeaf);
  //             console.log("children", nodeMap[item.name].children);
  //             // leafQueue.push(nodeMap[item.name]);
  //           } else {
  //             let node = {
  //               id: item.id,
  //               name: item.name,
  //               size: item.size,
  //               children: currentLeaf ? [currentLeaf] : [],
  //               leaf: item.size === 0 ? true : false,
  //             };
  //             leafQueue.push(node);
  //             nodeMap[item.name] = node;
  //           }
  //         }
  //       );
  //     }
  //   }
  //   leafQueue = Array.from(nodeMap.values());
  // }
  // defaultExpandedKeys.value = Array.from(defaultExpandedKeysSet);
  // rootTree = _.uniqBy(rootTree, "name");
  // console.log("rootTree", rootTree);
  return rootTree;
};

const loadNode = async (node: Node, resolve: (data: Tree[]) => void) => {
  if (node.level === 0) {
    let response;
    if (queryObj.value > 0) {
      // treeLazy.value = false;
      // let leafQueue = await iteratorToFather(queryObj.value, queryObj.name);
      // return resolve(leafQueue);
      return resolve([]);
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
    return resolve(root);
  } else if (node.level > 0) {
    let response = await axios.request({
      // url: queryFlag.value ? ChildCategoriesPath : ParentCategoriesPath,
      url: ChildCategoriesPath,
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
