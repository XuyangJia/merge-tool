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
    calculate(testData)
  }
}

function calculate (data) {
  const sortByPower = R.sortBy(R.prop('topPower'))
  data = sortByPower(data) // 按照尖端战力排序

  // 列出所有方案
  console.log(data)
}

function getAllPlan (num) {
  let result = [[0], [1], [2]]
  for (let i = 3; i < num; ++i) {
    result = null
  }
}

export function mergePlan (data) {
  originalData = data
  zoneNum = 2
  startMerge()
}
