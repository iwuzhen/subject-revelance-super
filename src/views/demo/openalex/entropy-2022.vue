<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="14")  
        el-form-item(label="cat:" size="large")
          el-select(v-model="appStore.states.Cats",placeholder="cat",style="width: 100%;",size='large',@change='updateChart' multiple)
            el-option(v-for="item in Cats_Candidates",:key="item",:label="item",:value="item") 

      el-col(:span="4")  
        el-form-item(label="type:" size="large")
          el-select(v-model="appStore.states.Type",placeholder="type",style="width: 100%;",size='large',@change='updateChart')
            el-option(v-for="item in Type_Candidates",:key="item.value",:label="item.label",:value="item.value") 
            
      el-col(:span="4")  
        el-form-item(label="direct:" size="large")
          el-select(v-model="appStore.states.Direct",placeholder="direct",style="width: 100%;",size='large',@change='updateChart')
            el-option(v-for="item in Direct_Candidates",:key="item.value",:label="item.label",:value="item.value") 

    el-row(v-loading="loading")
      el-col(:span="24")
        div.echart(:id="chartID")

  </template>

<script lang="ts">
const modelName = "openalex-entropy-2022";
export default {
  name: modelName,
  autoIndex: true,
  text: "openalex-entropy-2022",
  update: "2023-04-13T09:43:03.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import _ from "lodash";
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
import { extendEchartsOpts } from "@/utils/model";
import { localService } from "@/utils/requests";
import { nanoid } from "@/utils/tools";

const chartID = nanoid();

const Cats_Candidates = [
  "Materials science",
  "Geology",
  "Geography",
  "Environmental science",
  "Medicine",
  "Psychology",
  "Philosophy",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Sociology",
  "Economics",
  "Political science",
  "Linguistics",
  "History",
  "Computer science",
  "Artificial intelligence",
  "Engineering",
  "Chemical engineering",
  "Civil engineering",
  "Electrical engineering",
  "Mechanical engineering",
  "Biological engineering",
  "Computer engineering",
  "Industrial engineering",
  "Environmental engineering",
  "Cognitive science",
  "Machine learning",
  "Blockchains",
  "Deep learning",
  "Theoretical computer science",
  "Quantum computer",
  "Genetic engineering",
  "Genome editing",
  "Anthropology",
  "Neuroscience",
  "Literature",
];

const Direct_Candidates = [
  {
    label: "in",
    value: 0,
  },
  {
    label: "out",
    value: 1,
  },
  {
    label: "Undirected",
    value: 2,
  },
];

const Type_Candidates = [
  {
    label: "度分布熵",
    value: 0,
  },
  {
    label: "结构熵",
    value: 1,
  },
  {
    label: "标准结构熵",
    value: 2,
  },
  {
    label: "网络节点数",
    value: 3,
  },
];

const loading = ref(false);
const appHomeStore = homeStore();
appHomeStore.title = "openalex entropy";
const appStore = dynamicStore(modelName, {
  Cats: ["Mathematics", "Materials science"],
  Direct: 0,
  Type: 3,
});
let myChartObjs: echarts.ECharts[] = [];
const updateChart = _.debounce(async () => {
  loading.value = true;
  let baseUrl = "static/data/openalex/entropy/";

  const decisionTree = {
    "0-0": ["degreeEntropy/", "InE"],
    "0-1": ["degreeEntropy/", "OutE"],
    "0-2": ["degreeEntropy/", "UndirectedE"],
    "1-0": ["structEntropy/", "InE"],
    "1-1": ["structEntropy/", "OutE"],
    "1-2": ["structEntropy/", "UndirectedE"],
    "2-0": ["structEntropy/", "InSE"],
    "2-1": ["structEntropy/", "OutSE"],
    "2-2": ["structEntropy/", "UndirectedSE"],
    "3-0": ["structEntropy/", "InLength"],
    "3-1": ["structEntropy/", "OutLength"],
    "3-2": ["structEntropy/", "UndirectedLength"],
  };

  let key = `${appStore.states.Type}-${appStore.states.Direct}`;
  console.log(key);
  let [subPath, dataKey] = decisionTree[key];

  let year = _.range(1900, 2023);
  let names = [];
  let dataset = [year];
  for (let subjectName of appStore.states.Cats) {
    names.push(subjectName);
    let fileName = subjectName.toLowerCase().replace(/\s+/g, "_") + ".json";
    let url = baseUrl + subPath + fileName;
    let response = await localService.get(url);
    dataset.push(response.data[dataKey]);
  }

  dataset = _.zip(...dataset);
  dataset = _.map(dataset, (row) => _.map(row, (num) => _.round(num, 3)));
  dataset = [["year", ...names], ...dataset];

  console.log(dataset);
  let option = extendEchartsOpts({
    title: {
      left: "center",
      top: "1%",
      textAlign: "center",
      textStyle: {
        fontSize: 20,
      },
      text: "",
    },
    toolbox: {
      show: true,
    },
    xAxis: {
      name: "year",
      type: "category",
      // min: "dataMin",
      // max: "dataMax",
      // axisLabel: {
      //   formatter: function (value) {
      //     return value + "";
      //   },
      // },
    },
    legend: {
      show: true,
      data: names,
    },
    yAxis: [
      {
        name: "",
        type: "value",
        min: "dataMin",
      },
    ],
    dataset: [
      {
        source: dataset,
        // dimensions: data.x,
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
    series: names.map((name, index) => {
      return {
        datasetIndex: 0,
        type: "line",
        name: name,
        encode: {
          x: 0,
          y: index + 1,
        },
      };
    }),
  });
  console.log("set option:", option);
  // myChartObjs[0].clear();
  myChartObjs[0].setOption(option, true);
  loading.value = false;
}, 1000);

onMounted(() => {
  for (let chartName of [chartID]) {
    let elem = document.getElementById(chartName);
    if (elem) {
      myChartObjs.push(echarts.init(elem));
    }
  }
  updateChart();
  window.onresize = _.debounce(() => {
    myChartObjs.forEach((element) => {
      element.resize();
    });
  }, 500);
});
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
