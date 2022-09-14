import axios from "axios";

// 创建axios实例
export const localSeveice = axios.create({
  timeout: 120 * 1000,
});
localSeveice.defaults.baseURL = "/v2";

// 创建axios实例
export const apiSeveice = axios.create({
  timeout: 120 * 1000,
});
apiSeveice.defaults.baseURL = "https://api.nikepai.com";

export const getfresh = async (path: string, key: string) => {
  return await apiSeveice.get(`v/1.0/fresh/${path}/${key}`);
};

export const setfresh = async (
  path: string,
  key: string,
  id: string,
  data: string
) => {
  return apiSeveice.post(`v/1.0/fresh/${path}/${key}`, {
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
