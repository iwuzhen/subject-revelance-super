import axios from "axios";

// 创建axios实例
const localSeveice = axios.create({
  timeout: 150000000, // 请求超时时间
});

localSeveice.defaults.baseURL = "/v2";

// 创建axios实例
const apiSeveice = axios.create({
  timeout: 150000000, // 请求超时时间
});

apiSeveice.defaults.baseURL = "https://api.nikepai.com";

export { localSeveice, apiSeveice };
