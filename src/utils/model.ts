import echarts from "echarts";
import merge from "ts-deepmerge";

// 单页图，使用这个模版
export function extendEchartsOpts(opt: echarts.EChartsOption) {
  let basicEchartsOption: echarts.EChartsOption = {
    // color: ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#003399', '#333366', '#663366', '#CC0099'],
    title: {
      left: "center",
    },
    yAxis: {
      axisLine: {
        show: true,
      },
      axisLabel: {
        show: true,
        formatter: (value: any) => {
          return value;
        },
      },
    },
    tooltip: {
      trigger: "axis",
      textStyle: {
        align: "left",
      },
      axisPointer: {
        type: "cross",
        animation: true,
        label: {
          backgroundColor: "#505765",
        },
      },
      formatter: function (params: any, ticket: string) {
        params.sort((x: { data: number }, y: { data: number | undefined }) => {
          if (y.data === undefined) {
            return -1;
          }
          return y.data - x.data;
        });
        let showHtm = ` ${params[0].name}<br>`;
        for (let i = 0; i < params.length; i++) {
          if (params[i].data === undefined) {
            continue;
          }
          const _text = params[i].seriesName;
          const _data = params[i].data;
          const _marker = params[i].marker;
          showHtm += `${_marker}${_text}：${_data}<br>`;
        }
        return showHtm;
      },
    },
    legend: {
      type: "scroll",
      left: "82%",
      right: "left",
      top: "middle",
      textStyle: {
        fontSize: 13,
      },
      orient: "vertical",
    },
    grid: {
      left: "2%",
      right: "20%",
      bottom: "5%",
      containLabel: true,
    },
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
  };
  basicEchartsOption = merge(basicEchartsOption, opt);
  return basicEchartsOption;
}
