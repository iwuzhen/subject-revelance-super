<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="4")
        el-form-item(label="图表选择:" size="large")
          el-select(v-model="appStore.states.chartTypeSelect",placeholder="图表选择",style="width: 100%",size='large',@change='updateChart')
            el-option(v-for="item in chartTypeOpt",:key="item.text",:label="item.text",:value="item.value")    
      el-col(:span="18")  
        el-form-item(label="学科选择:" size="large")
          el-select(v-model="appStore.states.SubjectSelect",placeholder="学科选择",multiple,style="width: 100%",size='large',@change='updateChart')
            el-option(v-for="item in allSubjects",:key="item",:label="item",:value="item")    
    el-row
      el-col(:span="24")
        #echart1.echart
</template>

<script lang="ts">
export default {
  name: "WM-disruption",
  autoIndex: true,
  text: "WM disruption 逐年分布, 联通网络的学科文章数",
  update: "2022-09-01T09:43:03.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import _ from "lodash";
import { onMounted } from "vue";
import * as echarts from "echarts";
import { extendEchartsOpts } from "@/utils/model";
import { localService } from "@/utils/requests";

const appHomeStore = homeStore();
appHomeStore.title = "WM 颠覆度学科逐年分布";

const appStore = dynamicStore("wm-disruption", {
  SubjectSelect: [
    "WM",
    "Chemistry",
    "Mathematics",
    "History",
    "Geology",
    "Algebra",
    "Biology",
  ],
  chartTypeSelect: 1,
});

const allSubjects = [
  "WM",
  "Chemistry",
  "Mathematics",
  "History",
  "Geology",
  "Algebra",
  "Biology",
  "Discrete mathematics",
  "Physics",
  "Medicine",
  "Theoretical physics",
  "Engineering disciplines",
  "Materials science",
  "Experimental physics",
  "Philosophy",
  "Geometry",
  "Geography",
  "Psychology",
  "Anthropology",
  "Computer science",
  "Literature",
  "Electrical engineering",
  "Neuroscience",
  "Applied mathematics",
  "Computational biology",
  "Cognitive science",
  "Linguistics",
  "Political science",
  "Economics",
  "Environmental science",
  "Sociology",
  "Number theory",
  "Chemical engineering",
  "Earth science",
  "Artificial intelligence",
  "Civil engineering",
  "Machine learning",
  "Applied physics",
  "Theoretical computer science",
  "Mechanical engineering",
  "Biological engineering",
  "Theoretical chemistry",
  "Computer engineering",
  "Industrial engineering",
  "Operating system",
  "Environmental engineering",
  "Logic",
  "Quantum computing",
  "Genetic engineering",
  "Deep learning",
  "Genome editing",
];
const chartTypeOpt = [
  {
    text: "颠覆度",
    value: 0,
  },
  {
    text: "联通的Paper数",
    value: 1,
  },
];

let myChartObjs: echarts.ECharts[] = [];

const updateChart = _.debounce(async () => {
  let url = "static/data/wm/connect-graph-subject-paper-count.json";
  if (appStore.states.chartTypeSelect === 0) {
    url = "static/data/wm/average-disrution.json";
  }
  let response = await localService.get(url);
  let option = extendEchartsOpts({
    title: {
      left: "center",
      top: "1%",
      textAlign: "center",
      textStyle: {
        fontSize: 20,
      },
      text: "WM 颠覆度学科逐年分布",
    },
    xAxis: {
      name: "year",
      type: "value",
      max: 2020,
      min: 1960,
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
        source: response.data,
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
    series: appStore.states.SubjectSelect.map((item: string) => {
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
  console.log("set option:", option);
  // myChartObjs[0].clear();
  myChartObjs[0].setOption(option);
}, 1000);

onMounted(() => {
  let elem = document.getElementById("echart1");
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
