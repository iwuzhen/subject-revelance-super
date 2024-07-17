<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="4")
        el-form-item(label="层级:" size="large")
          el-select(v-model="appStore.states.graphModeSelect",placeholder="层级",style="width: 100%",size='large',@change='updateChart')
            el-option(v-for="item in graphMode",:key="item.text",:label="item.text",:value="item.value")
      el-col(:span="18")
        el-form-item(label="平均度数:" size="large")
          el-radio-group.ml-4(v-model="appStore.states.linksMultiple" @change='updateChart')
            el-radio-button(:label="0" size="large") 2(最小生成树)
            //- el-radio-button(v-for=(index in 12),:key="index",:label="index" ) {{ index }}
            //- el-radio-button(:label="2" size="large") 4

    el-row
      el-col(:span="4")
        el-form-item(label="着色模式:" size="large")
          el-switch(v-model="categoryMode"  size="large"  active-text="Subject" inactive-text="InfoMap" @change='updateChart')
      el-col(:span="4")
        el-form-item(label="展示标签:" size="large")
          el-switch(v-model="labelShow"  size="large"  active-text="T" inactive-text="F" @change='updateChart')
      el-col(:span="4")
        el-form-item(label="固定点:" size="large")
          el-switch(v-model="fixedNode"  size="large"  active-text="T" inactive-text="F" @change='handleFixedNode')
      el-col(:span="2")
          el-button(@click='dumpChart' type="primary") 存储charts
      el-col(:span="2")
          el-button(@click='loadChart' type="success") 导出charts
    
    el-row
      el-col(:span="24")
        el-collapse
          el-collapse-item.colorPicker(title="颜色修改")
            el-form-item(v-for="(obj, index) in subjectOrder" :key="index" :label="`${obj.name}:`" size="large")
              el-color-picker(v-model="appStore.states.colorPicksV2[index]" @change='updateChart' show-alpha :predefine="predefineColors")
            el-button(@click='exportColor' type="primary" style="margin-top:10px") export color
      
    el-row
      el-col(:span="24")
        #echart1.echartForce
    el-row 
      NoteBook(storagekey="subject-algorithm-tree",:editMode="true")
</template>

