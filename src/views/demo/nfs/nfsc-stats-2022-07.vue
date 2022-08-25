<template lang="pug">
el-container
  el-main
    el-row
      el-col(:span="8")
        el-form.radius(label-position="left" label-width="auto")
          el-form-item(label="GDP:" size="large")
            el-checkbox(v-model="appStore.ShowGDP", size="large",  @change='updateChart')

          el-form-item(label="选项:" size="large")
            el-checkbox(v-model="appStore.GDPvCPI",size="large",label="CPI加权",:disabled="!appStore.ShowGDP",  @change='updateChart')

          el-form-item(label="GDP 缩小倍数:" size="large")
            el-input-number(v-model="appStore.GDPZoom",:min=100,:max=10000 ,:step=100, size="default",:disabled="!appStore.ShowGDP", @change='updateChart')

      el-col(:span="6")
        el-form.radius(label-position="left" label-width="auto")
          el-form-item(label="资金数:" size="large")
            el-checkbox(v-model="appStore.ShowFund", size="large",  @change='updateChart')
          el-form-item(label="选项:" size="large")
            el-checkbox(v-model="appStore.FundMvCPI",size="large",label="CPI加权",:disabled="!appStore.ShowFund",  @change='updateChart')

      el-col(:span="4")
        el-form.radius(label-position="left")
          el-form-item(label="项目数:" size="large")
            el-checkbox(v-model="appStore.ShowNOI", size="large",  @change='updateChart')

      el-col(:span="4")
        el-form.radius(label-position="left")
          el-form-item(label="资金GDP比例:" size="large")
            el-checkbox(v-model="appStore.ShowRatio", size="large",  @change='updateChart')      
    el-row
      el-col(:span="24")
        #echart1.echart
    el-row
      el-col(:span="8")
        el-form-item(label="数据类型:" size="large")
          el-select(v-model="chart1Type.select", placeholder="图表选择",style="width: 100%",size='large',@change='updateNextChart')
            el-option(v-for="item in chart1Type.opt",:key="item.value",:label="item.text",:value="item.value")
    el-row
      el-col(:span="24")
        #echart2.echart
</template>

<script lang="ts">
export default {
  name: "NFSC-stats-2022-07",
  autoIndex: true,
  text: "NFSC 数据统计",
  update: "2022-08-11T09:43:03.429Z",
};
</script>

<script setup lang="ts">
import { homeStore, nsfcStatstore } from "@/pinia/modules/pageStore";
import _, { round } from "lodash";
import { reactive, onMounted } from "vue";
import * as echarts from "echarts";
import { extendEchartsOpts } from "@/utils/model";

const appHomeStore = homeStore();
appHomeStore.title = "NFSC 数据统计";

const appStore = nsfcStatstore();

const addNewColume = (source: any, newName: string, callback: any) => {
  // first row is schema
  let indexMap = {};
  for (let i in source[0]) {
    indexMap[source[0][i]] = [i];
  }
  for (let i = 1; i < source.length; i++) {
    let obj = {};
    for (let key in indexMap) {
      obj[key] = source[i][indexMap[key]];
    }
    source[i].push(callback(obj));
  }
  source[0].push(newName);
};

