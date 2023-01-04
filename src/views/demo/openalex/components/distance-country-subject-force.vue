<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="10")
        el-form-item(label="国家:" size="large")
          CountrySelect(placeholder="选择国家",v-model="appStore.states.Country",@change='updateData', :multiple="true")

      el-col(:span="10")
        el-form-item(label="学科:" size="large")
          el-select(v-model="appStore.states.Subject",placeholder="学科",style="width: 100%",size='large',@change='updateData',multiple)
            el-option(v-for="item of subjectOpt",:key="item.id",:label="item.name",:value="item.id")

      el-col(:span="10")
        el-form-item(label="保留的距离上限:" size="large")
          el-input-number(v-model="appStore.states.topDistance" :precision="2" :step="0.01" :max="1" :min="0" @change='updateChart')
      el-col(:span="10")
        el-form-item(label="分组方式:" size="large")
          el-select(v-model="appStore.states.showFlag",style="width: 100%",size='large',@change='updateChart')
            el-option(v-for="item of showFlagOpt",:key="item.value",:label="item.label",:value="item.value")
    el-row
      el-col(:span="24" v-loading="loading")
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
import { onMounted, ref } from "vue";
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

const appHomeStore = homeStore();
appHomeStore.title = "openalex country google distance";
const appStore = dynamicStore("openalex-country-subject-distance-force", {
  Country: ["US", "CN", "GB", "DE", "JP", "IN"],
  Subject: [
    127413603, 33923547, 121332964, 15744967, 41008148, 185592680, 138885662,
    144024400, 86803240, 162324750,
  ],
  topDistance: 0.45,
  showFlag: 0,
});
let myChartObjs: echarts.ECharts[] = [];
const showFlagOpt = [
  {
    value: 0,
    label: "按国家分组",
  },
  {
    value: 1,
    label: "按学科分组分组",
  },
];

const loading = ref(false);

let responseData: any;
const updateData = _.debounce(async () => {
  loading.value = true;
  let response = await pyApiService.post(
    "/openalex/force_distance_country_subject",
    {
      countries: appStore.states.Country,
      subjects: appStore.states.Subject,
      maxDistance: appStore.states.topDistance,
    }
  );
  responseData = response.data;
  updateChart();
  loading.value = false;
}, 1000);

const updateChart = _.debounce(async () => {
  // filter links
  let linksMatrix = responseData.links.map((item: any[]) => {
    return item.filter((v) => v.value <= appStore.states.topDistance);
  });

  // build category
  const categories: any[] = [];
  let gp = _.groupBy(
    responseData.nodes,
    (item) => item.name.split("-")[appStore.states.showFlag]
  );
  console.log("gp", gp);
  let categoryIndex = 0;
  let nodeNameMapCategoryIndex = new Map();
  for (let [key, items] of Object.entries(gp)) {
    items.forEach((item) => {
      nodeNameMapCategoryIndex.set(item.name, categoryIndex);
    });
    categoryIndex += 1;
    categories.push({ name: key });
  }
  responseData.nodes.forEach((item: any) => {
    item.category = nodeNameMapCategoryIndex.get(item.name);
  });

  let timeline: echarts.TimelineComponentOption = {
    data: responseData.years,
    autoPlay: false,
    axisType: "category",
    loop: false,
  };
  let options = linksMatrix.map((item: any, index: number) => {
    return {
      title: {
        left: "center",
        top: "1%",
        textAlign: "center",
        textStyle: {
          fontSize: 20,
        },
        text: responseData.years[index],
      },
      legend: {
        show: true,
        type: "scroll",
        left: "left",
        orient: "vertical",
      },
      series: {
        type: "graph",
        layout: "force",
        data: responseData.nodes,
        categories,
        links: item,
        roam: true,
        label: {
          position: "right",
        },
        force: {
          repulsion: 50,
          // layoutAnimation: false,
          edgeLength: [10, 50],
          friction: 0.05,
          initLayout: "circular",
        },
      },
    };
  });

  let option: echarts.EChartsOption = {
    timeline,
    options,
  };
  console.log("set option:", option);

  myChartObjs[0].setOption<echarts.EChartsOption>(option, false);
}, 500);

onMounted(() => {
  for (let chartName of ["echartForceCountrySubject"]) {
    let elem = document.getElementById(chartName);
    if (elem) {
      myChartObjs.push(echarts.init(elem));
    }
  }
  updateData();
  window.onresize = _.debounce(() => {
    myChartObjs.forEach((element) => {
      element.resize();
    });
  }, 500);
});
</script>
