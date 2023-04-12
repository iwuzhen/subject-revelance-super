<template lang="pug">
el-main
  el-row 
    el-col(:span="16")  
      el-form-item(label="图表类型:" size="large")
        el-select(v-model="appStore.states.chartType",placeholder="类型选择",style="width: 100%;",size='large',@change='updateChartType')
          el-option(v-for="item in chartTypeOpt",:key="item.value",:label="item.label",:value="item.value") 
  el-row
    el-col(:span="4" v-if="chartTypeLink[appStore.states.chartType].country1")
      el-form-item(label="国家A:" size="large")
        CountrySelect(placeholder="选择国家A",v-model="appStore.states.CountryA",@change='updateChart', :multiple="false")
    el-col(:span="18" v-if="chartTypeLink[appStore.states.chartType].country2")  
      el-form-item(label="国家B多选:" size="large")
        CountrySelect(placeholder="国家B多选",v-model="appStore.states.CountryB",@change='updateChart', :multiple="true")
    el-col(:span="10"  v-if="chartTypeLink[appStore.states.chartType].cat1")
      el-form-item(label="学科a:" size="large")
        el-select(v-model="appStore.states.CatA",placeholder="学科a",style="width: 100%",size='large',@change='updateChart')
          el-option(v-for="item of subjectOpt",:key="item.name",:label="item.name",:value="item.name")
    el-col(:span="10"  v-if="chartTypeLink[appStore.states.chartType].cat2")
      el-form-item(label="学科b:" size="large")
        el-select(v-model="appStore.states.CatB",placeholder="学科b",style="width: 100%",size='large',@change='updateChart',multiple)
          el-option(v-for="item of subjectOpt",:key="item.name",:label="item.name",:value="item.name")
  el-row
    el-col(:span="24")
      #echartCountrySubject.echart
</template>

<script setup lang="ts">
import { dynamicStore } from "@/pinia/modules/pageStore";
import axios from "axios";
import { reactive, ref, onMounted } from "vue";
import _ from "lodash";
import * as echarts from "echarts";
import CountrySelect from "./CountrySelect.vue";
import { extendEchartsOpts } from "@/utils/model";

const appStore = dynamicStore("openalex-reference-country-subject", {
  CountryA: "US",
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
  CatA: "Physics",
  CatB: ["Physics", "Mathematics"],
  chartType: 0,
});

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

const chartTypeOpt = [
  {
    label: "国家A不同学科的论文引用本国的情况",
    value: 0,
  },
  {
    label: "各个国家的单学科论文引用本国的情况",
    value: 1,
  },
  {
    label: "国家A的单学科论文的linksout中各国家的占比",
    value: 2,
  },
];

const chartTypeLink = {
  0: {
    country1: true,
    country2: false,
    cat1: false,
    cat2: true,
  },
  1: {
    country1: false,
    country2: true,
    cat1: true,
    cat2: false,
  },
  2: {
    country1: true,
    country2: true,
    cat1: true,
    cat2: true,
  },
};

let myChartObjs: echarts.ECharts[] = [];

// 创建axios实例
const apiService = axios.create({
  timeout: 120 * 1000,
});
apiService.defaults.baseURL = "https://wiki.nikepai.com/";

const updateChart = _.debounce(async () => {
  // 生成一些数据
  let query = {
    countryA: appStore.states.CountryA,
    countryB: appStore.states.CountryB.join(","),
    cat: appStore.states.CatA,
    cats: appStore.states.CatB.join(","),
    type: appStore.states.chartType,
  };
  let response = await apiService.post(
    "api/openAlex/getOpenAlexRefSelfRate_cat",
    query
  );
  console.log(response.data);

  let series: echarts.SeriesOption[] = _.zip<any, any>(
    response.data.data.legend,
    response.data.data.y
  ).map((item) => {
    return {
      name: item[0],
      type: "line",
      symbolSize: 10,
      smooth: false,
      data: item[1],
    };
  });

  let option = extendEchartsOpts({
    title: {
      left: "center",
      top: "1%",
      textAlign: "center",
      textStyle: {
        fontSize: 20,
      },
      text: response.data.data.title,
    },
    xAxis: {
      // max: 5,
      type: "category",
      data: response.data.data.x,
    },
    legend: {
      show: true,
      data: response.data.data.legend,
    },
    yAxis: {
      position: "left",
    },
    series,
  });
  myChartObjs[0].setOption(option, true);
}, 1000);

const updateChartType = _.debounce(async () => {
  // 生成一些数据
  let query = {
    countryA: appStore.states.CountryA,
    countryB: appStore.states.CountryB.join(","),
    cat: appStore.states.CatA,
    cats: appStore.states.CatB.join(","),
    type: appStore.states.chartType,
  };
  let response = await apiService.post(
    "api/openAlex/getOpenAlexRefSelfRate_cat",
    query
  );
  console.log(response.data);

  let series: echarts.SeriesOption[] = _.zip<any, any>(
    response.data.data.legend,
    response.data.data.y
  ).map((item) => {
    return {
      name: item[0],
      type: "line",
      symbolSize: 10,
      smooth: false,
      data: item[1],
    };
  });

  let option = extendEchartsOpts({
    title: {
      left: "center",
      top: "1%",
      textAlign: "center",
      textStyle: {
        fontSize: 20,
      },
      text: response.data.data.title,
    },
    xAxis: {
      // max: 5,
      type: "category",
      data: response.data.data.x,
    },
    legend: {
      show: true,
      data: response.data.data.legend,
    },
    yAxis: {
      position: "left",
    },
    series,
  });
  myChartObjs[0].setOption(option, true);
}, 1000);

onMounted(() => {
  let elem = document.getElementById("echartCountrySubject");
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
</script>
