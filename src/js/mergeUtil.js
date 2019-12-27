import * as R from 'ramda'
import { variance } from './variance'
import config from './config'
// import store from '../store'
const { Cright1, Cright2, Cright3, Cright4, Cright5, Cright6, ratio } = config.Cright
const minNum = config.numRight[0][0]
const maxNum = config.maxNum

const STATUS_ZONE_SHORT = 0
const STATUS_NOT_ENOUGH = 1
const STATUS_TOO_MUCH = 2
const STATUS_NOT_EXIST = 3

const mapIndexed = R.addIndex(R.map)

let tempVariances = null
let tempData = null
let Crights = null
let criticalCright = 0
let criticalPowerfulNum = 0
let criticalActiveNum = 0
let criticalTopPower = 0
let criticalActivePowerSum = 0
let criticalPay = 0
let minPowerfulNum = 0
let minActiveNum = 0
let minActivePowerSum = 0
let minPay = 0
let cursor = 0
let zoneNum = 0
const filed = (status, msg) => ({ status, msg })

function sendMsg (msg) {
  console.log(msg)
  // store.dispatch('zones/addLog', msg)
}

function getSingleMergePlan (data) {
  const num = data.length / 3
  const sum = countPlayers(data)
  const zonesStr = ` (${data[0].zone}区-${data[data.length - 1].zone}区) `
  if (num < 2) {
    zoneNum = num
    return filed(STATUS_ZONE_SHORT, `区数量不足${zonesStr}`)
  } else if (sum < minNum) {
    return filed(STATUS_NOT_ENOUGH, `人数不足: ${sum} < ${minNum}${zonesStr}`)
  } else if (sum > maxNum) {
    return filed(STATUS_TOO_MUCH, `人数过多: ${sum} > ${maxNum}${zonesStr}`)
  } else {
    sendMsg(`尝试${zonesStr} 共计${num}个区进行合并，当前总人数${sum}`)
    return calculate(data)
  }
}

function allocateTop3 (top3) {
  const result = []
  const countrys = R.map(R.prop('country'))(top3)
  result[countrys[0]] = 0
  if (countrys[1] !== countrys[0]) {
    result[countrys[1]] = 1
    result[3 - countrys[0] - countrys[1]] = 2
  } else if (countrys[1] !== countrys[0]) {
    result[countrys[2]] = 2
    result[3 - countrys[0] - countrys[2]] = 1
  } else {
    result[(countrys[0] + 1) % 3] = 1
    result[(countrys[0] + 2) % 3] = 2
  }
  return result
}

function calculate (data) {
  const sortWithPower = R.sortWith([R.descend(R.prop('topPower'))])
  tempData = data
  const temp = sortWithPower(data.concat()) // 按照尖端战力排序后取前三
  const top3 = R.take(3)(temp)
  const base = Array(temp.length).fill(-1)
  allocateTop3(top3).map(i => {
    const index = data.indexOf(temp[i])
    base[index] = i
  })

  Crights = R.map(getCright)(data)
  criticalCright = Math.floor(R.sum(Crights) * ratio)
  criticalPowerfulNum = Math.floor(R.compose(R.sum, R.map(x => x.powerfulNum))(tempData) * ratio)
  criticalActiveNum = Math.floor(R.compose(R.sum, R.map(x => x.activeNum))(tempData) * ratio)
  criticalTopPower = Math.floor(R.compose(R.sum, R.map(x => x.topPower))(tempData) * ratio)
  criticalActivePowerSum = Math.floor(R.compose(R.sum, R.map(x => x.activePowerSum))(tempData) * ratio)
  criticalPay = Math.floor(R.compose(R.sum, R.map(x => (x.activePay + x.activePayFake)))(tempData) * ratio)
  minPowerfulNum = Math.floor(R.compose(R.sum, R.map(x => x.powerfulNum))(tempData) / 6)
  minActiveNum = Math.floor(R.compose(R.sum, R.map(x => x.activeNum))(tempData) / 5)
  minActivePowerSum = Math.floor(R.compose(R.sum, R.map(x => x.activePowerSum))(tempData) / 4)
  minPay = Math.floor(R.compose(R.sum, R.map(x => (x.activePay + x.activePayFake)))(tempData) / 5)

  // 列出所有方案
  const plans = getAllPlans(base)
  sendMsg(`方案数量：${plans.length}`)

  const variances = R.map(plan => variance(plan, tempData), plans)
  const exist = R.any(R.flip(R.lte)(config.idealS), variances)
  const result = R.sortBy(R.prop('0'), R.zip(variances, plans))
  if (exist) {
    return result
  } else {
    tempVariances.push(result)
    return filed(STATUS_NOT_EXIST, `所有组合的方差都大于${config.idealS}`)
  }
}

