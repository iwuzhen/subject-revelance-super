<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="4")
        el-form-item(label="包含未知国家：" size="large")
          el-checkbox(v-model="appStore.states.CountainUnknow",style="width: 100%",size='large',label="Yes", @change='updateWorkCountChart')
      el-col(:span="18")  
        el-form-item(label="选择国家:" size="large")
          CountrySelect(placeholder="国家多选",v-model="appStore.states.CountryB",@change='updateWorkCountChart', :multiple="true")
    el-row
      el-col(:span="24")  
        el-form-item(label="文章类型选择:" size="large")
          el-select(v-model="appStore.states.WorkTypeSelect",placeholder="类型选择",multiple,style="width: 100%",size='large',@change='updateWorkCountChart')
            el-option(v-for="item in WorksTypes",:key="item",:label="item",:value="item")    
    el-row
      el-col(:span="24")
        #echartCoutryCount.echart

  </template>

<script lang="ts">
export default {
  name: "open-alex-country-google-distance",
  autoIndex: false,
  text: "openalex country google distance",
  update: "2022-10-26T09:43:03.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import _ from "lodash";
import { onMounted } from "vue";
import * as echarts from "echarts";
import { extendEchartsOpts } from "@/utils/model";
import { pyApiSeveice } from "@/utils/requests";
import CountrySelect from "./ConutrySelect.vue";

const WorksTypes = [
  "UNKNOW",
  "book",
  "book-chapter",
  "book-part",
  "book-section",
  "book-series",
  "book-set",
  "book-track",
  "component",
  "dataset",
  "dissertation",
  "grant",
  "journal",
  "journal-article",
  "journal-issue",
  "journal-volume",
  "monograph",
  "other",
  "peer-review",
  "posted-content",
  "proceedings",
  "proceedings-article",
  "proceedings-series",
  "reference-book",
  "reference-entry",
  "report",
  "report-series",
  "standar",
];
const appHomeStore = homeStore();
appHomeStore.title = "openalex country google distance";
const appStore = dynamicStore("openalex-country-distance", {
  CountryB: [
    "CN",
    "GB",
    "DE",
    "JP",
    "FR",
    "IN",
    "CA",
    "BR",
    "IT",
    "AU",
    "ES",
    "KR",
    "RU",
    "NL",
    "ID",
  ],
  CountainUnknow: true,
  WorkTypeSelect: [
    "component",
    "dataset",
    "dissertation",
    "grant",
    "journal",
    "journal-article",
    "journal-issue",
    "journal-volume",
    "monograph",
    "other",
    "peer-review",
    "posted-content",
    "proceedings",
    "proceedings-article",
    "proceedings-series",
    "reference-entry",
    "report",
    "report-series",
    "standar",
  ],
});
let myChartObjs: echarts.ECharts[] = [];

const updateWorkCountChart = _.debounce(async () => {
  let countrys: any[] = [].concat([], appStore.states.CountryB);
  if (appStore.states.CountainUnknow) {
    countrys.push("UNKNOW");
  }
  let response = await pyApiSeveice.post("/openalex/countryworkscount", {
    countrys,
    typenames: appStore.states.WorkTypeSelect,
  });
  console.log("response.data", response.data);
  let option = extendEchartsOpts({
    title: {
      left: "center",
      top: "1%",
      textAlign: "center",
      textStyle: {
        fontSize: 20,
      },
      text: "country works count",
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
        // position: "left",
        // name: "disruption",
        type: "value",
      },
    ],
    dataset: [
      {
        source: response.data.data,
        dimensions: response.data.dimensions,
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
          showHtm += `${_marker}${_text}  ：${_data}<br>`;
        }
        return showHtm;
      },
    },
    series: response.data.dimensions.slice(1).map((item: string) => {
      return {
        datasetIndex: 0,
        type: "line",
        name: item,
        encode: {
          x: "year",
          y: item,
        },
        markPoint: {
          data: [{ type: "max", name: "Max" }],
        },
      };
    }),
  });
  console.log("set opion:", option);
  myChartObjs[0].setOption(option, true);
}, 1000);
onMounted(() => {
  for (let chartName of ["echartCoutryCount"]) {
    let elem = document.getElementById(chartName);
    if (elem) {
      myChartObjs.push(echarts.init(elem));
    }
  }
  window.onresize = _.debounce(() => {
    myChartObjs.forEach((element) => {
      element.resize();
    });
  }, 500);
  updateWorkCountChart();
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
