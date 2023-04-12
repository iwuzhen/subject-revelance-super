<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="8")
        el-form-item(label="DB:" size="large")
          el-select(v-model="appStore.states.DB",placeholder="DB",style="width: 100%;",size='large',@change='updateChart')
            el-option(v-for="item in DB_Candidates",:key="item.value",:label="item.label",:value="item.value") 
      el-col(:span="8")  
        el-form-item(label="type:" size="large")
          el-select(v-model="appStore.states.Type",placeholder="type",style="width: 100%;",size='large',@change='updateChart')
            el-option(v-for="item in Type_Candidates",:key="item.value",:label="item.label",:value="item.value") 

    el-row
      el-col(:span="24")
        div.echart(:id="chartID")

  </template>

<script lang="ts">
const modelName = "openalex-node-edge-stats";
export default {
  name: modelName,
  autoIndex: true,
  text: "openalex-node-edge-stats",
  update: "2023-04-11T09:43:03.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import _ from "lodash";
import { onMounted } from "vue";
import * as echarts from "echarts";
import { extendEchartsOpts } from "@/utils/model";
import axios from "axios";
import { nanoid } from "@/utils/tools";

const chartID = nanoid();

const DB_Candidates = [
  {
    value: "openAlex_nobook_notypenull",
    label: "openAlex去书，去论文类型为空",
  },
];

const Type_Candidates = [
  {
    value: "node",
    label: "node",
  },
  {
    value: "edge",
    label: "edge",
  },
  {
    value: "fos",
    label: "fos",
  },
  {
    value: "node_dx",
    label: "node_dx",
  },
  {
    value: "edge_dx",
    label: "edge_dx",
  },
  {
    value: "fos_dx",
    label: "fos_dx",
  },
];

const appHomeStore = homeStore();
appHomeStore.title = "openalex node edge stats";
const appStore = dynamicStore(modelName, {
  DB: "openAlex_nobook_notypenull",
  Type: "node",
});
let myChartObjs: echarts.ECharts[] = [];
const updateChart = _.debounce(async () => {
  let response = await axios.post(
    "https://wiki.lmd.knogen.com:10443/api/wiki/getWikiAndMagCountByYear",
    {
      db: appStore.states.DB,
      type: appStore.states.Type,
    }
  );
  console.log("response.data", response.data);
  const data = response.data.data;

  let dataset = [data.x, data.y];
  dataset = _.zip(...dataset);

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
    },
    legend: {
      show: true,
    },
    yAxis: [
      {
        type: "value",
        min: "dataMin",
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
    series: {
      datasetIndex: 0,
      type: "line",
      name: "",
      encode: {
        x: 0,
        y: 1,
      },
    },
  });
  console.log("set option:", option);
  // myChartObjs[0].clear();
  myChartObjs[0].setOption(option, true);
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
