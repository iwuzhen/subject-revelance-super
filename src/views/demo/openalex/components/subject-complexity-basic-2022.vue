<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="6" v-if="props.typeMode == 1")
        el-form-item(label="国家:" size="large")
          CountrySelect(placeholder="选择国家",v-model="appStore.states.Country",@change='updateChart', :multiple="false")
      el-col(:span="8" v-if="props.typeMode == 2")
        el-form-item(label="国家:" size="large")
          CountrySelect(placeholder="选择国家",v-model="appStore.states.CountryMultiple",@change='updateChart', :multiple="true")
      el-col(:span="6" v-if="props.typeMode == 2")
        el-form-item(label="Subject:" size="large")
          el-select(v-model="appStore.states.Subject",placeholder="Subject",style="width: 100%",size='large',@change='updateChart')
            el-option(v-for="key in SubjectOption",:key="key",:label="key",:value="key")


      el-col(:span="6")
        el-form-item(label="TopN:" size="large")
          el-select(v-model="appStore.states.TopN",placeholder="TopN",style="width: 100%",size='large',@change='updateChart')
            el-option(v-for="key in 20",:key="key",:label="key*1000",:value="key*1000")
      el-col(:span="6")
        el-form-item(label="统计参数:" size="large")
          el-select(v-model="appStore.states.tj_type",placeholder="tj_type",style="width: 100%",size='large',@change='updateChart')
            el-option(label="统计数值",:value="0")
            el-option(label="统计比例",:value="1")
      el-col(:span="6")
        el-form-item(label="linksin 阈值:" size="large")
          el-select(v-model="appStore.states.linksInThreshold",placeholder="阈值",style="width: 100%",size='large',@change='updateChart')
            el-option(v-for="item in [100,1000,10000]",:key="item",:label="item",:value="item")
    el-row
      el-col(:span="24" v-loading="loading")
        div.echart(:id="chartID")

  </template>

<script lang="ts">
export default {
  name: "openalex-subject-complexity-2022",
  autoIndex: false,
  text: "openalex country google distance",
  update: "2023-01-03T09:43:03.429Z",
};
</script>

<script setup lang="ts">
import { dynamicStore } from "@/pinia/modules/pageStore";
import _ from "lodash";
import { onMounted, defineProps, ref } from "vue";
import * as echarts from "echarts";
import axios from "axios";
import { extendEchartsOpts } from "@/utils/model";
import CountrySelect from "./CountrySelect.vue";
import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("1234567890abcdef", 10);
const chartID = nanoid();
let loading = ref(false);
const props = defineProps({
  typeMode: {
    type: Number,
    default: 0,
  },
});

// typeMode
// 0: 不分国家的按学科年度比较
// 1: 1个国家内的学科年度比较
// 2: 1个学科内的国家间年度比较

// tj_type=[0:统计数值 1:统计比例]

const appStore = dynamicStore(
  `openalex-country-distance-basic-${props.typeMode}`,
  {
    Country: "CN",
    CountryMultiple: ["CN", "US", "GB", "DE", "JP", "FR"],
    Subject: "Medicine",
    TopN: 1000,
    linksInThreshold: 100,
    tj_type: 1,
  }
);

let SubjectOption = [
  "Medicine",
  "Computer science",
  "Biology",
  "Engineering",
  "Mathematics",
  "Physics",
  "Psychology",
  "Economics",
  "Chemistry",
  "Political science",
  "Philosophy",
  "Business",
  "Sociology",
  "Materials science",
  "Geology",
  "Geography",
  "Environmental science",
];

const CountryCodes = [
  "US",
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
  "PL",
  "IR",
  "SE",
  "CH",
  "TR",
  "TW",
  "BE",
  "MX",
  "IL",
  "DK",
  "AT",
  "FI",
  "ZA",
  "PT",
];
const apiService = axios.create({
  timeout: 120 * 1000,
});
apiService.defaults.baseURL = "https://wiki.nikepai.com/";

let MyChartObj: echarts.ECharts;

const queryMemory = _.memoize(
  function (queryMirror) {
    return apiService.post("api/openAlex/tjXuekeFzx", queryMirror);
  },
  (...args) => JSON.stringify(args)
);

