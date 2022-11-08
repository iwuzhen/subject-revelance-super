import axios from "axios";

// 创建axios实例
export const localService = axios.create({
  timeout: 120 * 1000,
});
localService.defaults.baseURL = "/v2";

// 创建axios实例
export const apiService = axios.create({
  timeout: 120 * 1000,
});
apiService.defaults.baseURL = "https://api.nikepai.com:10444";

export const getfresh = async (path: string, key: string) => {
  return await apiService.get(`v/1.0/fresh/${path}/${key}`);
};

export const setfresh = async (
  path: string,
  key: string,
  id: string,
  data: string
) => {
  return apiService.post(`v/1.0/fresh/${path}/${key}`, {
    id,
    data: data,
  });
};

export const getNote = async (key: string) => {
  const rep = await getfresh("notebok", key);
  if (rep.data.code === 200) {
    return rep.data.data;
  }
  throw Error(rep.data.message || rep.status);
};

export const setNote = async (key: string, id: string, data: string) => {
  const rep = await setfresh("notebok", key, id, data);
  if (rep.data.code === 200) {
    return rep.data.data;
  }
  throw Error(rep.data.message || rep.status);
};

// 创建 fastapi axios实例
export const pyApiService = axios.create({
  timeout: 120 * 1000,
});
pyApiService.defaults.baseURL = "/pyapi/v1";