<script lang="ts">
export default {
  name: "wikipedia-subject-algorithm-tree",
  autoIndex: true,
  text: "Wikipedia 学科树",
  update: "2024-07-16T01:01:01.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, dynamicStore } from "@/pinia/modules/pageStore";
import NoteBook from "@/components/NoteBook.vue";
import { ref, onMounted } from "vue";
import Infomap from "@mapequation/infomap";
import _ from "lodash";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { scaleLinear } from "d3-scale";

const appHomeStore = homeStore();
appHomeStore.title = "Wikipedia 学科连接树";
let dataset: any;
const paperLoading = ref(false);
const labelShow = ref(false);
const categoryMode = ref(true);
const fixedNode = ref(false);

const predefineColors = [
  "#7f7e80",
  "#ebce2b",
  "#702c8c",
  "#db6917",
  "#ba1c30",
  "#96cde6",
  "#4277b6", //工程
  "#1d1d1d",
  "#5fa641",
  "#d485b2",
  "#c0bd7f", // History
  "#df8461",
  "#463397",
  "#e1a11a",
  "#91218c",
  "#e8e948",
  "#7e1510",
  "#92ae31",
  // "#6f340d",
  // "#2b3514",
  "#d32b1e",
];

const subjectOrder = [
  { name: "Biology" },
  { name: "Chemistry" },
  { name: "Computer science" },
  { name: "Economics" },
  { name: "Engineering disciplines" },
  { name: "Environmental science" },
  { name: "Geography" },
  { name: "Geology" },
  { name: "Linguistics" },
  { name: "Materials science" },
  { name: "Mathematics" },
  { name: "Medicine" },
  { name: "Philosophy" },
  { name: "Physics" },
  { name: "Political science" },
  { name: "Psychology" },
  { name: "Sociology" },
];

const lv1_subject_data = {
  nodes: [
    { name: "Biology", id: 0, category: 0, value: 100 },
    { name: "Chemistry", id: 1, category: 1, value: 100 },
    { name: "Computer science", id: 2, category: 2, value: 100 },
    { name: "Economics", id: 3, category: 3, value: 100 },
    { name: "Engineering disciplines", id: 4, category: 4, value: 100 },
    { name: "Environmental science", id: 5, category: 5, value: 100 },
    { name: "Geography", id: 6, category: 6, value: 100 },
    { name: "Geology", id: 7, category: 7, value: 100 },
    { name: "Linguistics", id: 8, category: 8, value: 100 },
    { name: "Materials science", id: 9, category: 9, value: 100 },
    { name: "Mathematics", id: 10, category: 10, value: 100 },
    { name: "Medicine", id: 11, category: 11, value: 100 },
    { name: "Philosophy", id: 12, category: 12, value: 100 },
    { name: "Physics", id: 13, category: 13, value: 100 },
    { name: "Political science", id: 14, category: 14, value: 100 },
    { name: "Psychology", id: 15, category: 15, value: 100 },
    { name: "Sociology", id: 16, category: 16, value: 100 },
  ],
  categories: [
    { name: "Biology" },
    { name: "Chemistry" },
    { name: "Computer science" },
    { name: "Economics" },
    { name: "Engineering disciplines" },
    { name: "Environmental science" },
    { name: "Geography" },
    { name: "Geology" },
    { name: "Linguistics" },
    { name: "Materials science" },
    { name: "Mathematics" },
    { name: "Medicine" },
    { name: "Philosophy" },
    { name: "Physics" },
    { name: "Political science" },
    { name: "Psychology" },
    { name: "Sociology" },
  ],
};
const lv1_spanning_tree_links_v1 = [
  [0, 2, 0.2114],
  [1, 2, 0.1773],
  [1, 3, 0.2185],
  [1, 8, 0.0494],
  [1, 12, 0.1744],
  [1, 14, 0.0901],
  [1, 15, 0.1882],
  [1, 16, 0.1683],
  [4, 8, 0.2145],
  [5, 2, 0.2048],
  [6, 2, 0.2367],
  [7, 8, 0.1918],
  [10, 0, 0.2175],
  [10, 11, 0.2067],
  [13, 14, 0.1359],
  [14, 9, 0.1251],
];

const lv1_spanning_tree_links_v2 = [
  [0, 8, 0.5192],
  [1, 14, 0.5057],
  [3, 4, 0.5509],
  [6, 9, 0.5181],
  [7, 2, 0.5166],
  [7, 11, 0.5248],
  [7, 12, 0.5044],
  [7, 14, 0.447],
  [7, 15, 0.5153],
  [8, 4, 0.5047],
  [8, 9, 0.4908],
  [10, 14, 0.5234],
  [13, 14, 0.5027],
  [14, 5, 0.5311],
  [14, 9, 0.4223],
  [16, 4, 0.5258],
];

const appStore = dynamicStore("wiki-subject-algorithm-tree-2022-v17", {
  graphModeSelect: 0,
  linksMultiple: 0,
  colorPicksV2: [
    "rgba(255, 105, 180, 0.97)",
    "rgba(152, 252, 65, 1)",
    "rgba(156, 148, 255, 1)",
    "#db6917",
    "rgba(128, 49, 231, 1)",
    "rgba(211, 174, 235, 1)",
    "rgba(146, 141, 150, 1)",
    "rgba(124, 181, 234, 1)",
    "rgba(66, 119, 182, 1)",
    "rgba(232, 233, 72, 1)",
    "rgba(166, 163, 110, 1)",
    "rgba(130, 238, 255, 1)",
    "rgba(186, 28, 48, 1)",
    "rgba(32, 191, 0, 1)",
    "rgba(255, 25, 251, 1)",
    "rgba(255, 174, 2, 1)",
    "rgba(84, 126, 129, 0.93)",
    "rgba(223, 120, 244, 1)",
    "rgba(255, 180, 161, 1)",
  ],
  chartData: {},
});
const graphMode = [
  {
    text: "学术圈 lv2",
    value: 0,
  },
  {
    text: "顶级类 lv2",
    value: 1,
  },
  // {
  //   text: "二级学科(293)网络",
  //   value: 1,
  // },
];

let myChartObj: echarts.ECharts;

const updateChart = _.debounce(async () => {
  let graph: any;
  if (appStore.states.graphModeSelect === 0) {
    graph = Object.assign(lv1_subject_data);
    graph.links = lv1_spanning_tree_links_v1.map((item) => {
      return {
        source: item[0],
        target: item[1],
        value: 1 - item[2],
        lineStyle: { width: 4 },
      };
    });
  }
  if (appStore.states.graphModeSelect === 1) {
    graph = Object.assign(lv1_subject_data);
    graph.links = lv1_spanning_tree_links_v2.map((item) => {
      return {
        source: item[0],
        target: item[1],
        value: 1 - item[2],
        lineStyle: { width: 4 },
      };
    });
  }
  let max = Math.max(...graph.nodes.map((item: any) => Math.sqrt(item.value)));
  let min = Math.min(...graph.nodes.map((item: any) => Math.sqrt(item.value)));
  let symbolSize_resize = scaleLinear().domain([min, max]).range([10, 10]);
  graph.nodes = graph.nodes.map((item: any) => {
    item.symbolSize = symbolSize_resize(Math.sqrt(item.value));
    if (labelShow.value) {
      item.label = { show: true };
    } else item.label = { show: false };
    return item;
  });

  if (categoryMode.value == false) {
    console.log(graph.nodes);
    // use infoMap to stain category
    let networkList = [`#source target [weight]\n`];
    for (let row of graph.links) {
      networkList.push(`${row.source} ${row.target} ${row.value}`);
    }
    let infomap = new Infomap()
      .on("data", (data) => console.log(data))
      .on("error", (err) => console.warn(err))
      .on("finished", (data) => {
        if (!data.clu) return;
        let graphCopy = _.cloneDeep(graph);
        console.log(data);
        let categoriesSet = new Set();
        let nodeCategoriesMap = new Map();
        let categories = [];
        for (let row of data.clu.split("\n")) {
          if (row.startsWith("#")) continue;
          let column = row.split(" ");
          if (column.length !== 3) continue;
          if (!categoriesSet.has(column[1])) {
            categories.push({
              name: column[1],
            });
            categoriesSet.add(column[1]);
            // 模式 infoMap 按顺序返回的 clu ID
          }
          nodeCategoriesMap[Number(column[0])] = Number(column[1]) - 1;
        }
        for (let node of graphCopy.nodes) {
          node.category = nodeCategoriesMap[node.id];
        }
        graphCopy.categories = categories;
        console.log(graphCopy);
        setOptions(graphCopy);
      });
    let network = networkList.join("\n");
    console.log(network);
    infomap.run({ network, args: "--clu" });
  } else {
    setOptions(graph);
  }
  // set graph size
}, 1000);

const setOptions = (graph: {
  categories: { name: any }[];
  nodes: any;
  links: any;
}) => {
  // graph.nodes[0].x = 0;
  // graph.nodes[0].y = 0;
  // graph.nodes[0].fixed = true;
  let option = {
    title: {
      left: "center",
      show: false,
      top: "1%",
      textAlign: "center",
      textStyle: {
        fontSize: 20,
      },
      // text: graphTitle,
    },
    tooltip: {},
    legend: {
      show: true,
      left: "auto",
      orient: "vertical",
      data: graph.categories.map(function (a: { name: any }) {
        return a.name;
      }),
    },
    color: appStore.states.colorPicksV2,
    //     color: [
    //   "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff",
    //   "#800000", "#008000", "#000080", "#808000", "#800080", "#008080",
    //   "#c0c0c0", "#808080", "#999999", "#666666", "#333333", "#000000",
    //   "#f08080"
    // ],
    toolbox: {
      right: 0,
      top: 0,
      orient: "vertical",
      feature: {
        saveAsImage: {},
        dataZoom: {
          yAxisIndex: "none",
        },
        dataView: { readOnly: false },
        // magicType: { type: ['line', 'bar'] },
        restore: {},
      },
    },
    series: [
      {
        // name: "subject",
        tooltip: {
          formatter: (args: any) => {
            // console.log(args);
            if (args.data.category > -1)
              // return `<b>${
              //   graph.categories[args.data.category].name
              // }</b><br />${args.data.name}: ${args.data.value}`;
              return `<b>${graph.categories[args.data.category].name}</b>`;
            else
              return `${graph.nodes[args.data.source - 1].name} <-> ${
                graph.nodes[args.data.target - 1].name
              }`;
          },
        },
        type: "graph",
        layout: "force",
        draggable: "true",
        data: graph.nodes,
        links: graph.links,
        categories: graph.categories,
        roam: true,
        zoom: 2,
        label: {
          show: labelShow.value,
          position: "top",
          formatter: "{b}",
          color: "#000",
          // fontWeight: "lighter",
          fontSize: 14,
        },
        labelLayout: function () {
          return {
            // x: myChart.getWidth() - 100,
            x: 1200 - 100,
            moveOverlap: "shiftY",
          };
        },
        labelLine: {
          showAbove: true,
          minTurnAngle: 30,
          smooth: true,
          show: true,
          length2: 5,
          lineStyle: {
            color: "#bbb",
          },
        },
        itemStyle: {
          borderColor: "rgba(255, 255, 255, 1)",
          // borderColor: "rgba(0, 0, 0, 0.5)",
          borderWidth: 2,
        },
        lineStyle: {
          curveness: 0.02,
        },
        center: ["50%", "50%"],
        force: {
          initLayout: "circular",
          edgeLength: [5, 10],
          repulsion: 10,
          gravity: 0.01,
          layoutAnimation: true,
        },
      },
    ],
  };
  console.log("set option:", option);
  myChartObj.setOption(option, false);
};

const handleFixedNode = () => {
  const option = myChartObj.getOption();
  for (const i in (option.series as any)[0].data) {
    (option.series as any)[0].data[i].fixed = fixedNode.value;
  }
  console.log((option.series as any)[0].data);
  myChartObj.setOption(option);
};

const exportColor = () => {
  alert(JSON.stringify(appStore.states.colorPicksV2));
};

onMounted(() => {
  let elem = document.getElementById("echart1");
  if (elem) {
    myChartObj = echarts.init(elem, undefined, {
      devicePixelRatio: 10,
      renderer: "svg",
    });

    myChartObj.on("mouseup", function (params: any) {
      let option = myChartObj.getOption();
      (option.series as any)[0].data[params.dataIndex].x = params.event.offsetX;
      (option.series as any)[0].data[params.dataIndex].y = params.event.offsetY;
      (option.series as any)[0].data[params.dataIndex].fixed = true;

      (option.series as any)[0].data[params.dataIndex].label.show = true;

      myChartObj.setOption(option);
    });
    myChartObj.on("dblclick", function (params: any) {
      let option = myChartObj.getOption();
      (option.series as any)[0].data[params.dataIndex].fixed = false;
      (option.series as any)[0].data[params.dataIndex].label.show = false;
      myChartObj.setOption(option);
    });

    window.onresize = _.debounce(() => {
      myChartObj.resize();
    }, 500);
    updateChart();
  }
});

const dumpChart = () => {
  let opt: any = myChartObj.getOption();
  appStore.states.chartData.links = opt.series[0].links;
  appStore.states.chartData.data = opt.series[0].data;
  appStore.states.chartData.categories = opt.series[0].categories;
  appStore.states.chartData.center = opt.series[0].center;
  appStore.states.chartData.zoom = opt.series[0].zoom;
  console.log("dumpChart", opt);
  console.log("dumpChart", appStore.states.chartData);
};

const loadChart = () => {
  let opt: any = myChartObj.getOption();
  console.log(appStore.states.chartData);
  // opt.series[0].links = appStore.states.chartData.links;
  // opt.series[0].data = appStore.states.chartData.data;
  // opt.series[0].categories = appStore.states.chartData.categories;
  opt.series[0].center = appStore.states.chartData.center;
  // opt.series[0].zoom = appStore.states.chartData.categories;
  for (let i in appStore.states.chartData.data) {
    opt.series[0].data[i].x = appStore.states.chartData.data[i].x;
    opt.series[0].data[i].y = appStore.states.chartData.data[i].y;
    opt.series[0].data[i].fixed = appStore.states.chartData.data[i].fixed;
    opt.series[0].data[i].label.show =
      appStore.states.chartData.data[i].label.show;
  }
  myChartObj.setOption(opt, false);
};
</script>

<style lang="less" scoped>
.echartForce {
  height: 80vh;
}

.el-row {
  margin: 0;
  padding: 0;
}

.el-form-item {
  margin: 0;
  padding: 0;
}

.el-select {
  width: 95%;
}

.colorPicker .el-form-item {
  display: inline-flex !important;
  margin-right: 30px;
}
</style>
