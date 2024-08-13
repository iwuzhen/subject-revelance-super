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
            el-radio-button(:label="1" size="large") 3
            el-radio-button(:label="2" size="large") 4
            el-radio-button(:label="3" size="large") 5
            el-radio-button(:label="5" size="large") 7
            el-radio-button(:label="6" size="large") 8
            el-radio-button(:label="7" size="large") 9
            el-radio-button(:label="8" size="large") 10
            el-radio-button(:label="9" size="large") 11
            el-radio-button(:label="10" size="large") 12
            el-radio-button(:label="11" size="large") 13
            el-radio-button(:label="13" size="large") 15

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
  name: "wikipedia-subject-algorithm-tree-v2",
  autoIndex: true,
  text: "Wikipedia 二级学科树",
  update: "2024-07-26T01:01:01.429Z",
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
import lv2_node_data from "./sat_lv2_subject_data.json";
import lv2_spanning_tree_links from "./sat_lv2_spanning_tree_links.json";
import lv2_extend_links from "./sat_lv2_extend_links.json";

const lv2_subject_data = {
  nodes: lv2_node_data,
  categories: [
    { name: "Art" },
    { name: "Biology" },
    { name: "Business" },
    { name: "Chemistry" },
    { name: "Computer Science" },
    { name: "Economics" },
    { name: "Engineering" },
    { name: "Environmental Science" },
    { name: "Geography" },
    { name: "Geology" },
    { name: "History" },
    { name: "Materials Science" },
    { name: "Mathematics" },
    { name: "Medicine" },
    { name: "Philosophy" },
    { name: "Physics" },
    { name: "Political Science" },
    { name: "Psychology" },
    { name: "Sociology" },
  ],
};

const appHomeStore = homeStore();
appHomeStore.title = "Wikipedia 二级学科连接树";
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
  { name: "Art" },
  { name: "Biology" },
  { name: "Business" },
  { name: "Chemistry" },
  { name: "Computer Science" },
  { name: "Economics" },
  { name: "Engineering" },
  { name: "Environmental Science" },
  { name: "Geography" },
  { name: "Geology" },
  { name: "History" },
  { name: "Materials Science" },
  { name: "Mathematics" },
  { name: "Medicine" },
  { name: "Philosophy" },
  { name: "Physics" },
  { name: "Political Science" },
  { name: "Psychology" },
  { name: "Sociology" },
];

const lv1_subject_data = {
  nodes: [
    { id: 0, name: "Art", category: 0, value: 748063 },
    { id: 1, name: "Biology", category: 1, value: 12612930 },
    { id: 2, name: "Business", category: 2, value: 1593474 },
    { id: 3, name: "Chemistry", category: 3, value: 11741275 },
    { id: 4, name: "Computer Science", category: 4, value: 4623287 },
    { id: 5, name: "Economics", category: 5, value: 2656089 },
    { id: 6, name: "Engineering Disciplines", category: 6, value: 9111096 },
    { id: 7, name: "Environmental Science", category: 7, value: 2267695 },
    { id: 8, name: "Geography", category: 8, value: 2071887 },
    { id: 9, name: "Geology", category: 9, value: 2203668 },
    { id: 10, name: "History", category: 10, value: 1129814 },
    { id: 11, name: "Materials Science", category: 11, value: 4376608 },
    { id: 12, name: "Mathematics", category: 12, value: 4947878 },
    { id: 13, name: "Medicine", category: 13, value: 14751709 },
    { id: 14, name: "Philosophy", category: 14, value: 948189 },
    { id: 15, name: "Physics", category: 15, value: 6588603 },
    { id: 16, name: "Political Science", category: 16, value: 1451254 },
    { id: 17, name: "Psychology", category: 17, value: 4540769 },
    { id: 18, name: "Sociology", category: 18, value: 2519800 },
  ],
  categories: [
    { name: "Art" },
    { name: "Biology" },
    { name: "Business" },
    { name: "Chemistry" },
    { name: "Computer Science" },
    { name: "Economics" },
    { name: "Engineering" },
    { name: "Environmental Science" },
    { name: "Geography" },
    { name: "Geology" },
    { name: "History" },
    { name: "Materials Science" },
    { name: "Mathematics" },
    { name: "Medicine" },
    { name: "Philosophy" },
    { name: "Physics" },
    { name: "Political Science" },
    { name: "Psychology" },
    { name: "Sociology" },
  ],
};