let dataSet = [
  ["year", "FundM", "NumborOfProject", "CPI", "GDPM", "C_U_Exchange"],
  [1987, 0.208, 12, 27.93261, 272972.97, 3.73],
  [1988, 8.017, 359, 33.18724, 312353.63, 3.73],
  [1989, 64.058, 2367, 39.24247, 347768.05, 3.77],
  [1990, 96.32, 3095, 40.44026, 360857.91, 4.79],
  [1991, 93.468, 2791, 41.8786, 383373.32, 5.34],
  [1992, 106.186, 3211, 44.53955, 426915.71, 5.52],
  [1993, 119.958, 3470, 51.04682, 444731.28, 5.78],
  [1994, 144.318, 3414, 63.42924, 564324.67, 8.64],
  [1995, 233.501, 3664, 74.07979, 734547.9, 8.37],
  [1996, 302.944, 3874, 80.23816, 863746.72, 8.34],
  [1997, 318.348, 3669, 82.47397, 961603.95, 8.32],
  [1998, 312.363, 3404, 81.83629, 1029043.1, 8.3],
  [1999, 385.971, 3676, 80.68938, 1093997.3, 8.28],
  [2000, 527.672, 3797, 80.97002, 1211346.9, 8.28],
  [2001, 637.355, 4064, 81.5523, 1339395.7, 8.28],
  [2002, 717.928, 4395, 80.95536, 1470550, 8.28],
  [2003, 829.986, 4888, 81.86821, 1660288, 8.28],
  [2004, 1005.946, 5373, 84.99938, 1955347, 8.28],
  [2005, 1516.936, 6643, 86.50932, 2285965.9, 8.2],
  [2006, 1773.955, 7195, 87.93623, 2752131.8, 7.97],
  [2007, 2229.96, 8694, 92.17191, 3550342.7, 7.61],
  [2008, 2757.163, 9968, 97.63333, 4594307, 6.95],
  [2009, 3390.7, 11214, 96.9224, 5101703.1, 6.83],
  [2010, 3778.662, 12930, 100, 6087163.9, 6.77],
  [2011, 5139.184, 16369, 105.5539, 7551500.1, 6.46],
  [2012, 6147.532, 19248, 108.3189, 8532230, 6.31],
  [2013, 8022.847, 24875, 111.158, 9570406.2, 6.15],
  [2014, 5053.99, 15869, 113.2941, 10475683, 6.16],
  [2015, 14440.83, 32117, 114.9221, 11061553, 6.28],
  [2016, 19827.797, 35988, 117.2206, 11233277, 6.65],
  [2017, 19954.943, 36585, 119.0881, 12310409, 6.76],
  [2018, 19184.792, 35607, 121.5589, 13894818, 6.63],
  [2019, 17676.242, 37130, 125.0832, 14279938, 6.91],
  [2020, 18113.808, 38570, 128.1094, 14687674, 6.9],
  [2021, 17258.749, 35627, 129.3662, 17734063, 6.45],
];