const updateChart = _.debounce(async () => {
  loading.value = true;
  let query = {
    topN: appStore.states.TopN, //[0,20000]
    level: 0, //[0:一级大类]
    type: props.typeMode === 0 ? 0 : 1, //[0:按年统计 1:按国家按年统计]
    countries: CountryCodes.join(","), //100多个国家列表
    linksin_yz: appStore.states.linksInThreshold, //[100,1000,10000]
    year: 2000, //[1980,2022],空字符串表示查询所有
    tj_type: appStore.states.tj_type,
  };

  let dataSet: any[] = [];
  // dimensions
  if (props.typeMode < 2) {
    dataSet.push(["year", ...SubjectOption]);
  } else if (props.typeMode == 2) {
    dataSet.push(["year", ...appStore.states.CountryMultiple]);
  }

  // 独立进行
  // for (let year = 1980; year <= 2022; year += 2) {
  //   query.year = year;
  //   // if ()
  //   let response = await apiService.post("api/openAlex/tjXuekeFzx", query);
  //   console.log(response.data.data);

  //   // 构建 dataSet
  //   let dataRow = [year];
  //   if (props.typeMode == 0) {
  //     for (let key of dataSet[0].slice(1)) {
  //       dataRow.push(response.data.data[year]?.[key] ?? "-");
  //     }
  //     dataSet.push(dataRow);
  //   } else if (props.typeMode == 1) {
  //     for (let key of dataSet[0].slice(1)) {
  //       dataRow.push(
  //         response.data.data[year]?.[appStore.states.Country]?.[key] ?? "-"
  //       );
  //     }
  //     dataSet.push(dataRow);
  //   } else if (props.typeMode == 2) {
  //     for (let key of dataSet[0].slice(1)) {
  //       dataRow.push(
  //         response.data.data[year]?.[key]?.[appStore.states.Subject] ?? "-"
  //       );
  //     }
  //     dataSet.push(dataRow);
  //   }
  // }
  console.log(dataSet);

  // Promise.all
  let ps = [];

  for (let year = 1980; year <= 2022; year += 2) {
    let queryMirror = Object.assign(query);
    queryMirror.year = year;
    ps.push(queryMemory(queryMirror));
  }
  const allPromise = Promise.all(ps);
  const lists = await allPromise;
  console.log("lists", lists);
  let year = 1980;
  for (let response of lists) {
    let responseData = response.data.data;
    // 构建 dataSet
    let dataRow = [year];
    if (props.typeMode == 0) {
      for (let key of dataSet[0].slice(1)) {
        dataRow.push(responseData[year]?.[key] ?? "-");
      }
      dataSet.push(dataRow);
    } else if (props.typeMode == 1) {
      for (let key of dataSet[0].slice(1)) {
        dataRow.push(
          responseData[year]?.[appStore.states.Country]?.[key] ?? "-"
        );
      }
      dataSet.push(dataRow);
    } else if (props.typeMode == 2) {
      for (let key of dataSet[0].slice(1)) {
        dataRow.push(
          responseData[year]?.[key]?.[appStore.states.Subject] ?? "-"
        );
      }
      dataSet.push(dataRow);
    }
    year += 2;
  }

  // series rank by last year date
  let dimensions = dataSet[0].slice(1);
  let dimensionsValue = dataSet.slice(-1)[0].slice(1);
  // console.log("dataSet", dataSet, dataSet.slice(-1));
  dimensions = _.unzip(
    _.zip(dimensions, dimensionsValue).sort((a: any[], b: any[]) => b[1] - a[1])
  )[0];
  console.log("dimensions", dimensions);
  // if (props.typeMode == 0) {
  // } else {
  // }
  // let response = await apiService.post("api/openAlex/tjXuekeFzx", query);
  // console.log(response.data);
  // console.log("response.data", response.data);
  let option = extendEchartsOpts({
    title: {
      left: "center",
      top: "1%",
      textAlign: "center",
      textStyle: {
        fontSize: 20,
      },
      text: "subject complexity",
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
        source: dataSet,
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
    series: dimensions.map((item: string) => {
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
  MyChartObj.setOption(option, true);
  loading.value = false;
}, 1000);

onMounted(() => {
  let elem = document.getElementById(chartID);
  if (elem) {
    MyChartObj = echarts.init(elem);
  }
  updateChart();
  window.onresize = _.debounce(() => {
    MyChartObj.resize();
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
