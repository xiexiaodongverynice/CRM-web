import { arrayToTree } from '../../utils/index';
import consoleUtil from '../../utils/consoleUtil';

export const buildTreeData =(resultData)=>{
  let arrayTreeData = [];
  if (!_.isEmpty(resultData)) {
    _.forEach(resultData,(item)=>{
      arrayTreeData.push({
          label: item.name,
          value: _.toString(item.id),
          key: _.toString(item.id),
          pid: _.toString(item.parent_id),
        })
    })
  }
  // consoleUtil.log('resultData',resultData)
  // 生成树状
  const dataTree = arrayToTree(arrayTreeData, 'value', 'pid')
  // consoleUtil.log('dataTree',dataTree)
  return dataTree;
}
