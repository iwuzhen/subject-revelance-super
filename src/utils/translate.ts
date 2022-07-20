import axios from "axios";

const url = "https://wiki.lmd.knogen.com:10443/goapi/utils/translate";

export async function getTranslate(params: string[]) {
  const ret = await axios.request({
    url,
    method: "post",
    data: params,
  });
  return ret.data;
}
