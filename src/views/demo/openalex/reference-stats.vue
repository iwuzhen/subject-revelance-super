<template lang="pug">
el-main
  el-row
    el-col(:span="4")
      el-form-item(label="国家A:" size="large")
        CountrySelect(placeholder="选择国家A",v-model="appStore.states.CountryA",@change='updateChart', :multiple="false")
    el-col(:span="18")  
      el-form-item(label="国家B多选:" size="large")
        CountrySelect(placeholder="国家B多选",v-model="appStore.states.CountryB",@change='updateChart', :multiple="true")
  el-row
    el-col(:span="8")  
      el-form-item(label="图表类型:" size="large")
        el-select(v-model="appStore.states.chartType",placeholder="类型选择",style="width: 100%;",size='large',@change='updateChart')
          el-option(v-for="item in chanrtTypeOpt",:key="item.value",:label="item.label",:value="item.value") 
    el-row
      el-col(:span="24")
        #echart1.echart
  el-row 
    NoteBook(storagekey="openalex_reference_stats",:editMode="true")
</template>

<script lang="ts">
export default {
  name: "openalex-stats-2022",
  autoIndex: true,
  text: "openalex reference stats",
  update: "2022-11-02T01:01:01.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import axios from "axios";
import { reactive, ref, onMounted } from "vue";
import _ from "lodash";
import NoteBook from "@/components/NoteBook.vue";
import * as echarts from "echarts";
import CountrySelect from "./components/ConutrySelect.vue";
import { extendEchartsOpts } from "@/utils/model";

const appHomeStore = homeStore();
appHomeStore.title = "openalex reference stats";
const appStore = dynamicStore("openalex-reference-stats", {
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
  chartType: 0,
});

const chanrtTypeOpt = [
  {
    label: "计算countryB的自恋度",
    value: 0,
  },
  {
    label: "计算countryA的linksout中各个countryB的比例",
    value: 1,
  },
];

let myChartObjs: echarts.ECharts[] = [];

// 创建axios实例
const apiSeveice = axios.create({
  timeout: 120 * 1000,
});
apiSeveice.defaults.baseURL = "https://wiki.nikepai.com:10444/";

const updateChart = _.debounce(async () => {
  // 生成一些数据
  let query = {
    countryA: appStore.states.CountryA,
    countryB: appStore.states.CountryB.join(","),
    type: appStore.states.chartType,
  };
  let reponse = await apiSeveice.post(
    "api/openAlex/getOpenAlexRefSelfRate",
    query
  );
  console.log(reponse.data);

  let series: echarts.SeriesOption[] = _.zip(
    reponse.data.data.legend,
    reponse.data.data.y
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
      text: reponse.data.data.title,
    },
    xAxis: {
      // max: 5,
      type: "category",
      data: reponse.data.data.x,
    },
    legend: {
      show: true,
      data: reponse.data.data.legend,
    },
    yAxis: {
      position: "left",
    },
    series,
  });
  myChartObjs[0].setOption(option, true);
}, 1000);

onMounted(() => {
  let elem = document.getElementById("echart1");
  if (elem) {
    myChartObjs.push(echarts.init(elem));
  }
  elem = document.getElementById("echart2");
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

<style lang="less" scoped>
.card-header {
  .el-row {
    margin: 0;
    .el-col {
      margin: 0;
      .el-tag {
        margin: 0;
      }
    }
  }
}
.el-select {
  width: 95%;
}
.el-card {
  width: 20rem;
  text-align: end;
  .el-row {
    margin: 0;
    .author {
      margin-right: 10px;
      .name {
        white-space: nowrap;
        font-style: normal;
      }
      .org {
        white-space: nowrap;
        font-style: italic;
      }
    }
  }
  .card-header {
    text-align: end;
    .zh {
      font-style: italic;
    }
  }
  .tag {
    .el-tag {
      margin-left: 5px;
    }
  }
}
.el-popper.is-customized {
  /* Set padding to ensure the height is 32px */
  padding: 6px 12px;
  background: linear-gradient(90deg, rgb(159, 229, 151), rgb(204, 229, 129));
}

.el-popper.is-customized .el-popper__arrow::before {
  background: linear-gradient(45deg, #b2e68d, #bce689);
  right: 0;
}
</style>
