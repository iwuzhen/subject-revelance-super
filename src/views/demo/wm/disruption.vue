<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="12")
        el-form-item(label="学科选择:" size="large")
          el-select(v-model="appStore.Subject",placeholder="学科选择",multiple,style="width: 100%",size='large',@change='updateChart')
            el-option(v-for="item in allSubjects",:key="item",:label="item",:value="item")    
    el-row
      el-col(:span="24")
        #echart1.echart
</template>

<script lang="ts">
export default {
  name: "WM-disruption",
  autoIndex: true,
  text: "WM disruption 逐年分布",
  update: "2022-09-01T09:43:03.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, wmStatstore } from "@/pinia/modules/pageStore";
import _ from "lodash";
import { reactive, onMounted } from "vue";
import * as echarts from "echarts";
import { extendEchartsOpts } from "@/utils/model";
import axios from "@/utils/requests";

const appHomeStore = homeStore();
appHomeStore.title = "WM 颠覆度学科逐年分布";

const appStore = wmStatstore();

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

let myChartObjs: echarts.ECharts[] = [];

const updateChart = _.debounce(async () => {
  let response = await axios.get("static/data/wm/average-disrution.json");
  // console.log(response.data);
  // 生成一些数据
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
      // max: 5,
      type: "category",
    },
    legend: {
      show: true,
    },
    yAxis: [
      {
        position: "left",
        name: "数量",
      },
      {
        name: "百万美元",
        position: "right",
      },
      {
        name: "Fund/GDP",
        position: "right",
        show: false,
      },
    ],
    dataset: [
      {
        source: response.data,
      },
      {
        transform: {
          type: "filter",
          config: { dimension: "Year", value: 2011 },
        },
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
    series: [
      {
        type: "line",
        name: appStore.Subject[0],
        // yAxisIndex: 1,
        encode: {
          x: "year",
          y: appStore.Subject[0],
        },
      },
    ],
  });
  // console.log("set opion:", option);
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
