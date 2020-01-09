import * as R from 'ramda'
// const R = require('ramda')
let config = null
let oriCountries = null // 国家数据
let countriesSorted = null // 按标力排序后的国家数据
let goal = 0 // 目标标准潜力
const mapIndexed = R.addIndex(R.map)

function sortByProp (prop) {
  return R.sortWith([R.descend(R.prop(prop))])
}

function allocateTop6 (top3) {
  const top3Pos = []
  const countrys = R.map(R.prop('country'))(top3)
  top3Pos[0] = countrys[0]
  if (countrys[1] !== countrys[0]) {
    top3Pos[1] = countrys[1]
    top3Pos[2] = 3 - countrys[0] - countrys[1]
  } else if (countrys[2] !== countrys[0]) {
    top3Pos[2] = countrys[2]
    top3Pos[1] = 3 - countrys[0] - countrys[2]
  } else {
    top3Pos[1] = (countrys[0] + 1) % 3
    top3Pos[2] = (countrys[0] + 2) % 3
  }
  let result = [[]]
  for (let i = 0; i < 3; ++i) {
    for (let len = result.length - 1; len >= 0; --len) {
      const temp = result[len].slice(0, i)
      const arr = R.map(id => {
        const temp2 = temp.concat()
        temp2[i] = id
        return temp2
      })([0, 1, 2])
      result.splice(len, 1, ...arr)
    }
  }
  return R.map(item => top3Pos.concat(item))(result)
}

function getPlans (countries) {
  oriCountries = countries
  if (!config) {
    config = JSON.parse(localStorage.getItem('merge-tool-config'))
  }
  const sortWithPower = sortByProp('topPower')
  // 按照尖端战力排序
  let dataSorted = sortWithPower(countries.concat())
  // 计算所有国家潜力
  const { Right2, Right3, Right4, Right5, Right6 } = config
  mapIndexed((item, i) => {
    const right1 = config.Right1[Math.floor(i / 3)] || 0
    item.potential = item.topPower * right1 +
    item.activePowerSum * Right2 +
    (item.activePay + item.activePayFake) * Right3 +
    item.activePay30 * Right4 +
    (item.powerfulNum + item.activeNum) * Right5 +
    item.activeCoin * Right6
  })(dataSorted)
  const sortWithPotential = sortByProp('potential')
  // 按照国家潜力排序
  countriesSorted = dataSorted = sortWithPotential(dataSorted)
  // 按照最大潜力 标准化所有国家潜力(最大的按10000计算)
  const maxPotential = dataSorted[0].potential
  R.forEach(item => {
    item.potentialS = Math.round((item.potential / maxPotential) * 10000)
  })(dataSorted)
  // 新国家预期标力(标准化潜力)
  goal = Math.round(R.compose(R.sum, R.map(R.prop('potentialS')))(dataSorted) / 3)
  const top3 = dataSorted.slice(0, 3)
  const top6 = allocateTop6(top3)
  if (countries.length <= 6) {
    return changeOrder(top6)
  } else {
    return changeOrder(search(top6, goal))
  }
}

/**
 * 按照原国家顺序分配新国家
 * @param {*} plans 按照标力得到的方案
 */
function changeOrder (plans) {
  return R.map(arr => {
    const temp = Array(oriCountries.length).fill(-1)
    arr.map((id, index) => {
      const cData = countriesSorted[index]
      const oriIndex = oriCountries.indexOf(cData)
      temp[oriIndex] = id
    })
    return temp
  })(plans)
}

/**
 * 建立以上27个状态的评估
 * @param {Array} top6 // 6个潜力值最大的国家的27种枚举方案
 */
function search (top6) {
  const planList = []
  const searchingList = []

  function findPlan (arr) {
    while (arr.length < countriesSorted.length) {
      const result = R.map(id => {
        const newArr = arr.concat(id)
        return [newArr, getValue(newArr)]
      })([0, 1, 2])
      result.sort((a, b) => a[1] - b[1])
      arr = result.shift()[0]
      searchingList.push(...result)
    }
    planList.push(arr)
  }

  // 检测初始的27种方案
  top6.forEach(findPlan)

  // 继续查找方案
  while (planList.length < config.queryTimes) {
    searchingList.sort((a, b) => a[1] - b[1])
    const arr = searchingList.shift()[0]
    findPlan(arr)
  }
  // console.log(planList, searchingList)
  return planList
}

function getValue (plan) {
  let valueBusy = [0, 0, 0]
  let valueFree = 0
  plan.forEach((id, index) => {
    valueBusy[id] += countriesSorted[index].potentialS
  })
  countriesSorted.forEach((item, index) => {
    if (index >= plan.length) {
      valueFree += item.potentialS
    }
  })
  return Math.pow(Math.abs(valueBusy[0] - goal), config.busyRatio) +
  Math.pow(Math.abs(valueBusy[1] - goal), config.busyRatio) +
  Math.pow(Math.abs(valueBusy[2] - goal), config.busyRatio) -
  valueFree * config.freeRatio
}

export { getPlans }
