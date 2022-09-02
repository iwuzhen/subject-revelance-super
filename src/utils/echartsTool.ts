// example
// dataSetAddNewColume(dataSetObj, "UfundM", (obj: any) => {
//     return _.round((obj.fundM / obj.CPI) * 100, 1);
// });
export const dataSetAddNewColume = (
  source: any,
  newName: string,
  callback: any
) => {
  // first row is schema
  const indexMap = {};
  for (const i in source[0]) {
    indexMap[source[0][i]] = [i];
  }
  for (let i = 1; i < source.length; i++) {
    const obj = {};
    for (const key in indexMap) {
      obj[key] = source[i][indexMap[key]];
    }
    source[i].push(callback(obj));
  }
  source[0].push(newName);
};
