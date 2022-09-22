import axios from "axios";

const url = "https://api.nikepai.com/v/1.0/translate/zh";

export async function getTranslate(params: string[]) {
  const ret = await axios.request({
    url,
    method: "post",
    data: {
      query: params,
    },
  });
  return ret.data;
}
