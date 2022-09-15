<template lang="pug">
el-row
  el-col(:span="8")
    el-tree(:props="props" lazy :load="loadNode" show-checkbox :check-strictly="true" @check-change="handleCheckChange")
      template.custom-tree-node(v-slot:="{ node }") {{ node.data.name }}
        el-tag(class="ml-2") {{ en2zhdict[node.data.name]===undefined?'Loading...': en2zhdict[node.data.name] }}
        el-tag(class="ml-2" type="success" v-if="node.data.size>0") {{node.data.size}}
  
  el-col(:span="10")
    el-form-item(label="选中的学科 :" size="large")
      el-select(v-model="appStore.states.subjectSelect",allow-create,multiple,default-first-option,filterable,size='large',@change='updateChart')
        el-option(v-for="item in subjectOpt",:key="item",:label="item",:value="item")    

  el-col(:span="4")
    el-form-item(label="文章类型:" size="large")
      el-select(v-model="appStore.states.typeSelect",placeholder="图表选择",style="width: 100%",size='large',@change='updateChart')
        el-option(v-for="item in typeOpt",:key="item",:label="item",:value="item")    

el-row
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

const appHomeStore = homeStore();
appHomeStore.title = "MAG FOS browser";

const appStore = dynamicStore("fos-trend-2022", {
  subjectSelect: ["Mathematics", "Physics"],
  typeSelect: "patent",
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

const props = {
  label: "name",
  children: "zones",
  isLeaf: "leaf",
};

const subjectOpt: string[] = [];
const typeOpt = ["book", "patent", "article"];
// "type":"book"  //[book,patent,article]  book和patent数据好了 article数据没好

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
});

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
    },
  });
  // build dataset
  let dataObj = response.data.data;
  let dataset = [["year", ...Object.keys(dataObj)]];
  for (let year = 1800; year <= 2020; year++) {
    let row: any[] = [year];
    for (let key of dataset[0].slice(1)) {
      row.push(dataObj[key][year] || "-");
    }
    dataset.push(row);
  }
  // console.log(dataset);
  // sort dataset title by last row value
  const fuseData = _.zip(
    appStore.states.subjectSelect,
    dataset.slice(-1)[0].slice(1)
  );

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
      text: "WM 颠覆度学科逐年分布",
    },
    xAxis: {
      name: "year",
      type: "value",
      max: 2020,
      min: 1800,
    },
    legend: {
      show: true,
    },
    yAxis: [
      {
        // position: "left",
        // name: "disruption",
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
        params.sort((x: any, y: any) => {
          let dataIDX: number = x.encode.y[0];
          let dataIDY: number = y.encode.y[0];
          // if (y.data === undefined) {
          //   return -1;
          // }
          return y.data[dataIDY] - x.data[dataIDX];
        });
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
          showHtm += `${_marker}${_text}：${_data}<br>`;
        }
        return showHtm;
      },
    },
    series: legend.map((item: any) => {
      return {
        datasetIndex: 0,
        type: "line",
        name: item,
        encode: {
          x: "year",
          y: item.toLowerCase(),
        },
      };
    }),
  });
  // myChartObjs[0].clear();
  myChartObjs[0].setOption(option);
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
    response = await axios.get(OriginCategoriesPath);
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
  } else if (node.level == 1) {
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
          leaf: true,
        };
      }
    );
    // console.log("root", root);
    return resolve(root);
  } else if (node.level > 1) {
    return resolve([]);
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
.el-tag {
  margin-left: 20px;
}
.el-select {
  width: 95%;
}
</style>
