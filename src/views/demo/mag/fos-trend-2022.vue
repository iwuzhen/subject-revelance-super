<template lang="pug">
el-dialog(v-model="dialogTableVisible" title="Paper information" width="90%")
  el-space(wrap)
    el-card(v-for="item in paperItem" :to="item.href" target="_blank")
      template(#header)
        .card-header
          span.text-3xl {{item.title}}
          br
          span.zh {{ en2zhdict[item.title]===undefined?'Loading...': en2zhdict[item.title] }}
      description(v-if="item.publisher !==''")
        p publisher: {{item.publisher}}

      el-row
        .author( v-for="author in item.authors" :key="author.name" )
          .name {{author.name}}
          .org  {{author.org}}
      .tag
        time.italic {{item.year}}

      .tag
        el-tag( v-for="tag in item.fos"  :key="tag.name"  :disable-transitions="false" ) {{tag.name}}

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
      el-select(v-model="appStore.states.subjectSelect",allow-create,multiple,filterable,size='large',@change='updateChart')
        el-option(v-for="item in subjectOpt",:key="item",:label="item",:value="item")    
el-row
  el-col(:span="8") 
    el-form-item(label="搜索:" size="large")
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
  el-col(:span="12")
    el-tree(v-if="treeFlag" :props="props" lazy :load="loadNode" show-checkbox :check-strictly="true" @check-change="handleCheckChange",node-key="name",accordion,:default-checked-keys="appStore.states.subjectSelect")
      template.custom-tree-node(v-slot:="{ node }") {{ node.data.name }}
        el-tag(class="ml-2") {{ en2zhdict[node.data.name]===undefined?'Loading...': en2zhdict[node.data.name] }}
        el-tag(class="ml-2" type="success" v-if="node.data.size>0") {{node.data.size}}
  
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

const appStore = dynamicStore("fos-trend-2022", {
  subjectSelect: ["Mathematics", "Physics"],
  typeSelect: "patent",
  yz: 1,
});

interface Tree {
  id?: number;
  name: string;
  size: number;
  // children?: Tree[];
  leaf?: boolean;
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
const dialogTableVisible = ref(false);

const props = {
  label: "name",
  children: "zones",
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
const queryName = ref("");
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
let paperItem = ref<any[]>([]);
const getPaperDetail = async (name: string, year: number) => {
  let url = "https://wiki.lmd.knogen.com:10443/api/mag/getMagInfoByFos";
  let response = await axios.request({
    url,
    method: "post",
    data: {
      type: appStore.states.typeSelect,
      cat: name,
      year: year,
    },
  });
  paperItem.value = response.data.data;
  dialogTableVisible.value = true;
  for (let item of response.data.data) {
    addTranslateChan(item.title);
  }
  console.log(response.data);
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
  let dataset = [["year", ...Object.keys(dataObj)]];
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
    series: legend.map((item: any) => {
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
    return resolve(root);
  } else if (node.level > 0) {
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

<style lang="less" scoped>
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
</style>