// NSFC 学科 资金分布
let dataSet1 = [
  [
    "year",
    "医学科学",
    "生命科学",
    "工程",
    "信息科学",
    "地球科学",
    "化学",
    "物理",
    "材料",
    "管理科学",
    "数学",
  ],
  [
    1987, 0, 9383.378016, 0, 19302.94906, 10723.86059, 14745.30831, 0,
    1608.579088, 0, 0,
  ],
  [
    1988, 47721.17962, 213941.0188, 225201.0724, 471045.5764, 128820.3753,
    481769.437, 357908.8472, 85120.64343, 75335.12064, 62466.48794,
  ],
  [
    1989, 442148.5411, 2451352.785, 2387002.653, 2977612.732, 1840716.18,
    2992838.196, 2055172.414, 1290318.302, 283554.3767, 270822.2812,
  ],
  [
    1990, 1692693.111, 3764843.424, 2158872.651, 3192400.835, 2662839.248,
    2800626.305, 1979123.173, 1310855.95, 299373.6952, 246972.8601,
  ],
  [
    1991, 1897565.543, 3401217.228, 1936142.322, 2237265.918, 2533146.067,
    1945131.086, 1773127.341, 1236329.588, 322846.4419, 220599.2509,
  ],
  [
    1992, 2371213.768, 4280615.942, 2107246.377, 2202862.319, 2873007.246,
    1935507.246, 1643297.101, 1155072.464, 380978.2609, 286775.3623,
  ],
  [
    1993, 2166903.114, 4220242.215, 2407266.436, 2569671.28, 3392958.478,
    2157958.478, 1782698.962, 1331314.879, 433737.0242, 291176.4706,
  ],
  [
    1994, 1814687.5, 3090740.741, 1663078.704, 2207997.685, 2887581.019,
    1723148.148, 1687962.963, 1157060.185, 264120.3704, 207060.1852,
  ],
  [
    1995, 2664157.706, 4620597.372, 3129749.104, 3722461.171, 4267264.038,
    4064874.552, 2633691.756, 1847909.2, 557228.1959, 389486.2605,
  ],
  [
    1996, 3765647.482, 6724724.221, 3970383.693, 4246834.532, 5218345.324,
    4473980.815, 3600599.52, 3015587.53, 652278.1775, 655887.2902,
  ],
  [
    1997, 4477043.269, 6744951.923, 5103605.769, 4849507.212, 5045072.115,
    3650120.192, 4150120.192, 2744591.346, 839302.8846, 658653.8462,
  ],
  [
    1998, 5244337.349, 7907590.361, 4381204.819, 3530963.855, 4934096.386,
    4021325.301, 3223493.976, 2378915.663, 995421.6867, 1016746.988,
  ],
  [
    1999, 6210507.246, 9180917.874, 4545531.401, 6093840.58, 6544987.923,
    4816062.802, 3927536.232, 2956521.739, 1506280.193, 832729.4686,
  ],
  [
    2000, 7993961.353, 11889251.21, 7371497.585, 6882560.386, 10065217.39,
    7096739.13, 5570048.309, 3844806.763, 1601690.821, 1412681.159,
  ],
  [
    2001, 9277777.778, 14920893.72, 7369806.763, 8199770.531, 10725845.41,
    8203333.333, 9011714.976, 4939613.527, 2011111.111, 2315338.164,
  ],
  [
    2002, 9830917.874, 15689855.07, 10035990.34, 9230374.396, 11714528.99,
    10005072.46, 9659420.29, 5506038.647, 2782246.377, 2251811.594,
  ],
  [
    2003, 14751811.59, 19056763.29, 10057971.01, 10740978.26, 12836352.66,
    10953502.42, 9832125.604, 5894927.536, 3159480.676, 2955917.874,
  ],
  [
    2004, 17572101.45, 21882850.24, 13992753.62, 12948671.5, 15713768.12,
    12402536.23, 13056159.42, 7888888.889, 3745289.855, 2288043.478,
  ],
  [
    2005, 27015853.66, 32251585.37, 21451219.51, 20933658.54, 24917073.17,
    19764024.39, 19190853.66, 10944146.34, 4569512.195, 3954268.293,
  ],
  [
    2006, 29495608.53, 35705144.29, 26555959.85, 24010037.64, 35190715.18,
    24151819.32, 25003450.44, 11927352.57, 5969259.724, 4569636.136,
  ],
  [
    2007, 45128777.92, 50560446.78, 30633377.14, 31735873.85, 39864651.77,
    34490144.55, 31156373.19, 16609724.05, 7599868.594, 5250985.545,
  ],
  [
    2008, 65282014.39, 68668345.32, 41900719.42, 46005755.4, 47838848.92,
    44155395.68, 41946762.59, 19387050.36, 12438561.15, 9090647.482,
  ],
  [
    2009, 81357247.44, 85121522.69, 59622254.76, 54316251.83, 63960468.52,
    52737920.94, 47898975.11, 25144948.76, 15101024.89, 11181551.98,
  ],
  [
    2010, 89856720.83, 93645494.83, 63877400.3, 59853766.62, 69896602.66,
    65378138.85, 57932791.73, 27794682.42, 17079320.53, 12833087.15,
  ],
  [
    2011, 131165634.7, 135986068.1, 90032507.74, 91325077.4, 108750774,
    84616099.07, 73993808.05, 39848297.21, 23492879.26, 16328173.37,
  ],
  [
    2012, 163492868.5, 163948494.5, 115011093.5, 108665610.1, 123908082.4,
    103228209.2, 95987321.71, 48220285.26, 31505863.71, 20284469.1,
  ],
  [
    2013, 259956097.6, 205565040.7, 156047154.5, 142029268.3, 145643902.4,
    136944715.4, 124904065, 64827642.28, 41333658.54, 27276422.76,
  ],
  [
    2014, 145254870.1, 111017857.1, 94162337.66, 96470779.22, 106308441.6,
    86931818.18, 88719155.84, 38397727.27, 30038961.04, 23150974.03,
  ],
  [
    2015, 484388535, 373788216.6, 284464968.2, 251207006.4, 234601910.8,
    237842356.7, 196999203.8, 106001592.4, 73908439.49, 56292993.63,
  ],
  [
    2016, 625440601.5, 489803007.5, 368632330.8, 334639097.7, 314607518.8,
    288630075.2, 249141353.4, 143710526.3, 97880751.88, 69138345.86,
  ],
  [
    2017, 620528550.3, 468435650.9, 374137396.4, 330355029.6, 310877071,
    299447485.2, 243911982.2, 137908284, 99205177.51, 67107988.17,
  ],
  [
    2018, 619320663.7, 456104072.4, 351813725.5, 323074660.6, 309278883.9,
    300162443.4, 235862745.1, 133748868.8, 96466817.5, 67800904.98,
  ],
  [
    2019, 538754413.9, 408199710.6, 325341534, 278865412.4, 279624457.3,
    258662807.5, 211484081, 114690303.9, 82749204.05, 59694934.88,
  ],
  [
    2020, 550370449.3, 409330434.8, 338669565.2, 301114492.8, 273047826.1,
    258104202.9, 220637681.2, 120918840.6, 91893188.41, 61102898.55,
  ],
  [
    2021, 552119364.3, 419706976.7, 345936434.1, 300686604.7, 280386666.7,
    260628527.1, 240663565.9, 119319379.8, 89670077.52, 66657364.34,
  ],
];