const lv1_spanning_tree_links = [
  [0, 10, 0.3715],
  [0, 14, 0.3766],
  [2, 5, 0.2435],
  [3, 1, 0.3472],
  [4, 6, 0.4664],
  [8, 10, 0.4141],
  [9, 7, 0.2648],
  [9, 8, 0.3067],
  [11, 15, 0.423],
  [11, 3, 0.578],
  [12, 4, 0.3737],
  [13, 1, 0.2973],
  [13, 17, 0.6131],
  [15, 6, 0.4484],
  [17, 18, 0.3907],
  [18, 16, 0.2601],
  [18, 5, 0.3108],
  [18, 10, 0.4178],
];
// max 12
const lv1_extend_links = [
  [5, 16, 0.3332],
  [7, 8, 0.3388],
  [2, 16, 0.3543],
  [2, 18, 0.3894],
  [10, 14, 0.4154],
  [10, 16, 0.4248],
  [6, 11, 0.451],
  [14, 18, 0.4576],
  [14, 16, 0.4793],
  [6, 12, 0.4847],
  [5, 8, 0.4885],
  [12, 15, 0.4993],
  [3, 13, 0.5052],
  [0, 18, 0.5095],
  [8, 16, 0.5172],
  [8, 18, 0.5194],
  [0, 16, 0.5264],
  [9, 10, 0.5435],
  [16, 17, 0.5488],
  [0, 8, 0.5836],
  [3, 15, 0.5847],
  [5, 10, 0.5888],
  [5, 17, 0.5901],
  [2, 8, 0.594],
  [2, 17, 0.6057],
  [7, 10, 0.6139],
  [14, 17, 0.617],
  [3, 6, 0.6192],
  [2, 4, 0.6545],
  [9, 15, 0.6566],
  [4, 17, 0.6673],
  [1, 7, 0.6696],
  [6, 7, 0.6698],
  [5, 14, 0.6703],
  [5, 7, 0.6717],
  [2, 10, 0.6862],
  [3, 7, 0.6967],
  [6, 9, 0.7012],
  [10, 17, 0.7023],
  [2, 14, 0.7074],
  [4, 5, 0.7082],
  [5, 12, 0.7122],
  [9, 12, 0.7168],
  [0, 17, 0.7206],
  [0, 5, 0.7241],
  [4, 15, 0.7301],
  [8, 14, 0.7326],
  [2, 12, 0.7326],
  [1, 8, 0.7371],
  [0, 9, 0.742],
  [4, 18, 0.7504],
  [9, 11, 0.7546],
  [2, 6, 0.7591],
  [4, 14, 0.762],
  [7, 15, 0.7622],
  [8, 12, 0.7662],
  [0, 2, 0.7704],
  [11, 12, 0.7763],
  [1, 17, 0.7811],
  [7, 12, 0.7842],
  [7, 11, 0.7877],
  [6, 8, 0.7964],
  [4, 8, 0.7976],
  [5, 6, 0.7981],
  [2, 7, 0.8014],
  [3, 9, 0.8019],
  [5, 9, 0.8069],
  [0, 7, 0.8166],
  [12, 14, 0.8166],
  [1, 9, 0.8169],
  [12, 17, 0.8182],
  [4, 16, 0.8189],
  [8, 17, 0.8363],
  [1, 10, 0.8436],
  [0, 4, 0.8521],
  [4, 10, 0.8536],
  [7, 16, 0.8667],
  [1, 6, 0.8679],
  [8, 15, 0.8791],
  [4, 9, 0.8799],
  [13, 18, 0.8851],
  [12, 18, 0.8951],
  [4, 7, 0.8962],
  [10, 12, 0.897],
  [6, 16, 0.9206],
  [12, 16, 0.923],
  [0, 6, 0.9238],
  [4, 11, 0.9344],
  [0, 12, 0.9393],
  [7, 18, 0.9403],
  [13, 14, 0.9404],
  [6, 17, 0.9479],
  [6, 10, 0.9486],
  [6, 18, 0.9511],
  [7, 13, 0.9525],
  [13, 16, 0.9568],
  [0, 1, 0.9577],
  [6, 13, 0.965],
  [10, 13, 0.9652],
  [6, 14, 0.9659],
  [3, 8, 0.9662],
  [9, 14, 0.9709],
  [1, 14, 0.972],
  [1, 15, 0.9747],
  [14, 15, 0.975],
  [2, 13, 0.9773],
  [3, 12, 0.979],
  [5, 13, 0.9839],
];

const appStore = dynamicStore("wikipedia-subject-algorithm-tree-2022-v2", {
  graphModeSelect: 1,
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
  // {
  //   text: "一级学科(19)网络",
  //   value: 0,
  // },
  {
    text: `二级学科(${lv2_subject_data.nodes.length})网络`,
    value: 1,
  },
];

let myChartObj: echarts.ECharts;

const updateChart = _.debounce(async () => {
  let graph: any;
  if (appStore.states.graphModeSelect === 0) {
    graph = Object.assign(lv1_subject_data);
    graph.links = lv1_spanning_tree_links.map((item) => {
      return {
        source: item[0],
        target: item[1],
        value: 1 - item[2],
        lineStyle: { width: 4 },
      };
    });
    let count = appStore.states.linksMultiple * 9;
    for (let index in lv1_extend_links) {
      if (Number(index) > count) break;
      // console.log(index);
      graph.links.push({
        source: lv1_extend_links[index][0],
        target: lv1_extend_links[index][1],
        value: 1 - lv1_extend_links[index][2],
        lineStyle: { width: 1 },
      });
    }
  } else if (appStore.states.graphModeSelect === 1) {
    graph = Object.assign(lv2_subject_data);

    graph.links = lv2_spanning_tree_links.map((item) => {
      return {
        source: item[0],
        target: item[1],
        value: 1 - item[2],
        lineStyle: { width: 3 },
      };
    });
    let count =
      (appStore.states.linksMultiple * lv2_subject_data.nodes.length) / 2 + 1;
    console.log("edge count:", count + graph.links.length);
    for (let index in lv2_extend_links) {
      if (Number(index) >= count) break;
      graph.links.push({
        source: lv2_extend_links[index][0],
        target: lv2_extend_links[index][1],
        value: 1 - lv2_extend_links[index][2],
        lineStyle: { width: 1 },
      });
    }
  }
  let max = Math.max(...graph.nodes.map((item: any) => Math.sqrt(item.value)));
  let min = Math.min(...graph.nodes.map((item: any) => Math.sqrt(item.value)));
  let symbolSize_resize = scaleLinear().domain([min, max]).range([10, 30]);
  graph.nodes = graph.nodes.map((item: any) => {
    item.symbolSize = symbolSize_resize(Math.sqrt(item.value));
    item.label = { show: false };
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
        zoom: appStore.states.graphModeSelect === 0 ? 2 : 0.6,
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