/**
 * 计算总人数
 * @param {Array} arr
 */
function countPlayers (arr) {
  return R.reduce((acc, elem) => {
    return acc + elem.powerfulNum + elem.activeNum
  }, 0, arr)
}

function chooseBest () {
  const sortByFirstItem = R.sortBy(R.prop(0))
  const minVariances = R.map(obj => sortByFirstItem(obj.data[0])[0])(tempVariances)
  const index = minVariances.findIndex(x => x === sortByFirstItem(minVariances)[0])
  return tempVariances[index]
}

function testMerge (countries) {
  zoneNum++
  const current = countries.slice(0, zoneNum * 3)
  const testData = getSingleMergePlan(current)
  if (testData.status === STATUS_TOO_MUCH || (testData.status === STATUS_NOT_EXIST && countries.length < (zoneNum + 1) * 3)) {
    return chooseBest()
  } else if (!Array.isArray(testData) && countries.length >= (zoneNum + 1) * 3) {
    if (testData.status === STATUS_NOT_ENOUGH || testData.status === STATUS_NOT_EXIST) {
      return testMerge(countries)
    }
  }
  return testData
}

function getAllMergePlan (countries, plans) {
  tempVariances = [] // 清空临时记录
  zoneNum = 1
  const plan = testMerge(countries)
  plans.push([plan, cursor, zoneNum])
  if (Array.isArray(plan)) {
    cursor += zoneNum
    countries.splice(0, zoneNum * 3)
    if (countries.length) {
      return getAllMergePlan(countries, plans)
    }
  }
  return plans
}

function getAllPlans (base) {
  function cover (item, pos, array) {
    const result = R.clone(array)
    result[pos] = item
    return result
  }

  let result = [base]
  for (let i = 0, len = base.length; i < len; ++i) {
    if (result[0][i] === -1) {
      let tempResult = []
      for (let j = 0, len2 = result.length; j < len2; ++j) {
        const arr = R.map(item => cover(item, i, result[j]))([0, 1, 2])
        tempResult = tempResult.concat(arr.filter(feasibility))
      }
      result = tempResult
    }
  }
  return R.filter(workable)(result)
}

function feasibility (arr) {
  return R.all(id => {
    const arr2 = []
    mapIndexed((val, idx) => {
      val === id && arr2.push(idx)
    })(arr)
    return feasibilityWithCounrey(arr2)
  })([0, 1, 2])
}

function feasibilityWithCounrey (arr) {
  return (R.compose(R.sum, R.map(i => Crights[i]))(arr) < criticalCright &&
  R.compose(R.sum, R.map(i => tempData[i].powerfulNum))(arr) < criticalPowerfulNum &&
  R.compose(R.sum, R.map(i => tempData[i].activeNum))(arr) < criticalActiveNum &&
  R.compose(R.sum, R.map(i => tempData[i].topPower))(arr) < criticalTopPower &&
  R.compose(R.sum, R.map(i => tempData[i].activePowerSum))(arr) < criticalActivePowerSum &&
  R.compose(R.sum, R.map(i => (tempData[i].activePay + tempData[i].activePayFake)))(arr) < criticalPay)
}

function workable (arr) {
  return R.all(id => {
    const arr2 = []
    mapIndexed((val, idx) => {
      val === id && arr2.push(idx)
    })(arr)
    return workableWithCounrey(arr2)
  })([0, 1, 2])
}

function workableWithCounrey (arr) {
  return (R.compose(R.sum, R.map(i => tempData[i].powerfulNum))(arr) > minPowerfulNum &&
  R.compose(R.sum, R.map(i => tempData[i].activeNum))(arr) > minActiveNum &&
  R.compose(R.sum, R.map(i => tempData[i].activePowerSum))(arr) > minActivePowerSum &&
  R.compose(R.sum, R.map(i => (tempData[i].activePay + tempData[i].activePayFake)))(arr) > minPay)
}

export function getCright (x) {
  return Cright1 * x.topPower + Cright2 * x.activePowerSum + Cright3 * (x.activePay + x.activePayFake) + Cright4 * x.activePay30 + Cright5 * x.powerfulNum + Cright6 * x.activeNum
}

export function getMergePlans (countries, progress, single) {
  cursor = progress || 0
  countries = countries.concat()
  if (single) {
    return [getSingleMergePlan(countries), cursor, zoneNum]
  }
  return getAllMergePlan(countries, [])
}
