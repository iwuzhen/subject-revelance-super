import axios from "axios";

// 创建axios实例
const service = axios.create({
  timeout: 150000000, // 请求超时时间
});

service.defaults.baseURL = "/v2";

export default service;
