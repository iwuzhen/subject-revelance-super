<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="6")
        el-form-item(label="网络组成:" size="large")
          el-select(v-model="appStore.states.graphModeSelect",placeholder="网络组成",style="width: 100%",size='large',@change='updateChart')
            el-option(v-for="item in graphMode",:key="item.text",:label="item.text",:value="item.value")    
      el-col(:span="6")  
        el-form-item(label="熵选择:" size="large")
          el-select(v-model="appStore.states.entropyModeSelect",placeholder="熵选择",style="width: 100%",size='large',@change='updateChart')
            el-option(v-for="item in entropyMode",:key="item",:label="item.text",:value="item.value")    
    el-row
      el-col(:span="24")
        #echart1.echart
    el-row 
      NoteBook(storagekey="e1200-entropy",:editMode="true")
</template>

<script lang="ts">
export default {
  name: "e1200-entropy",
  autoIndex: true,
  text: "E1200 entropy 趋势",
  update: "2022-12-19T01:01:01.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import NoteBook from "@/components/NoteBook.vue";
import { localService } from "@/utils/requests";
import { reactive, ref, onMounted } from "vue";
import _ from "lodash";
import * as echarts from "echarts";
import { extendEchartsOpts } from "@/utils/model";
import { ElMessage } from "element-plus";

const appHomeStore = homeStore();
appHomeStore.title = "MAG FOS trend";
let dataset: any;
const paperLoading = ref(false);

const appStore = dynamicStore("e200-entropy-2022", {
  graphModeSelect: 0,
  entropyModeSelect: 0,
  yz: 1,
});

const graphMode = [
  {
    text: "E1200网络",
    value: 0,
  },
  {
    text: "MAG中的E1200",
    value: 1,
  },
];

const entropyMode = [
  {
    text: "度分布熵",
    value: 0,
  },
  {
    text: "结构熵",
    value: 1,
  },
  {
    text: "标准结构熵",
    value: 2,
  },
  {
    text: "网络节点数",
    value: 3,
  },
];
let myChartObjs: echarts.ECharts[] = [];

const updateChart = _.debounce(async () => {
  let graphTitle = "";
  let url = "static/data/e1200/";
  if (
    appStore.states.graphModeSelect === 0 &&
    appStore.states.entropyModeSelect > 0
  ) {
    url += "dumpMiniStructEntropyObject.json";
    graphTitle = "结构熵";
  } else if (
    appStore.states.graphModeSelect === 0 &&
    appStore.states.entropyModeSelect === 0
  ) {
    url += "dumpMiniDegreeEntropyObject.json";
    graphTitle = "度分布熵";
  } else if (
    appStore.states.graphModeSelect === 1 &&
    appStore.states.entropyModeSelect > 0
  ) {
    url += "dumpHugeStructEntropyObject.json";
    graphTitle = "结构熵";
  } else if (
    appStore.states.graphModeSelect === 1 &&
    appStore.states.entropyModeSelect === 0
  ) {
    url += "dumpHugeDegreeEntropyObject.json";
    graphTitle = "度分布熵";
  }

  let response = await localService.get(url);
  console.log(response.data);
  // format data
  let dataSet: any = [["year"]];
  let keyArray = ["InE", "OutE", "UndirectedE"];
  if (appStore.states.entropyModeSelect === 1) {
    graphTitle = "结构熵";
  } else if (appStore.states.entropyModeSelect === 2) {
    graphTitle = "结构标准熵";
    keyArray = ["InSE", "OutSE", "UndirectedSE"];
  } else if (appStore.states.entropyModeSelect === 3) {
    graphTitle = "网络节点数";
    keyArray = ["InLength", "OutLength", "UndirectedLength"];
  }
  dataSet[0].push(...keyArray);
  let responseData = response.data;
  let startYear = 1950;
  for (let year = startYear; year <= 2022; year++) {
    let index = year - startYear;
    let newRow = [year];
    for (let key of keyArray) {
      newRow.push(responseData[key][index]);
    }
    dataSet.push(newRow);
  }
  console.log(dataSet);

  let option = extendEchartsOpts({
    title: {
      left: "center",
      top: "1%",
      textAlign: "center",
      textStyle: {
        fontSize: 20,
      },
      text: "E-1200 " + graphTitle,
    },
    xAxis: {
      name: "year",
      type: "value",
      max: 2020,
      min: 1950,
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
    series: keyArray.map((item: string) => {
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
