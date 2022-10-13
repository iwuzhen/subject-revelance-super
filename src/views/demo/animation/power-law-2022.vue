<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="24") 学科选择
        el-select(v-model="appPageStore.subjectSelect",multiple, placeholder="学科选择",clearable,style="width: 100%",size='large',@change='updateChart')
          el-option(v-for="item in option.subject.opt",:key="item",:label="item",:value="item")
    el-row 
      el-col(:span="11") 求斜率范围: {{appPageStore.nodeRange[0]}} ~ {{appPageStore.nodeRange[1]}}
        el-slider(v-model="appPageStore.nodeRange", range,:max="10000",:min="10",@change='updateChart')
      el-col(:span="3") 幂律范围
        el-select(v-model="appPageStore.zipfTypeSelect", placeholder="幂律范围",size='large',@change='updateChart')
          el-option(v-for="item in option.type.opt",:key="item.value",:label="item.text",:value="item.value")
      el-col(:span="3") level
        el-select(v-model="appPageStore.levelSelect", placeholder="level",size='large',@change='updateChart')
          el-option(v-for="item in [2,3]",:key="item",:label="item",:value="item")
    el-row
      el-col(:span="24" v-loading="loading")
        #echart
</template>

<script lang="ts">
export default {
  name: "power-law-2022",
  autoIndex: true,
  text: "wikipedia 幂律动画图",
  update: "2022-07-21T09:43:03.429Z",
};
</script>

<script setup lang="ts">
import { powerlawDemoStore, homeStore } from "@/pinia/modules/pageStore";
import _ from "lodash";
import { reactive, onMounted, ref } from "vue";
import axios from "axios";
import * as echarts from "echarts";

const url = "https://wiki.nikepai.com:10444/api/wiki/getDfb_newDB";
let loading = ref(false);
const option = {
  y_to: 0.1,
  nodeRange: [100, 10000],
  year: {
    select: 2020,
    opt: _.range(2004, 2022),
  },
  level: {
    select: 2,
    opt: [2, 3],
  },
  month: {
    select: 3,
    opt: [3, 6, 9, 12],
  },
  mode: {
    select: "一年的幂率度分布",
    opt: ["一年的幂率度分布", "逐年的斜率分布"],
  },
  subject: {
    select: [
      "Biology",
      "Physics",
      "Chemistry",
      "Political science",
      "Computer science",
      "Psychology",
      "Sociology",
      "Engineering disciplines",
      "Environmental science",
      "Geology",
      "Materials science",
      "Mathematics",
      "Philosophy",
    ],
    opt: [
      "Biology",
      "Physics",
      "Chemistry",
      "Political science",
      "Computer science",
      "Psychology",
      "Economics",
      "Sociology",
      "Engineering disciplines",
      "Environmental science",
      "Geography",
      "Geology",
      "Linguistics",
      "Materials science",
      "Mathematics",
      "Medicine",
      "Philosophy",
      "all",
    ].sort(),
  },
  type: {
    select: "zipf",
    opt: [
      {
        text: "世界幂律",
        value: "zipf",
      },
      {
        text: "小世界幂律",
        value: "innerzipf",
      },
      {
        text: "学术圈幂律",
        value: "xueshu_zipf",
      },
    ],
  },
};

const appPageStore = powerlawDemoStore();
const appHomeStore = homeStore();
appHomeStore.title = "幂律度分布逐年动画";

interface basicInterface {
  [propName: string]: number;
}

interface dataInterface {
  [propName: string]: basicInterface;
}

interface responseInterface {
  data: dataInterface;
  msg: string;
  x1: basicInterface;
}

let myChart: echarts.ECharts;
// interface reFindRetInterface {
//   [propName: string]: dataInterface;
// }

const reFindData = (data: responseInterface) => {
  // 需要清理压缩提取数据,保留2位小数
  let cacheData: dataInterface = {};
  for (let item of Object.entries(data.data)) {
    cacheData[item[0]] = {};
    for (let subItem of Object.entries(item[1])) {
      let key = Number(subItem[0]) < 0 ? 0 : Number(subItem[0]).toFixed(2);
      cacheData[item[0]][key] = Number(subItem[1].toFixed(2));
    }
  }
  console.log(cacheData);
  // return cacheData;

  const seriesList = [];
  for (const [key, dataValue] of Object.entries(cacheData)) {
    let setiesOption: echarts.SeriesOption = {
      name: key,
      type: "scatter",
      symbolSize: 5,
      large: true,
      data: Object.entries(dataValue),
    };
    seriesList.push(setiesOption);
  }
  return seriesList;
};

const updateChart = _.debounce(async () => {
  // console.log(appPageStore.subjectSelect);
  let axiosOption = {
    url,
    method: "post",
    data: {
      cats: appPageStore.subjectSelect.join(","),
      islog: 1,
      level: appPageStore.levelSelect,
      month: 3,
      type: appPageStore.zipfTypeSelect,
      x_from: appPageStore.nodeRange[0],
      x_to: appPageStore.nodeRange[1],
      y_to: 0.1,
      year: 2007,
    },
  };
  let seriesListArray = [];
  let yearStrik: string[] = [];
  loading.value = true;
  for (let i = 0; i < 15; i++) {
    for (let month of [3, 6, 9, 12]) {
      try {
        // console.log(axiosOption);
        axiosOption.data.year = 2007 + i;
        axiosOption.data.month = month;
        let response = await axios.request<responseInterface>(axiosOption);
        console.log(response.data);
        // 需要清理压缩提取数据,保留2位小数
        let seriesList = reFindData(response.data);
        seriesListArray.push(seriesList);
        yearStrik.push(
          `${axiosOption.data.year}.${("0" + axiosOption.data.month).slice(-2)}`
        );
      } catch (error) {
        console.log(axiosOption.data.year, "requests error");
      }
    }
  }

  let echartOptions: echarts.EChartsOption[] = [];
  for (let i in seriesListArray) {
    let optionData: echarts.EChartsOption = {
      series: seriesListArray[i],
      title: {
        show: true,
        text: String(yearStrik[i]),
      },
    };
    echartOptions.push(optionData);
    loading.value = false;
  }

  let option: echarts.EChartsOption = {
    baseOption: {
      title: {
        right: "5%",
        top: "15%",
        textAlign: "right",
        textStyle: {
          fontSize: 80,
        },
        subtext: "幂律分布",
      },
      xAxis: {
        max: 5,
      },
      legend: {
        show: true,
      },
      yAxis: {
        max: 5,
      },
      timeline: {
        axisType: "category",
        autoPlay: appPageStore.autoPlay,
        playInterval: 500,
        data: yearStrik,
      },
      series: seriesListArray[0],
    },
    options: echartOptions,
  };
  console.log(option);
  myChart.setOption<echarts.EChartsOption>(option);
}, 1000);

onMounted(() => {
  const elem = document.getElementById("echart");
  if (elem) {
    myChart = echarts.init(elem);
  }
  updateChart();
});
</script>

<style lang="less">
.el-col {
  margin: 20px 10px;
}
#echart {
  width: 100vw;
  height: 600px;
}
</style>