let dataSet2 = [
  [
    "year",
    "医学科学",
    "生命科学",
    "工程",
    "信息科学",
    "地球科学",
    "化学",
    "物理",
    "管理科学",
    "材料",
    "数学",
  ],
  [1987, 0, 2, 0, 3, 3, 3, 0, 0, 1, 0],
  [1988, 6, 37, 32, 65, 22, 73, 83, 15, 10, 16],
  [1989, 73, 367, 272, 349, 171, 428, 353, 53, 151, 150],
  [1990, 303, 617, 298, 456, 308, 444, 342, 72, 169, 86],
  [1991, 351, 575, 287, 341, 291, 321, 283, 81, 160, 101],
  [1992, 447, 758, 310, 335, 328, 345, 282, 92, 164, 150],
  [1993, 410, 772, 355, 409, 394, 389, 308, 105, 181, 147],
  [1994, 451, 731, 312, 384, 381, 392, 349, 73, 189, 152],
  [1995, 482, 696, 365, 426, 423, 460, 328, 117, 226, 141],
  [1996, 522, 766, 391, 411, 423, 443, 378, 122, 253, 165],
  [1997, 502, 685, 401, 413, 423, 381, 375, 123, 213, 153],
  [1998, 490, 722, 359, 289, 373, 368, 325, 128, 193, 157],
  [1999, 532, 759, 344, 407, 408, 387, 323, 174, 203, 139],
  [2000, 554, 749, 369, 407, 420, 400, 347, 189, 213, 149],
  [2001, 575, 795, 398, 425, 453, 433, 403, 200, 227, 155],
  [2002, 593, 801, 453, 476, 532, 486, 409, 257, 229, 159],
  [2003, 756, 995, 468, 497, 511, 536, 413, 248, 240, 224],
  [2004, 867, 1033, 548, 582, 549, 531, 557, 262, 276, 168],
  [2005, 1115, 1295, 741, 688, 666, 674, 617, 279, 347, 221],
  [2006, 1200, 1362, 767, 783, 741, 766, 662, 318, 353, 243],
  [2007, 1628, 1645, 843, 903, 831, 952, 768, 426, 420, 278],
  [2008, 1783, 1747, 1024, 1190, 940, 1084, 886, 503, 448, 363],
  [2009, 2110, 2026, 1182, 1167, 1126, 1175, 969, 539, 508, 412],
  [2010, 2394, 2261, 1364, 1324, 1326, 1443, 1123, 581, 589, 525],
  [2011, 3152, 2806, 1760, 1935, 1600, 1734, 1330, 673, 759, 620],
  [2012, 3813, 3336, 2106, 2036, 1843, 1943, 1646, 812, 884, 829],
  [2013, 5586, 4036, 2849, 2618, 2201, 2447, 2000, 1006, 1159, 973],
  [2014, 3435, 2303, 1845, 1796, 1512, 1478, 1342, 695, 731, 732],
  [2015, 7027, 5086, 3955, 3544, 2965, 3068, 2354, 1405, 1509, 1204],
  [2016, 8149, 5711, 4339, 4025, 3485, 3266, 2526, 1549, 1645, 1293],
  [2017, 8292, 5655, 4493, 4068, 3506, 3421, 2533, 1581, 1685, 1351],
  [2018, 8440, 5382, 4308, 4048, 3312, 3305, 2528, 1522, 1637, 1125],
  [2019, 8847, 5780, 4564, 4103, 3491, 3427, 2572, 1570, 1681, 1095],
  [2020, 9235, 5985, 4749, 4213, 3570, 3448, 2676, 1717, 1773, 1204],
  [2021, 8603, 5541, 4286, 3692, 3278, 3217, 2635, 1601, 1583, 1191],
];

