<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="4")
        el-form-item(label="catA:" size="large")
          el-select(v-model="appStore.states.CatA",placeholder="catA",style="width: 100%;",size='large',@change='updateChart')
            el-option(v-for="item in Cats_Candidates",:key="item",:label="item",:value="item") 
            
      el-col(:span="14")  
        el-form-item(label="catB:" size="large")
          el-select(v-model="appStore.states.CatB",placeholder="catB",style="width: 100%;",size='large',@change='updateChart' multiple)
            el-option(v-for="item in Cats_Candidates",:key="item",:label="item",:value="item") 

      el-col(:span="4")  
        el-form-item(label="method:" size="large")
          el-select(v-model="appStore.states.Method",placeholder="method",style="width: 100%;",size='large',@change='updateChart')
            el-option(v-for="item in Method_Candidates",:key="item",:label="item",:value="item") 

      el-col(:span="4")  
        el-form-item(label="type:" size="large")
          el-select(v-model="appStore.states.Type",placeholder="type",style="width: 100%;",size='large',@change='updateChart')
            el-option(v-for="item in Type_Candidates",:key="item.value",:label="item.text",:value="item.value") 

      el-col(:span="8")  
        el-form-item(:label="`year range ${appStore.states.YearRange[0]}-${appStore.states.YearRange[1]}:`" size="large")
          el-slider(v-model="appStore.states.YearRange" range show-input :min="1950" :max="2022" @change='updateChart')

    el-row(v-loading="loading")
      el-col(:span="24")
        div.echart(:id="chartID")

  </template>

<script lang="ts">
const modelName = "openalex-subject-google-distance-middle-data";
export default {
  name: modelName,
  autoIndex: false,
  text: "openalex-subject-google-distance-middle-data",
  update: "2023-04-11T09:43:03.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import _ from "lodash";
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
import { extendEchartsOpts } from "@/utils/model";
import axios from "axios";
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
const Method_Candidates = ["linksin", "linksout"];
const Type_Candidates = [
  { text: "引用数", value: 0 },
  { text: "引用交集数", value: 1 },
  { text: "MAX/交集", value: 2 },
];

const loading = ref(false);
// const appHomeStore = homeStore();
// appHomeStore.title = "openalex power law point year";
const appStore = dynamicStore(modelName, {
  CatA: "Physics",
  CatB: ["Materials science", "Biology", "Chemistry"],
  Method: "linksin",
  Type: 0,
  YearRange: [1950, 2022],
});
let myChartObjs: echarts.ECharts[] = [];
const updateChart = _.debounce(async () => {
  loading.value = true;
  let response = await axios.post(
    "https://wiki.lmd.knogen.com:10443/api/mag/getGoogleDistance_tempdata",
    {
      strA: appStore.states.CatA,
      strB: appStore.states.CatB.filter(
        (item) => item != appStore.states.CatA
      ).join(","),
      method: appStore.states.Method,
      from: appStore.states.YearRange[0],
      to: appStore.states.YearRange[1],
      version: "nobook_notypenull",
      dbtype: "openAlex",
      type: appStore.states.Type,
      level: "-1",
      levelType: "-1",
    }
  );
  console.log("response.data", response.data);
  const data = response.data.data;

  let dataset = [data.x, ...data.y];
  dataset = _.zip(...dataset);
  dataset = _.map(dataset, (row) => _.map(row, (num) => _.round(num, 3)));
  dataset = [["x", ...data.legend], ...dataset];

  let option = extendEchartsOpts({
    title: {
      left: "center",
      top: "1%",
      textAlign: "center",
      textStyle: {
        fontSize: 20,
      },
      text: data.title,
    },
    xAxis: {
      name: "year",
      type: "category",
      min: "dataMin",
      max: "dataMax",
    },
    legend: {
      show: true,
      data: data.legend,
    },
    yAxis: [
      {
        name: "count",
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
    series: data.legend.map((name, index) => {
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
