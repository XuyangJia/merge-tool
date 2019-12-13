import * as R from 'ramda'
import { variance } from './tools'
import config from './config'
const [minNum] = [120, 250]
let originalData
let zoneNum = 0

function startMerge () {
  if (originalData.length < zoneNum * 3) {
    return '区服数量不足'
  }
  const testData = originalData.slice(0, zoneNum * 3)

  // 计算总人数
  const sum = R.reduce((acc, elem) => {
    return acc + elem.powerfulNum + elem.activeNum
  }, 0, testData)
  if (sum < minNum) {
    return addZone()
  } else { // 人数满足条件
    console.log(`尝试${zoneNum}个区进行合并，当前总人数${sum}`)
    return calculate(testData)
  }
}

function calculate (data) {
  const sortByPower = R.sortBy(R.prop('topPower'))
  data = sortByPower(data) // 按照尖端战力排序

  // 列出所有方案
  const plans = getAllPlan(data.length)
  const variances = R.map(R.compose(variance, R.map(item => R.map(i => data[i], item))), plans)
  const exist = R.any(R.flip(R.lte)(config.idealS), variances)
  if (exist) {
    return [R.sortBy(R.prop('0'), R.zip(variances, plans)), data.slice(0, zoneNum * 3)]
  } else {
    return addZone()
  }
}

function insert (item, pos, array) {
  const result = R.clone(array)
  result[pos].push(item)
  return result
}

function getAllPlan (num = 0) {
  let result = [[[0], [1], [2]]]
  if (num <= 3) return result
  for (let i = 3; i < num; ++i) {
    const curriedInsert = R.curry(insert)(i)
    result = R.ap([curriedInsert(0), curriedInsert(1), curriedInsert(2)])(result)
  }
  return result
}

function addZone () {
  zoneNum++
  return startMerge()
}

export function mergePlan (data) {
  originalData = data
  zoneNum = 2
  return startMerge()
}