let dataSet3 = [
  ["name", "fund", "count"],
  ["上海交通大学", 653.295, 10299],
  ["北京大学", 615.828, 9746],
  ["浙江大学", 610.664, 10034],
  ["清华大学", 551.24, 7978],
  ["复旦大学", 438.515, 7674],
  ["华中科技大学", 434.248, 7617],
  ["中山大学", 419.895, 6964],
  ["南京大学", 328.707, 5054],
  ["中国科学技术大学", 318.7, 4449],
  ["武汉大学", 316.308, 5401],
  ["西安交通大学", 296.038, 5126],
  ["同济大学", 295.676, 4484],
  ["四川大学", 294.11, 5565],
  ["山东大学", 284.606, 4735],
  ["中南大学", 263.386, 4565],
  ["哈尔滨工业大学", 261.014, 4254],
  ["吉林大学", 253.819, 4651],
  ["天津大学", 232.765, 3823],
  ["大连理工大学", 220.258, 3506],
  ["厦门大学", 217.294, 3328],
  ["北京航空航天大学", 192.585, 3056],
  ["东南大学", 188.172, 3289],
  ["中国人民解放军第四军医大学", 178.663, 3398],
  ["华南理工大学", 171.292, 2721],
  ["中国农业大学", 171.246, 2850],
  ["苏州大学", 170.28, 2723],
  ["南开大学", 165.009, 2965],
  ["中国人民解放军第三军医大学", 162.73, 3036],
  ["中国人民解放军第二军医大学", 161.206, 3069],
  ["北京师范大学", 154.375, 2412],
  ["南京医科大学", 140.619, 2406],
  ["首都医科大学", 138.351, 2401],
  ["北京理工大学", 134.679, 2088],
  ["重庆大学", 133.678, 2331],
  ["兰州大学", 130.306, 2196],
  ["西北工业大学", 128.259, 2220],
  ["华中农业大学", 126.673, 2039],
  ["东北大学", 122.986, 1993],
  ["电子科技大学", 119.515, 1910],
  ["北京科技大学", 118.441, 1896],
];

const chart1Type = reactive({
  select: 1,
  opt: [
    {
      text: "NSFC 学科 资金逐年分布",
      value: 0,
      yName: "百万人民币",
      dataSet: dataSet1,
    },
    {
      text: "NSFC 学科项目数逐年分布",
      value: 1,
      yName: "个",
      dataSet: dataSet2,
    },
    {
      text: "NSFC 学校项目资金数",
      value: 2,
      yName: "个",
      dataSet: dataSet3,
    },
  ],
});

let myChartObjs: echarts.ECharts[] = [];

