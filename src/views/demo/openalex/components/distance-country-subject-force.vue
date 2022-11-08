<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="10")
        el-form-item(label="国家:" size="large")
          CountrySelect(placeholder="选择国家",v-model="appStore.states.Country",@change='updateChart', :multiple="true")

      el-col(:span="10")
        el-form-item(label="学科:" size="large")
          el-select(v-model="appStore.states.Subject",placeholder="学科",style="width: 100%",size='large',@change='updateChart',multiple)
            el-option(v-for="item of subjectOpt",:key="item.id",:label="item.name",:value="item.id")

    el-row
      el-col(:span="24")
        #echartForceCountrySubject.echart

  </template>

<script lang="ts">
export default {
  name: "open-alex-country-subject-google-distance",
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
import { pyApiService } from "@/utils/requests";
import CountrySelect from "./CountrySelect.vue";

const subjectOpt = [
  { id: 205649164, name: "Geography" },
  { id: 127413603, name: "Engineering" },
  { id: 144133560, name: "Business" },
  { id: 33923547, name: "Mathematics" },
  { id: 121332964, name: "Physics" },
  { id: 15744967, name: "Psychology" },
  { id: 41008148, name: "Computer science" },
  { id: 95457728, name: "History" },
  { id: 185592680, name: "Chemistry" },
  { id: 192562407, name: "Materials science" },
  { id: 17744445, name: "Political science" },
  { id: 127313418, name: "Geology" },
  { id: 138885662, name: "Philosophy" },
  { id: 144024400, name: "Sociology" },
  { id: 39432304, name: "Environmental science" },
  { id: 142362112, name: "Art" },
  { id: 71924100, name: "Medicine" },
  { id: 86803240, name: "Biology" },
  { id: 162324750, name: "Economics" },
].sort((a: any, b: any) => a.name.localeCompare(b.name));

console.log(subjectOpt);
const appHomeStore = homeStore();
appHomeStore.title = "openalex country google distance";
const appStore = dynamicStore("openalex-country-subject-distance-force", {
  Country: [
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
    "IL",
  ],
  Subject: [33923547],
});
let myChartObjs: echarts.ECharts[] = [];

const updateChart = _.debounce(async () => {
  let response = await pyApiService.post(
    "/openalex/force_distance_country_subject",
    {
      countries: appStore.states.Country,
      subjects: appStore.states.Subject,
    }
  );
  console.log("response.data", response.data);
  let option = extendEchartsOpts({
    title: {
      left: "center",
      top: "1%",
      textAlign: "center",
      textStyle: {
        fontSize: 20,
      },
      // text: "subject country google distance",
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
        min: "dataMin",
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
          showHtm += `${_marker}${_text}：${_data}<br>`;
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
      };
    }),
  });
  console.log("set opion:", option);
  // myChartObjs[0].clear();
  myChartObjs[0].setOption(option, true);
}, 1000);

onMounted(() => {
  for (let chartName of ["echartCountrySubject"]) {
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
