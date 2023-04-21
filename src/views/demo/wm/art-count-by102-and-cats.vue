<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="8")
        el-form-item(label="DBs:" size="large")
          el-select(v-model="appStore.states.dbs",placeholder="DB",style="width: 100%;",size='large',@change='updateChart',multiple)
            el-option(v-for="item in dbs_Candidates",:key="item",:label="item",:value="item") 
            
      el-col(:span="14")  
        el-form-item(label="cat:" size="large")
          el-select(v-model="appStore.states.Cats",placeholder="cat",style="width: 100%;",size='large',@change='updateChart' multiple)
            el-option(v-for="item in Cats_Candidates",:key="item",:label="item",:value="item") 

      el-col(:span="4")  
        el-form-item(label="type:" size="large")
          el-select(v-model="appStore.states.Type",placeholder="type",style="width: 100%;",size='large',@change='updateChart')
            el-option(v-for="item in Type_Candidates",:key="item.value",:label="item.label",:value="item.value") 

      el-col(:span="4")  
        el-form-item(label="tj_type:" size="large")
          el-select(v-model="appStore.states.tj_type",placeholder="type",style="width: 100%;",size='large',@change='updateChart')
            el-option(v-for="item in tj_type_Candidates",:key="item.value",:label="item.label",:value="item.value") 


    el-row(v-loading="loading")
      el-col(:span="24")
        div.echart(:id="chartID")

  </template>

<script lang="ts">
const modelName = "ArtCountBy102AndCats";
export default {
  name: modelName,
  autoIndex: true,
  text: "ArtCountBy102AndCats",
  update: "2023-04-21T09:43:03.429Z",
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

const dbs_Candidates = ["e102", "c102", "d102", "p102"];

const tj_type_Candidates = [
  {
    value: 0,
    label: "逐年数量",
  },
  {
    value: 1,
    label: "统计逐年交集",
  },
];

const Cats_Candidates = [
  "all",
  "Art",
  "Business",
  "Theoretical chemistry",
  "Computational biology",
  "Theoretical physics",
  "Applied physics",
  "Experimental physics",
  "Number theory",
  "Algebra",
  "Geometry",
  "Applied mathematics",
  "Operating system",
  "Discrete mathematics",
  "Earth science",
  "Materials science",
  "Geology",
  "Geography",
  "Environmental science",
  "Medicine",
  "Psychology",
  "Logic",
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
  "Engineering disciplines",
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
  "Quantum computing",
  "Genetic engineering",
  "Genome editing",
  "Anthropology",
  "Neuroscience",
  "Literature",
].sort();
const Type_Candidates = [
  {
    value: 0,
    label: "按所有网络计算",
  },
  {
    value: 1,
    label: "按1965-2010区间网络计算",
  },
];

const loading = ref(false);
// const appHomeStore = homeStore();
// appHomeStore.title = "openalex power-law tide";
const appStore = dynamicStore(modelName, {
  dbs: ["e102", "c102"],
  Cats: ["all", "Materials science"],
  Type: 1,
  tj_type: 1,
});
let myChartObjs: echarts.ECharts[] = [];
const updateChart = _.debounce(async () => {
  loading.value = true;
  let response = await axios.post(
    "https://wiki.lmd.knogen.com:10443/api/wiki/getArtCountBy102AndCats",
    {
      type: appStore.states.Type,
      tj_type: appStore.states.tj_type,
      cats: appStore.states.Cats.join(","),
      dbs: appStore.states.dbs.join(","),
    }
  );
  console.log("response.data", response.data);
  const data = response.data.data;

  let dataset = [data.x, ...data.y];
  dataset = _.zip(...dataset);
  dataset = _.map(dataset, (row) => _.map(row, (num) => _.round(num, 3)));
  dataset = [["year", ...data.legend], ...dataset];

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
      type: "value",
      min: "dataMin",
      max: "dataMax",
      axisLabel: {
        formatter: function (value: any) {
          return value + "";
        },
      },
    },
    legend: {
      show: true,
      data: data.legend,
    },
    yAxis: [
      {
        name: "slope",
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
    series: data.legend.map((name: any, index: any) => {
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