const updateChart = _.debounce(async () => {
  // 生成一些数据
  // ["year", "Fund", "NumborOfProject", "CPI", "GDP", "C_U_Exchange"],
  const dataSetObj = _.cloneDeep(dataSet);
  addNewColume(dataSetObj, "UfundM", (obj: any) => {
    return round((obj.FundM / obj.CPI) * 100, 1);
  });

  addNewColume(dataSetObj, "GDPZoom", (obj: any) => {
    if (appStore.GDPvCPI) {
      return _.round((obj.GDPM / appStore.GDPZoom / obj.CPI) * 100, 1);
    }
    return _.round(obj.GDPM / appStore.GDPZoom, 1);
  });

  addNewColume(dataSetObj, "FundVSGDP", (obj: any) => {
    return obj.FundM / obj.GDPM;
  });

  let series: echarts.SeriesOption[] = [];
  if (appStore.ShowNOI) {
    series.push({
      type: "line",
      name: "项目数",
      yAxisIndex: 0,
      encode: {
        x: "year",
        y: "NumborOfProject",
      },
    });
  }
  if (appStore.ShowRatio) {
    series.push({
      type: "line",
      name: "资金在 GDP 中占比",
      yAxisIndex: 2,
      encode: {
        x: "year",
        y: "FundVSGDP",
      },
    });
  }
  if (appStore.ShowFund) {
    series.push({
      type: "line",
      name: appStore.FundMvCPI ? "资金数 CPI 加权" : "资金数",
      yAxisIndex: 1,
      encode: {
        x: "year",
        y: appStore.FundMvCPI ? "UfundM" : "FundM",
      },
    });
  }
  if (appStore.ShowGDP) {
    series.push({
      type: "line",
      name: appStore.GDPvCPI
        ? `GDP 加权CPI  缩小${appStore.GDPZoom}倍`
        : `GDP 缩小${appStore.GDPZoom}倍`,
      yAxisIndex: 1,
      encode: {
        x: "year",
        y: "GDPZoom",
      },
    });
  }
  let option = extendEchartsOpts({
    title: {
      left: "center",
      top: "1%",
      textAlign: "center",
      textStyle: {
        fontSize: 20,
      },
      text: "NSFC 结题项目数和资金数",
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
        name: "百万人民币",
        position: "right",
      },
      {
        name: "Fund/GDP",
        position: "right",
        show: false,
      },
    ],
    dataset: {
      source: dataSetObj,
    },
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
          showHtm += `${_marker}${_text}:${_data}<br>`;
        }
        return showHtm;
      },
    },
    series,
  });
  myChartObjs[0].clear();
  myChartObjs[0].setOption(option);
}, 1000);

const updateNextChart = _.debounce(async () => {
  // directoract 资金分布
  let dataID = chart1Type.select;
  let option;
  if (dataID === 2) {
    // 柱状图
    option = option = extendEchartsOpts({
      title: {
        left: "center",
        top: "1%",
        textAlign: "center",
        textStyle: {
          fontSize: 20,
        },
        text: "NSFC 学校 项目数和资金数",
      },
      xAxis: {
        // max: 5,
        type: "category",
        axisLabel: {
          rotate: 90,
        },
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
          name: "百万人民币",
          position: "right",
        },
      ],
      dataset: {
        source: chart1Type.opt[dataID].dataSet,
      },
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
            const _data = params[i].data[dataID];
            const _marker = params[i].marker;
            showHtm += `${_marker}${_text}：${_data}<br>`;
          }
          return showHtm;
        },
      },
      series: [
        {
          type: "bar",
          name: "项目数",
          yAxisIndex: 0,
          encode: {
            x: "year",
            y: "count",
          },
        },
        {
          type: "bar",
          name: "资金数",
          yAxisIndex: 1,
          encode: {
            x: "year",
            y: "fund",
          },
        },
      ],
    });
  } else {
    option = extendEchartsOpts({
      title: {
        left: "center",
        top: "1%",
        textAlign: "center",
        textStyle: {
          fontSize: 20,
        },
        text: chart1Type.opt[dataID].text,
      },
      xAxis: {
        // max: 5,
        type: "category",
      },
      legend: {
        show: true,
      },
      yAxis: {
        position: "left",
        name: chart1Type.opt[dataID].yName,
      },
      dataset: {
        source: chart1Type.opt[dataID].dataSet,
      },
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
            const _data = params[i].data[dataID];
            const _marker = params[i].marker;
            showHtm += `${_marker}${_text}：${_data}<br>`;
          }
          return showHtm;
        },
      },
      series: chart1Type.opt[dataID].dataSet[0].slice(1, -1).map(() => {
        return { type: "line" };
      }),
    });
  }
  myChartObjs[1].clear();
  myChartObjs[1].setOption(option);
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
  updateNextChart();
  window.onresize = _.debounce(() => {
    myChartObjs.forEach((element) => {
      element.resize();
    });
  }, 500);
});
</script>

<style lang="less">
.el-col {
  margin: 20px 10px;
}
.echart {
  width: 95vw;
  height: 600px;
}
</style>
