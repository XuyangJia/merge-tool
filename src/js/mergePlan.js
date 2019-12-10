import * as R from 'ramda'
const [minNum] = [120, 250]
let originalData
let zoneNum = 0

function startMerge () {
  const testData = originalData.slice(0, zoneNum * 3)

  // 计算总人数
  const sum = R.reduce((acc, elem) => {
    return acc + elem.powerfulNum + elem.activeNum
  }, 0, testData)
  if (sum < minNum) {
    zoneNum++
    startMerge()
  } else { // 人数满足条件
    console.log(`尝试${zoneNum}个区进行合并，当前总人数${sum}`)
    calculate(testData)
  }
}

function calculate (data) {
  const sortByPower = R.sortBy(R.prop('topPower'))
  data = sortByPower(data) // 按照尖端战力排序

  // 列出所有方案
  const results = getAllPlan(data.length)
  R.map(R.compose(variance, R.map(item => R.map(i => data[i], item))), results)
}

function variance (countrys) {
  const sortByFirstItem = R.sortBy(R.prop('topPower'))
  const result = sortByFirstItem(countrys);
  console.log(result)
}

function insert (item, pos, array) {
  const result = R.clone(array)
  result[pos].push(item)
  return result
}
function getAllPlan (num = 0) {
  console.log(num)
  let result = [[[0], [1], [2]]]
  if (num <= 3) return result
  for (let i = 3; i < num; ++i) {
    const curriedInsert = R.curry(insert)(i)
    result = R.ap([curriedInsert(0), curriedInsert(1), curriedInsert(2)])(result)
  }
  return result
}

export function mergePlan (data) {
  originalData = data
  zoneNum = 2
  startMerge()
}
